// --- STATS DO HERÓI ---
// Melhorados na árvore de skills (data_model/tree.js): cada ponto gasto sobe um nível.
export const UPGRADE_MODELS = {
    damage: { name: 'Blade Damage', icon: '⚔️', lvl: 1, maxLvl: 99, desc: 'Increases the base damage of each hit.' },
    radius: { name: 'Attack Range', icon: '⭕', lvl: 1, maxLvl: 99, desc: 'Increases the radius that detects targets.' },
    slashArc: { name: 'Slash Width', icon: '📐', lvl: 1, maxLvl: 6, desc: 'Widens the slash (Lv. 1: 40° up to Max Lv.: 180°).' },
    atkSpeed: { name: 'Attack Speed', icon: '⏱️', lvl: 1, maxLvl: 99, desc: 'Reduces the cooldown between hits.' },
    moveSpeed: { name: 'Move Speed', icon: '🥾', lvl: 1, maxLvl: 99, desc: 'Makes the character move faster.' },
    frenzyNova: { name: 'Fury (Skill)', icon: '😡', lvl: 1, maxLvl: 99, desc: 'Increases the duration and damage of Fury, which fires on its own when the bar fills.' },
    playerHp: { name: 'Hero Health', icon: '❤️', lvl: 1, maxLvl: 99, desc: 'Increases max health and heals the character.' },
    knockback: { name: 'Knockback', icon: '👊', lvl: 1, maxLvl: 99, desc: 'Increases the push when hitting targets.' }
};

export const BLADE_SKILL = {
    baseDamage: 30,
    damagePerUpgrade: 5,
    baseRadius: 56,
    radiusPerUpgrade: 7,
    maxRadiusScreenRatio: 0.38,
    minimumSlashArcDegrees: 40,
    maximumSlashArcDegrees: 180,
    baseCooldownSeconds: 0.7,
    cooldownReductionPerUpgrade: 0.03,
    frenzyCooldownMultiplier: 0.25,
    minimumCooldownSeconds: 0.07,
    baseKnockback: 170,
    knockbackPerUpgrade: 50,
    baseCritChance: 0.06,
    baseCritMultiplier: 2,
    comboDamageMultiplier: 1.5,
    comboKnockbackMultiplier: 1.4,
    comboDashDistance: 35
};

export const FRENZY_NOVA_SKILL = {
    chargePerHit: 6,
    maximumEnergy: 100,
    baseDurationSeconds: 3,
    durationPerUpgradeLevelSeconds: 0.5,
    damageBonusPerUpgradeLevel: 0.15,
    slashCount: 8,
    slashRadiusMultiplier: 1.3,
    // Explosão ao ativar: empurra e fere tudo em volta (o resto da Fúria é o golpe acelerado)
    burstRadiusMultiplier: 2.4,
    burstDamageMultiplier: 2,
    burstKnockback: 460
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

// Dash: esquiva rápida com invulnerabilidade. Espaço, Shift ou botão direito; botão próprio no celular.
export const DASH_SKILL = {
    charges: 1,
    cooldownSeconds: 2.6,       // tempo para recuperar uma carga
    seconds: 0.17,              // duração do avanço
    distance: 150,
    invulnerableSeconds: 0.3,
    ghosts: 6                   // imagens deixadas pelo caminho
};

export function createAttributes() {
    return Object.fromEntries(
        Object.entries(UPGRADE_MODELS).map(([key, attribute]) => [key, { ...attribute }])
    );
}
