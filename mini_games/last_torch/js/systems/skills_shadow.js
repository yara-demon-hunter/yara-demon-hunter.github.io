import { FEATHER_DODGE, MASTER_THIEF, FEATHER_RAIN, RAVEN_DECOY, SHADOW_RAVEN, SHADOW_SHACKLE, SMOKE_BOMB } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { blast, dealDamage } from './damage.js';
import { addFloater, addShockwave, createExplosion, hitStop, shakeScreen } from './effects.js';
import { dropGold } from './gold.js';
import { getKnifeRange } from './knives.js';
import { followRate, wander } from './companions.js';
import { mod } from './modifiers.js';
import { startCast } from './moves.js';
import { nearestEnemy } from './powers.js';
import { getAtkDamage, getDashCharges } from './stats.js';

// --- SKILLS DA SOMBRA ---
// O ladrão ganha com técnica: marca de longe, detona de perto, atravessa a horda, some na fumaça.
// Desenho em js/render/skills.js.

// --- DEATH MARK ---
export function markEnemy(e) {
    const level = getPowerLevel(powers.deathMark);
    if (level) e.marked = level.seconds;
}

// byDash: atravessar o monstro rende mais e devolve a carga do dash. Toda detonação recarrega a adaga.
export function detonateMark(e, byDash) {
    const level = getPowerLevel(powers.deathMark);
    if (!level) return;
    e.marked = 0;
    const M = POWER_MODELS.deathMark;
    const damage = getAtkDamage() * level.damage * (byDash ? M.dashMultiplier : 1);
    dealDamage(e, damage, { crit: byDash });
    state.markBursts.push({ x: e.x, y: e.y, age: 0, seconds: 0.3, radius: e.radius, big: byDash });
    createExplosion(e.x, e.y, '#a78bfa', byDash ? 12 : 7);
    state.knifeTimer = 0;
    if (level.splash > 0) {
        state.blastBudget++;
        blast(e.x, e.y, level.splash, damage * 0.5, 180, '#a78bfa');
    }
    if (byDash) {
        player.dashCharges = Math.min(getDashCharges(), player.dashCharges + 1);
        hitStop(0.04);
        shakeScreen(4);
    }
    audio.playMark(byDash);
}

// --- CAMINHO DO DASH ---
// Tudo que o dash faz ao passar por um monstro (uma vez por monstro, por dash)
export function strikeDashPath() {
    const rush = getPowerLevel(powers.phantomDash);
    const thief = passives.masterThief.lvl > 0;
    const marks = powers.deathMark.lvl > 0;
    if (!rush && !thief && !marks) return;
    for (const e of state.enemies) {
        if (player.dashStruck?.has(e) || Math.hypot(e.x - player.x, e.y - player.y) > e.radius + 26) continue;
        (player.dashStruck ??= new Set()).add(e);
        if (rush) {
            dealDamage(e, getAtkDamage() * rush.damage, { kbX: player.dashX * 200, kbY: player.dashY * 200 });
            createExplosion(e.x, e.y, '#67e8f9', 5);
        }
        if (e.marked > 0) detonateMark(e, true);
        if (thief && !e.isBoss) pickPocket(e);
    }
}

function pickPocket(e) {
    const gold = Math.round((MASTER_THIEF.stealBase + state.turn * MASTER_THIEF.stealPerHour) * (1 + mod('gold')));
    dropGold(e.x, e.y, gold);
    createExplosion(e.x, e.y, '#fbbf24', 3);
}

export function stealOnPerfectDodge() {
    if (passives.masterThief.lvl <= 0) return;
    dropGold(player.x, player.y, Math.round(MASTER_THIEF.perfectDodgeGold * (1 + mod('gold'))));
    addFloater(player.x, player.y - 62, 'STOLEN', '#fbbf24');
}

// --- SMOKE BOMB ---
function addSmoke(x, y) {
    const { smokes } = state;
    if (smokes.length >= SMOKE_BOMB.maxClouds) smokes.shift();
    smokes.push({ x, y, age: 0, seconds: SMOKE_BOMB.seconds, radius: SMOKE_BOMB.radius, seed: Math.random() * 6 });
}

