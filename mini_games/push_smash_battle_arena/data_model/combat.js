// --- BATIDAS, SMASH E K.O. ---
export const COMBAT = {
    hitCooldownFrames: 12,     // a mesma batida não conta duas vezes
    hitForce: 6,               // chute extra de quem ataca, somado ao quique elástico entre as bolas
    dashHitForce: 16,
    knockbackBuff: 2.4,        // item KNOCKBACK
    stunnedVictimMultiplier: 1.3,
    maxForce: 36,
    shieldedForce: 2,
    hitStopFrames: { normal: 2, dash: 5, headBounce: 4, smash: 9, bomb: 8 },
    shake: { normal: 7, dash: 14, headBounce: 8, smash: 18, bomb: 24, ko: 20 },
    platformShrinkOnHit: 1.5,
    smash: {
        aboveRatio: 0.3,       // atacante precisa estar acima do rival
        stunFrames: 70,
        massLoss: 0.3,
        pushX: 0.15,
        victimFallInAir: 15,
        victimFallOnGround: 2,
        attackerBounce: 10,
        platformShrink: 3,
        botTauntChance: 0.5
    },
    koBonusCoins: 5,
    replayFrames: 110,         // quanto do final entra no replay
    replaySpeed: 0.4,
    replayZoom: 1.8
};
