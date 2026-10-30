export const CHARACTER_MODEL = {
    id: 'hero',
    name: 'Demon Hunter',
    initialHp: 100,
    initialPositionOffsetY: -60,
    initialMoveSpeed: 150,
    moveSpeedPerUpgrade: 8,
    baseHp: 100,
    hpPerUpgrade: 10,
    invulnerabilitySeconds: 0.5,
    projectileInvulnerabilitySeconds: 0.4,
    damageImmunityFlashIntervalMs: 50,
    collisionRadius: 12,
    topMargin: 76,              // o herói não sobe até atrás do HUD
    trailLength: 6,
    trailFadePerSecond: 4,
    // XP para o próximo nível: base + linear x n + quadratic x n², com n = nível - 1
    xpCurve: { base: 110, linear: 75, quadratic: 4 },
    levelUpHealRatio: 0.12,
    // Calor da tocha: perto dela o herói se recupera aos poucos
    warmthRadius: 92,
    warmthHealPerSecond: 3,
    // Ouro no chão só vem até o herói dentro deste raio (no fim da hora vem tudo)
    magnetRadius: 105
};

export function getXpToNextLevel(level) {
    const { base, linear, quadratic } = CHARACTER_MODEL.xpCurve;
    const n = level - 1;
    return Math.round(base + linear * n + quadratic * n * n);
}

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
        // Mirror Ward: recarga restante, instante e direção do último rebate (animação)
        reflectTimer: 0, reflectTime: -100000, reflectAngle: 0,
        comboStep: 1,
        trail: [],
        // Dash: cargas, recarga, tempo restante do avanço e direção
        dashCharges: 0, dashRecharge: 0, dashTimer: 0, dashX: 0, dashY: 0,
        hidden: false,              // morto: o boneco some na explosão de sombra
        mouseFollow: true           // herói anda até o cursor (desliga ao usar o teclado)
    };
}
