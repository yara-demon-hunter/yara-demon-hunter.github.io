import { audio, player, state } from '../core/state.js';
import { dealDamage } from './damage.js';
import { addNumber, addShockwave, createExplosion, hitStop, screenFlash, shakeScreen, zoomPunch } from './effects.js';
import { getBladeDamage, getMaxPlayerHp } from './stats.js';
import { showCallout } from '../ui/banner.js';

// --- FÚRIAS DE CADA PERSONAGEM ---
// A barra de Fúria é a mesma para todos (carrega com os golpes e dispara sozinha, js/systems/combat.js), mas o especial muda:
//   blades      Demon Hunter: a explosão de lâminas em volta (fica em combat.js, como sempre foi)
//   bloodWaltz  Azael: até 6 cortes seguidos, saltando para o monstro mais perto que não seja o do corte anterior e
//               deixando um risco vermelho no caminho (com 2 monstros, vai e volta 3 vezes); cada corte cura
//   stomp       Brutos: enquanto a Fúria dura, cada pisada bate no chão em volta dele e a tela treme
// Os números ficam no arquivo de cada personagem (`fury` em data_model/characters/<id>.js). Só o herói tem Fúria: as sombras
// do Shadow Clone não a repetem. Um objeto só, reaproveitado: nada é criado por quadro.
const run = { kind: null, fury: null, left: 0, timer: 0, side: 1, last: null };

// Riscos vermelhos da Valsa de Sangue: poucos, reaproveitados (js/render/fury.js desenha)
export const furyTrails = Array.from({ length: 8 }, () => ({ x0: 0, y0: 0, x1: 0, y1: 0, life: 0, max: 1 }));
let nextTrail = 0;

export function resetFury() {
    for (const t of furyTrails) t.life = 0;
    run.kind = null;
    run.fury = null;
    run.left = 0;
    run.timer = 0;
    run.last = null;
}

// Começa a Fúria do personagem (chamado por combat.js quando a barra enche). Devolve false para a do Demon Hunter,
// que combat.js desenha do jeito de sempre.
export function startFury(fury) {
    if (fury.kind === 'blades') return false;
    resetFury();
    run.kind = fury.kind;
    run.fury = fury;
    showCallout(fury.name.toUpperCase(), fury.kind === 'bloodWaltz' ? '#f87171' : fury.color ?? '#cbd5e1');
    if (fury.kind === 'bloodWaltz') {
        run.left = fury.cuts;
        run.timer = 0;
        screenFlash('#7f1d1d', 0.3);
        zoomPunch(0.03);
        hitStop(0.06);
        createExplosion(player.x, player.y, '#450a0a', 16);
    } else if (fury.kind === 'forestGuardian') {
        run.timer = 0;
        addShockwave(player.x, player.y, { radius: 52, color: '#166534', width: 10, seconds: 0.65 });
        createExplosion(player.x, player.y, '#14532d', 20);
    } else if (fury.kind === 'stomp') {
        run.timer = 0;
        shakeScreen(fury.shake * 1.6);
        hitStop(0.05);
    }
    return true;
}

// Brutos recebe menos dano; o escudo de folhas de Rowan reduz o dano recebido.
export function furyDamageRatio() {
    if (state.frenzyActiveTimer <= 0) return 1;
    if (run.kind === 'stomp') return 1 - run.fury.damageTakenCut;
    if (run.kind === 'forestGuardian') return 1 - run.fury.damageReduction;
    return 1;
}

export function forestGuardianActive() {
    return run.kind === 'forestGuardian' && state.frenzyActiveTimer > 0;
}

// --- VALSA DE SANGUE (Azael) ---
// O próximo alvo: o monstro vivo mais perto que não seja o do corte anterior. Se só sobrou ele, volta nele mesmo
// (atravessa de novo, do outro lado).
function nextVictim(range) {
    let best = null;
    let bestDist = range;
    for (const e of state.enemies) {
        if (e.hp <= 0 || e === run.last) continue;
        const d = Math.hypot(e.x - player.x, e.y - player.y) - e.radius;
        if (d < bestDist) {
            bestDist = d;
            best = e;
        }
    }
    if (!best && run.last && run.last.hp > 0 && state.enemies.includes(run.last)) return run.last;
    return best;
}

