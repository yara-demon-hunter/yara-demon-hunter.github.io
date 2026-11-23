import { SKELETON_CRAWLER_25D_VISUALS } from '../skeleton_crawler/skeleton_crawler25d_visual.js';

// --- DADOS VISUAIS: Zumbi Rastejante 2.5D (zombie_crawler25d.js) ---
// Meio zumbi: só do peito para cima. A metade de baixo não existe; do corte sai tripa e a COLUNA segue solta no chão (vértebras à mostra)
// arrastando atrás dele, enquanto ele se puxa com as mãos. Cabeça de pele verde-acinzentada, olhos amarelos, costelas à mostra.
// Mesma postura do Esqueleto Rastejante (crawl*), mais as opções noLegs / tailBones / fleshHead / fleshTorso / noSoul do skeleton25d.js.
export const ZOMBIE_CRAWLER_25D_VISUALS = {
    ...SKELETON_CRAWLER_25D_VISUALS,
    colors: {
        ...SKELETON_CRAWLER_25D_VISUALS.colors,
        skin: '#86a070', skinShade: '#55704a', wound: '#5a1f2a',
        soul: '#fde68a', soulCore: '#fef9c3', soulGlow: 'rgba(250, 204, 21, 0.45)',
        bone: '#e0d8c2', boneDark: '#5e5742'
    },
    noLegs: true,
    noSoul: true,
    fleshHead: true,
    fleshTorso: true,
    ragStrips: 0,              // sem trapo: o que aparece atrás é a coluna
    tailBones: 8,              // vértebras soltas atrás da bacia
    tailGap: 1.25,             // distância entre elas
    strideSpeed: 4.5,          // se arrasta devagar
    ribPairs: 3,
    clawLength: 1.3,
    center: 4
};
