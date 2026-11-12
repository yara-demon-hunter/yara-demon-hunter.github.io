// --- DADOS VISUAIS: cenário Floresta da Névoa (dark_forest_2) ---
// A Floresta da Névoa do yara-rpg (primeira fase) vista de cima. Cores, densidades e ritmos lidos por dark_forest_2.js
// (chão, samambaias, capim, cogumelos) e por scenery_kit.js (vento, névoa, vinheta, esporos).
// Paleta e fileiras de origem: mini_games/yara-rpg/js/data/visuals/stage.js (scenes['dark-forest']).
// Ficha de como foi criado: art_reference/scenery.md.
export const DARK_FOREST_2_VISUALS = {
    seed: 4242,

    // Névoa azul-esverdeada: camada translúcida por cima de tudo (antes da vinheta)
    nightTint: 'rgba(3, 14, 22, 0.36)',

    // --- Cores (as do RPG: tronco, luz fria, folhagem, musgo, pedra, samambaia, capim, cogumelo) ---
    ground: ['#12292f', '#0b1c22', '#050e12'],     // chão do centro (claro) para a borda (escuro)
    trunk: '#08161b',
    trunkLight: '#1f4651',
    moss: '#2f5a4a',
    rock: '#22363b',
    rockLight: '#3b5a60',
    fern: '#183f37',
    fernLight: '#2f5f50',
    grass: '#33645a',
    mushroom: '#8ef0ff',
    stumpTop: '#3a6a70',
    stumpRing: '#13313a',
    clearingRadiusRatio: 0.7,

    // Luz fria do "portal" do fundo da floresta: um lago de luz pálida fora do centro
    portal: { color: 'rgba(200, 240, 245, 0.16)', x: 0.7, y: 0.28, radiusRatio: 0.36 },

    // --- Chão pintado uma vez (quantidades por 100 mil unidades quadradas do mundo) ---
    mossColors: ['rgba(47, 90, 74, 0.34)', 'rgba(30, 62, 58, 0.42)', 'rgba(20, 50, 52, 0.38)'],
    mossPatchesPer100kPx: 12,
    // Folhas caídas: marrom e laranja queimado no meio das verde-azuladas (como na arte da floresta)
    leafColors: ['rgba(140, 92, 44, 0.5)', 'rgba(176, 108, 40, 0.45)', 'rgba(96, 70, 44, 0.5)', 'rgba(40, 90, 80, 0.32)'],
    leavesPer100kPx: 22,
    pebbleColor: 'rgba(80, 112, 118, 0.4)',
    pebblesPer100kPx: 6,
    rootsPer100kPx: 0.9,
    stumpsPer100kPx: 0.45,
    rocksPer100kPx: 0.4,

    // --- Coisas que balançam: um atlas de poucos quadros cada (kit: buildSpriteSheet) ---
    // Quantidades por 100 mil unidades, e quadros do ciclo, por nível de detalhe [0, 1, 2]. Menos quadros = atlas menor.
    swayCycleSeconds: 3.4,        // duração de um ciclo de balanço (as vizinhas defasam: parece vento passando)
    fern: { per100kPx: [0.8, 0.45, 0.2], frames: [10, 6, 4], variants: 3, sway: 0.1, size: 1.8 },
    grass: { per100kPx: [1.4, 0.7, 0], frames: [8, 6, 4], variants: 3, bend: 2.2, size: 1.7 },
    mushrooms: { per100kPx: [0.5, 0.3, 0.15], frames: [8, 6, 4], variants: 2, pulse: 0.3, size: 1.9, cycleSeconds: 2.6 },
    clearAroundCenter: 70,        // raio em volta da tocha sem samambaia nem cogumelo (a luta fica limpa)

    // Vento (a mesma lógica da floresta: rajadas que viajam pela tela)
    windSpeed: 0.55,
    windWaveLength: 0.0035,
    windBase: 0.35,

    // Névoa azul-esverdeada: camadas de textura rolando em direções diferentes + manchas soltas
    fogColor: '127, 178, 186',
    fogDensityBoostAtZeroHp: 1.3,
    fogFrameMs: [55, 80, 125],
    fogResolution: 0.25,
    fogTileSize: 512,
    fogTilePixels: 128,
    fogTilePuffs: 80,
    fogLayers: [
        { speedX: 26, speedY: 7, scale: 1.6, alpha: 0.22 },
        { speedX: -16, speedY: -11, scale: 1.1, alpha: 0.16 },
        { speedX: 9, speedY: -5, scale: 2.4, alpha: 0.12 }
    ],
    fogBlobs: 12,
    fogMinRadius: 140,
    fogMaxRadius: 300,
    fogAlphaCenter: 0.09,
    fogAlphaEdge: 0.3,
    fogDriftSpeed: 34,
    fogWobble: 50,

    // Esporos de luz flutuando (azul-gelo, como os do RPG)
    fireflies: [8, 4, 0],
    fireflyGlow: 'rgba(170, 240, 255, 0.85)',
    fireflySpeed: 12,
    fireflyGlowRadius: 6,

    // Vinheta escura
    vignetteColor: 'rgba(0, 4, 8, 0.82)',
    vignetteInnerRatio: 0.42,
    vignetteResolution: 0.06
};
