import { HUMAN_DEFAULTS, HUMAN_COLORS } from '../human25d_visual.js';

// --- DADOS VISUAIS: Rei do Cemitério 2.5D (grave_king25d.js) ---
// Chefe do Graveyard (onda 12), pela imagem de referência art_reference/images/grave-king.webp: cavaleiro morto-vivo em armadura NEGRA de placas com
// frisos de BRONZE escuro e rebites, elmo de espinhos aberto na frente mostrando a CAVEIRA de olhos vermelhos, pino no topo com rabo de crina vermelha,
// ombreiras grandes com espinhos e medalhões de caveira, mãos de ESQUELETO saindo das manoplas, saia de cota de malha, fivela de caveira, capa comprida
// e RASGADA e um espadão largo que ele arrasta pelo chão. Montado por human25d.js (as escolhas ficam em `look`).
export const GRAVE_KING_25D_VISUALS = {
    ...HUMAN_DEFAULTS,
    look: {
        legs: 'greaves', torso: 'plate', pauldrons: true, spikes: true, tabard: null, helmet: 'skull', plume: true, weapon: 'greatsword', shield: false,
        tail: false, wings: false, cape: true, claws: false, boneHands: true, mail: true, skullBuckle: true
    },
    colors: {
        ...HUMAN_COLORS,
        aura: 'rgba(220, 38, 38, 0.35)',
        outline: '#08080a', ink: '#0a0507',
        armor: '#3d3e44', armorDark: '#1d1e23', armorLight: '#7a7d86',
        trim: '#8a6a3a', trimDark: '#4e3a1e',
        bone: '#ddd3b6', boneDark: '#8a7f62',
        mail: '#4a4c53', mailDark: '#2c2d32',
        glow: '#ef4444', eye: '#fecaca',
        plume: '#8e1b1b', plumeLight: '#b42323',
        metal: '#8d929b', metalDark: '#3a3e45', metalLight: '#dde1e6', grip: '#2b2118',
        belt: '#3a2a1a', boot: '#151518',
        cape: '#151316', capeFold: '#0b0a0c', capeEdge: '#2a2629', capeInner: '#1d191b'
    },
    // Capa comprida (a padrão do boneco já tem a barra dentada, que vira o pano rasgado)
    capeSpread: 1.25, capeHemSpread: 1.35, capeLength: 1.05,
    strideSpeed: 4.6,
    weaponLength: 14,
    bodyScale: 1.28,
    chestWiden: 1.2,
    shoulderScale: 1.18,
    pauldronRadius: 3.0,
    legWidth: 2.8,
    armWidth: 2.3,
    handRadius: 1.0,
    headRadius: 2.45,
    plumeLength: 6.5,
    center: 12.5
};
