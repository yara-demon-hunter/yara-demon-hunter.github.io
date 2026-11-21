// --- DADOS VISUAIS: Travessia do Rio Gelado (river_crossing_2) ---
// Variante 2 de `river_crossing`: mesmo desenho de base, outro clima. Água gelada, chão azulado, ponte mais estreita, juncos secos, mais pedras.
import { RIVER_CROSSING_VISUALS as BASE } from '../river_crossing/river_crossing_visual.js';

export const RIVER_CROSSING_2_VISUALS = {
    ...BASE,
    seed: 5202,
    nightTint: 'rgba(6, 16, 32, 0.36)',
    ground: ['#27343c', '#18232b', '#0b1117'],
    river: { ...BASE.river, from: 0.38, to: 0.62, water: ['#3b6e85', '#25495c', '#142f3f'], mud: '#1a2128', foam: 'rgba(235, 248, 255, 0.45)' },
    bridge: { ...BASE.bridge, halfWidth: 0.05, plank: ['#4a4038', '#3c332c', '#55493f'], rail: '#1b1815' },
    props: BASE.props.map(p => p.prop === 'reed' ? { ...p, palette: { blade: '#7a7a58', blade2: '#9a9468', head: '#4a3a2a' } }
        : p.prop === 'rock' ? { ...p, per100kPx: p.per100kPx * 1.6 }
        : p.prop === 'moss' ? { ...p, palette: { colors: ['rgba(150, 190, 205, 0.18)', 'rgba(120, 160, 180, 0.2)'] } }
        : p.prop === 'mushroom' ? { ...p, per100kPx: [0.2, 0.1, 0] } : p),
    fogColor: '190, 215, 230',
    fogAlphaCenter: 0.08,
    fireflyGlow: 'rgba(210, 240, 255, 0.85)'
};
