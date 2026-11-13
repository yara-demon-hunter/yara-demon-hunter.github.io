import { WHITE_WOLF_VISUALS } from './white_wolf_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../../monsters/25d/creature25d.js';

// --- DADOS VISUAIS: Lobo Branco 2.5D (buddy, white_wolf25d.js) ---
// O corpo de lobo 2.5D (monsters/25d/wolf25d.js) do Lobo Sombrio, com as medidas dele e as CORES de white_wolf_visual.js.
// Medidas em unidades do boneco (o herói tem ~25 de altura).
export const WHITE_WOLF_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: { ...BASE_COLORS, ...WHITE_WOLF_VISUALS.colors },
    strideSpeed: 13,

    // Corpo
    bodyLength: 10,
    bodyWidth: 5,
    hipHeight: 8.2,
    shoulderHeight: 9.6,
    bounce: 0.7,               // sobe e desce do galope
    // Pescoço e cabeça
    neckLength: 3.6,
    headHeight: 11.6,
    headRadius: 2.5,
    snoutLength: 4.2,
    snoutWidth: 2.1,
    mouthOpen: 1.6,
    earLength: 2.6,
    eyeGlow: 1.8,
    // Patas
    legWidth: 1.7,
    legSpread: 2.1,
    stride: 3.6,
    footLift: 2.4,

    // Juba desgrenhada em volta do pescoço e mechas claras no lombo
    maneTufts: 7,
    maneLength: 4.2,
    backTufts: 4,
    // Fumaça preta: a cauda e a traseira se desfazem
    smokeTails: 3,
    smokeLength: 8,
    smokePuffs: 5,
    // O espectro verde-azulado que sai do corpo (a chama espectral, ../spectral_flame.js)
    flames: 6,
    tailFlames: 3,
    flameRise: 0.55,           // quão rápido a chama sobe (ciclos por segundo)
    flameHeight: 9,            // até onde sobe antes de sumir

    auraRadius: 16.9,
    auraAlpha: WHITE_WOLF_VISUALS.auraAlpha,
    focusZ: 11.2,
    focusA: 10.5,
    scalePerRadius: 0.18,
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão do monstro
    center: 6.5
};
