export const UPGRADE_MODELS = {
    damage: { name: 'Dano da Lâmina', icon: '⚔️', lvl: 1, maxLvl: 99, baseCost: 10, costMult: 1.5, desc: 'Aumenta o dano base de cada golpe.' },
    radius: { name: 'Alcance do Ataque', icon: '⭕', lvl: 1, maxLvl: 99, baseCost: 12, costMult: 1.6, desc: 'Aumenta o raio de detecção de alvos.' },
    slashArc: { name: 'Amplitude do Corte', icon: '📐', lvl: 1, maxLvl: 6, baseCost: 15, costMult: 1.8, desc: 'Aumenta a abertura do corte (Nv. 1: 40° até Nv. Max: 180°).' },
    atkSpeed: { name: 'Velocidade de Ataque', icon: '⚡', lvl: 1, maxLvl: 99, baseCost: 15, costMult: 1.5, desc: 'Reduz o tempo de recarga entre golpes.' },
    moveSpeed: { name: 'Velocidade de Movimento', icon: '🚀', lvl: 1, maxLvl: 99, baseCost: 10, costMult: 1.4, desc: 'Acelera a movimentação do personagem.' },
    frenzyNova: { name: 'Frenzy Nova (Skill)', icon: '🔥', lvl: 1, maxLvl: 99, baseCost: 20, costMult: 1.8, desc: 'Aumenta a duração e o dano do especial automático.' },
    playerHp: { name: 'Vida do Herói', icon: '❤️', lvl: 1, maxLvl: 99, baseCost: 12, costMult: 1.5, desc: 'Aumenta a vida máxima e cura o personagem.' },
    knockback: { name: 'Força de Empurrão', icon: '💥', lvl: 1, maxLvl: 99, baseCost: 10, costMult: 1.4, desc: 'Aumenta o empurrão ao acertar os alvos.' }
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

export const POWERUP_MODELS = {
    SHIELD: { color: '#38bdf8', durationSeconds: 6, lifeSeconds: 10 },
    DOUBLE_DMG: { color: '#f59e0b', durationSeconds: 8, lifeSeconds: 10 },
    BOMB: { color: '#ef4444', damage: 150, lifeSeconds: 10 }
};

export function createAttributes() {
    return Object.fromEntries(
        Object.entries(UPGRADE_MODELS).map(([key, attribute]) => [key, { ...attribute }])
    );
}
