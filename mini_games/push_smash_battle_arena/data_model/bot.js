// --- IA DO BOT ---
export const BOT = {
    jumpChance: 0.02,
    jumpChanceNearRival: 0.04,
    nearRivalDistance: 70,
    dashDistance: 100,
    dashChance: 0.06,
    dashVerticalTolerance: 40,
    smashAbove: 25,            // quanto acima do rival precisa estar para tentar o smash
    stompStunnedChance: 0.08,  // rival atordoado e perto: chance por frame de pular na cabeça dele (SKY DROP)
    stompStunnedDistance: 50,
    edgeMargin: 25,
    deadZone: 12,
    skyDropMinHover: 120,      // SKY DROP: frames lá em cima antes de poder soltar (suspense e tempo do rival fugir)
    skyDropAim: 14             // ... e quão alinhado com o rival precisa estar
};
