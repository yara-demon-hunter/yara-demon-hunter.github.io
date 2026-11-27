export const CHARACTER_MODEL = {
    id: 'hero',
    name: 'Demon Hunter',
    initialHp: 100,
    // Onde o herói começa CADA onda (e a partida): sempre no mesmo lugar, logo ABAIXO da tocha (offsetY positivo = mais para baixo na tela). Constância: o jogador sabe onde está ao começar.
    // Se o ponto cair numa área bloqueada do cenário, usa o primeiro livre de `fallback` (placeHeroAtSpawn, js/systems/player.js)
    heroSpawn: { offsetX: 0, offsetY: 70, fallback: [[60, 70], [-60, 70], [0, 110], [90, 40], [-90, 40]] },
    initialPositionOffsetY: 70,       // (o menu e o redimensionar usam este; o mesmo ponto abaixo da tocha)
    moveSpeedPerUpgrade: 8,
    hpPerUpgrade: 10,
    invulnerabilitySeconds: 0.5,
    projectileInvulnerabilitySeconds: 0.4,
    damageImmunityFlashIntervalMs: 50,
    collisionRadius: 12,
    topMargin: 76,              // o herói não sobe até atrás do HUD
    trailLength: 6,
    trailFadePerSecond: 4,
    // XP para o próximo nível: EXPONENCIAL, base x growth^n, com n = nível - 1 (2026-11-27; antes era base + linear x n + quadratic x n², 260/110/5, que dava nível 37 na onda 18).
    // Cada nível custa 37% mais que o anterior: o começo é rápido (nível 5 no fim da onda 1, 10 na onda 5: o jogador sente os golpes novos chegando) e depois sobe
    // devagar (~nível 18 na onda 18), para a tela não se encher de skills. Medido com o autopiloto (ver report/improvement_2026_11_16/06_checklist.md, Fase 8)
    xpCurve: { base: 100, growth: 1.19 },
    levelUpHealRatio: 0.12,
    // Calor da tocha: perto dela o herói se recupera aos poucos
    // Ouro no chão só vem até o herói dentro deste raio (no fim da hora vem tudo)
    magnetRadius: 105
};

export function getXpToNextLevel(level) {
    const { base, growth } = CHARACTER_MODEL.xpCurve;
    return Math.round(base * Math.pow(growth, level - 1));
}

export function createPlayerState() {
    return {
        x: 0, y: 0,
        targetX: 0, targetY: 0,
        angle: 0,
        attackTimer: 0,
        hp: CHARACTER_MODEL.initialHp,
        maxHp: CHARACTER_MODEL.initialHp,
        knockbackX: 0, knockbackY: 0,
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
        // Golpe especial em andamento e feitiço saindo (js/systems/moves.js)
        move: null, castAge: -1,
        // De onde partiu o dash e onde ficou a última nuvem do rasto de fumaça (Smoke Bomb)
        dashFromX: 0, dashFromY: 0, smokeX: 0, smokeY: 0,
        // Tempo parado (Steady Hand) e a pose ajoelhada da biblioteca (vigilStance, hoje sempre desligada)
        stillTime: 0, vigilStance: false,
        mouseFollow: true           // herói anda até o cursor (desliga ao usar o teclado)
    };
}
