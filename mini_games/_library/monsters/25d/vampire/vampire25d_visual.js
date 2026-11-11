import { VAMPIRE_VISUALS } from '../../topdown/vampire/vampire_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Vampiro 2.5D (vampire25d.js) ---
// O Vampiro de topdown/vampire (nobre pálido de cabelo preto penteado para trás, olhos vermelhos e presas, gola alta,
// capa preta com forro vermelho, medalhão; estica os braços ao chegar perto do herói) no boneco 2.5D.
// As cores são as de topdown/vampire/vampire_visual.js, mais as da roupa (da imagem de referência).
const C = VAMPIRE_VISUALS.colors;

export const VAMPIRE_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: {
        ...BASE_COLORS, ...C, outline: C.capeShade,
        // Roupa: casaca escura com frisos prateados, botas pretas
        suit: '#1c141f', suitLight: '#2e2233', trim: '#8a8fa3', body: '#1c141f', boots: '#0b0b10', sash: '#2e2233',
        // Capa (as chaves que a capa padrão do boneco lê): preta, com o forro vermelho na borda
        capeFold: C.capeEdge, capeInner: C.lining
    },
    // Desliza: passos curtos
    strideSpeed: 5,
    floatAmount: 0.35,
    floatHz: VAMPIRE_VISUALS.floatHz,

    // Capa em leque
    capeSpread: 1.3,
    capeHemSpread: 1.25,
    capeLining: 0.5,           // largura do forro vermelho aparecendo na borda

    // Cabeça
    headRadius: 2.7,
    eyeGlow: 1.1,
    fangLength: 0.7,
    // Gola alta: duas pontas rígidas ao redor da cabeça
    collarHeight: 3.4,
    collarSpread: 3.5,

    // Braços: mãos juntas na frente do corpo; esticam para agarrar
    sleeveWidth: 2,
    handRadius: 0.95,
    nailLength: 1.1,
    grabReach: 8.5,
    previewGrab: 0,            // no tuner: 0 = mãos juntas, 1 = agarrando

    medallionRadius: 0.5,

    auraRadius: 22,
    auraAlpha: VAMPIRE_VISUALS.auraAlpha,
    grabDistance: VAMPIRE_VISUALS.grabDistance,
    focusZ: 20.5,
    focusA: 1,
    scalePerRadius: 0.135
};
