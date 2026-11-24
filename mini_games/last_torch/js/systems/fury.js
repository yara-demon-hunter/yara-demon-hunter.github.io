import { executeBladeSlash } from './combat.js';
import { startMove } from './moves.js';
import { audio, joystick, player, state } from '../core/state.js';
import { dealDamage } from './damage.js';
import { addNumber, addShockwave, createExplosion, hitStop, screenFlash, shakeScreen, zoomPunch } from './effects.js';
import { getBladeDamage, getMaxPlayerHp, getSpellDamage } from './stats.js';
import { feedTorch } from './torch.js';
import { mod } from './modifiers.js';
import { showCallout } from '../ui/banner.js';

// --- FÚRIAS DE CADA PERSONAGEM ---
// A barra de Fúria é a mesma para todos (carrega com os golpes e dispara sozinha, js/systems/combat.js), mas o especial muda:
//   swordRain   Demon Hunter: enquanto a Fúria dura, uma espada cai do céu em cima de um monstro por perto a cada instante; nos
//               últimos instantes uma espada gigante cai onde há mais monstros juntos (o desenho: js/render/fury.js)
//   bloodWaltz  Azael: até 6 cortes seguidos, saltando para o monstro mais perto que não seja o do corte anterior e
//               deixando um risco vermelho no caminho (com 2 monstros, vai e volta 3 vezes); cada corte cura
//   groundRend  Kuro (ninja): ergue a espada e desce na vertical; um corte vermelho rasga o chão à frente, abrindo uma fenda que
//               machuca tudo no caminho (js/render/fury.js desenha a fenda)
//   consecration Avgustino: abre um círculo de luz no chão onde ele está; dentro dele os monstros queimam e andam mais
//               devagar (demônios sofrem mais), e ele e a tocha se curam. No fim, uma cruz de luz estoura (js/render/fury.js)
//   stomp       Brutos: enquanto a Fúria dura, cada pisada bate no chão em volta dele e a tela treme
// Os números ficam no arquivo de cada personagem (`fury` em data_model/characters/<id>.js). Só o herói tem Fúria: as sombras
// do Shadow Clone não a repetem. Um objeto só, reaproveitado: nada é criado por quadro.
// Oath of the Wild: a Fúria não machuca (defende e deixa lento como sempre). Todo dano de Fúria passa por aqui
const isDemon = (e) => e.elite || e.isBoss;

export function furyDamage(amount) {
    return mod('furyNoDamage') > 0 ? 0 : amount;
}

// Terra Consagrada (Avgustino): o círculo em campo e a cruz do fim (js/render/fury.js desenha)
export const consecration = { on: false, x: 0, y: 0, radius: 0, age: 0, pulse: 0, finale: 0, finaleRadius: 0 };
export const CONSECRATION_FINALE_SECONDS = 0.9;     // a cruz de luz do fim: desce, crava no chão e some

// Raio do Gudran (Lord's Decree): o cajado aponta e o raio cruza a tela; js/render/arcane.js desenha
export const furyBeam = { on: false, angle: 0, age: 0, pulse: 0 };

// Fenda do Corte Carmesim (Kuro): uma só, reaproveitada. pts = zigue-zague da fenda, fixo na hora do golpe (js/render/fury.js desenha)
export const furyRend = { on: false, x: 0, y: 0, angle: 0, age: 0, windup: 0.3, travel: 0.3, linger: 1, length: 500, width: 70, front: 0, struck: false, pts: [], second: 1, front2: 0, struck2: false, secondWidth: 1.6 };
const rendHit = new Set();
const rendHit2 = new Set();

const run = { kind: null, fury: null, left: 0, timer: 0, side: 1, last: null };

// Espadas da Chuva de Espadas: um conjunto fixo, reaproveitado em círculo (js/render/fury.js desenha)
export const furySwords = Array.from({ length: 40 }, () => ({ on: false, x: 0, y: 0, age: 0, fall: 0.2, stay: 0.3, big: false, hit: false, F: null }));
let nextSword = 0;

// Riscos vermelhos da Valsa de Sangue: poucos, reaproveitados (js/render/fury.js desenha)
export const furyTrails = Array.from({ length: 8 }, () => ({ x0: 0, y0: 0, x1: 0, y1: 0, life: 0, max: 1 }));
let nextTrail = 0;

export function resetFury() {
    for (const t of furyTrails) t.life = 0;
    for (const s of furySwords) s.on = false;
    consecration.on = false;
    furyBeam.on = false;
    furyRend.on = false;
    run.kind = null;
    run.fury = null;
    run.left = 0;
    run.timer = 0;
    run.last = null;
}

