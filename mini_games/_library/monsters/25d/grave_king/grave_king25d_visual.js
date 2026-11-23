import { SKELETON_WARRIOR_25D_VISUALS } from '../skeleton_warrior/skeleton_warrior25d_visual.js';

// --- DADOS VISUAIS: Rei do Cemitério 2.5D (grave_king25d.js) ---
// Chefe do Graveyard: um esqueleto zumbi de guerra. Corpo do Esqueleto Guerreiro (capacete e peitoral enferrujados, espada gasta e escudo), mas ainda com
// carne verde podre nas costelas e na cabeça, olhos amarelos, ossos rachados e pesado. Usa as opções fleshHead/fleshTorso do skeleton25d.js.
export const GRAVE_KING_25D_VISUALS = {
    ...SKELETON_WARRIOR_25D_VISUALS,
    colors: {
        ...SKELETON_WARRIOR_25D_VISUALS.colors,
        skin: '#7f996a', skinShade: '#4d6340', wound: '#5a1f2a',
        soul: '#fde047', soulCore: '#fef9c3', soulGlow: 'rgba(250, 204, 21, 0.55)',
        rust: '#7a4a2a', steelDark: '#2e3540', steel: '#7f8996'
    },
    fleshHead: true,
    fleshTorso: true,
    weaponLength: 12,
    shieldRadius: 4.4,
    ribPairs: 5,
    strideSpeed: 5.5,
    bodyScale: 1.25,
    center: 13
};