export function onDashStart(x, y) {
    if (passives.smokeBomb.lvl <= 0) return;
    player.smokeX = x;
    player.smokeY = y;
    addSmoke(x, y);
    audio.playSmoke();
}

// Durante o avanço: uma nuvem a cada `spacing`, formando o rasto
export function leaveSmokeTrail() {
    if (passives.smokeBomb.lvl <= 0) return;
    if (Math.hypot(player.x - player.smokeX, player.y - player.smokeY) < SMOKE_BOMB.spacing) return;
    player.smokeX = player.x;
    player.smokeY = player.y;
    addSmoke(player.x, player.y);
}

function updateSmokes(dt) {
    const { smokes } = state;
    for (let i = smokes.length - 1; i >= 0; i--) {
        const s = smokes[i];
        s.age += dt;
        if (s.age >= s.seconds) {
            smokes.splice(i, 1);
            continue;
        }
        for (const e of state.enemies) {
            if (Math.hypot(e.x - s.x, e.y - s.y) < s.radius + e.radius) e.slow = Math.max(e.slow ?? 0, SMOKE_BOMB.slow);
        }
    }
}

// --- NIGHT REAPER ---
// Fim do dash: a sombra refaz o mesmo caminho, um instante depois, cortando de novo
export function onDashEnd(fromX, fromY) {
    if (!powers.phantomDash.evolved) return;
    const { echo } = EVOLUTIONS.phantomDash;
    state.echoes.push({
        fromX, fromY, toX: player.x, toY: player.y,
        x: fromX, y: fromY,
        delay: echo.delaySeconds, age: 0, seconds: echo.seconds,
        damage: getAtkDamage() * getPowerLevel(powers.phantomDash).damage * echo.damage,
        struck: new Set()
    });
}

function updateEchoes(dt) {
    const { echo } = EVOLUTIONS.phantomDash;
    const { echoes } = state;
    for (let i = echoes.length - 1; i >= 0; i--) {
        const s = echoes[i];
        s.delay -= dt;
        if (s.delay > 0) continue;
        s.age += dt;
        const k = Math.min(1, s.age / s.seconds);
        s.x = s.fromX + (s.toX - s.fromX) * k;
        s.y = s.fromY + (s.toY - s.fromY) * k;
        state.dashGhosts.push({ x: s.x, y: s.y, age: 0, seconds: 0.22, angle: Math.atan2(s.toY - s.fromY, s.toX - s.fromX), dark: true });
        for (const e of state.enemies) {
            if (s.struck.has(e) || Math.hypot(e.x - s.x, e.y - s.y) > e.radius + echo.hitRadius) continue;
            s.struck.add(e);
            dealDamage(e, s.damage, { style: 'shadow' });
            createExplosion(e.x, e.y, '#7c3aed', 6);
        }
        if (k >= 1) echoes.splice(i, 1);
    }
}

// --- SHADOW RAVEN ---
// O corvo voa no ombro do herói, do lado de trás de quem anda. De tempos em tempos mergulha no monstro mais perto,
// bica e volta. Desenho em js/render/raven.js.
// Onde o corvo pousa: quem já voa em volta do herói (a fênix e o Grave Wisp) tem a vez, e ele escolhe o primeiro
// pouso livre. Troca só quando o atual fica ocupado, para não pular de um lado a outro.
function companionSpots() {
    const spots = [];
    if (passives.phoenixPact.lvl > 0 && !state.phoenixSpent) spots.push({ x: state.phoenix.x - player.x, y: state.phoenix.y - player.y });
    if (powers.graveWisp.lvl > 0) spots.push({ x: -26, y: -14 });
    return spots;
}

function pickSpot(bird) {
    const C = SHADOW_RAVEN;
    const others = companionSpots();
    const free = (spot, clearance) => others.every(o => Math.hypot(o.x - bird.side * spot.side * spot.x, o.y - spot.y) >= clearance);
    const current = C.spots[bird.spot ?? 0];
    if (free(current, C.spotClearance * 0.7)) return current;
    bird.spot = Math.max(0, C.spots.findIndex(spot => free(spot, C.spotClearance)));
    return C.spots[bird.spot];
}

