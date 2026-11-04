// --- PARTIDA, ROUNDS, ARENA E ITENS ---
export const MATCH = {
    roundTime: 60,             // segundos
    roundsToWin: 3,            // melhor de 5
    countdownFrames: 135,      // 3-2-1
    countdownStep: 45,
    koFrames: 50,              // pausa antes do replay
    roundEndFrames: 110,       // pausa mostrando o vencedor do round, antes do próximo
    shrinkStartSeconds: 30,    // a plataforma começa a fechar
    shrinkLastSeconds: 15,
    shrinkPerSecond: 5,
    shrinkPerSecondLast: 10
};

// O palco é 1,4x maior que o original (800x450): os bichos, moedas e itens não mudam de tamanho,
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

export const SPAWN = {
    coinEveryFrames: 150,
    maxCoins: 5,
    coinRadius: 9,
    coinArea: { x: px(160), width: px(480), y: px(100), height: px(180) },
    dropEveryFrames: 360,
    firstDropFrames: 240,      // quanto de espera extra no início do round
    dropRadius: 14,
    dropFallSpeed: 1.5
};

export const ITEMS = {
    SPEED:     { color: '#ffd32a', icon: '⚡', frames: 270, multiplier: 1.7 },
    KNOCKBACK: { color: '#a55eea', icon: '🥊', frames: 270 },
    SHIELD:    { color: '#26de81', icon: '🛡️' },
    HEAVY:     { color: '#ff7f50', icon: '🏋️', frames: 360 },
    BOMB:      { color: '#2f3542', icon: '💣' }
};

// Bomba quente: passe pro rival encostando nele antes de explodir
export const BOMB = {
    fuseFrames: 300,
    passCooldownFrames: 30,
    beepFromFrames: 150,
    blastSpeed: 20,
    blastLift: 11,
    shieldedBlastSpeed: 6,
    massLoss: 0.2
};
