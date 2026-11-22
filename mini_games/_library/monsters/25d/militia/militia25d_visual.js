import { HUMAN_DEFAULTS, HUMAN_COLORS } from '../human25d_visual.js';

// --- DADOS VISUAIS: Miliciano da Vila 2.5D (militia25d.js) ---
// Camponês armado e acolchoado: gibão de couro e linho remendado, chapéu de ferro de aba larga, machado de lenhador e um escudo de madeira com a marca da vila pintada. Anda curvado e firme.
// Montado por human25d.js (as escolhas ficam em `look`). Medidas em unidades do boneco; cores aqui mesmo.
export const MILITIA_25D_VISUALS = {
    ...HUMAN_DEFAULTS,
    look: { legs: 'cloth', torso: 'gambeson', pauldrons: false, tabard: null, helmet: 'kettle', plume: false, weapon: 'axe', shield: true, tail: false, wings: false, cape: true, claws: false },
    colors: {
        ...HUMAN_COLORS,
        aura: 'rgba(250, 204, 21, 0.35)',
        cloth: '#7a6a50', clothDark: '#4a3e2e', clothLight: '#9a8660', gambeson: '#b8a06c', patch: '#7a5a3a',
        armor: '#7e8794', armorDark: '#464e5a', armorLight: '#b7c0cd',
        shield: '#8a6238', shieldRim: '#2d2113', shieldMark: '#b91c1c', shieldBoss: '#9aa3b2',
        cape: '#3f7a3a', capeFold: '#2c5a2a', capeEdge: '#5a9a50', capeInner: '#1d3d1c'      // capa verde, para disfarçar na mata
    },
    capeSpread: 1.0, capeHemSpread: 1.1, capeLength: 0.55,
    strideSpeed: 7.5,
    weaponLength: 9.5,
    shieldRadius: 4.4,
    bodyScale: 1.04,
};
