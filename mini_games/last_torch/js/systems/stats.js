import { CHARACTER_MODEL } from '../../data_model/character.js';
import { BLADE_SKILL, FRENZY_NOVA_SKILL } from '../../data_model/skills.js';
import { attributes, player, state } from '../core/state.js';

// --- FÓRMULAS DE ATRIBUTOS ---
// Só os níveis comprados na loja contam; o nível do herói não muda os stats.
export function getAtkDamage() {
    let base = BLADE_SKILL.baseDamage
        + (attributes.damage.lvl - 1) * BLADE_SKILL.damagePerUpgrade;
    if (state.frenzyActiveTimer > 0) base *= 1 + attributes.frenzyNova.lvl * FRENZY_NOVA_SKILL.damageBonusPerUpgradeLevel;
    return base;
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
    let cd = BLADE_SKILL.baseCooldownSeconds
        - (attributes.atkSpeed.lvl - 1) * BLADE_SKILL.cooldownReductionPerUpgrade;
    if (state.frenzyActiveTimer > 0) cd *= BLADE_SKILL.frenzyCooldownMultiplier;
    return Math.max(BLADE_SKILL.minimumCooldownSeconds, cd);
}
export function getPlayerMaxSpeed() {
    return CHARACTER_MODEL.initialMoveSpeed
        + (attributes.moveSpeed.lvl - 1) * CHARACTER_MODEL.moveSpeedPerUpgrade;
}
export function getKnockback() {
    return BLADE_SKILL.baseKnockback
        + (attributes.knockback.lvl - 1) * BLADE_SKILL.knockbackPerUpgrade;
}
export function getMaxPlayerHp() {
    return CHARACTER_MODEL.baseHp
        + (attributes.playerHp.lvl - 1) * CHARACTER_MODEL.hpPerUpgrade;
}
export function getFrenzyDuration() {
    return FRENZY_NOVA_SKILL.baseDurationSeconds
        + attributes.frenzyNova.lvl * FRENZY_NOVA_SKILL.durationPerUpgradeLevelSeconds;
}
