// --- BATIDAS, SMASH E K.O. ---
export const COMBAT = {
    hitCooldownFrames: 12,     // a mesma batida não conta duas vezes
    dashMomentumTransfer: 0.35, // fração do momento do dash transferida como impulso extra
    maxDashImpulse: 24,         // limite para o bônus de impulso do dash
    hitStopFrames: { normal: 2, dash: 5, headBounce: 4, smash: 9 },
    shake: { normal: 7, dash: 14, headBounce: 8, smash: 18, ko: 20 },
    platformShrinkOnHit: 1.5,
    smash: {
        aboveRatio: 0.3,       // atacante precisa estar acima do rival
        stunFrames: 150,       // atordoado ~2,5 s: não toma dano, mas dá para pisar na cabeça e lançar outro SKY DROP
        pushX: 0.15,
        victimFallInAir: 15,
        victimFallOnGround: 2,
        attackerBounce: 10,
        platformShrink: 3,
        botTauntChance: 0.5
    },
    // SKY DROP: pisar na cabeça do rival lança você como um foguete para fora da tela, por cima. Lá em cima
    // você anda pros lados com uma mira no chão logo abaixo e depois despenca (um SMASH em linha reta) nela.
    skyDrop: {
        launchSpeed: 10,       // velocidade de saída do foguete
        rocketAccel: 1.4,      // o foguete acelera a cada frame...
        rocketMaxSpeed: 36,    // ... até essa velocidade
        hoverY: -160,          // altura em que fica lá em cima (negativo = acima da tela)
        hoverFrames: 300,      // 5 s lá em cima antes de cair sozinho (▼ solta na hora)
        moveSpeed: 7,          // velocidade lateral lá em cima (multiplicada pela velocidade do bicho)
        moveLerp: 0.2,
        fallSpeed: 24          // velocidade inicial da queda
    },
    replayFrames: 110,         // quanto do final entra no replay
    replaySpeed: 0.4,
    replayZoom: 1.8
};