// Começa a Fúria do personagem (chamado por combat.js quando a barra enche e o anúncio acaba)
export function startFury(fury) {
    resetFury();
    run.kind = fury.kind;
    run.fury = fury;
    showCallout(fury.name.toUpperCase(), fury.kind === 'bloodWaltz' ? '#f87171' : fury.kind === 'swordRain' ? '#f0abfc' : fury.color ?? '#cbd5e1');
    if (fury.kind === 'swordRain') {
        run.timer = 0.12;
        run.giant = false;
        screenFlash('#f0abfc', 0.3);
        zoomPunch(0.03);
        hitStop(0.05);
        addShockwave(player.x, player.y, { radius: 70, color: '#f0abfc', width: 8, seconds: 0.5 });
        createExplosion(player.x, player.y, '#f0abfc', 14);
        audio.playBlast();
    }
    if (fury.kind === 'groundRend') {
        // Mira no monstro mais perto (ou para onde ele já olha) e ergue a espada
        let aim = player.angle, best = 900;
        for (const e of state.enemies) {
            if (e.hp <= 0) continue;
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < best) { best = d; aim = Math.atan2(e.y - player.y, e.x - player.x); }
        }
        rendHit.clear();
        rendHit2.clear();
        const pts = [];
        for (let d = 0; d <= fury.length; d += 14) pts.push(d, (Math.random() - 0.5) * 9 * Math.min(1, d / 60));
        Object.assign(furyRend, { on: true, x: player.x, y: player.y, angle: aim, age: 0, windup: fury.windup, travel: fury.travelSeconds, linger: fury.lingerSeconds,
            length: fury.length, width: fury.width, front: 0, struck: false, pts,
            second: fury.windup + fury.travelSeconds + fury.secondGap, front2: 0, struck2: false, secondWidth: fury.secondWidth });
        player.angle = aim;
        run.timer = 0;
        startMove('overhead');              // ergue a espada nas duas mãos e desce (a pose do Axe Quake, sem a habilidade do Brutos)
        screenFlash('#7f1d1d', 0.25);
        zoomPunch(0.03);
        addShockwave(player.x, player.y, { radius: 50, color: '#dc2626', width: 6, seconds: 0.4 });
    }
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
    } else if (fury.kind === 'consecration') {
        run.timer = 0;
        run.heal = 0;
        Object.assign(consecration, { on: true, x: player.x, y: player.y, radius: fury.radius, age: 0 });
        screenFlash('#fde68a', 0.3);
        addShockwave(player.x, player.y, { radius: fury.radius, color: '#fde68a', width: 10, seconds: 0.6 });
        createExplosion(player.x, player.y, '#fef3c7', 18);
        audio.playBlast();
    } else if (fury.kind === 'beam') {
        run.timer = 0;
        // Começa apontando para o alvo (ou o monstro mais perto), e daí gira com a mira
        const aim = Math.hypot(player.targetX - player.x, player.targetY - player.y) > 8 ? Math.atan2(player.targetY - player.y, player.targetX - player.x) : player.angle;
        Object.assign(furyBeam, { on: true, angle: aim, age: 0, pulse: 0 });
        screenFlash('#93c5fd', 0.3);
        zoomPunch(0.03);
        addShockwave(player.x, player.y, { radius: 60, color: '#93c5fd', width: 9, seconds: 0.5 });
        createExplosion(player.x, player.y, '#bfdbfe', 16);
        audio.playBlast();
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
    if (run.kind === 'consecration' && insideConsecration(player.x, player.y)) return 1 - run.fury.damageReduction;
    if (run.kind === 'beam') return 1 - run.fury.damageReduction;
    return 1;
}

export function insideConsecration(x, y) {
    return consecration.on && Math.hypot(x - consecration.x, y - consecration.y) < consecration.radius;
}

// O raio está no ar: o herói fica plantado e só mira (js/systems/player.js) e o ataque básico para (combat.js)
export const beamActive = () => furyBeam.on && state.frenzyActiveTimer > 0;

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

    const damage = furyDamage(getBladeDamage() * F.cutDamage);
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
        dealDamage(e, furyDamage(getBladeDamage() * F.damage), { kbX: Math.cos(a) * F.knockback, kbY: Math.sin(a) * F.knockback, noCrit: true });
        if (!e.isBoss) e.stunned = Math.max(e.stunned ?? 0, F.stunSeconds);
    }
    addShockwave(x, y, { radius: F.radius, color: '#cbd5e1', width: 5, seconds: 0.3 });
    createExplosion(x, y, '#94a3b8', 7);
    shakeScreen(F.shake);
    audio.playSlam(0.4);
}

