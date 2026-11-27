// --- EVENTOS DE ONDA (valores em data_model/wave_events.js) ---
// A 2ª onda de cada tela sorteia um evento que muda a regra da caçada (Goblin do Baú que dá blink, ataque pelo flanco, escuridão, chuva de meteoros).
// Nada aqui desenha por quadro: o aviso dos meteoros e a escuridão reutilizam o que já existe (telegraphs 'circle' e bossFx 'dark').
import { effectiveTurn, screenIndexOf, waveInScreen } from '../../data_model/campaign.js';
import { getTurnDifficulty, waveProgress } from '../../data_model/difficulty.js';
import { FIRST_SCREEN_EVENT, WAVE_EVENTS } from '../../data_model/wave_events.js';
import { screenOf } from '../../data_model/screens/index.js';
import { audio, player, state } from '../core/state.js';
import { showBanner, showToast } from '../ui/banner.js';
import { getSceneryId } from '../render/scenery.js';
import { addSlam } from './boss_ai.js';
import { blockedAt } from './colliders.js';
import { createExplosion, shakeScreen } from './effects.js';
import { purgeEnemy } from './enemies.js';
import { mod } from './modifiers.js';
import { addMonster, spawnSpotFor } from './spawner.js';
import { spawnDefOf } from '../../library/monsters/25d/spawn.js';
import { zoneMonsterTypes } from './spawn_zones.js';

const KEYS = Object.keys(WAVE_EVENTS);

// Chamado ao começar cada hora (night.js, startHour): devolve o evento da onda ou null
export function rollWaveEvent(hour, random = Math.random) {
    if (waveInScreen(hour) !== 2 || state.hourPlan?.boss) return null;       // só a onda do meio; onda com chefe (a 17, no Castle) não tem evento
    let key;
    if (screenIndexOf(hour) === 0) key = FIRST_SCREEN_EVENT;
    else {
        const pool = KEYS.filter(k => k !== state.lastWaveEvent);
        key = pool[Math.floor(random() * pool.length)];
    }
    state.lastWaveEvent = key;
    return { key, started: false, timer: 0, goblin: null };
}

export function updateWaveEvents(dt) {
    const ev = state.hourPlan?.event;
    if (!ev || state.phase !== 'HUNT') return;
    const def = WAVE_EVENTS[ev.key];
    const progress = waveProgress(state.scoreTurn, state.targetScore, state.waveTime);
    if (ev.goblin) updateGoblin(ev, def, dt);
    if (state.lastStand || state.bossSlain || state.currentBoss || state.bossPending > 0) {
        if (ev.goblin) endGoblin(ev, false);
        return;
    }
    if (!ev.started) {
        if (progress < def.at) return;
        ev.started = true;
        START[ev.key](ev, def);
    }
    if (ev.key === 'meteors' && progress < def.until) updateMeteors(ev, def, dt);
}

const curve = () => effectiveTurn(state.turn);
// Faixa do evento no centro da tela (eyebrow WAVE EVENT; o Goblin tem a sua em verde: style 'goblin' em css/components/banner.css)
const announce = (def, style = def.banner ?? 'warn', sub = def.sub) => { showBanner('WAVE EVENT', def.name, sub, style); audio.playHorn(); };

const START = {
    goblin(ev, def) {
        const e = addMonster('CHEST_GOBLIN', state.coreX, state.coreY);
        e.hp = e.maxHp = Math.round(e.maxHp * def.hpMultiplier);
        e.holdAim = true;                   // o movimento normal fica desligado: quem o move é updateGoblin
        e.torchOnly = true;
        e.dropsChest = true;                // morto, solta o baú
        e.goblin = { phase: 'visible', timer: rand(def.visibleSeconds), age: 0, theta: Math.random() * TAU, dir: Math.random() < 0.5 ? -1 : 1, laughed: false };
        e.goblin.theta = freeTheta(e, def, e.goblin.theta, 1);
        placeOnOrbit(e, def);
        blinkIn(e);
        ev.goblin = e;
        announce(def);
    },
    flank(ev, def) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const count = Math.round(def.baseCount + def.perCurveTurn * curve());
        const screen = screenOf(getSceneryId());
        const here = zoneMonsterTypes();
        const pool = (here.length ? here : screen.monsters.map(m => m.type)).filter(t => t !== 'BONE_COLOSSUS' && t !== 'TREANT' && t !== 'GOLEM' && t !== 'NECROMANCER');
        const type = pool[Math.floor(Math.random() * pool.length)] ?? 'SKELETON';
        let spawned = 0;
        for (let tries = 0; tries < 60 && spawned < count; tries++) {
            const spot = spawnSpotFor(type);
            if (!spot) break;
            const onSide = side === 'left' ? spot.x < state.width / 2 : spot.x >= state.width / 2;
            if (!onSide && tries < 50) continue;       // sem zona do lado sorteado, aceita qualquer uma
            const e = addMonster(type, spot.x + (Math.random() - 0.5) * 40, spot.y + (Math.random() - 0.5) * 40, { emerge: spot.emerge });
            e.torchOnly = true;                        // vão direto para a chama: o herói tem que interceptar
            spawned++;
        }
        announce(def, 'danger', def.sub.replace('{side}', side));
    },
    dark(ev, def) {
        state.bossFx = { kind: 'dark', boss: { hp: 1 }, age: 0, seconds: def.seconds, strength: def.strength, r0: def.innerRadius, r1: def.outerRadius };
        announce(def);
    },
    meteors(ev, def) {
        ev.timer = 0.8;
        announce(def);
    }
};

