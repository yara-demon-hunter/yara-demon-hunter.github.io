// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/swamp/swamp_visual.js e rode o sync.
// --- DADOS VISUAIS: cenário Pântano (swamp) ---
// Lama escura com poças de água parada (pintadas na base), juncos, fogos-fátuos e cogumelos amarelo-esverdeados.
import { DARK_FOREST_2_VISUALS as BASE } from '../dark_forest_2/dark_forest_2_visual.js';

export const SWAMP_VISUALS = {
    ...BASE,
    seed: 6203,
    nightTint: 'rgba(8, 16, 6, 0.38)',
    ground: ['#262d18', '#171e0f', '#0a0f07'],
    clearingRadiusRatio: 0.7,
    portal: { ...BASE.portal, color: 'rgba(170, 220, 130, 0.12)' },
    pools: { count: [9, 13], radius: [38, 100], water: ['#27472f', '#13291d'], mud: '#0e1409', weed: 'rgba(120, 170, 70, 0.55)', keepClear: 0.2 },
    props: [
        { prop: 'moss', per100kPx: 14 },
        { prop: 'leaves', per100kPx: 14 },
        { prop: 'puddle', per100kPx: 2.2, palette: { water: '#1f3c2a', shine: 'rgba(190, 240, 170, 0.28)' }, avoidCenter: 80 },
        { prop: 'root', per100kPx: 1.4 },
        { prop: 'stump', per100kPx: 0.7, avoidCenter: 90, maxTries: 60, palette: { bark: '#2c2616' } },
        { prop: 'bones', per100kPx: 0.5, avoidCenter: 80, maxTries: 60 },
        { prop: 'rock', per100kPx: 0.3, avoidCenter: 90, maxTries: 60 },
        { prop: 'reed', per100kPx: [2.6, 1.5, 0.7], frames: [8, 6, 4], variants: 3, size: 1.6, cycleSeconds: 3.4, avoidCenter: 70 },
        { prop: 'wisp', per100kPx: [0.5, 0.3, 0.15], frames: [10, 6, 4], variants: 2, size: 1.5, cycleSeconds: 3.6, avoidCenter: 90 },
        { prop: 'mushroom', per100kPx: [0.6, 0.35, 0.16], frames: [8, 6, 4], variants: 2, size: 1.9, cycleSeconds: 2.6, avoidCenter: 70,
          palette: { glow: '200, 240, 90', cap: '#d8f27a', capRim: '#8aa43a', capUnder: '#566b1f', stem: '#d8dca8', spot: 'rgba(60, 80, 15, 0.35)' } },
        { prop: 'grass', per100kPx: [1.2, 0.6, 0], frames: [8, 6, 4], variants: 3, size: 1.7, cycleSeconds: 3.4, avoidCenter: 70, palette: { blade: '#4f6a2c' } }
    ],
    fogColor: '150, 175, 110',
    fogDensityBoostAtZeroHp: 1.4,
    fogAlphaCenter: 0.1,
    fogAlphaEdge: 0.34,
    fireflyGlow: 'rgba(190, 255, 140, 0.85)'
};
