// --- DADOS VISUAIS: Pátio do Castelo em Ruínas (castle_gate_2) ---
// Variante 2 de `castle_gate`: mesmo desenho de base, outro clima. Mais lajes quebradas, pedras e ossos, musgo, tapete esmaecido, menos braseiros.
import { CASTLE_GATE_VISUALS as BASE } from '../castle_gate/castle_gate_visual.js';

export const CASTLE_GATE_2_VISUALS = {
    ...BASE,
    seed: 8520,
    nightTint: 'rgba(8, 12, 18, 0.42)',
    carpet: { ...BASE.carpet, color: '#2c0f14', edge: '#7a6030', worn: 'rgba(0, 0, 0, 0.45)' },
    props: BASE.props.map(p => p.prop === 'flagstone' ? { ...p, per100kPx: 3.6 }
        : p.prop === 'bones' ? { ...p, per100kPx: 1.6 }
        : p.prop === 'rock' ? { ...p, per100kPx: 0.9 }
        : p.prop === 'moss' ? { ...p, per100kPx: 6 }
        : p.prop === 'brazier' ? { ...p, per100kPx: p.per100kPx.map(v => v * 0.55) } : p),
    fogColor: '130, 140, 150',
    fogAlphaEdge: 0.3
};
