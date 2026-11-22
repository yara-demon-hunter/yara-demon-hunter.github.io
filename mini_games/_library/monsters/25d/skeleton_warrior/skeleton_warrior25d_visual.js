import { SKELETON_25D_VISUALS } from '../skeleton/skeleton25d_visual.js';

// --- DADOS VISUAIS: Esqueleto Guerreiro 2.5D (skeleton_warrior25d.js) ---
// Esqueleto armado do cemitério: capacete e peitoral enferrujados, espada gasta na mão direita e um escudo de madeira rachado na esquerda. Mesmo corpo do Esqueleto, com as peças de guerra por cima.
// É o Esqueleto 2.5D (../skeleton/) com as escolhas de arma e armadura ligadas: S.hold, S.armor, S.helmet, S.hood, S.quiver (ver skeleton25d.js).
export const SKELETON_WARRIOR_25D_VISUALS = {
    ...SKELETON_25D_VISUALS,
    hold: 'sword',
    armor: true,
    helmet: true,
    weaponLength: 9.5,
    shieldRadius: 3.6,
    strideSpeed: 7.5,
    bodyScale: 1.05,
    colors: {
        ...SKELETON_25D_VISUALS.colors,
        rust: '#8a5532', steelDark: '#3b4452', steel: '#9aa4b2', shield: '#6a4a2c', grip: '#2b2118', wood: '#7a5a34'
    },
};
