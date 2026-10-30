// --- STATS DO HERÓI ---
// Comprados com pontos de skill: cada nível de stat custa STAT_UPGRADE_COST pontos.
// Subir de nível não melhora nada sozinho, só dá pontos para o jogador distribuir.
export const SKILL_POINTS_PER_LEVEL = 1;
export const STAT_UPGRADE_COST = 1;

export const UPGRADE_MODELS = {
    damage: { name: 'Blade Damage', icon: '⚔️', lvl: 1, maxLvl: 99, desc: 'Increases the base damage of each hit.' },
    radius: { name: 'Attack Range', icon: '⭕', lvl: 1, maxLvl: 99, desc: 'Increases the radius that detects targets.' },
    slashArc: { name: 'Slash Width', icon: '📐', lvl: 1, maxLvl: 6, desc: 'Widens the slash (Lv. 1: 40° up to Max Lv.: 180°).' },
    atkSpeed: { name: 'Attack Speed', icon: '💨', lvl: 1, maxLvl: 99, desc: 'Reduces the cooldown between hits.' },
    moveSpeed: { name: 'Move Speed', icon: '🥾', lvl: 1, maxLvl: 99, desc: 'Makes the character move faster.' },
    frenzyNova: { name: 'Fury (Skill)', icon: '🔥', lvl: 1, maxLvl: 99, desc: 'Increases the duration and damage of Fury, which fires on its own when the bar fills.' },
    playerHp: { name: 'Hero Health', icon: '❤️', lvl: 1, maxLvl: 99, desc: 'Increases max health and heals the character.' },
    knockback: { name: 'Knockback', icon: '💥', lvl: 1, maxLvl: 99, desc: 'Increases the push when hitting targets.' }
};

export const BLADE_SKILL = {
    baseDamage: 20,
    damagePerUpgrade: 10,
    baseRadius: 42,
    radiusPerUpgrade: 10,
    maxRadiusScreenRatio: 0.38,
    minimumSlashArcDegrees: 40,
    maximumSlashArcDegrees: 180,
    baseCooldownSeconds: 0.5,
    cooldownReductionPerUpgrade: 0.03,
    frenzyCooldownMultiplier: 0.25,
    minimumCooldownSeconds: 0.07,
    baseKnockback: 170,
    knockbackPerUpgrade: 50,
    comboDamageMultiplier: 1.5,
    comboKnockbackMultiplier: 1.4,
    comboDashDistance: 35
};

export const FRENZY_NOVA_SKILL = {
    chargePerHit: 4,
    maximumEnergy: 100,
    baseDurationSeconds: 3,
    durationPerUpgradeLevelSeconds: 0.5,
    damageBonusPerUpgradeLevel: 0.15,
    slashCount: 8,
    slashRadiusMultiplier: 1.3
};

// Faca de arremesso: golpe separado da lâmina, com recarga própria. Anda enquanto arremessa.
export const KNIFE_SKILL = {
    cooldownSeconds: 0.9,
    speed: 520,
    radius: 7,
    maxRange: 420,
    damageMultiplier: 0.8,
    knockbackMultiplier: 0.8
};

export function createAttributes() {
    return Object.fromEntries(
        Object.entries(UPGRADE_MODELS).map(([key, attribute]) => [key, { ...attribute }])
    );
}
