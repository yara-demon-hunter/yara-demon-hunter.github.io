import { SHADOW_WOLF_VISUALS } from '../../topdown/shadow_wolf/shadow_wolf_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Lobo Sombrio 2.5D (shadow_wolf25d.js) ---
// O Lobo Sombrio de topdown/shadow_wolf (pelo cinza-azulado escuro com mechas claras, juba desgrenhada, olhos e boca
// vermelhos, a traseira se desfazendo em fumaça preta) no corpo de lobo 2.5D (../wolf25d.js).
// As cores são as de topdown/shadow_wolf/shadow_wolf_visual.js. Medidas em unidades do boneco (o herói tem ~25 de altura).
export const SHADOW_WOLF_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: { ...BASE_COLORS, ...SHADOW_WOLF_VISUALS.colors },
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

    auraRadius: 16.9,
    auraAlpha: SHADOW_WOLF_VISUALS.auraAlpha,
    focusZ: 11.2,
    focusA: 10.5,
    scalePerRadius: 0.18,
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão do monstro
    center: 6.5
};