export function updateRaven(dt) {
    const bird = state.raven;
    if (passives.shadowRaven.lvl <= 0) {
        bird.placed = false;
        return;
    }
    const C = SHADOW_RAVEN;
    const t = state.runTime;
    const moved = player.x - (bird.heroX ?? player.x);
    bird.heroX = player.x;
    if (Math.abs(moved) > 0.3) bird.side = moved > 0 ? -1 : 1;
    const spot = pickSpot(bird);
    const drift = wander(t, 2);
    const homeX = player.x + bird.side * spot.side * spot.x + drift.x;
    const homeY = player.y + spot.y + drift.y;
    if (!bird.placed) {
        bird.x = homeX;
        bird.y = homeY;
        bird.placed = true;
        bird.rise = 0;
        bird.mode = 'home';
        bird.target = null;
        bird.timer = C.cooldownSeconds * 0.5;
        bird.facing = -bird.side;
        createExplosion(homeX, homeY, '#8b5cf6', 8);
    }
    bird.rise = Math.min(1, bird.rise + dt / C.riseSeconds);

    if (bird.mode === 'dive') {
        const e = bird.target;
        bird.diveTime += dt;
        if (!e || e.hp <= 0 || !state.enemies.includes(e) || bird.diveTime > C.maxDiveSeconds) {
            bird.mode = 'home';
        } else {
            const dx = e.x - bird.x;
            const dy = e.y - bird.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist <= e.radius + C.reach) {
                peck(e, dx / dist, dy / dist);
                bird.mode = 'home';
            } else {
                const step = Math.min(dist, C.diveSpeed * dt);
                bird.x += (dx / dist) * step;
                bird.y += (dy / dist) * step;
                bird.facing = dx >= 0 ? 1 : -1;
                bird.tilt = bird.facing * Math.atan2(dy, Math.abs(dx)) * 0.85;
            }
        }
        bird.dive = bird.mode === 'dive' ? 1 : 0;
        return;
    }

    // Em casa: segue o ombro (mais depressa quando está longe, na volta do mergulho)
    const far = Math.hypot(homeX - bird.x, homeY - bird.y) > 60 ? 2.4 : 1;
    const pull = Math.min(1, dt * followRate(C.followSpeed) * far);
    const vx = (homeX - bird.x) * pull;
    bird.x += vx;
    bird.y += (homeY - bird.y) * pull;
    bird.tilt += (Math.max(-0.3, Math.min(0.3, vx * 0.05)) - bird.tilt) * Math.min(1, dt * 8);
    bird.facing = -bird.side;
    bird.dive = Math.max(0, bird.dive - dt * 5);

    bird.timer -= dt;
    if (bird.rise < 1 || bird.timer > 0) return;
    const target = nearestEnemy(player.x, player.y, C.range);
    if (!target) return;
    bird.timer = C.cooldownSeconds;
    bird.mode = 'dive';
    bird.target = target;
    bird.diveTime = 0;
}

function peck(e, dirX, dirY) {
    const C = SHADOW_RAVEN;
    dealDamage(e, getAtkDamage() * C.damage, { kbX: dirX * C.knockback, kbY: dirY * C.knockback, style: 'shadow' });
    e.ravenMark = C.markSeconds;
    createExplosion(e.x, e.y, '#f87171', 5);
    audio.playCaw();
}

const TAU = Math.PI * 2;