function addTrail(x0, y0, x1, y1, seconds) {
    const t = furyTrails[nextTrail];
    nextTrail = (nextTrail + 1) % furyTrails.length;
    t.x0 = x0;
    t.y0 = y0;
    t.x1 = x1;
    t.y1 = y1;
    t.life = seconds;
    t.max = seconds;
}

function cut() {
    const F = run.fury;
    const target = nextVictim(F.cutRange);
    if (!target) {
        endWaltz();
        return;
    }
    // Atravessa o monstro: sai do outro lado, e o caminho fica riscado de vermelho
    const fromX = player.x;
    const fromY = player.y;
    const a = Math.atan2(target.y - fromY, target.x - fromX);
    const gap = target.radius + 16;
    player.x = Math.max(10, Math.min(state.width - 10, target.x + Math.cos(a) * gap));
    player.y = Math.max(10, Math.min(state.height - 10, target.y + Math.sin(a) * gap));
    player.targetX = player.x;
    player.targetY = player.y;
    player.angle = a;
    player.iFrames = Math.max(player.iFrames, F.cutSeconds + 0.15);
    addTrail(fromX, fromY, player.x, player.y, F.trailSeconds);

    const damage = getBladeDamage() * F.cutDamage;
    dealDamage(target, damage, { kbX: Math.cos(a) * 60, kbY: Math.sin(a) * 60 });
    const heal = Math.round(damage * F.healRatio);
    if (heal > 0 && player.hp > 0) {
        player.hp = Math.min(getMaxPlayerHp(), player.hp + heal);
        addNumber(player.x, player.y - 40, heal, 1, 'heal');
    }
    createExplosion(target.x, target.y, '#dc2626', 7);
    hitStop(0.02);
    audio.playSlice();
    run.last = target;
    run.left--;
    if (run.left <= 0) endWaltz();
}

function endWaltz() {
    run.kind = null;
    run.last = null;
}

// --- PISADAS DO CAPITÃO (Brutos) ---
function stomp() {
    const F = run.fury;
    run.side = -run.side;
    const x = player.x + Math.cos((player.angle ?? 0) + Math.PI / 2) * 6 * run.side;
    const y = player.y + 4;
    for (const e of state.enemies) {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d > F.radius + e.radius) continue;
        const a = Math.atan2(e.y - y, e.x - x);
        dealDamage(e, getBladeDamage() * F.damage, { kbX: Math.cos(a) * F.knockback, kbY: Math.sin(a) * F.knockback, noCrit: true });
        if (!e.isBoss) e.stunned = Math.max(e.stunned ?? 0, F.stunSeconds);
    }
    addShockwave(x, y, { radius: F.radius, color: '#cbd5e1', width: 5, seconds: 0.3 });
    createExplosion(x, y, '#94a3b8', 7);
    shakeScreen(F.shake);
    audio.playSlam(0.4);
}

// Chamado a cada quadro (js/game.js), depois do ataque do herói
export function updateFury(dt) {
    for (const t of furyTrails) if (t.life > 0) t.life -= dt;
    if (!run.kind) return;
    if (run.kind === 'bloodWaltz') {
        run.timer -= dt;
        if (run.timer <= 0) {
            run.timer = run.fury.cutSeconds;
            cut();
        }
        return;
    }
    if (run.kind === 'stomp') {
        if (state.frenzyActiveTimer <= 0 || player.hp <= 0) {
            resetFury();
            return;
        }
        run.timer -= dt;
        if (run.timer <= 0) {
            run.timer = run.fury.stepSeconds;
            stomp();
        }
        return;
    }
    if (run.kind === 'forestGuardian') {
        if (state.frenzyActiveTimer <= 0 || player.hp <= 0) {
            resetFury();
            return;
        }
        const F = run.fury;
        run.timer -= dt;
        for (const e of state.enemies) {
            if (e.hp <= 0 || Math.hypot(e.x - player.x, e.y - player.y) > F.radius + e.radius) continue;
            e.slow = Math.max(e.slow ?? 0, F.slow);
            if (run.timer <= 0) {
                dealDamage(e, getBladeDamage() * F.damage, { noCrit: true, quiet: true });
                createExplosion(e.x, e.y - e.radius, '#4ade80', 2);
            }
        }
        if (run.timer <= 0) run.timer = F.tickSeconds;
    }
}
