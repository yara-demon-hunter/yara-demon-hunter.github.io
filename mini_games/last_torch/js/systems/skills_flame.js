import { CHARACTER_MODEL } from '../../data_model/character.js';
import { BACKDRAFT, FIREBALLS, FLAME_BLADE, PHOENIX_PACT, VIGIL } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { updateHUD } from '../ui/hud.js';
import { blast, dealDamage, ignite } from './damage.js';
import { addShockwave, createExplosion, screenFlash, shakeScreen, slowMotion } from './effects.js';
import { wander, followRate } from './companions.js';
import { mod } from './modifiers.js';
import { phoenixBeak } from '../render/phoenix.js';
import { addGroundFire, nearestEnemy, ready } from './powers.js';
import { getSpellCooldown, getSpellDamage } from './stats.js';

// --- SKILLS DA CHAMA ---
// O guardião ganha com paciência: fica perto da tocha, firme, e deixa o fogo trabalhar.
// Desenho em js/render/skills.js; a pose do Vigil em js/render/player25d.js.

// --- HEARTH RING ---
function updateFireRing(dt) {
    const level = getPowerLevel(powers.fireRing);
    if (!level) return;
    const M = POWER_MODELS.fireRing;
    const tick = ready('fireRing', dt, M.tickSeconds);
    const damage = getSpellDamage() * level.dps * M.tickSeconds;
    for (const e of state.enemies) {
        const d = Math.hypot(e.x - state.coreX, e.y - state.coreY);
        if (Math.abs(d - level.radius) > M.width + e.radius) continue;
        e.slow = Math.max(e.slow ?? 0, level.slow);
        if (tick) dealDamage(e, damage, { noCrit: true, quiet: true });
    }
    if (powers.fireRing.evolved) updateSolarFlare(dt, level);
}

// Solar Wall: de tempos em tempos a muralha sobe e joga para longe quem está nela
function updateSolarFlare(dt, level) {
    const F = EVOLUTIONS.fireRing.flare;
    if (!ready('solarFlare', dt, F.seconds)) return;
    const damage = getSpellDamage() * F.damage;
    for (const e of state.enemies) {
        const dx = e.x - state.coreX;
        const dy = e.y - state.coreY;
        const d = Math.hypot(dx, dy) || 1;
        if (Math.abs(d - level.radius) > F.reach + e.radius) continue;
        const push = e.isBoss ? 0 : F.knockback;
        dealDamage(e, damage, { kbX: (dx / d) * push, kbY: (dy / d) * push, noCrit: true });
    }
    addShockwave(state.coreX, state.coreY, { radius: level.radius + F.reach, color: '#fef08a', width: 10, seconds: 0.4 });
    audio.playNova();
}

// --- VIGIL ---
function updateVigil(dt) {
    if (passives.vigil.lvl <= 0) {
        player.shield = 0;
        player.vigilStance = false;
        return;
    }
    if (player.shieldCooldown > 0) player.shieldCooldown -= dt;
    player.vigilStance = player.stillTime >= VIGIL.stillSeconds * 0.5 && !player.move;
    if (player.shield > 0 || player.shieldCooldown > 0 || player.stillTime < VIGIL.stillSeconds) return;
    player.shield = 1;
    addShockwave(player.x, player.y, { radius: 46, color: '#fde68a', width: 4, seconds: 0.35 });
    audio.playShield();
}

// O escudo paga o golpe (true) e estoura em volta do herói
export function absorbHit() {
    if (player.shield <= 0) return false;
    player.shield = 0;
    player.shieldCooldown = VIGIL.rechargeSeconds;
    state.blastBudget++;
    blast(player.x, player.y, VIGIL.burstRadius, getSpellDamage() * VIGIL.burstDamage, VIGIL.burstKnockback, '#fb923c');
    addShockwave(player.x, player.y, { radius: VIGIL.burstRadius, color: '#fde68a', width: 8, seconds: 0.35 });
    audio.playShieldBreak();
    return true;
}

// --- BACKDRAFT ---
// Um monstro acaba de se consumir na chama
export function onTorchTouched() {
    if (passives.backdraft.lvl <= 0) return;
    state.blastBudget++;
    blast(state.coreX, state.coreY, BACKDRAFT.radius, getSpellDamage() * BACKDRAFT.damage, BACKDRAFT.knockback, '#fb923c');
}

