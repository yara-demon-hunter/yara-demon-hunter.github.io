// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/headless_knight/headless_knight25d_visual.js e rode o sync.
import { HEADLESS_KNIGHT_VISUALS } from '../../topdown/headless_knight/headless_knight_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Cavaleiro Sem Cabeça 2.5D (headless_knight25d.js) ---
// O Cavaleiro de topdown/headless_knight (ombreiras enormes com espinhos, gorjal oco com a chama azul no lugar da
// cabeça, capa roxa rasgada, montante arrastando no chão e o elmo flutuando ao lado) no boneco 2.5D.
// As cores são as de topdown/headless_knight/headless_knight_visual.js. Medidas em unidades do boneco.
const C = HEADLESS_KNIGHT_VISUALS.colors;

export const HEADLESS_KNIGHT_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: {
        ...BASE_COLORS, ...C, outline: C.ink,
        // Capa (as chaves que a capa padrão do boneco lê)
        cape: C.cloth, capeFold: C.clothMid, capeEdge: C.clothEdge, capeInner: C.clothDark
    },
    strideSpeed: 6.5,
    bodyScale: 1.12,

    // Armadura
    chestWiden: 1.2,
    shoulderScale: 1.25,       // ombros mais abertos que os do herói
    pauldronRadius: 3.3,
    spikeLength: 2.6,
    armWidth: 2.4,
    gauntletWidth: 2.9,
    legWidth: 3,

    // Capa
    capeSpread: 1.4,
    capeRise: 0.6,

    // Montante arrastando no chão do lado direito
    bladeLength: 13.5,
    bladeWidth: 1.5,
    dragHandHeight: 8.8,
    dragSide: 3.2,
    sparks: 4,

    // Gorjal oco e a chama azul no lugar da cabeça
    gorgetRadius: 2.4,
    flameHeight: 8,
    flameWidth: 1.9,

    // Elmo flutuando do lado esquerdo
    helmRadius: 2.5,
    helmForward: 2.5,
    helmSide: 5.6,
    helmHeight: 11,
    helmFloat: 0.5,
    plumeLength: 4.5,

    auraRadius: 24,
    auraAlpha: HEADLESS_KNIGHT_VISUALS.auraAlpha,
    focusZ: 17,
    focusA: 1,
    scalePerRadius: 0.13
};
