// --- DADOS VISUAIS: Pátio do Castelo em Ruínas (castle_gate_2) ---
// Variante 2 de `castle_gate`: mesmo desenho de base, outro clima. Mais lajes quebradas, pedras e ossos, musgo, tapete esmaecido, menos braseiros.

// --- O desenho-base deste cenário (era `castle_gate`, que foi removido): o clima da variante vem abaixo, em cima dele ---
// --- DADOS VISUAIS: cenário Portões do Castelo de Gudran (castle_gate) ---
// Pátio de lajes de pedra, tapete vermelho do portão até a tocha, portão em arco na borda de cima, braseiros, ossos e lajes quebradas.
import { DARK_FOREST_2_VISUALS as FOREST } from '../dark_forest_2/dark_forest_2_visual.js';

const BASE = {
    ...FOREST,
    seed: 8419,
    nightTint: 'rgba(8, 8, 22, 0.4)',
    ground: ['#2b2e3a', '#1d1f2b', '#0c0d14'],
    clearingRadiusRatio: 0.8,
    portal: { ...FOREST.portal, color: 'rgba(255, 150, 70, 0.1)' },
    floor: { tile: 54, mortar: 'rgba(4, 4, 8, 0.7)', shades: ['#343845', '#2c303c', '#3a3e4c', '#282b36'] },
    carpet: { halfWidth: 0.055, color: '#47111a', edge: '#c89b3c', worn: 'rgba(0, 0, 0, 0.3)' },
    gate: { halfWidth: 0.16, height: 0.13, stone: '#14151d', light: '#2c2f3c', arch: '#05060a', bars: 'rgba(120, 125, 150, 0.35)' },
    props: [
        { prop: 'flagstone', per100kPx: 1.8, avoidCenter: 60 },
        { prop: 'pebbles', per100kPx: 4, palette: { color: 'rgba(95, 100, 120, 0.4)' } },
        { prop: 'rock', per100kPx: 0.35, avoidCenter: 90, maxTries: 60, palette: { rock: '#2c2f3a', light: '#4a4e5e' } },
        { prop: 'bones', per100kPx: 0.7, avoidCenter: 80, maxTries: 60 },
        { prop: 'brazier', per100kPx: [0.3, 0.2, 0.12], frames: [10, 8, 5], variants: 2, size: 2, cycleSeconds: 1.6, avoidCenter: 120, avoidRect: [0.4, 0, 0.6, 1] },
        { prop: 'moss', per100kPx: 2, palette: { colors: ['rgba(45, 60, 48, 0.4)', 'rgba(32, 44, 40, 0.45)'] } }
    ],
    fogColor: '120, 120, 160',
    fogAlphaCenter: 0.05,
    fogAlphaEdge: 0.26,
    fireflyGlow: 'rgba(255, 160, 80, 0.85)',
    vignetteInnerRatio: 0.44
};

// --- A variante ---

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