// --- PHOENIX PACT ---
// A fênix voa no ombro do herói, do lado de trás de quem anda, e olha para o alvo ao atirar
export function updatePhoenix(dt) {
    const bird = state.phoenix;
    if (passives.phoenixPact.lvl <= 0 || state.phoenixSpent) {
        bird.placed = false;
        return;
    }
    const P = PHOENIX_PACT;
    const t = state.runTime;
    const moved = player.x - (bird.heroX ?? player.x);
    bird.heroX = player.x;
    if (Math.abs(moved) > 0.3) bird.side = moved > 0 ? -1 : 1;
    const drift = wander(t, 0);
    const homeX = player.x + bird.side * P.shoulderX + drift.x;
    const homeY = player.y + P.shoulderY + drift.y;
    if (!bird.placed) {
        bird.x = homeX;
        bird.y = homeY;
        bird.placed = true;
        bird.rise = 0;
        bird.facing = -bird.side;
        createExplosion(homeX, homeY, '#fde047', 10);
        addShockwave(homeX, homeY, { radius: 44, color: '#fb923c', width: 4, seconds: 0.4 });
        audio.playPhoenixRise();
    }
    const pull = Math.min(1, dt * followRate(P.followSpeed));
    const vx = (homeX - bird.x) * pull;
    bird.x += vx;
    bird.y += (homeY - bird.y) * pull;
    bird.tilt += (Math.max(-0.3, Math.min(0.3, vx * 0.05)) - bird.tilt) * Math.min(1, dt * 8);
    bird.rise = Math.min(1, bird.rise + dt / P.riseSeconds);
    if (bird.flash > 0) bird.flash -= dt;
    if (bird.look > 0) bird.look -= dt;
    else bird.facing = -bird.side;

    if (bird.rise < 1 || !ready('phoenixFire', dt, getSpellCooldown(P.cooldownSeconds))) return;
    const target = nearestEnemy(player.x, player.y, P.range);
    if (!target) return;
    bird.facing = target.x >= bird.x ? 1 : -1;
    bird.look = 0.6;
    bird.flash = 0.16;
    const from = phoenixBeak(bird.x, bird.y, bird.facing);
    const a = Math.atan2(target.y - from.y, target.x - from.x);
    state.bolts.push({
        x: from.x, y: from.y,
        vx: Math.cos(a) * P.speed, vy: Math.sin(a) * P.speed,
        speed: P.speed, turnRate: P.turnRate,
        target, fire: true,
        damage: getSpellDamage() * P.boltDamage,
        life: 1.8,
        onHit: burstPhoenixFire
    });
    // Recua com o tiro, como quem cospe o fogo
    bird.x -= Math.cos(a) * 6;
    bird.y -= Math.sin(a) * 6;
    audio.playBolt();
}

// A bola de fogo acertou: o alvo queima e a explosão alcança os vizinhos
function burstPhoenixFire(b, hit) {
    const P = PHOENIX_PACT;
    ignite(hit, b.damage * P.burnRatio, P.burnSeconds);
    for (const e of state.enemies) {
        if (e === hit || e.hp <= 0 || Math.hypot(e.x - b.x, e.y - b.y) > P.splashRadius + e.radius) continue;
        dealDamage(e, b.damage * P.splashRatio, { noCrit: true, quiet: true });
        ignite(e, b.damage * P.burnRatio, P.burnSeconds);
    }
    addShockwave(b.x, b.y, { radius: P.splashRadius, color: '#fb923c', width: 3, seconds: 0.24 });
}

