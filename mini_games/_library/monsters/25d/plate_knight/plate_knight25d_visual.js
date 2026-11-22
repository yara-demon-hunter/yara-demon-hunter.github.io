import { HUMAN_DEFAULTS, HUMAN_COLORS } from '../human25d_visual.js';

// --- DADOS VISUAIS: Cavaleiro de Placas 2.5D (plate_knight25d.js) ---
// Cavaleiro em armadura completa de aço polido: elmo fechado com fenda e brilho vermelho, pluma vermelha, ombreiras, tabardo branco com a cruz vermelha da vila, espada e escudo de aço. Lento e pesado.
// Montado por human25d.js (as escolhas ficam em `look`). Medidas em unidades do boneco; cores aqui mesmo.
export const PLATE_KNIGHT_25D_VISUALS = {
    ...HUMAN_DEFAULTS,
    look: { legs: 'greaves', torso: 'plate', pauldrons: true, tabard: '#e7e5df', helmet: 'great', plume: true, weapon: 'sword', shield: true, tail: false, wings: false, cape: true, claws: false },
    colors: {
        ...HUMAN_COLORS,
        aura: 'rgba(239, 68, 68, 0.4)',
        armor: '#a9b2c0', armorDark: '#5b6473', armorLight: '#e1e7f0', rust: '#8a4a2a',
        tabardTrim: '#b91c1c', glow: '#ef4444', eye: '#fecaca', plume: '#b91c1c',
        shield: '#b4bdca', shieldRim: '#4a5260', shieldMark: '#b91c1c', shieldBoss: '#e1e7f0',
        metal: '#cfd6e2', metalDark: '#5d6676', metalLight: '#ffffff',
        cape: '#7f1d1d', capeFold: '#5a1212', capeEdge: '#991b1b', capeInner: '#3a0b0b'
    },
    capeSpread: 1.0, capeHemSpread: 1.1, capeLength: 0.55,
    strideSpeed: 6,
    weaponLength: 11.5,
    shieldRadius: 4.8,
    bodyScale: 1.12,
    chestWiden: 1.15,
    shoulderScale: 1.12,
    legWidth: 2.7,
    armWidth: 2.2,
    headRadius: 2.4,
};
