// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/river_crossing_3/river_crossing_3_visual.js e rode o sync.
// --- DADOS VISUAIS: Travessia do Rio ao Entardecer (river_crossing_3) ---
// Variante 3 de `river_crossing`: mesmo desenho de base, outro clima. Rio mais largo, água cor de cobre e céu laranja refletido, mais juncos e ondulações.
import { RIVER_CROSSING_VISUALS as BASE } from '../river_crossing/river_crossing_visual.js';

export const RIVER_CROSSING_3_VISUALS = {
    ...BASE,
    seed: 5303,
    nightTint: 'rgba(30, 14, 6, 0.28)',
    ground: ['#2a3020', '#1a2116', '#0b0f08'],
    river: { ...BASE.river, from: 0.36, to: 0.64, water: ['#6a4a34', '#4a3424', '#2c1f16'], mud: '#2a1e12', foam: 'rgba(255, 215, 170, 0.3)' },
    bridge: { ...BASE.bridge, halfWidth: 0.075, plank: ['#3d2a1a', '#33220f', '#4a3220'], rail: '#1d130a', margin: 0.07 },
    props: BASE.props.map(p => p.prop === 'reed' ? { ...p, per100kPx: p.per100kPx.map(v => v * 1.5) }
        : p.prop === 'ripple' ? { ...p, palette: { ring: 'rgba(255, 215, 170, 0.5)' } } : p),
    fogColor: '210, 170, 130',
    fogAlphaCenter: 0.06,
    fireflyGlow: 'rgba(255, 190, 110, 0.85)'
};
