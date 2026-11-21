// --- DADOS VISUAIS: Entrada da Vila em Chamas (village_gate_2) ---
// Variante 2 de `village_gate`: mesmo desenho de base, outro clima. Tom vermelho, brasas, telhados escuros com brilho de fogo, mais braseiros e ossos na estrada.
import { VILLAGE_GATE_VISUALS as BASE } from '../village_gate/village_gate_visual.js';

export const VILLAGE_GATE_2_VISUALS = {
    ...BASE,
    seed: 7408,
    nightTint: 'rgba(40, 8, 4, 0.34)',
    ground: ['#33291c', '#221b12', '#0e0a07'],
    portal: { ...BASE.portal, color: 'rgba(255, 110, 40, 0.16)' },
    roofs: { ...BASE.roofs, colors: ['#2a1a18', '#221619', '#301d17', '#1c1416'], light: 'rgba(255, 120, 50, 0.3)' },
    props: BASE.props.map(p => p.prop === 'brazier' ? { ...p, per100kPx: p.per100kPx.map(v => v * 1.8), palette: { glow: '255, 90, 30' } }
        : p.prop === 'bones' ? { ...p, per100kPx: 0.9 }
        : p.prop === 'plank' ? { ...p, per100kPx: 1.3 } : p),
    fogColor: '200, 130, 100',
    fireflies: [14, 8, 3],
    fireflySpeed: 20,
    fireflyGlow: 'rgba(255, 120, 50, 0.9)'
};
