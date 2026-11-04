// --- PARTIDA, ROUNDS E ARENA ---
export const MATCH = {
    roundTime: 60,             // segundos
    roundsToWin: 3,            // melhor de 5
    hearts: 3,                 // vidas por round: cada SMASH sofrido tira um coração; sem corações é K.O.
    countdownFrames: 135,      // 3-2-1
    countdownStep: 45,
    koFrames: 40,              // pausa antes do replay
    roundEndFrames: 110,       // pausa mostrando o vencedor do round, antes do próximo
    shrinkStartSeconds: 30,    // a plataforma começa a fechar
    shrinkLastSeconds: 15,
    shrinkPerSecond: 5,
    shrinkPerSecondLast: 10
};

// O palco é 1,4x maior que o original (800x450): os bichos não mudam de tamanho,
// então ficam proporcionalmente menores e a arena ganha espaço. Para mexer no zoom, mude só ARENA_SCALE.
const ARENA_SCALE = 1.4;
const px = (v) => Math.round(v * ARENA_SCALE);

export const ARENA = {
    scale: ARENA_SCALE,
    width: px(800),
    height: px(450),
    wall: { width: 18, height: px(280), y: px(50) },
    platform: { y: px(350), height: 22, fullWidth: px(500), minWidth: px(200) },
    startOffsetY: 60,
    startX: [px(280), px(520)]         // P1, P2
};
