// --- DADOS VISUAIS: Level up. ---
// Cores, tamanhos e ritmos de animação lidos por js/render/level_up.js.

export const LEVEL_UP_VISUALS = {
    colors: {
        title: '#d8b4fe',
        points: '#f3e8ff',
        outline: '#14061f',
        glow: 'rgba(147, 51, 234, 0.55)',
        energy: '#a855f7',
        energyCore: '#c084fc'
    },

    durationSeconds: 1.8,       // tempo total na tela
    fadeSeconds: 0.4,           // últimos segundos: tudo some aos poucos
    groundSquash: 0.45,         // achata o círculo em volta do herói (perspectiva)

    // Texto acima do herói
    titleText: 'LEVEL UP',
    titleFont: '800 15px Cinzel, serif',
    pointsFont: '800 11px Inter, sans-serif',
    textOffsetY: 88,            // distância do herói até o título
    pointsGap: 20,              // distância do título até a linha dos pontos
    fadeInSeconds: 0.2,
    riseDistance: 12,           // quanto o texto sobe durante a animação
    outlineWidth: 3.5,
    // Limites para o texto não sair do mundo nem ficar atrás do HUD do topo
    textMarginX: 100,
    textMinY: 125,

    // Brilho suave nos pés do herói
    glowRadius: 46,

    // Fios de energia que sobem girando em volta do herói
    streakCount: 20,
    streakSeconds: 0.85,
    streakDelayMax: 0.75,       // os fios saem aos poucos, não todos juntos
    streakRadius: 25,
    streakRise: 62,
    streakLength: 25,
    streakSpin: 1.6,            // radianos girados enquanto sobe
    streakWidth: 2,
    streakGlowWidth: 6
};
