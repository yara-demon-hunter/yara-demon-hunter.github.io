// --- DADOS VISUAIS: Cenário: floresta sombria. ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

// --- CENÁRIO: FLORESTA SOMBRIA (vista de cima) ---
// Noite fria: o núcleo é uma tocha que ilumina um círculo sem névoa; conforme ela perde
// vida, a luz encolhe e a névoa avança. Vento mexe a grama e a névoa rola por cima de tudo.
export const FOREST_VISUALS = {
    seed: 1337,

    // Noite fria: camada azulada escura por cima de tudo (antes da vinheta)
    nightTint: 'rgba(3, 9, 26, 0.42)',

    // Chão
    groundColor: '#02070a',
    clearingColor: 'rgba(22, 42, 56, 0.5)',
    moonlightColor: 'rgba(130, 170, 220, 0.10)',
    mossColors: ['rgba(10, 34, 38, 0.38)', 'rgba(6, 20, 26, 0.5)', 'rgba(24, 32, 40, 0.3)'],
    mossPatchesPer100kPx: 14,
    grassColor: 'rgba(40, 90, 85, 0.22)',
    grassTuftsPer100kPx: 110,
    stoneColor: 'rgba(100, 120, 140, 0.18)',
    stonesPer100kPx: 10,
    leafColors: ['rgba(60, 50, 40, 0.22)', 'rgba(40, 70, 60, 0.2)'],
    leavesPer100kPx: 60,

    // Clareira: elipse proporcional à tela (0 = centro, 1 = borda)
    clearingRadiusRatio: 0.62,

    // Vento: rajadas que atravessam a tela (afetam a grama)
    windSpeed: 0.55,              // velocidade das rajadas
    windWaveLength: 0.0035,       // quanto a rajada varia ao longo da tela (menor = onda mais larga)
    windBase: 0.35,               // vento constante mínimo (0 a 1)

    // Grama animada: tufos que se curvam com o vento
    grassClumpsPer100kPx: 42,
    grassBladesPerClump: 3,
    grassMinHeight: 6,
    grassMaxHeight: 13,
    grassBend: 6,                 // curvatura máxima na rajada (px)
    grassColors: ['rgba(46, 110, 100, 0.55)', 'rgba(30, 80, 78, 0.5)', 'rgba(70, 140, 120, 0.4)'],

    // Névoa: camadas de textura rolando em direções diferentes + manchas soltas
    fogColor: '170, 195, 215',
    fogDensityBoostAtZeroHp: 1.3, // quanto a névoa fica mais densa com a torre quase apagada (+130%)
    fogResolution: 0.5,           // fração da resolução da tela usada para desenhar a névoa (menor = mais rápido)
    fogTileSize: 512,
    fogTilePuffs: 80,
    fogLayers: [
        { speedX: 26, speedY: 7, scale: 1.6, alpha: 0.24 },
        { speedX: -16, speedY: -11, scale: 1.1, alpha: 0.17 },
        { speedX: 9, speedY: -5, scale: 2.4, alpha: 0.12 }
    ],
    fogBlobs: 14,
    fogMinRadius: 140,
    fogMaxRadius: 300,
    fogAlphaCenter: 0.1,
    fogAlphaEdge: 0.3,
    fogDriftSpeed: 34,
    fogWobble: 50,

    // Vaga-lumes (verde-azulados e discretos)
    fireflies: 16,
    fireflyColor: '140, 230, 200',
    fireflySpeed: 16,
    fireflyRadius: 1.5,
    fireflyGlowRadius: 8,

    // Vinheta escura
    vignetteColor: 'rgba(0, 2, 8, 0.88)',
    vignetteInnerRatio: 0.4
};
