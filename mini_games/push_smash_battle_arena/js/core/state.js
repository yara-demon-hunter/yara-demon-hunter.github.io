// Estado mutável da partida, compartilhado entre os módulos (um `import` não pode reatribuir variável).
import { H, W } from './canvas.js';

export const state = {
    coins: parseInt(localStorage.getItem('mda_coins') || '0'),
    // MENU | COUNTDOWN | PLAYING | KO | REPLAY | ROUND_END
    gameState: 'MENU',
    isBotMatch: true,
    paused: false,
    roundNumber: 1,
    stage: 0,          // índice em STAGES
    frameCount: 0,
    cameraShake: 0,
    hitStop: 0,        // congela o jogo por alguns frames no impacto
    hitCooldown: 0,    // evita contar a mesma batida em vários frames

    // Round
    matchTimer: 0,
    roundFrames: 0,
    countdownFrames: 0,
    lastCount: 0,
    stateFrames: 0,
    roundResult: null,

    // Arena
    airDrops: [],
    spawnableCoins: [],
    massBlobs: [],
    coinSpawnTimer: 0,
    dropSpawnTimer: 0,
    bombHolder: null,
    bombTimer: 0,
    bombPassCd: 0,
    particles: [],
    bursts: [],        // estrelas de impacto
    rings: [],         // ondas de choque
    popups: [],

    // Replay do K.O.
    history: [],
    replayFrames: [],
    replayIndex: 0,
    replayCam: { x: W / 2, y: H / 2, z: 1 },
    koLoserIndex: 0,
    koWinner: null,

    audioCtx: null
};
