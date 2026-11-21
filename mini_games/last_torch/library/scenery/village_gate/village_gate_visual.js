// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/village_gate/village_gate_visual.js e rode o sync.
// --- DADOS VISUAIS: cenário Entrada da Vila (village_gate) ---
// Uma estrada de terra batida atravessa o mundo na horizontal, com calçada de pedras; capim dos lados, cercas e telhados nas bordas.
import { DARK_FOREST_2_VISUALS as BASE } from '../dark_forest_2/dark_forest_2_visual.js';

export const VILLAGE_GATE_VISUALS = {
    ...BASE,
    seed: 7307,
    nightTint: 'rgba(24, 12, 8, 0.3)',
    ground: ['#2d3320', '#1d2316', '#0d110a'],
    clearingRadiusRatio: 0.78,
    portal: { ...BASE.portal, color: 'rgba(255, 190, 110, 0.1)' },
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
