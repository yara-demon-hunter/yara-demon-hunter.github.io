// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/armored_zombie/armored_zombie25d_visual.js e rode o sync.
import { HUMAN_DEFAULTS, HUMAN_COLORS } from '../human25d_visual.js';

// --- DADOS VISUAIS: Zumbi de Armadura 2.5D (armored_zombie25d.js) ---
// Soldado medieval morto-vivo: armadura de placas enferrujada e amassada (peitoral, ombreiras, grevas), cabeça descoberta de rosto verde apodrecido de olhos
// amarelos, braços esticados à frente em manoplas, e uma perna que arrasta. Maior e mais pesado que o Zumbi comum. Montado por human25d.js (`look`).
export const ARMORED_ZOMBIE_25D_VISUALS = {
    ...HUMAN_DEFAULTS,
    look: { legs: 'greaves', torso: 'plate', pauldrons: true, tabard: '#4a2a2a', helmet: 'none', plume: false, weapon: 'none', shield: false, tail: false, wings: false, cape: false, claws: false, armsForward: true, armsBare: false, boneArms: false, boneLegs: false, ribs: false, dragLeg: true },
    colors: {
        ...HUMAN_COLORS,
        aura: 'rgba(132, 204, 22, 0.35)',
        skin: '#7f996a', skinShade: '#52684a', ink: '#1a130a',
        armor: '#7c7468', armorDark: '#3e3a33', armorLight: '#a89e8c', rust: '#8a4a2a',
        tabardTrim: '#8a6a4a', belt: '#2a2018', buckle: '#8a6a3a',
        eye: '#fde68a', glow: '#facc15', cloth: '#4a3a2c', clothDark: '#2e241a', clothLight: '#6a5844'
    },
    strideSpeed: 3,
    limp: 0.7,
    dragSide: -1,
    eyeGlow: 1.3,
    openMouth: true,
    slouch: 1.1,
    armReach: 6.4,
    armSpread: 0.7,
    armDrop: 1.3,
    armSwing: 0.9,
    chestWiden: 1.25,
    shoulderScale: 1.15,
    pauldronRadius: 2.9,
    legWidth: 2.8,
    armWidth: 2.2,
    headRadius: 2.5,
    bodyScale: 1.2,
};
