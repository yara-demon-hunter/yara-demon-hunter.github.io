import { WHITE_WOLF_VISUALS } from './white_wolf_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../../monsters/25d/creature25d.js';

// --- DADOS VISUAIS: Lobo Branco 2.5D (buddy, white_wolf25d.js) ---
// O corpo de lobo 2.5D (monsters/25d/wolf25d.js) do Lobo Sombrio, com as medidas dele e as CORES de white_wolf_visual.js.
// Segue a arte de art_reference/images/white_wolf.webp (lobo branco envolto em espectro verde-água).
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
    mouthOpen: 2,              // rosnando, de boca bem aberta
    earLength: 2.6,
    eyeGlow: 2.4,
    // Patas
    legWidth: 1.7,
    legSpread: 2.1,
    stride: 3.6,
    footLift: 2.4,

    // Juba de mechas brancas pontudas para trás, com labaredas por cima, e mechas claras no lombo
    maneTufts: 9,
    maneLength: 4.8,
    backTufts: 5,
    // A cauda é uma labareda grande: três camadas (escura, verde-água, clara) curvadas para trás e para cima
    tailLength: 11,
    tailRise: 0.75,            // quanto a cauda sobe (0 = reta para trás, 1 = em pé)
    // O espectro verde-água que envolve o corpo (a chama espectral, ../spectral_flame.js)
    flames: 11,                // no lombo, de ponta a ponta
    maneFlames: 5,             // na juba
    pawFlames: 1,              // em cada pata
    tailFlames: 4,             // soltando da cauda
    flameRise: 0.6,            // quão rápido a chama sobe (ciclos por segundo)
    flameHeight: 10,           // até onde sobe antes de sumir

    auraRadius: 16.9,
    auraAlpha: WHITE_WOLF_VISUALS.auraAlpha,
    focusZ: 11.2,
    focusA: 10.5,
    scalePerRadius: 0.18,
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão do monstro
    center: 6.5
};
