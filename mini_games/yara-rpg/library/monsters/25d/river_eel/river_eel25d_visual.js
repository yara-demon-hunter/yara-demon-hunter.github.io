// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/river_eel/river_eel25d_visual.js e rode o sync.
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Enguia do Rio 2.5D (river_eel25d.js) ---
// Serpente d'água azul: corpo comprido que ondula, cabeça erguida com a boca cheia de dentes, nadadeira nas costas, manchas que brilham em ciano.
// Medidas em unidades do boneco (o herói tem ~25 de altura).
export const RIVER_EEL_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: {
        ...BASE_COLORS,
        aura: 'rgba(56, 189, 248, 0.45)',
        outline: '#06182a', body: '#2a6fa8', bodyDark: '#17446e', bodyLight: '#5fb0e0', belly: '#a8d8ee', fin: 'rgba(120, 200, 245, 0.78)', finEdge: '#0e3a5e',
        spot: '#67e8f9', spotGlow: 'rgba(103, 232, 249, 0.85)', eye: '#ecfeff', eyeGlow: 'rgba(103, 232, 249, 0.9)', mouth: '#08121e', tooth: '#f1f5f9'
    },
    strideSpeed: 7,
    segments: 11,          // pedaços do corpo
    spacing: 1.9,          // distância entre eles
    thick: 2.5,            // grossura perto da cabeça
    tailThin: 0.3,         // quanto da grossura sobra na ponta (0 a 1)
    headA: 4.5,            // onde fica a cabeça (para a frente do centro)
    headHeight: 8.5,       // altura da cabeça (erguida)
    baseZ: 1.6,            // altura do corpo no chão
    headR: 2.9,
    waveAmp: 2.1,          // quanto ondula para os lados
    waveHz: 1,             // 1 onda por segundo (o sprite grava um ciclo de 1 s; no jogo o ciclo toca mais rápido)
    waveHzRun: 0,
    waveLength: 1.15,
    finHeight: 1.7,
    spotEvery: 2,
    auraRadius: 19, auraAlpha: 0.18, focusZ: 8, focusA: 0, scalePerRadius: 0.17, center: 6
};
