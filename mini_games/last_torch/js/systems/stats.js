import { CHARACTER_MODEL } from '../../data_model/character.js';
import { BLADE_SKILL, DASH_SKILL, FRENZY_NOVA_SKILL, KNIFE_SKILL } from '../../data_model/skills.js';
import { attributes, player, state } from '../core/state.js';
import { mod } from './modifiers.js';

// --- FÓRMULAS DE ATRIBUTOS ---
// Só as cartas escolhidas contam; o nível do herói não muda os stats sozinho.
// mod(): bônus de herói, relíquias e presságios (js/systems/modifiers.js).
export function getAtkDamage() {
    let base = (BLADE_SKILL.baseDamage
        + (attributes.damage.lvl - 1) * BLADE_SKILL.damagePerUpgrade) * (1 + mod('damage'));
    if (state.frenzyActiveTimer > 0) base *= 1 + getFrenzyDamageBonus();
    if (mod('lowHpDamage') > 0 && player.hp < player.maxHp * 0.35) base *= 1 + mod('lowHpDamage');
    return base;
}
export function getCritChance() {
    return BLADE_SKILL.baseCritChance + mod('critChance');
}
export function getCritMultiplier() {
    return BLADE_SKILL.baseCritMultiplier + mod('critDamage');
}
export function getAtkRadius() {
    return Math.min(
        state.width * BLADE_SKILL.maxRadiusScreenRatio,
        BLADE_SKILL.baseRadius
            + (attributes.radius.lvl - 1) * BLADE_SKILL.radiusPerUpgrade
    );
}

// Retorna a amplitude do corte em radianos (Nv 1: ~40° -> Nv 6: 180° = Math.PI radianos)
export function getSlashArcRadian() {
    const minDeg = BLADE_SKILL.minimumSlashArcDegrees;
    const maxDeg = BLADE_SKILL.maximumSlashArcDegrees;
    const currentDeg = minDeg + (attributes.slashArc.lvl - 1) * ((maxDeg - minDeg) / (attributes.slashArc.maxLvl - 1));
    return (currentDeg * Math.PI) / 180;
}
export function getSlashArcDegree() {
    return Math.round((getSlashArcRadian() * 180) / Math.PI);
}

export function getAtkCooldown() {
    let cd = (BLADE_SKILL.baseCooldownSeconds
        - (attributes.atkSpeed.lvl - 1) * BLADE_SKILL.cooldownReductionPerUpgrade) * (1 - mod('attackSpeed'));
    if (state.frenzyActiveTimer > 0) cd *= BLADE_SKILL.frenzyCooldownMultiplier;
    return Math.max(BLADE_SKILL.minimumCooldownSeconds, cd);
}
export function getPlayerMaxSpeed() {
    return (CHARACTER_MODEL.initialMoveSpeed
        + (attributes.moveSpeed.lvl - 1) * CHARACTER_MODEL.moveSpeedPerUpgrade) * (1 + mod('moveSpeed'));
}
export function getKnockback() {
    return BLADE_SKILL.baseKnockback
        + (attributes.knockback.lvl - 1) * BLADE_SKILL.knockbackPerUpgrade;
}
export function getMaxPlayerHp() {
    return Math.round((CHARACTER_MODEL.baseHp
        + (attributes.playerHp.lvl - 1) * CHARACTER_MODEL.hpPerUpgrade
        + mod('maxHpFlat')) * (1 + mod('maxHp')));
}
export function getFrenzyDamageBonus() {
    return attributes.frenzyNova.lvl * FRENZY_NOVA_SKILL.damageBonusPerUpgradeLevel;
}
export function getFrenzyDuration() {
    return FRENZY_NOVA_SKILL.baseDurationSeconds
        + attributes.frenzyNova.lvl * FRENZY_NOVA_SKILL.durationPerUpgradeLevelSeconds
        + mod('furyDuration');
}
export function getKnifeCooldown() {
    return KNIFE_SKILL.cooldownSeconds * (1 - mod('knifeCooldown'));
}
export function getDashCharges() {
    return DASH_SKILL.charges + mod('dashCharges');
}
export function getDashCooldown() {
    return DASH_SKILL.cooldownSeconds * Math.max(0.3, 1 - mod('dashCooldown'));
}
export function getMagnetRadius() {
    return CHARACTER_MODEL.magnetRadius * (1 + mod('magnet'));
}
