// --- DADOS VISUAIS: cenário Pântano (swamp) ---
// Lama escura com poças de água parada (pintadas na base), juncos, fogos-fátuos e cogumelos amarelo-esverdeados.
import { DARK_FOREST_2_VISUALS as BASE } from '../dark_forest_2/dark_forest_2_visual.js';

// As 12 lagoas que o pântano já teve (peça `swamp_pool`), guardadas só como referência: não são mais usadas
export const OLD_POOLS = [
        { prop: 'swamp_pool', x: 0.3673, y: 0.2773, seed: 1, rot: -11.0, palette: { rx: 48, ry: 27 } },
        { prop: 'swamp_pool', x: 0.0024, y: 0.2152, seed: 2, rot: -9.4, palette: { rx: 68, ry: 46 } },
        { prop: 'swamp_pool', x: 0.0865, y: 0.9166, seed: 3, rot: -8.0, palette: { rx: 90, ry: 48 } },
        { prop: 'swamp_pool', x: 0.2526, y: 0.418, seed: 4, rot: 13.9, palette: { rx: 75, ry: 42 } },
        { prop: 'swamp_pool', x: 0.2371, y: 0.5939, seed: 5, rot: 11.8, palette: { rx: 82, ry: 47 } },
        { prop: 'swamp_pool', x: 0.7634, y: 0.7918, seed: 6, rot: -12.5, palette: { rx: 81, ry: 43 } },
        { prop: 'swamp_pool', x: 0.5317, y: 0.8455, seed: 7, rot: 7.0, palette: { rx: 40, ry: 22 } },
        { prop: 'swamp_pool', x: 0.7474, y: 0.459, seed: 8, rot: 8.5, palette: { rx: 47, ry: 32 } },
        { prop: 'swamp_pool', x: 0.9588, y: 0.1259, seed: 9, rot: 10.9, palette: { rx: 84, ry: 47 } },
        { prop: 'swamp_pool', x: 0.3082, y: 0.292, seed: 10, rot: 6.2, palette: { rx: 97, ry: 54 } },
        { prop: 'swamp_pool', x: 0.569, y: 0.9822, seed: 11, rot: 6.5, palette: { rx: 43, ry: 29 } },
        { prop: 'swamp_pool', x: 0.7881, y: 0.7505, seed: 12, rot: -2.7, palette: { rx: 88, ry: 60 } }

];

export const SWAMP_VISUALS = {
    ...BASE,
    seed: 6203,
    nightTint: 'rgba(8, 16, 6, 0.38)',
    ground: ['#262d18', '#171e0f', '#0a0f07'],
    clearingRadiusRatio: 0.7,
    portal: { ...BASE.portal, color: 'rgba(170, 220, 130, 0.12)' },
    // As lagoas de água parada: agora são OBJETOS (peça `swamp_pool`), nas mesmas posições e tamanhos de antes. Mova, gire, mude o tamanho, apague ou ponha
    // mais no editor (tools/scenery_editor.html). `pools` abaixo só vale para o desenho antigo, que some assim que há uma `swamp_pool` aqui.
    placed: [],                   // sem lagoas (o usuário as tirou); a peça `swamp_pool` continua disponível no editor
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
