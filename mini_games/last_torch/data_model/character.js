export const CHARACTER_MODEL = {
    id: 'hero',
    name: 'Demon Hunter',
    initialHp: 100,
    initialPositionOffsetY: -60,
    initialMoveSpeed: 150,
    moveSpeedPerUpgrade: 10,
    moveSpeedPerLevel: 5,
    baseHp: 100,
    hpPerUpgrade: 10,
    hpPerLevel: 5,
    invulnerabilitySeconds: 0.5,
    projectileInvulnerabilitySeconds: 0.4,
    damageImmunityFlashIntervalMs: 50,
    collisionRadius: 12,
    trailLength: 12,
    trailFadePerSecond: 4,
    xpToNextLevel: 100,
    xpGrowthMultiplier: 1.35,
    levelUpHealRatio: 0.3
};

export function createPlayerState() {
    return {
        x: 0, y: 0,
        targetX: 0, targetY: 0,
        angle: 0,
        attackTimer: 0,
        hp: CHARACTER_MODEL.initialHp,
        maxHp: CHARACTER_MODEL.initialHp,
        iFrames: 0,
        // Só visual: direção e instante do último golpe recebido (animação de empurrão)
        hitDirX: 0, hitDirY: 0, hitTime: -100000,
        comboStep: 1,
        trail: []
    };
}
