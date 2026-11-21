// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/river_crossing/river_crossing_visual.js e rode o sync.
// --- DADOS VISUAIS: cenário Travessia do Rio (river_crossing) ---
// Margens de musgo, um rio raso atravessando o mundo na horizontal (faixa river.from..river.to da altura) e uma ponte de tábuas
// no meio, onde fica a tocha. A névoa e a vinheta vêm da Floresta da Névoa.
import { DARK_FOREST_2_VISUALS as BASE } from '../dark_forest_2/dark_forest_2_visual.js';

export const RIVER_CROSSING_VISUALS = {
    ...BASE,
    seed: 5101,
    nightTint: 'rgba(3, 12, 22, 0.34)',
    ground: ['#1b2c20', '#112018', '#08120c'],
    clearingRadiusRatio: 0.75,
    river: { from: 0.4, to: 0.6, water: ['#1d4150', '#123040', '#0b2230'], mud: '#2a2418', foam: 'rgba(200, 235, 245, 0.28)' },
    bridge: { halfWidth: 0.065, plank: ['#5e452b', '#4d3822', '#6b4f31'], rail: '#2a1d10', margin: 0.05 },
    props: [
        { prop: 'moss', per100kPx: 10, zone: { from: 0.34, to: 0.66, invert: true } },
        { prop: 'leaves', per100kPx: 14, zone: { from: 0.36, to: 0.64, invert: true } },
        { prop: 'pebbles', per100kPx: 7, zone: { from: 0.3, to: 0.7 } },
        { prop: 'rock', per100kPx: 1.1, zone: { from: 0.41, to: 0.59 }, avoidRect: [0.38, 0.3, 0.62, 0.7] },
        { prop: 'stump', per100kPx: 0.35, zone: { from: 0.34, to: 0.66, invert: true }, avoidCenter: 90 },
        { prop: 'puddle', per100kPx: 1.4, zone: { from: 0.3, to: 0.38 }, avoidCenter: 80 },
        { prop: 'ripple', per100kPx: [3, 1.8, 0.8], frames: [10, 6, 4], variants: 2, size: 1.4, cycleSeconds: 2.8, zone: { from: 0.42, to: 0.58 }, avoidRect: [0.38, 0.3, 0.62, 0.7] },
        { prop: 'reed', per100kPx: [2.4, 1.3, 0.6], frames: [8, 6, 4], variants: 3, size: 1.5, cycleSeconds: 3.2, zone: { from: 0.33, to: 0.41 }, avoidRect: [0.38, 0.3, 0.62, 0.7] },
        { prop: 'reed', per100kPx: [2.4, 1.3, 0.6], frames: [8, 6, 4], variants: 3, size: 1.5, cycleSeconds: 3.2, zone: { from: 0.59, to: 0.67 }, avoidRect: [0.38, 0.3, 0.62, 0.7] },
        { prop: 'fern', per100kPx: [0.7, 0.4, 0.15], frames: [10, 6, 4], variants: 3, size: 1.8, cycleSeconds: 3.4, zone: { from: 0.3, to: 0.7 }, avoidCenter: 70 },
        { prop: 'grass', per100kPx: [1.2, 0.6, 0], frames: [8, 6, 4], variants: 3, size: 1.7, cycleSeconds: 3.4, zone: { from: 0.34, to: 0.66, invert: true }, avoidCenter: 70 },
        { prop: 'mushroom', per100kPx: [0.4, 0.25, 0.12], frames: [8, 6, 4], variants: 2, size: 1.9, cycleSeconds: 2.6, zone: { from: 0.34, to: 0.66, invert: true }, avoidCenter: 70 }
    ],
    fogColor: '140, 190, 205',
    fogAlphaCenter: 0.07
};
