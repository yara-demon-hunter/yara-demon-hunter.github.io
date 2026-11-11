import { DEMON_LORD_VISUALS } from '../../topdown/demon_lord/demon_lord_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Demon Lord 2.5D (demon_lord25d.js) ---
// O Demon Lord de topdown/demon_lord (demônio vermelho musculoso, chifres de carneiro cinza-escuros, olhos laranja em
// brasa, asas de morcego enormes, cauda longa com ponta de lança; lança bolas de fogo) no boneco 2.5D.
// As cores são as de topdown/demon_lord/demon_lord_visual.js. Medidas em unidades do boneco.
const D = DEMON_LORD_VISUALS;

export const DEMON_LORD_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: { ...BASE_COLORS, ...D.colors, fire: D.fireball.colors, fireGlow: D.fireball.glowColor },
    // Andar pesado
    strideSpeed: 5.5,
    bodyScale: 1.15,
    hunch: 1.2,

    // Corpo musculoso
    chestWiden: 1.45,
    shoulderWidth: 6.4,
    armWidth: 3.2,
    handRadius: 1.6,
    clawLength: 1.4,
    legWidth: 3.5,

    // Cabeça
    headRadius: 3,
    earLength: 2.4,
    eyeGlow: 1.2,
    // Chifres de carneiro: saem para os lados, curvam para trás e a ponta volta para a frente
    hornWidth: 1.25,
    hornSpread: 3.4,
    hornCurl: 3,

    // Asas de morcego: os ossos abrem em leque a partir do ombro (ângulos de wingBones, do desenho de cima)
    wingBones: D.wingBones.map(b => ({ ...b })),
    wingUnit: 9.5,             // unidades por "raio" do desenho de cima
    wingRise: 0.75,            // quanto o primeiro osso sobe (radianos); os de trás descem
    wingScallop: 0.2,
    flapHz: D.flapHz,
    flapAmount: 0.16,

    // Cauda com ponta de lança
    tailLength: 15,
    tailWidth: 1.8,
    spearLength: 3.4,
    spearWidth: 1.4,

    // Bola de fogo crescendo na mão direita
    fireballRadius: 2.6,
    previewCharge: 0.4,        // no tuner: 0 = sem fogo, 1 = bola cheia

    auraRadius: 30,
    auraAlpha: D.auraAlpha,
    chargeSeconds: D.chargeSeconds,
    focusZ: 20,
    focusA: 2.5,
    scalePerRadius: 0.115
};