// --- FEATHER DODGE ---
// Chamado por hurtPlayer (js/systems/player.js) quando um golpe ia acertar o herói: o golpe erra, as penas de corvo explodem em volta dele e ele fica
// intocável por immuneSeconds (o resto do tempo em que o herói pisca é a invulnerabilidade comum). Uma vez por recarga. Devolve true se escapou.
export function tryFeatherDodge() {
    const D = FEATHER_DODGE;
    if (passives.featherDodge.lvl <= 0 || (state.powerTimers.featherDodge ?? 0) > 0 || state.phase !== 'HUNT' || player.hp <= 0) return false;
    state.powerTimers.featherDodge = D.cooldownSeconds;
    player.iFrames = Math.max(player.iFrames, D.immuneSeconds);
    state.featherDodge = { age: 0, seconds: D.immuneSeconds };
    for (let i = 0; i < D.feathers; i++) {
        const a = Math.random() * TAU;
        const speed = 90 + Math.random() * 230;
        state.feathers.push({
            x: player.x + Math.cos(a) * 6, y: player.y - 16 + Math.sin(a) * 4,
            vx: Math.cos(a) * speed, vy: Math.sin(a) * speed * 0.7 - 30,
            rot: Math.random() * TAU, spin: (Math.random() - 0.5) * 9,
            age: 0, life: 0.7 + Math.random() * 0.7, size: 5 + Math.random() * 3.5, tone: i % 3
        });
    }
    if (passives.ravenDecoy.lvl > 0) state.decoy = { x: player.x, y: player.y, age: 0, seconds: RAVEN_DECOY.seconds, lures: RAVEN_DECOY.lures };
    createExplosion(player.x, player.y - 14, '#a78bfa', 10);
    addShockwave(player.x, player.y, { radius: 54, color: '#a78bfa', width: 4, seconds: 0.35 });
    shakeScreen(3);
    audio.playFeatherDodge?.();
    audio.playCaw?.();
    return true;
}

function updateFeathers(dt) {
    const timers = state.powerTimers;
    if ((timers.featherDodge ?? 0) > 0) timers.featherDodge -= dt;
    const dodge = state.featherDodge;
    if (dodge) {
        dodge.age += dt;
        if (dodge.age >= dodge.seconds) state.featherDodge = null;
    }
    const decoy = state.decoy;
    if (decoy) {
        decoy.age += dt;
        if (decoy.age >= decoy.seconds) {
            const R = RAVEN_DECOY;
            state.decoy = null;
            blast(decoy.x, decoy.y, R.radius, getAtkDamage() * R.damage, 160, '#a78bfa', 'shadow');
            for (let i = 0; i < R.feathers; i++) {
                const a = Math.random() * TAU, speed = 80 + Math.random() * 200;
                state.feathers.push({ x: decoy.x, y: decoy.y - 10, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed * 0.7 - 40, rot: Math.random() * TAU,
                    spin: (Math.random() - 0.5) * 9, age: 0, life: 0.6 + Math.random() * 0.6, size: 5 + Math.random() * 3.5, tone: i % 3 });
            }
            createExplosion(decoy.x, decoy.y - 8, '#a78bfa', 10);
            addShockwave(decoy.x, decoy.y, { radius: R.radius, color: '#a78bfa', width: 4, seconds: 0.35 });
            shakeScreen(3);
            audio.playFeatherDodge?.();
        }
    }
    const { feathers } = state;
    for (let i = feathers.length - 1; i >= 0; i--) {
        const f = feathers[i];
        f.age += dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vx *= 0.94;
        f.vy = f.vy * 0.94 + 55 * dt;                 // cai devagar, planando
        f.rot += f.spin * dt;
        if (f.age >= f.life) feathers.splice(i, 1);
    }
}

// Feather Rain: a cada cooldownSeconds, os marcados pelo corvo (os mais perto do herói) recebem uma chuva de penas que cai de cima. Cada pena machuca ao pousar.
function updateFeatherRain(dt) {
    const Q = FEATHER_RAIN;
    const timers = state.powerTimers;
    if (passives.featherRain.lvl > 0 && state.phase === 'HUNT') {
        timers.featherRain = (timers.featherRain ?? Q.cooldownSeconds) - dt;
        if (timers.featherRain <= 0) {
            const marked = state.enemies.filter((e) => e.ravenMark > 0 && e.hp > 0)
                .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y)).slice(0, Q.targets);
            if (marked.length) {
                timers.featherRain = Q.cooldownSeconds;
                for (const e of marked) {
                    for (let i = 0; i < Q.quills; i++) {
                        state.quills.push({ target: e, ox: (Math.random() - 0.5) * 26, oy: (Math.random() - 0.5) * 14, delay: i * 0.07, age: 0, fall: Q.fallSeconds, hit: false });
                    }
                }
                audio.playFeatherDodge?.();
            } else timers.featherRain = 0.3;
        }
    }
    const quills = state.quills;
    for (let i = quills.length - 1; i >= 0; i--) {
        const q = quills[i];
        q.age += dt;
        const e = q.target;
        if (!q.hit && q.age >= q.delay + q.fall) {
            q.hit = true;
            q.x = e.x + q.ox; q.y = e.y + q.oy;
            if (e.hp > 0) {
                dealDamage(e, getAtkDamage() * Q.damage, { style: 'shadow' });
                createExplosion(q.x, q.y, '#a78bfa', 2);
            }
        }
        if (q.age >= q.delay + q.fall + Q.stuckSeconds) quills.splice(i, 1);
    }
}

