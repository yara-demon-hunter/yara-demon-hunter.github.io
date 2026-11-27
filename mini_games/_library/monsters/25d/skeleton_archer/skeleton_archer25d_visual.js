import { SKELETON_25D_VISUALS } from '../skeleton/skeleton25d_visual.js';

// --- DADOS VISUAIS: Esqueleto Arqueiro 2.5D (skeleton_archer25d.js) ---
// Esqueleto atirador: capuz rasgado cinza-arroxeado, arco de madeira velha na mão esquerda com a flecha encaixada, aljava com penas vermelhas nas costas. Fica de arco armado, pronto para soltar.
// É o Esqueleto 2.5D (../skeleton/) com as escolhas de arma e armadura ligadas: S.hold, S.armor, S.helmet, S.hood, S.quiver (ver skeleton25d.js).
export const SKELETON_ARCHER_25D_VISUALS = {
    ...SKELETON_25D_VISUALS,
    hold: 'bow',
    previewAim: 0.6,       // tuner: o quanto a corda está puxada (0 a 1)
    bowScale: 1.45,        // o arco é 45% maior que o padrão (27/11/2026)
    hood: true,
    quiver: true,
    strideSpeed: 7,
    bodyScale: 1,
    colors: {
        ...SKELETON_25D_VISUALS.colors,
        hood: '#3a3550', hoodDark: '#221f33', wood: '#7a5a34', string: '#e5e7eb', leather: '#4a3320', feather: '#b91c1c', steel: '#9aa4b2'
    },
};
