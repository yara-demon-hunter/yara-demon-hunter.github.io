// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/wraith/wraith25d_visual.js e rode o sync.
import { WRAITH_VISUALS } from '../../topdown/wraith/wraith_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Espectro 2.5D (wraith25d.js) ---
// O Espectro de topdown/wraith (capuz vazio com dois olhos frios, flutuando sobre um rastro de fiapos; brilha ao mirar
// e os fiapos esticam ao disparar) no boneco 2.5D. As cores são as de topdown/wraith/wraith_visual.js.
export const WRAITH_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: { ...BASE_COLORS, ...WRAITH_VISUALS.colors, hoodInner: '#020617' },
    strideSpeed: 6,

    // Flutua, sem pernas
    floatHeight: 6,            // altura da barra do manto
    floatAmount: 0.9,
    floatHz: WRAITH_VISUALS.floatHz,
    alpha: WRAITH_VISUALS.alpha,

    // Manto: ombros largos afinando para baixo
    shoulderHeight: 13.5,
    shoulderRadius: 4.2,
    taper: 0.5,                // raio na barra em relação aos ombros
    lean: 1.2,                 // inclinado para a frente

    // Capuz vazio e olhos frios
    hoodHeight: 18,
    hoodRadius: 3.5,
    eyeSpread: 0.95,
    eyeGlow: 2.2,

    // Mangas vazias pendendo dos lados
    sleeveLength: 6,
    sleeveWidth: 1.6,

    // Fiapos da barra, ondulando para trás
    wisps: WRAITH_VISUALS.wisps + 2,
    wispLength: 8,
    wispWidth: 1.1,
    lungeStretch: 2.1,         // os fiapos esticam no disparo

    // Tuner: 0 = normal, 1 = mirando (brilha); e 0 = normal, 1 = disparando (fiapos esticados)
    previewAim: 0,
    previewLunge: 0,

    auraRadius: 22,
    auraAlpha: WRAITH_VISUALS.auraAlpha,
    focusZ: 17,
    focusA: 2,
    scalePerRadius: 0.17
};
