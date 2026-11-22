// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/graveyard_2/graveyard_2_visual.js e rode o sync.
// --- DADOS VISUAIS: Cemitério sob a Lua Cheia (graveyard_2) ---
// Variante 2 de `graveyard`: mesmo desenho de base, outro clima. Luz azul-prateada, mais lápides, menos ossos, fogos-fátuos brancos.

// --- O desenho-base deste cenário (era `graveyard`, que foi removido): o clima da variante vem abaixo, em cima dele ---
// --- DADOS VISUAIS: cenário Cemitério (graveyard) ---
// Capim cinzento, trilha de cascalho do portão de ferro (borda de cima) até a tocha, lápides, ossos, fogos-fátuos e névoa pálida.
import { DARK_FOREST_2_VISUALS as FOREST } from '../dark_forest_2/dark_forest_2_visual.js';

// A entrada do cemitério: o portão de ferro no meio da borda de cima (sobre a trilha) e a cerca de ferro dos dois lados. São objetos
// (x e y em fração do mundo): mova, gire ou apague no editor (tools/scenery_editor.html).
const GRAVEYARD_GATE_PLACED = [
    { prop: 'iron_fence', x: 0.063, y: 0.145, seed: 11, scale: 1.6 },
    { prop: 'iron_fence', x: 0.169, y: 0.145, seed: 12, scale: 1.6 },
    { prop: 'iron_fence', x: 0.275, y: 0.145, seed: 13, scale: 1.6 },
    { prop: 'iron_fence', x: 0.381, y: 0.145, seed: 14, scale: 1.6 },
    { prop: 'iron_fence', x: 0.619, y: 0.145, seed: 15, scale: 1.6 },
    { prop: 'iron_fence', x: 0.725, y: 0.145, seed: 16, scale: 1.6 },
    { prop: 'iron_fence', x: 0.831, y: 0.145, seed: 17, scale: 1.6 },
    { prop: 'iron_fence', x: 0.937, y: 0.145, seed: 18, scale: 1.6 },
    { prop: 'iron_gate', x: 0.5, y: 0.145, seed: 1, scale: 1.6 }
];

const BASE = {
    ...FOREST,
    seed: 9511,
    nightTint: 'rgba(8, 10, 22, 0.4)',
    ground: ['#2a3030', '#1b2123', '#0b0e10'],
    clearingRadiusRatio: 0.78,
    portal: { ...FOREST.portal, color: 'rgba(190, 210, 255, 0.12)' },
    path: { halfWidth: 0.045, gravel: ['#4a4a46', '#383834'], edge: 'rgba(0, 0, 0, 0.4)' },
    gate: { halfWidth: 0.12, height: 0.12, pillar: '#3a3d46', pillarLight: '#565a66', bars: '#101216', barLight: 'rgba(150, 160, 190, 0.3)' },
    props: [
        { prop: 'moss', per100kPx: 6 },
        { prop: 'leaves', per100kPx: 10, palette: { colors: ['rgba(110, 100, 90, 0.4)', 'rgba(80, 76, 70, 0.45)', 'rgba(130, 120, 100, 0.35)'] } },
        { prop: 'pebbles', per100kPx: 5 },
        { prop: 'root', per100kPx: 0.7 },
        { prop: 'tombstone', per100kPx: 1.8, avoidCenter: 80, avoidRect: [0.44, 0, 0.56, 1], maxTries: 120 },
        { prop: 'fence', per100kPx: 0.35, avoidCenter: 100, avoidRect: [0.4, 0, 0.6, 1], palette: { post: '#15171c', rail: '#1d2026', top: '#3a3e48' } },
        { prop: 'bones', per100kPx: 0.5, avoidCenter: 80, maxTries: 60 },
        { prop: 'stump', per100kPx: 0.35, avoidCenter: 90, maxTries: 60, palette: { bark: '#1e1c18' } },
        { prop: 'grass', per100kPx: [1.4, 0.7, 0], frames: [8, 6, 4], variants: 3, size: 1.7, cycleSeconds: 3.4, avoidCenter: 70, palette: { blade: '#46564a' } },
        { prop: 'wisp', per100kPx: [0.4, 0.25, 0.12], frames: [10, 6, 4], variants: 2, size: 1.5, cycleSeconds: 3.6, avoidCenter: 90, palette: { glow: '170, 200, 255' } },
        { prop: 'mushroom', per100kPx: [0.25, 0.15, 0.08], frames: [8, 6, 4], variants: 2, size: 1.9, cycleSeconds: 2.6, avoidCenter: 70,
          palette: { glow: '180, 150, 240', cap: '#c0a8ee', capRim: '#7a5cb0', capUnder: '#4a3578', stem: '#d8d0e6', spot: 'rgba(40, 20, 70, 0.35)' } }
    ],
    placed: GRAVEYARD_GATE_PLACED,
    fogColor: '170, 180, 200',
    fogDensityBoostAtZeroHp: 1.4,
    fogAlphaCenter: 0.09,
    fogAlphaEdge: 0.32,
    fireflyGlow: 'rgba(190, 215, 255, 0.85)'
};

// --- A variante ---

export const GRAVEYARD_2_VISUALS = {
    ...BASE,
    seed: 9612,
    // O portão de ferro que era desenhado no chão-base fica DESLIGADO neste cenário: a entrada (portão e cerca) é feita só com objetos
    // (peças iron_gate e iron_fence), que se posicionam no editor.
    gate: { ...BASE.gate, hidden: true },
    // A catedral do cemitério (peça `cathedral`), no canto esquerdo, longe da trilha e da tocha. Posição em fração do mundo; mova no editor
    // (tools/scenery_editor.html) e grave: um layout gravado em scenery/layouts/graveyard_2.js substitui esta lista.
    placed: [...BASE.placed, { prop: 'cathedral', x: 0.17, y: 0.66, seed: 1, scale: 1.5 }],
    nightTint: 'rgba(14, 24, 50, 0.3)',
    ground: ['#3a4452', '#262e3a', '#10151c'],
    portal: { ...BASE.portal, color: 'rgba(210, 225, 255, 0.2)' },
    path: { ...BASE.path, gravel: ['#6a6e78', '#4a4e58'] },
    props: BASE.props.map(p => p.prop === 'tombstone' ? { ...p, per100kPx: 3.4, palette: { stone: '#6a707c', light: 'rgba(235, 242, 255, 0.35)' } }
        : p.prop === 'bones' ? { ...p, per100kPx: 0.2 }
        : p.prop === 'wisp' ? { ...p, palette: { glow: '230, 240, 255' } } : p),
    fogColor: '200, 215, 240',
    fogAlphaCenter: 0.1,
    fireflyGlow: 'rgba(230, 240, 255, 0.9)'
};
