// --- DADOS VISUAIS: Entrada da Vila sob a Chuva (village_gate_3) ---
// Variante 3 de `village_gate`: mesmo desenho de base, outro clima. Lama escura, poças na estrada, tom azul, poucos braseiros.

// --- O desenho-base deste cenário (era `village_gate`, que foi removido): o clima da variante vem abaixo, em cima dele ---
// --- DADOS VISUAIS: cenário Entrada da Vila (village_gate) ---
// Uma estrada de terra batida atravessa o mundo na horizontal, com calçada de pedras; capim dos lados, cercas e telhados nas bordas.
import { DARK_FOREST_2_VISUALS as FOREST } from '../dark_forest_2/dark_forest_2_visual.js';

const BASE = {
    ...FOREST,
    seed: 7307,
    nightTint: 'rgba(24, 12, 8, 0.3)',
    ground: ['#2d3320', '#1d2316', '#0d110a'],
    clearingRadiusRatio: 0.78,
    portal: { ...FOREST.portal, color: 'rgba(255, 190, 110, 0.1)' },
    road: { from: 0.4, to: 0.62, dirt: ['#4c3b28', '#3a2c1d'], rut: 'rgba(20, 12, 6, 0.4)' },
    roofs: { hidden: true, rows: 0.13, colors: ['#43241f', '#34262a', '#4d2c22', '#2c2124'], tile: 'rgba(0, 0, 0, 0.25)', light: 'rgba(255, 190, 120, 0.16)' },
    props: [
        { prop: 'leaves', per100kPx: 10, palette: { colors: ['rgba(150, 100, 44, 0.5)', 'rgba(120, 78, 36, 0.5)', 'rgba(90, 64, 40, 0.5)'] } },
        { prop: 'pebbles', per100kPx: 6 },
        { prop: 'cobble', per100kPx: 2.2, zone: { from: 0.42, to: 0.6 }, avoidCenter: 40 },
        { prop: 'plank', per100kPx: 0.5, zone: { from: 0.42, to: 0.6 }, avoidCenter: 90 },
        { prop: 'fence', per100kPx: 0.45, zone: { from: 0.18, to: 0.3 }, avoidCenter: 90 },
        { prop: 'fence', per100kPx: 0.45, zone: { from: 0.72, to: 0.84 }, avoidCenter: 90 },
        { prop: 'rock', per100kPx: 0.35, zone: { from: 0.38, to: 0.64, invert: true }, avoidCenter: 90 },
        { prop: 'bones', per100kPx: 0.25, zone: { from: 0.4, to: 0.62 }, avoidCenter: 90 },
        { prop: 'brazier', per100kPx: [0.22, 0.14, 0.08], frames: [10, 8, 5], variants: 2, size: 1.9, cycleSeconds: 1.6, zone: { from: 0.3, to: 0.38 }, avoidCenter: 120 },
        { prop: 'brazier', per100kPx: [0.22, 0.14, 0.08], frames: [10, 8, 5], variants: 2, size: 1.9, cycleSeconds: 1.6, zone: { from: 0.64, to: 0.72 }, avoidCenter: 120 },
        { prop: 'grass', per100kPx: [1.6, 0.8, 0], frames: [8, 6, 4], variants: 3, size: 1.7, cycleSeconds: 3.4, zone: { from: 0.38, to: 0.64, invert: true }, avoidCenter: 70, palette: { blade: '#5a6c32' } }
    ],
    fogColor: '190, 160, 130',
    fogAlphaCenter: 0.05,
    fogAlphaEdge: 0.24,
    fireflyGlow: 'rgba(255, 180, 90, 0.85)',
    vignetteInnerRatio: 0.46
};

// --- A variante ---

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
