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

export const ARENA = {
    width: 800,
    height: 450,
    wall: { width: 18, height: 280, y: 50 },
    platform: { y: 350, height: 22, fullWidth: 500, minWidth: 200 },
    startOffsetY: 60,
    startX: [280, 520]         // P1, P2
};

export const SPAWN = {
    coinEveryFrames: 150,
    maxCoins: 5,
    coinRadius: 9,
    coinArea: { x: 160, width: 480, y: 100, height: 180 },
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
