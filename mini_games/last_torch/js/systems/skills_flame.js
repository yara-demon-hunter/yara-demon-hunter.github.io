import { CHARACTER_MODEL } from '../../data_model/character.js';
import { BACKDRAFT, PHOENIX_PACT, VIGIL } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { updateHUD } from '../ui/hud.js';
import { blast, dealDamage } from './damage.js';
import { addShockwave, createExplosion, screenFlash, shakeScreen, slowMotion } from './effects.js';
import { mod } from './modifiers.js';
import { ready } from './powers.js';
import { getSpellDamage } from './stats.js';

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
// Devolve true se a tocha pagou para o herói levantar
export function tryPhoenix() {
    if (passives.phoenixPact.lvl <= 0 || state.phoenixSpent || state.coreHp <= PHOENIX_PACT.torchCost) return false;
    state.phoenixSpent = true;
    state.coreHp -= PHOENIX_PACT.torchCost;
    player.hp = player.maxHp * PHOENIX_PACT.healRatio;
    player.iFrames = PHOENIX_PACT.invulnerableSeconds;
    state.phoenixFx = { x: player.x, y: player.y, age: 0, seconds: 1.3 };
    state.enemyProjectiles.length = 0;
    state.blastBudget++;
    blast(player.x, player.y, PHOENIX_PACT.radius, getSpellDamage() * PHOENIX_PACT.damage, PHOENIX_PACT.knockback, '#fb923c');
    addShockwave(player.x, player.y, { radius: PHOENIX_PACT.radius * 1.3, color: '#fde047', width: 12, seconds: 0.7 });
    createExplosion(player.x, player.y, '#fb923c', 30);
    slowMotion(0.3, 0.7);
    screenFlash('#fb923c', 0.6);
    shakeScreen(14);
    showBanner('', 'REBORN', 'The torch paid for you', 'gold');
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

export function updateFlameSkills(dt) {
    updateFireRing(dt);
    updateVigil(dt);
    updateWarmthBurn(dt);
    const fx = state.phoenixFx;
    if (fx) {
        fx.age += dt;
        if (fx.age >= fx.seconds) state.phoenixFx = null;
    }
}