// --- SHADOW SHACKLE ---
// Sozinha, a cada recarga: a corrente sai do herói, voa até o monstro mais forte ao alcance da adaga e o prende ao
// chão. Quem trava a posição é js/systems/enemies.js, pelo e.chained. Desenho em js/render/shackle.js.
function shackleTarget() {
    const range = getKnifeRange();
    let best = null;
    for (const e of state.enemies) {
        if (e.hp <= 0 || e.chained || e.unstoppable || Math.hypot(e.x - player.x, e.y - player.y) > range) continue;
        if (!best || e.maxHp > best.maxHp) best = e;
    }
    return best;
}

function releaseShackle() {
    const s = state.shackle;
    state.shackle = null;
    if (s?.held) s.target.chained = false;
}

function bindShackle(s) {
    const e = s.target;
    s.held = true;
    s.age = 0;
    s.hold = SHADOW_SHACKLE.holdSeconds * (e.isBoss ? SHADOW_SHACKLE.bossRatio : 1);      // chefe: metade do tempo
    e.chained = true;
    e.chainX = e.x;
    e.chainY = e.y;
    createExplosion(e.x, e.y, '#a78bfa', 10);
    addShockwave(e.x, e.y, { radius: e.radius + 34, color: '#a78bfa', width: 4, seconds: 0.3 });
    shakeScreen(3);
    audio.playShackle(true);
}

export function updateShackle(dt) {
    if (passives.shadowShackle.lvl <= 0) return;
    if (state.shackleTimer > 0) state.shackleTimer -= dt;
    const s = state.shackle;
    if (s) {
        const e = s.target;
        if (e.hp <= 0 || !state.enemies.includes(e)) {
            releaseShackle();
        } else if (s.held) {
            s.age += dt;
            if (s.age >= (s.hold ?? SHADOW_SHACKLE.holdSeconds)) {
                createExplosion(e.x, e.y, '#a78bfa', 8);
                releaseShackle();
            }
        } else {
            s.reach += SHADOW_SHACKLE.speed * dt;
            if (s.reach >= Math.hypot(e.x - player.x, e.y - player.y)) bindShackle(s);
        }
        return;
    }
    if (state.shackleTimer > 0) return;
    const target = shackleTarget();
    if (!target) return;
    state.shackleTimer = SHADOW_SHACKLE.cooldownSeconds;
    state.shackle = { target, reach: 0, held: false, age: 0 };
    startCast();
    audio.playShackle(false);
}

export function updateShadowSkills(dt) {
    updateRaven(dt);
    updateFeathers(dt);
    updateFeatherRain(dt);
    updateShackle(dt);
    updateSmokes(dt);
    updateEchoes(dt);
    for (let i = state.markBursts.length - 1; i >= 0; i--) {
        state.markBursts[i].age += dt;
        if (state.markBursts[i].age >= state.markBursts[i].seconds) state.markBursts.splice(i, 1);
    }
}

export function clearShadowSkills() {
    releaseShackle();
    state.featherDodge = null;
    state.feathers.length = 0;
    state.decoy = null;
    state.quills.length = 0;
    state.smokes.length = 0;
    state.echoes.length = 0;
    state.markBursts.length = 0;
}
