export const UPGRADE_MODELS = {
    damage: { name: 'Blade Damage', icon: '⚔️', lvl: 1, maxLvl: 99, baseCost: 10, costMult: 1.5, desc: 'Increases the base damage of each hit.' },
    radius: { name: 'Attack Range', icon: '⭕', lvl: 1, maxLvl: 99, baseCost: 12, costMult: 1.6, desc: 'Increases the radius that detects targets.' },
    slashArc: { name: 'Slash Width', icon: '📐', lvl: 1, maxLvl: 6, baseCost: 15, costMult: 1.8, desc: 'Widens the slash (Lv. 1: 40° up to Max Lv.: 180°).' },
    atkSpeed: { name: 'Attack Speed', icon: '💨', lvl: 1, maxLvl: 99, baseCost: 15, costMult: 1.5, desc: 'Reduces the cooldown between hits.' },
    moveSpeed: { name: 'Move Speed', icon: '🚀', lvl: 1, maxLvl: 99, baseCost: 10, costMult: 1.4, desc: 'Makes the character move faster.' },
    frenzyNova: { name: 'Fury (Skill)', icon: '🔥', lvl: 1, maxLvl: 99, baseCost: 20, costMult: 1.8, desc: 'Increases the duration and damage of Fury, which fires on its own when the bar fills.' },
    playerHp: { name: 'Hero Health', icon: '❤️', lvl: 1, maxLvl: 99, baseCost: 12, costMult: 1.5, desc: 'Increases max health and heals the character.' },
    knockback: { name: 'Knockback', icon: '💥', lvl: 1, maxLvl: 99, baseCost: 10, costMult: 1.4, desc: 'Increases the push when hitting targets.' }
};

export const BLADE_SKILL = {
    baseDamage: 25,
    damagePerUpgrade: 15,
    damagePerCharacterLevel: 10,
    baseRadius: 45,
    radiusPerUpgrade: 14,
    radiusPerCharacterLevel: 4,
    maxRadiusScreenRatio: 0.38,
    minimumSlashArcDegrees: 40,
    maximumSlashArcDegrees: 180,
    baseCooldownSeconds: 0.45,
    cooldownReductionPerUpgrade: 0.04,
    cooldownReductionPerCharacterLevel: 0.02,
    frenzyCooldownMultiplier: 0.25,
    minimumCooldownSeconds: 0.07,
    baseKnockback: 180,
    knockbackPerUpgrade: 65,
    comboDamageMultiplier: 1.5,
    comboKnockbackMultiplier: 1.4,
    comboDashDistance: 35
};

export const FRENZY_NOVA_SKILL = {
    chargePerHit: 5,
    maximumEnergy: 100,
    baseDurationSeconds: 3,
    durationPerUpgradeLevelSeconds: 0.5,
    damageBonusPerUpgradeLevel: 0.2,
    slashCount: 8,
    slashRadiusMultiplier: 1.3
};

export function createAttributes() {
    return Object.fromEntries(
        Object.entries(UPGRADE_MODELS).map(([key, attribute]) => [key, { ...attribute }])
    );
}
