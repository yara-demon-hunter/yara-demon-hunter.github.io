// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/rose/rose_visual.js e rode o sync.
// --- DADOS VISUAIS: a rosa de arremesso (Rowan) ---
// Duas versões do mesmo desenho: a rosa vermelha e a Rosa Negra (Dark Roses). Só a ARMA: cores e formato.
// Voo, altura, sombra, rastro e a animação da mão ficam no jogo (KNIFE_VISUALS).
export const ROSE_VISUALS = {
    rose: {
        colors: {
            stem: '#3f7a35', stemShade: '#25501f', leaf: '#5fa33a', thorn: '#a3d65c',
            petal: '#c81e4a', petalShade: '#7f1233', petalLight: '#f0587f', core: '#5a0a22',
            sepal: '#33661f',
            glow: 'rgba(244, 63, 94, 0.45)', trail: 'rgba(253, 164, 175, 0.9)', shadow: 'rgba(0, 0, 0, 0.35)', edge: '#fda4af'
        }
    },
    dark: {
        colors: {
            stem: '#1d2a22', stemShade: '#101812', leaf: '#2a1f3a', thorn: '#a78bfa',
            petal: '#17101f', petalShade: '#07040b', petalLight: '#4c2f6e', core: '#000000',
            sepal: '#1a1226',
            glow: 'rgba(139, 92, 246, 0.5)', trail: 'rgba(196, 181, 253, 0.85)', shadow: 'rgba(0, 0, 0, 0.45)', edge: '#a78bfa'
        }
    },
    // Efeitos da Dark Roses: a marca na cabeça do monstro e as rosas de espinho no chão (rose_effects.js)
    effects: {
        markGlow: 'rgba(167, 139, 250, 0.75)',
        markRing: '#c4b5fd',
        markBack: 'rgba(196, 181, 253, 0.55)',
        soil: 'rgba(52, 24, 84, 0.62)',
        soilEdge: 'rgba(167, 139, 250, 0.7)',
        vine: '#3b6a4c', vineShade: '#10190f', spike: '#c4b5fd', spikeTip: '#ede9fe',
        glow: 'rgba(139, 92, 246, 0.55)'
    },
    // Formato ao longo de +x, origem no meio do cabo (unidades da arma, como a adaga)
    shape: {
        stemStart: -5,
        stemEnd: 4,
        stemHalf: 0.55,
        thorns: [-2.6, -0.4, 1.8],
        leafX: -1.2,
        leafLength: 3.4,
        leafHalf: 1.2,
        headX: 6.6,
        headRadius: 3.1,
        petals: 6,
        centerX: 2.6             // ponto de equilíbrio (centro do desenho em voo)
    }
};
