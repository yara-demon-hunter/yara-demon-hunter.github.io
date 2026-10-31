import { EXECUTIONER, WAR_CRY } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { chargeUlt } from './combat.js';
import { blast, dealDamage } from './damage.js';
import { addGibs, addShockwave, createExplosion, hitStop, screenFlash, shakeScreen, zoomPunch } from './effects.js';
import { addGroundFire } from './powers.js';
import { startMove } from './moves.js';
import { getAtkDamage, getBladeDamage } from './stats.js';

// --- SKILLS DA LÂMINA ---
// O guerreiro quer estar no meio da horda: matar acelera, ser cercado rende um rugido, quem sobra morre de um golpe.
// Desenho em js/render/skills.js; as poses em js/render/player25d.js.
const TAU = Math.PI * 2;

// --- BLOODLUST ---
export function feedBloodlust() {
    const level = getPowerLevel(powers.bloodlust);
    if (!level) return;
    const hunger = state.bloodlust;
    hunger.stacks = Math.min(level.stacks, hunger.stacks + 1);
    hunger.timer = level.seconds;
}

function updateBloodlust(dt) {
    const hunger = state.bloodlust;
    if (hunger.stacks <= 0) return;
    hunger.timer -= dt;
    if (hunger.timer > 0) return;
    hunger.stacks--;
    hunger.timer = POWER_MODELS.bloodlust.decaySeconds;
}

// --- CRIMSON TIDE ---
// Com a fome alta, cada golpe joga uma meia-lua de sangue que atravessa a horda
export function launchCrescent(angle) {
    if (!powers.bloodlust.evolved) return;
    const C = EVOLUTIONS.bloodlust.crescent;
    if (state.bloodlust.stacks < C.minStacks) return;
    state.crescents.push({
        x: player.x, y: player.y, angle,
        vx: Math.cos(angle) * C.speed, vy: Math.sin(angle) * C.speed,
        travelled: 0, age: 0,
        damage: getBladeDamage() * C.damage,
        struck: new Set()
    });
}

function updateCrescents(dt) {
    const C = EVOLUTIONS.bloodlust.crescent;
    const { crescents } = state;
    for (let i = crescents.length - 1; i >= 0; i--) {
        const w = crescents[i];
        w.x += w.vx * dt;
        w.y += w.vy * dt;
        w.age += dt;
        w.travelled += C.speed * dt;
        for (const e of state.enemies) {
            if (w.struck.has(e) || Math.hypot(e.x - w.x, e.y - w.y) > e.radius + C.radius) continue;
            w.struck.add(e);
            dealDamage(e, w.damage, { kbX: Math.cos(w.angle) * 160, kbY: Math.sin(w.angle) * 160 });
            createExplosion(e.x, e.y, '#ef4444', 4);
        }
        if (w.travelled >= C.range) crescents.splice(i, 1);
    }
}

// --- EARTHBREAKER ---
// Rachaduras no chão: linhas irregulares que saem do impacto (sorteadas uma vez)
export function addCracks(x, y, radius, molten) {
    const rays = [];
    const count = 7 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * TAU + (Math.random() - 0.5) * 0.4;
        const points = [];
        const length = radius * (0.65 + Math.random() * 0.35);
        for (let s = 1; s <= 4; s++) {
            const reach = length * (s / 4);
            const side = (Math.random() - 0.5) * 16 * (s < 4 ? 1 : 0.4);
            points.push({
                x: Math.cos(angle) * reach - Math.sin(angle) * side,
                y: (Math.sin(angle) * reach + Math.cos(angle) * side) * 0.82
            });
        }
        rays.push(points);
    }
    state.cracks.push({ x, y, rays, life: 2.6, maxLife: 2.6, molten });
}

// Anel que fere e atordoa, usado pelo impacto e pelos abalos do Cataclysm
function quake(x, y, radius, damage, knockback, stun) {
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d > radius + e.radius) return;
        const a = Math.atan2(e.y - y, e.x - x);
        dealDamage(e, damage, { kbX: Math.cos(a) * knockback, kbY: Math.sin(a) * knockback, noCrit: true });
        if (!e.isBoss) e.stunned = Math.max(e.stunned ?? 0, stun);
    });
}

function slamImpact() {
    const level = getPowerLevel(powers.earthbreaker);
    if (!level) return;
    const M = POWER_MODELS.earthbreaker;
    const { x, y } = player;
    const evolved = powers.earthbreaker.evolved;
    quake(x, y, level.radius, getBladeDamage() * level.damage, M.knockback, M.stunSeconds);
    addCracks(x, y, level.radius * 1.1, evolved);
    addShockwave(x, y, { radius: level.radius, color: '#e7e0cf', width: 12, seconds: 0.4 });
    addShockwave(x, y, { radius: level.radius * 0.6, color: '#fb923c', width: 6, seconds: 0.3 });
    addGibs('ROCK', x, y, 1 + level.radius / 120);
    createExplosion(x, y, '#a8a29e', 14);
    shakeScreen(14);
    hitStop(0.08);
    zoomPunch(0.03);
    audio.playSlam();

    if (!evolved) return;
    const E = EVOLUTIONS.earthbreaker;
    for (let i = 1; i <= E.aftershocks; i++) {
        state.aftershocks.push({ x, y, delay: i * E.aftershockSeconds, radius: level.radius + i * E.aftershockStep, damage: level.damage * E.aftershockDamage });
    }
    for (let i = 0; i < E.lava.count; i++) {
        const a = (i / E.lava.count) * TAU + Math.random() * 0.5;
        const r = level.radius * (0.45 + Math.random() * 0.5);
        addGroundFire(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.82, { life: E.lava.life, radius: E.lava.radius, dps: E.lava.dps, evolved: true });
    }
}

