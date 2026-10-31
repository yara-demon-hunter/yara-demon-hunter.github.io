import { MASTER_THIEF, SMOKE_BOMB } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { blast, dealDamage } from './damage.js';
import { addFloater, createExplosion, hitStop, shakeScreen } from './effects.js';
import { dropGold } from './gold.js';
import { mod } from './modifiers.js';
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

export function updateShadowSkills(dt) {
    updateSmokes(dt);
    updateEchoes(dt);
    for (let i = state.markBursts.length - 1; i >= 0; i--) {
        state.markBursts[i].age += dt;
        if (state.markBursts[i].age >= state.markBursts[i].seconds) state.markBursts.splice(i, 1);
    }
}

export function clearShadowSkills() {
    state.smokes.length = 0;
    state.echoes.length = 0;
    state.markBursts.length = 0;
}
