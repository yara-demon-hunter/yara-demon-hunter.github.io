// Estado mutável da partida, compartilhado entre os módulos (um `import` não pode reatribuir variável).
import { H, W } from './canvas.js';

export const state = {
    // MENU | COUNTDOWN | PLAYING | KO | REPLAY | ROUND_END
    gameState: 'MENU',
    isBotMatch: true,
    botLevel: 'normal', // easy | normal | hard (data_model/bot.js)
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
    particles: [],
    bursts: [],        // estrelas de impacto
    rings: [],         // ondas de choque
    popups: [],
    blasts: [],        // explosões em estrela (estilo quadrinho)
    comics: [],        // palavras de impacto: BAM!, CRASH!...

    // Replay do K.O.
    history: [],
    replayFrames: [],
    replayIndex: 0,
    replayCam: { x: W / 2, y: H / 2, z: 1 },
    koLoserIndex: 0,
    koWinner: null,

    audioCtx: null
};