// Goblin do Baú: não faz nada além de rodar em volta da tocha, dar risada e sumir e aparecer (blink) em outro ponto da órbita. Muita vida: o jogador corre atrás dele.
// Fases: visible (à vista, rodando) -> out (some) -> gone (invisível, sem ser atingido) -> in (reaparece numa nuvem). Depois de staySeconds ele dá a última risada e vai embora.
const TAU = Math.PI * 2;
const rand = ([a, b]) => a + Math.random() * (b - a);

function orbitPoint(def, theta) {
    return {
        x: Math.max(40, Math.min(state.width - 40, state.coreX + Math.cos(theta) * def.orbitX)),
        y: Math.max(170, Math.min(state.height - 40, state.coreY + Math.sin(theta) * def.orbitY))
    };
}
const blockedPoint = (e, p) => blockedAt(p.x, p.y, e.radius + 6, 'monsters');       // dentro de rio, parede ou prédio do cenário?

function placeOnOrbit(e, def) {
    const p = orbitPoint(def, e.goblin.theta);
    e.x = p.x;
    e.y = p.y;
}

// Um ponto da órbita que NÃO está numa área bloqueada: tenta saltos a partir do ângulo de agora e, se nada servir, qualquer ângulo; sem nenhum, fica onde está
function freeTheta(e, def, from, dir) {
    for (let i = 0; i < 28; i++) {
        const theta = i < 10 ? from + dir * rand(def.jumpAngle) : Math.random() * TAU;
        if (!blockedPoint(e, orbitPoint(def, theta))) return theta;
    }
    return from;
}

// Reaparece: a nuvem de nascimento do monstro (library/monsters/25d/spawn.js) faz o corpo surgir
function blinkIn(e) {
    const def = spawnDefOf('CHEST_GOBLIN');
    e.blinkAlpha = undefined;
    e.untargetable = false;
    e.invulnerable = false;
    if (def) e.emerge = { age: 0, seconds: def.seconds, def };
    audio.playBlink?.();
}

function updateGoblin(ev, def, dt) {
    const e = ev.goblin;
    if (!e || e.hp <= 0 || !state.enemies.includes(e)) { ev.goblin = null; return; }
    const g = e.goblin;
    g.age += dt;
    if (g.age >= def.staySeconds && g.phase !== 'leaving') {
        g.phase = 'leaving';
        audio.playGiggle?.();
        endGoblin(ev, true);
        return;
    }
    if (e.emerge) return;                                   // reaparecendo: parado
    const stunned = e.frozen > 0 || e.stunned > 0;
    g.timer -= dt;
    if (g.phase === 'visible') {
        let blocked = false;
        if (!stunned) {
            const before = [e.x, e.y];
            const next = g.theta + g.dir * def.orbitSpeed * dt;
            // O caminho à frente (um pouco adiante do passo) bate numa área bloqueada? Em vez de empacar ou deslizar, ele dá blink
            blocked = blockedPoint(e, orbitPoint(def, next)) || blockedPoint(e, orbitPoint(def, next + g.dir * 0.12));
            if (!blocked) {
                g.theta = next;
                placeOnOrbit(e, def);
                e.angle = Math.atan2(e.y - before[1], e.x - before[0]);
                e.facing = e.angle;
            }
        }
        if (!g.laughed && g.timer < 1.2) { g.laughed = true; audio.playGiggle?.(); }
        if (g.timer <= 0 || blocked) {
            g.phase = 'out';
            g.timer = def.fadeSeconds;
            e.invulnerable = true;
            createExplosion(e.x, e.y, '#facc15', 8);
            audio.playBlink?.();
        }
    } else if (g.phase === 'out') {
        e.blinkAlpha = Math.max(0, g.timer / def.fadeSeconds);
        if (g.timer <= 0) {
            g.phase = 'gone';
            g.timer = rand(def.goneSeconds);
            e.blinkAlpha = 0;
            e.untargetable = true;
        }
    } else if (g.phase === 'gone') {
        if (g.timer <= 0) {
            if (Math.random() < 0.35) g.dir = -g.dir;       // às vezes muda de sentido
            g.theta = freeTheta(e, def, g.theta, g.dir);       // reaparece num ponto livre (fora de rio, parede, prédio)
            placeOnOrbit(e, def);
            g.phase = 'visible';
            g.timer = rand(def.visibleSeconds);
            g.laughed = false;
            blinkIn(e);
        }
    }
}

// Acabou o tempo (ou a onda fechou): ele some numa nuvem de ouro, sem baú
function endGoblin(ev, escaped) {
    const e = ev.goblin;
    ev.goblin = null;
    if (!e) return;
    const i = state.enemies.indexOf(e);
    if (i < 0 || e.hp <= 0) return;
    e.blinkAlpha = undefined;
    createExplosion(e.x, e.y, '#facc15', 14);
    e.dropsChest = false;
    purgeEnemy(i);
    if (escaped) showToast('💨', 'The goblin got away', 'He took the chest with him');
}

// Chuva de meteoros: a cada everySeconds, um bando de círculos vermelhos em volta do herói; um deles bem em cima dele (anda para sair)
function updateMeteors(ev, def, dt) {
    ev.timer -= dt;
    if (ev.timer > 0) return;
    ev.timer = def.everySeconds;
    const count = Math.min(def.maxCount, Math.round(def.baseCount + def.perCurveTurn * curve()));
    const damage = def.damage * getTurnDifficulty(state.turn).damageMultiplier * (1 + mod('enemyDamage'));
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = i === 0 ? 0 : 70 + Math.random() * 190;
        const x = Math.max(40, Math.min(state.width - 40, player.x + Math.cos(a) * d));
        const y = Math.max(170, Math.min(state.height - 40, player.y + Math.sin(a) * d));
        addSlam(x, y, def.radius, def.warnSeconds + i * 0.12, damage, null, 0, '#fb923c');
    }
    shakeScreen(2);
}