// Devolve true se a fênix morreu para o herói levantar
export function tryPhoenix() {
    if (passives.phoenixPact.lvl <= 0 || state.phoenixSpent) return false;
    const bird = state.phoenix;
    state.phoenixSpent = true;
    // A ave mergulha no herói e vira as asas de fogo em volta dele (js/render/skills.js)
    state.phoenixFx = { x: player.x, y: player.y, age: 0, seconds: 1.3 };
    if (bird.placed) {
        Object.assign(state.phoenixFx, { fromX: bird.x, fromY: bird.y, facing: bird.facing });
        createExplosion(bird.x, bird.y, '#fde047', 16);
    }
    bird.placed = false;
    player.hp = player.maxHp * PHOENIX_PACT.healRatio;
    player.iFrames = PHOENIX_PACT.invulnerableSeconds;
    state.enemyProjectiles.length = 0;
    state.blastBudget++;
    blast(player.x, player.y, PHOENIX_PACT.radius, getSpellDamage() * PHOENIX_PACT.damage, PHOENIX_PACT.knockback, '#fb923c');
    addShockwave(player.x, player.y, { radius: PHOENIX_PACT.radius * 1.3, color: '#fde047', width: 12, seconds: 0.7 });
    createExplosion(player.x, player.y, '#fb923c', 30);
    slowMotion(0.3, 0.7);
    screenFlash('#fb923c', 0.6);
    shakeScreen(14);
    showBanner('', 'REBORN', 'The phoenix gave its life', 'gold');
    audio.playPhoenix();
    updateHUD();
    return true;
}

// --- JURAMENTO DA CHAMA ---
// O calor da tocha também queima quem entra nele
function updateWarmthBurn(dt) {
    const burn = mod('warmthBurn');
    if (burn <= 0 || !ready('warmthBurn', dt, 0.5)) return;
    const reach = CHARACTER_MODEL.warmthRadius * (1 + mod('warmth'));
    const damage = getSpellDamage() * burn * 0.5;
    for (const e of state.enemies) {
        if (Math.hypot(e.x - state.coreX, e.y - state.coreY) > reach + e.radius) continue;
        dealDamage(e, damage, { noCrit: true, quiet: true });
    }
}

// Monstros em chamas (Flaming Sword e Fireballs)
const BURN_TICK = 0.5;
function updateBurns(dt) {
    for (const e of state.enemies) {
        if (!(e.burnTimer > 0)) continue;
        e.burnTimer -= dt;
        e.burnTick = (e.burnTick ?? 0) + dt;
        if (e.burnTick < BURN_TICK) continue;
        e.burnTick -= BURN_TICK;
        dealDamage(e, e.burnDps * BURN_TICK, { noCrit: true, quiet: true });
    }
}

// Fireballs: a adaga acertou. O alvo pega fogo e a explosão alcança os vizinhos
export function burstFireball(k, hit) {
    const radius = FIREBALLS.splashRadius * k.scale;
    const dps = k.damage * FIREBALLS.burnRatio;
    ignite(hit, dps, FIREBALLS.burnSeconds);
    for (const e of state.enemies) {
        if (e === hit || e.hp <= 0 || Math.hypot(e.x - k.x, e.y - k.y) > radius + e.radius) continue;
        dealDamage(e, k.damage * FIREBALLS.splashRatio, { noCrit: true, quiet: true });
        ignite(e, dps, FIREBALLS.burnSeconds);
    }
    addGroundFire(k.x, k.y, { life: FIREBALLS.patchSeconds, radius: radius * 0.7, dps: FIREBALLS.patchDps, evolved: false });
    addShockwave(k.x, k.y, { radius, color: '#fb923c', width: 4, seconds: 0.26 });
    createExplosion(k.x, k.y, '#fb923c', 9);
}

// Flaming Sword: monstro em chamas que morre passa o fogo a quem está perto
export function spreadBurn(dead) {
    if (passives.flameBlade.lvl <= 0 || !(dead.burnTimer > 0)) return;
    let any = false;
    for (const e of state.enemies) {
        if (e === dead || e.hp <= 0 || Math.hypot(e.x - dead.x, e.y - dead.y) > FLAME_BLADE.spreadRadius + e.radius) continue;
        ignite(e, dead.burnDps, FLAME_BLADE.burnSeconds);
        any = true;
    }
    if (any) addShockwave(dead.x, dead.y, { radius: FLAME_BLADE.spreadRadius, color: '#fb923c', width: 3, seconds: 0.3 });
}

export function updateFlameSkills(dt) {
    updateBurns(dt);
    updateFireRing(dt);
    updateVigil(dt);
    updateWarmthBurn(dt);
    updatePhoenix(dt);
    const fx = state.phoenixFx;
    if (fx) {
        fx.age += dt;
        if (fx.age >= fx.seconds) state.phoenixFx = null;
    }
}