function updateAftershocks(dt) {
    const { aftershocks } = state;
    for (let i = aftershocks.length - 1; i >= 0; i--) {
        const s = aftershocks[i];
        s.delay -= dt;
        if (s.delay > 0) continue;
        aftershocks.splice(i, 1);
        quake(s.x, s.y, s.radius, getBladeDamage() * s.damage, POWER_MODELS.earthbreaker.knockback * 0.5, 0.3);
        addShockwave(s.x, s.y, { radius: s.radius, color: '#fb923c', width: 8, seconds: 0.35 });
        shakeScreen(6);
        audio.playSlam(0.6);
    }
}

function updateEarthbreaker(dt) {
    const level = getPowerLevel(powers.earthbreaker);
    if (!level) return;
    const timers = state.powerTimers;
    timers.earthbreaker = (timers.earthbreaker ?? level.cooldown * 0.4) - dt;
    // Pronto, espera ter alguém perto: o golpe nunca é gasto no vazio
    if (timers.earthbreaker > 0 || player.move || player.dashTimer > 0) return;
    const near = state.enemies.some(e => Math.hypot(e.x - player.x, e.y - player.y) < level.radius * 0.8 + e.radius);
    if (!near) return;
    timers.earthbreaker = level.cooldown;
    startMove('slam', slamImpact);
    // No ar nada encosta nele: o salto também é uma esquiva
    player.iFrames = Math.max(player.iFrames, player.move.seconds * player.move.impactAt);
}

// --- WAR CRY ---
function warCryImpact() {
    const { x, y } = player;
    state.warCryTimer = WAR_CRY.bonusSeconds;
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d > WAR_CRY.radius + e.radius) return;
        const a = Math.atan2(e.y - y, e.x - x);
        dealDamage(e, getAtkDamage() * WAR_CRY.damage, { kbX: Math.cos(a) * WAR_CRY.knockback, kbY: Math.sin(a) * WAR_CRY.knockback, noCrit: true });
        if (!e.isBoss) e.stunned = Math.max(e.stunned ?? 0, WAR_CRY.stunSeconds);
    });
    addShockwave(x, y, { radius: WAR_CRY.radius, color: '#ef4444', width: 10, seconds: 0.45 });
    addShockwave(x, y, { radius: WAR_CRY.radius * 0.65, color: '#fecaca', width: 5, seconds: 0.35 });
    screenFlash('#ef4444', 0.18);
    shakeScreen(10);
    audio.playRoar();
}

function updateWarCry(dt) {
    if (state.warCryTimer > 0) state.warCryTimer -= dt;
    if (passives.warCry.lvl <= 0) return;
    const timers = state.powerTimers;
    if ((timers.warCry ?? 0) > 0) {
        timers.warCry -= dt;
        return;
    }
    if (player.move || state.phase !== 'HUNT') return;
    let around = 0;
    for (const e of state.enemies) {
        if (Math.hypot(e.x - player.x, e.y - player.y) < WAR_CRY.triggerRadius + e.radius) around++;
    }
    if (around < WAR_CRY.monsters) return;
    timers.warCry = WAR_CRY.cooldownSeconds;
    startMove('roar', warCryImpact);
}

// --- EXECUTIONER ---
// Chamado a cada monstro atingido pela lâmina do herói
export function tryExecute(e) {
    if (passives.executioner.lvl <= 0 || e.isBoss || e.hp <= 0) return;
    if (e.hp > e.maxHp * (e.elite ? EXECUTIONER.eliteThreshold : EXECUTIONER.threshold)) return;
    state.run.damage += e.hp;
    e.hp = 0;
    state.executions.push({ x: e.x, y: e.y, angle: Math.random() * TAU, age: 0, seconds: 0.26, radius: e.radius });
    createExplosion(e.x, e.y, '#dc2626', 10);
    chargeUlt(EXECUTIONER.furyCharge);
    hitStop(0.035);
    shakeScreen(3);
    audio.playExecute();
}

export function updateBladeSkills(dt) {
    updateBloodlust(dt);
    updateCrescents(dt);
    updateEarthbreaker(dt);
    updateAftershocks(dt);
    updateWarCry(dt);
    for (let i = state.executions.length - 1; i >= 0; i--) {
        state.executions[i].age += dt;
        if (state.executions[i].age >= state.executions[i].seconds) state.executions.splice(i, 1);
    }
}

export function clearBladeSkills() {
    state.crescents.length = 0;
    state.aftershocks.length = 0;
    state.executions.length = 0;
    state.cracks.length = 0;
}

export function updateCracks(dt) {
    const { cracks } = state;
    for (let i = cracks.length - 1; i >= 0; i--) {
        cracks[i].life -= dt;
        if (cracks[i].life <= 0) cracks.splice(i, 1);
    }
}
