// --- DADOS VISUAIS: Pátio Real Iluminado (castle_gate_3) ---
// Variante 3 de `castle_gate`: mesmo desenho de base, outro clima. Tapete vivo com bordas douradas, braseiros no triplo, poucas lajes quebradas e ossos.
import { CASTLE_GATE_VISUALS as BASE } from '../castle_gate/castle_gate_visual.js';

export const CASTLE_GATE_3_VISUALS = {
    ...BASE,
    seed: 8631,
    nightTint: 'rgba(14, 8, 24, 0.34)',
    ground: ['#35303f', '#26222e', '#100e16'],
    portal: { ...BASE.portal, color: 'rgba(255, 200, 100, 0.14)' },
    carpet: { ...BASE.carpet, halfWidth: 0.065, color: '#6b1522', edge: '#e0b84a' },
    gate: { ...BASE.gate, light: '#3c3a4c' },
    props: BASE.props.map(p => p.prop === 'brazier' ? { ...p, per100kPx: p.per100kPx.map(v => v * 3), palette: { glow: '255, 190, 90' } }
        : p.prop === 'flagstone' ? { ...p, per100kPx: 0.6 }
        : p.prop === 'bones' ? { ...p, per100kPx: 0.2 } : p),
    fogColor: '150, 130, 170',
    fogAlphaCenter: 0.04,
    fireflyGlow: 'rgba(255, 200, 110, 0.85)'
};
