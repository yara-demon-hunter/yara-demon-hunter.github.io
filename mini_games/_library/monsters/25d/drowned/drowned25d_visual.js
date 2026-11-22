import { HUMAN_DEFAULTS, HUMAN_COLORS } from '../human25d_visual.js';

// --- DADOS VISUAIS: Afogado 2.5D (drowned25d.js) ---
// Morto do rio: pele azul-acinzentada e inchada, cabelo de algas pingando, peito marcado, boca aberta e olhos de brilho ciano, com garras pálidas. Anda arrastado, de braços moles.
// Montado por human25d.js (as escolhas ficam em `look`). Medidas em unidades do boneco; cores aqui mesmo.
export const DROWNED_25D_VISUALS = {
    ...HUMAN_DEFAULTS,
    look: { legs: 'cloth', torso: 'bare', pauldrons: false, tabard: null, helmet: 'weeds', plume: false, weapon: 'none', shield: false, tail: false, wings: false, cape: false, claws: true },
    colors: {
        ...HUMAN_COLORS,
        aura: 'rgba(34, 211, 238, 0.4)',
        skin: '#8fb4c4', skinShade: '#5d8296', cloth: '#2f5a5e', clothDark: '#1d3a40', clothLight: '#3f7378',
        hair: '#2f6b4a', hairLight: '#4c9a6a', glow: '#22d3ee', eye: '#cffafe', ink: '#06222a', wound: '#1e4a58', claw: '#d6e4ea', boot: '#1d3a40'
    },
    strideSpeed: 6,
    eyeGlow: 2,
    openMouth: true,
    chestGlow: 4,
    hairLength: 6.5,
    armWidth: 1.7,
    wounds: [[0, -1.2, 0.8], [0.1, 1.4, 0.6]],
    headRadius: 2.4,
};
