// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/lake_spirit/lake_spirit25d_visual.js e rode o sync.
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Espírito do Lago 2.5D (lake_spirit25d.js) ---
// Chefe do River Crossing: uma dama feita de água que flutua sobre um redemoinho. Vestido de água em camadas, cabelo comprido que flui, coroa de juncos
// e lírios, olhos brancos brilhantes e esferas d'água em órbita. Medidas em unidades do boneco.
export const LAKE_SPIRIT_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: {
        ...BASE_COLORS,
        aura: 'rgba(56, 189, 248, 0.5)',
        outline: '#06304a', water: 'rgba(56, 189, 248, 0.78)', waterDark: 'rgba(14, 116, 180, 0.82)', waterLight: 'rgba(186, 230, 253, 0.85)', foam: '#e0f2fe',
        skin: '#bae6fd', skinShade: '#7dd3fc', hair: 'rgba(37, 150, 220, 0.85)', hairLight: 'rgba(125, 211, 252, 0.9)',
        eye: '#ffffff', eyeGlow: 'rgba(224, 242, 254, 0.95)', reed: '#4d7c0f', reedLight: '#84cc16', lily: '#fbcfe8', lilyCore: '#fde68a', glow: 'rgba(56, 189, 248, 0.55)', ripple: 'rgba(125, 211, 252, 0.55)'
    },
    strideSpeed: 3,
    dressBands: 7,
    dressR: 6.4,           // raio do vestido embaixo
    floatZ: 2.2,
    swayHz: 1,             // inteiros: o ciclo do sprite tem 1 s
    swayAmp: 0.9,
    hairStrands: 6,
    orbs: 3,
    auraRadius: 26, auraAlpha: 0.22, focusZ: 10, focusA: 1, scalePerRadius: 0.1, center: 8
};
