import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Sapo do Pântano 2.5D (bog_toad25d.js) ---
// Sapo gigante verde: corpo largo e baixo, olhos saltados cor de âmbar, papo que infla, verrugas escuras nas costas e pernas traseiras dobradas
// que se estendem a cada pulo. Medidas em unidades do boneco.
export const BOG_TOAD_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: {
        ...BASE_COLORS,
        aura: 'rgba(132, 204, 22, 0.35)',
        outline: '#0d1a09', body: '#5d9438', bodyDark: '#3a6524', bodyLight: '#8cc85a', belly: '#d8e089', wart: '#32541f', mouth: '#1a0f12', throat: '#e9c46a',
        eye: '#f5b82e', eyeRim: '#8a5a12', pupil: '#0c0a06'
    },
    strideSpeed: 5,
    bodyR: 4.4,
    bodyHeight: 3.6,       // altura do centro do corpo
    headR: 3.1,
    eyeR: 1.25,
    hop: 4.2,              // quanto sobe a cada pulo (só ao andar)
    thigh: 2.3,            // grossura da coxa
    warts: 8,
    throatPulseHz: 1,      // inteiro: o ciclo do sprite tem 1 s
    auraRadius: 20, auraAlpha: 0.16, focusZ: 6, focusA: 1, scalePerRadius: 0.16, center: 4
};
