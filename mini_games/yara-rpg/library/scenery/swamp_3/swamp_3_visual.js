// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/swamp_3/swamp_3_visual.js e rode o sync.
// --- DADOS VISUAIS: Pântano Profundo (swamp_3) ---
// Variante 3 de `swamp`: mesmo desenho de base, outro clima. Lagoas maiores e mais numerosas, água azul-esverdeada, mais juncos e fogos-fátuos, névoa mais densa.
import { SWAMP_VISUALS as BASE } from '../swamp/swamp_visual.js';

export const SWAMP_3_VISUALS = {
    ...BASE,
    seed: 6405,
    nightTint: 'rgba(4, 14, 18, 0.42)',
    ground: ['#1d2a22', '#121c17', '#080e0b'],
    pools: { ...BASE.pools, count: [11, 15], radius: [55, 130], water: ['#1f5a58', '#0f3030'], mud: '#0a110e', weed: 'rgba(90, 190, 140, 0.5)', keepClear: 0.17 },
    props: BASE.props.map(p => p.prop === 'wisp' ? { ...p, per100kPx: p.per100kPx.map(v => v * 1.6), palette: { glow: '130, 220, 255' } }
        : p.prop === 'reed' ? { ...p, per100kPx: p.per100kPx.map(v => v * 1.3) }
        : p.prop === 'mushroom' ? { ...p, palette: { glow: '110, 230, 220', cap: '#8ef0e0', capRim: '#3ba898', capUnder: '#1f6a62', stem: '#b9e6e0', spot: 'rgba(20, 100, 95, 0.35)' } } : p),
    fogColor: '130, 190, 180',
    fogDensityBoostAtZeroHp: 1.6,
    fogAlphaCenter: 0.13,
    fogAlphaEdge: 0.38,
    fireflyGlow: 'rgba(150, 240, 255, 0.85)'
};