// --- CHUVA DE ESPADAS (Demon Hunter) ---
function dropSword(x, y, big, F) {
    const s = furySwords[nextSword];
    nextSword = (nextSword + 1) % furySwords.length;
    s.on = true;
    s.F = F;
    s.x = x;
    s.y = y;
    s.age = 0;
    s.hit = false;
    s.big = big;
    s.fall = big ? F.giantFallSeconds : F.fallSeconds;
    s.stay = big ? 0.8 : 0.35;
}

// Um monstro por perto (sorteado); sem monstro, um ponto perto do herói
function pickRainTarget(F) {
    const near = [];
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        if (Math.hypot(e.x - player.x, e.y - player.y) < F.range + e.radius) near.push(e);
    }
    if (near.length > 0) {
        const e = near[Math.floor(Math.random() * near.length)];
        return { x: e.x + (Math.random() - 0.5) * 12, y: e.y + (Math.random() - 0.5) * 10 };
    }
    const a = Math.random() * Math.PI * 2;
    const d = 40 + Math.random() * 110;
    return { x: player.x + Math.cos(a) * d, y: player.y + Math.sin(a) * d };
}

// A gigante cai onde há mais monstros juntos (dentro do alcance dela)
function pickGiantTarget(F) {
    let best = null;
    let bestCount = -1;
    for (const e of state.enemies) {
        if (e.hp <= 0 || Math.hypot(e.x - player.x, e.y - player.y) > F.range + e.radius) continue;
        let count = 0;
        for (const o of state.enemies) if (o.hp > 0 && Math.hypot(o.x - e.x, o.y - e.y) < F.giantRadius) count++;
        if (count > bestCount) {
            bestCount = count;
            best = e;
        }
    }
    return best ? { x: best.x, y: best.y } : { x: player.x + Math.cos(player.angle ?? 0) * 70, y: player.y + Math.sin(player.angle ?? 0) * 70 };
}

function landSword(s, F) {
    const radius = s.big ? F.giantRadius : F.radius;
    const damage = furyDamage(getBladeDamage() * (s.big ? F.giantDamage : F.damage));
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        const d = Math.hypot(e.x - s.x, e.y - s.y);
        if (d > radius + e.radius) continue;
        const a = Math.atan2(e.y - s.y, e.x - s.x);
        const kb = s.big ? F.giantKnockback : 0;
        dealDamage(e, damage, { noCrit: true, kbX: Math.cos(a) * kb, kbY: Math.sin(a) * kb });
    }
    createExplosion(s.x, s.y, '#f0abfc', s.big ? 18 : 5);
    addShockwave(s.x, s.y, { radius: radius, color: '#f0abfc', width: s.big ? 9 : 3, seconds: s.big ? 0.5 : 0.25 });
    if (s.big) {
        shakeScreen(14);
        hitStop(0.08);
        zoomPunch(0.035);
        screenFlash('#f0abfc', 0.35);
        audio.playBlast();
        audio.playSlam(0.9);
    } else if (Math.random() < 0.4) audio.playSlam(0.22);
}

function updateSwordRain(dt) {
    const F = run.fury;
    if (player.hp <= 0) {
        run.kind = null;
        return;
    }
    const left = state.frenzyActiveTimer;
    if (left > F.giantFallSeconds) {
        run.timer -= dt;
        while (run.timer <= 0) {
            run.timer += F.stepSeconds;
            const t = pickRainTarget(F);
            dropSword(t.x, t.y, false, F);
        }
    } else if (!run.giant) {
        run.giant = true;
        const t = pickGiantTarget(F);
        dropSword(t.x, t.y, true, F);
    }
    if (left <= 0 && run.giant) run.kind = null;       // as espadas já no ar terminam a queda sozinhas
}

