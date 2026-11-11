// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/moth/moth25d_visual.js e rode o sync.
import { MOTH_VISUALS } from '../../topdown/moth/moth_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Mariposa de cinzas 2.5D (moth25d.js) ---
// A Mariposa de topdown/moth (quatro asas empoeiradas com olhos desenhados, corpo peludo, antenas e rastro de cinza em
// brasa) voando no boneco 2.5D. As cores são as de topdown/moth/moth_visual.js. Medidas em unidades do boneco.
export const MOTH_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: { ...BASE_COLORS, ...MOTH_VISUALS.colors },
    strideSpeed: 8,

    // Voo
    flyHeight: 11,
    bob: 0.7,
    flapHz: MOTH_VISUALS.flapHz * 0.5,
    flapAngle: 0.85,
    wobble: 1.3,
    wobbleHz: MOTH_VISUALS.wobbleHz,

    // Corpo
    bodyLength: 5.6,
    bodyWidth: 1.9,
    fuzzRadius: 1.5,
    antennaLength: 3.4,

    // Asas: a da frente, larga e clara, com o olho desenhado; a de trás, menor e escura
    foreSpan: 9,
    foreChord: 6,
    hindSpan: 6,
    hindChord: 4.4,
    eyeSpot: 1.5,

    // Rastro de cinzas em brasa
    embers: MOTH_VISUALS.embers + 2,
    emberTrail: 10,

    auraRadius: 20,
    auraAlpha: MOTH_VISUALS.auraAlpha,
    focusZ: 11.5,
    focusA: 1,
    scalePerRadius: 0.2
};
