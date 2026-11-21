// --- DADOS VISUAIS: Pântano Morto (swamp_2) ---
// Variante 2 de `swamp`: mesmo desenho de base, outro clima. Poucas poças pequenas, mais ossos e raízes, fogos-fátuos roxos, névoa cinza.
import { SWAMP_VISUALS as BASE } from '../swamp/swamp_visual.js';

export const SWAMP_2_VISUALS = {
    ...BASE,
    seed: 6304,
    nightTint: 'rgba(14, 8, 18, 0.4)',
    ground: ['#2b2a1d', '#1c1b12', '#0c0b07'],
    pools: { ...BASE.pools, count: [4, 6], radius: [30, 70], water: ['#2a2f2a', '#161a16'], weed: 'rgba(120, 120, 80, 0.4)' },
    props: BASE.props.map(p => p.prop === 'bones' ? { ...p, per100kPx: 1.8 }
        : p.prop === 'root' ? { ...p, per100kPx: 2.6 }
        : p.prop === 'stump' ? { ...p, per100kPx: 1.2 }
        : p.prop === 'wisp' ? { ...p, palette: { glow: '200, 140, 255' } }
        : p.prop === 'mushroom' ? { ...p, palette: { glow: '170, 120, 220', cap: '#b898e8', capRim: '#6e4fa0', capUnder: '#43306a', stem: '#d6cce4', spot: 'rgba(40, 20, 70, 0.35)' } }
        : p.prop === 'reed' ? { ...p, per100kPx: p.per100kPx.map(v => v * 0.5), palette: { blade: '#5c5a38', blade2: '#7a7448', head: '#3e2e20' } } : p),
    fogColor: '170, 165, 170',
    fireflyGlow: 'rgba(210, 170, 255, 0.85)'
};
