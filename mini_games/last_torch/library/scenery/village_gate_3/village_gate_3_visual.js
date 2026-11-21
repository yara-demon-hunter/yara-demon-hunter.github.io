// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/village_gate_3/village_gate_3_visual.js e rode o sync.
// --- DADOS VISUAIS: Entrada da Vila sob a Chuva (village_gate_3) ---
// Variante 3 de `village_gate`: mesmo desenho de base, outro clima. Lama escura, poças na estrada, tom azul, poucos braseiros.
import { VILLAGE_GATE_VISUALS as BASE } from '../village_gate/village_gate_visual.js';

export const VILLAGE_GATE_3_VISUALS = {
    ...BASE,
    seed: 7509,
    nightTint: 'rgba(6, 12, 24, 0.38)',
    ground: ['#232c25', '#161e19', '#080c0a'],
    portal: { ...BASE.portal, color: 'rgba(160, 190, 230, 0.1)' },
    road: { ...BASE.road, dirt: ['#3a3026', '#2a221a'], rut: 'rgba(8, 6, 4, 0.5)' },
    roofs: { ...BASE.roofs, colors: ['#2a2f3d', '#252a36', '#33384a', '#1f2430'], light: 'rgba(160, 190, 240, 0.12)' },
    props: [
        ...BASE.props.filter(p => p.prop !== 'brazier' && p.prop !== 'cobble'),
        { prop: 'cobble', per100kPx: 1.6, zone: { from: 0.42, to: 0.6 }, avoidCenter: 40 },
        { prop: 'puddle', per100kPx: 3.2, zone: { from: 0.4, to: 0.62 }, avoidCenter: 40 },
        { prop: 'brazier', per100kPx: [0.12, 0.08, 0.05], frames: [10, 8, 5], variants: 2, size: 1.9, cycleSeconds: 1.6, zone: { from: 0.3, to: 0.72 }, avoidCenter: 120 },
        // A vila: chalés nas duas margens (longe da luta), com poço, palheiros, carroça e barris por perto
        { prop: 'cottage', per100kPx: [0.68, 0.5, 0.36], frames: [6, 4, 3], variants: 3, size: 1.5, cycleSeconds: 3.2, zone: { from: 0.3, to: 0.7, invert: true }, avoidRect: [0, 0, 1, 0.14], avoidCenter: 130,
          palette: { roofs: ['#4d5566', '#3e4756', '#5a4a3a', '#6a5a3a'], window: '255, 200, 110' } },
        { prop: 'well', per100kPx: 0.12, zone: { from: 0.64, to: 0.72 }, avoidCenter: 140 },
        { prop: 'haystack', per100kPx: 0.35, zone: { from: 0.16, to: 0.34 }, avoidCenter: 120 },
        { prop: 'haystack', per100kPx: 0.35, zone: { from: 0.68, to: 0.86 }, avoidCenter: 120 },
        { prop: 'cart', per100kPx: 0.14, zone: { from: 0.34, to: 0.4 }, avoidCenter: 140 },
        { prop: 'barrel', per100kPx: 0.4, zone: { from: 0.3, to: 0.7, invert: true }, avoidCenter: 120 }
    ],
    fogColor: '150, 170, 195',
    fogAlphaCenter: 0.08,
    fogAlphaEdge: 0.3,
    fireflyGlow: 'rgba(190, 215, 255, 0.8)'
};