// Chamado a cada quadro (js/game.js), depois do ataque do herói
export function updateFury(dt) {
    if (consecration.finale > 0) consecration.finale -= dt;
    if (consecration.pulse > 0) consecration.pulse = Math.max(0, consecration.pulse - dt * 3);
    for (const t of furyTrails) if (t.life > 0) t.life -= dt;
    // As espadas no ar e fincadas seguem o relógio delas mesmo depois que a Fúria acaba
    for (const s of furySwords) {
        if (!s.on) continue;
        s.age += dt;
        if (!s.hit && s.age >= s.fall) {
            s.hit = true;
            landSword(s, s.F);
        }
        if (s.hit && s.age >= s.fall + s.stay) s.on = false;
    }
    if (!run.kind) return;
    if (run.kind === 'swordRain') {
        updateSwordRain(dt);
        return;
    }
    if (run.kind === 'groundRend') {
        updateRend(dt);
        return;
    }
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
    if (run.kind === 'beam') {
        if (state.frenzyActiveTimer <= 0 || player.hp <= 0) {
            if (player.hp > 0) {
                addShockwave(player.x, player.y, { radius: 50, color: '#93c5fd', width: 6, seconds: 0.4 });
                screenFlash('#bfdbfe', 0.2);
            }
            resetFury();
            return;
        }
        updateBeam(dt);
        return;
    }
    if (run.kind === 'consecration') {
        const F = run.fury;
        if (state.frenzyActiveTimer <= 0 || player.hp <= 0) {
            // Fim: uma cruz de luz estoura em cima do círculo
            if (player.hp > 0) {
                for (const e of state.enemies) {
                    if (e.hp <= 0 || Math.hypot(e.x - consecration.x, e.y - consecration.y) > F.radius * F.finaleRadius + e.radius) continue;
                    const a = Math.atan2(e.y - consecration.y, e.x - consecration.x);
                    dealDamage(e, furyDamage(getSpellDamage() * F.finaleDamage * (isDemon(e) ? 1 + F.demonBonus : 1)),
                        { noCrit: true, style: 'spell', kbX: Math.cos(a) * 260, kbY: Math.sin(a) * 260 });
                }
                consecration.finale = CONSECRATION_FINALE_SECONDS;
                consecration.finaleRadius = F.radius * F.finaleRadius;
                addShockwave(consecration.x, consecration.y, { radius: consecration.finaleRadius, color: '#fef3c7', width: 12, seconds: 0.5 });
                screenFlash('#fef3c7', 0.35);
                shakeScreen(10);
                audio.playBlast();
            }
            resetFury();
            return;
        }
        consecration.age += dt;
        run.timer -= dt;
        const pulse = run.timer <= 0;
        if (pulse) {
            run.timer = F.tickSeconds;
            consecration.pulse = 1;         // o desenho acende o círculo e solta uma onda do centro
        }
        for (const e of state.enemies) {
            if (e.hp <= 0 || Math.hypot(e.x - consecration.x, e.y - consecration.y) > F.radius + e.radius) continue;
            e.slow = Math.max(e.slow ?? 0, F.slow);
            if (pulse) {
                dealDamage(e, furyDamage(getSpellDamage() * F.damage * (isDemon(e) ? 1 + F.demonBonus : 1)), { noCrit: true, quiet: true, number: true, style: 'spell' });
                createExplosion(e.x, e.y - e.radius, '#fef3c7', 2);
            }
        }
        // Quem está dentro do círculo se cura: ele e a tocha
        if (insideConsecration(player.x, player.y)) player.hp = Math.min(getMaxPlayerHp(), player.hp + F.healPerSecond * dt);
        if (state.phase === 'HUNT' && Math.hypot(state.coreX - consecration.x, state.coreY - consecration.y) < F.radius) {
            run.heal += F.torchHealPerSecond * dt;
            if (run.heal >= 1) {
                feedTorch(Math.floor(run.heal));
                run.heal -= Math.floor(run.heal);
            }
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
                dealDamage(e, furyDamage(getSpellDamage() * F.damage), { noCrit: true, quiet: true, number: true, style: 'spell' });
                createExplosion(e.x, e.y - e.radius, '#4ade80', 2);
            }
        }
        if (run.timer <= 0) run.timer = F.tickSeconds;
    }
}

// --- CORTE CARMESIM (Kuro) ---
// Ergue a espada (windup), desce na vertical e a fenda corre à frente até `length`, rasgando o chão: cada monstro no caminho
// leva o golpe uma vez, e a fenda fica aberta um pouco antes de sumir.
function updateRend(dt) {
    const F = run.fury, R = furyRend;
    if (player.hp <= 0) { resetFury(); return; }
    R.age += dt;
    player.angle = R.angle;
    player.iFrames = Math.max(player.iFrames, 0.15);
    if (R.age < R.windup) return;
    const dx = Math.cos(R.angle), dy = Math.sin(R.angle);
    // 1º corte: vertical (a lâmina de ar em pé)
    if (!R.struck) {
        R.struck = true;
        executeBladeSlash(player.x, player.y, R.angle, 90, 2, false);     // o golpe vertical do boneco
        shakeScreen(12);
        hitStop(0.06);
        zoomPunch(0.05);
        screenFlash('#dc2626', 0.3);
        addShockwave(player.x, player.y, { radius: 80, color: '#dc2626', width: 10, seconds: 0.4 });
        audio.playBlast();
    }
    const prev = R.front;
    R.front = Math.min(R.length, ((R.age - R.windup) / R.travel) * R.length);
    rendSweep(F, R, R.front, R.width, F.damage, rendHit, dx, dy);
    if (R.front > prev) createExplosion(R.x + dx * R.front, R.y + dy * R.front, '#ef4444', 3);
    // 2º corte: horizontal, logo em seguida, deitado e bem mais largo
    const t2 = R.age - R.second;
    if (t2 >= 0) {
        if (!R.struck2) {
            R.struck2 = true;
            executeBladeSlash(player.x, player.y, R.angle, 100, 1, false);
            shakeScreen(10);
            hitStop(0.05);
            screenFlash('#dc2626', 0.25);
            audio.playSlice();
        }
        const prev2 = R.front2;
        R.front2 = Math.min(R.length, (t2 / R.travel) * R.length);
        rendSweep(F, R, R.front2, R.width * F.secondWidth, F.secondDamage, rendHit2, dx, dy);
        if (R.front2 > prev2) createExplosion(R.x + dx * R.front2, R.y + dy * R.front2, '#ef4444', 3);
    }
    if (R.age > R.second + R.travel + R.linger) resetFury();
}

// Machuca, uma vez por corte, quem a lâmina já alcançou na faixa de largura `width`
function rendSweep(F, R, front, width, mult, hitSet, dx, dy) {
    const damage = furyDamage(getBladeDamage() * mult);
    for (const e of state.enemies) {
        if (e.hp <= 0 || hitSet.has(e)) continue;
        const along = (e.x - R.x) * dx + (e.y - R.y) * dy;
        if (along < -e.radius || along > front + e.radius) continue;
        const across = (e.x - R.x) * -dy + (e.y - R.y) * dx;
        if (Math.abs(across) > width / 2 + e.radius) continue;
        hitSet.add(e);
        const side = across >= 0 ? 1 : -1;
        dealDamage(e, damage * (isDemon(e) ? 1 + F.demonBonus : 1), { kbX: -dy * side * F.knockback + dx * 80, kbY: dx * side * F.knockback + dy * 80 });
        createExplosion(e.x, e.y, '#dc2626', 8);
    }
}

// --- RAIO DO GUDRAN ---
// A mira vem do mouse (o ponto para onde ele iria) ou do joystick; o raio gira até ela na velocidade turnSpeed, como um farol. O
// herói não anda enquanto atira (js/systems/player.js). A cada pulso, todo monstro a menos de width/2 da linha leva dano de magia.
export const BEAM_LENGTH = 2400;
function updateBeam(dt) {
    const F = run.fury;
    let want = null;
    if (Math.hypot(joystick.x, joystick.y) > 0.15) want = Math.atan2(joystick.y, joystick.x);
    else if (Math.hypot(player.targetX - player.x, player.targetY - player.y) > 8) want = Math.atan2(player.targetY - player.y, player.targetX - player.x);
    if (want !== null) {
        let diff = want - furyBeam.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const step = F.turnSpeed * dt;
        furyBeam.angle += Math.max(-step, Math.min(step, diff));
    }
    furyBeam.age += dt;
    player.angle = furyBeam.angle;
    player.castAge = 0.05;                     // a mão livre fica erguida enquanto ele atira
    player.iFrames = Math.max(player.iFrames, 0.15);   // o escudo azul: invulnerável enquanto o raio dura
    run.timer -= dt;
    if (run.timer > 0) return;
    run.timer = F.tickSeconds;
    furyBeam.pulse = 1;
    const dx = Math.cos(furyBeam.angle);
    const dy = Math.sin(furyBeam.angle);
    const half = F.width / 2;
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        const along = (e.x - player.x) * dx + (e.y - player.y) * dy;
        if (along < 0) continue;
        const across = Math.abs((e.x - player.x) * -dy + (e.y - player.y) * dx);
        if (across > half + e.radius) continue;
        dealDamage(e, furyDamage(getSpellDamage() * F.damage * (isDemon(e) ? 1 + F.demonBonus : 1)),
            { noCrit: true, quiet: true, number: true, style: 'spell', kbX: dx * F.knockback, kbY: dy * F.knockback });
        createExplosion(e.x, e.y - e.radius, '#93c5fd', 2);
    }
}
