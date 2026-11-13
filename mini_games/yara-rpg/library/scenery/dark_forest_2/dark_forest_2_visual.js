// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/dark_forest_2/dark_forest_2_visual.js e rode o sync.
// --- DADOS VISUAIS: cenário Floresta da Névoa (dark_forest_2) ---
// A Floresta da Névoa do yara-rpg (primeira fase) vista de cima. É um cenário FEITO DE PEÇAS: a base (chão, portal, névoa,
// vinheta, esporos) é daqui; tudo o que decora o chão vem da receita `props`, com peças de scenery/props/.
// Paleta e fileiras de origem: mini_games/yara-rpg/js/data/visuals/stage.js (scenes['dark-forest']).
// Ficha de como foi criado: art_reference/scenery.md. Como a receita funciona: scenery/compose.js.
export const DARK_FOREST_2_VISUALS = {
    seed: 4242,

    // Névoa azul-esverdeada: camada translúcida por cima de tudo (antes da vinheta)
    nightTint: 'rgba(3, 14, 22, 0.36)',

    // --- Base: o chão ---
    ground: ['#12292f', '#0b1c22', '#050e12'],     // chão do centro (claro) para a borda (escuro)
    clearingRadiusRatio: 0.7,
    // Luz fria do "portal" do fundo da floresta: um lago de luz pálida fora do centro
    portal: { color: 'rgba(200, 240, 245, 0.16)', x: 0.7, y: 0.28, radiusRatio: 0.36 },

    // --- A receita: as peças que decoram o chão (veja scenery/compose.js para cada campo) ---
    // Quantidades por 100 mil unidades quadradas do mundo; listas [a, b, c] são por nível de detalhe.
    // As estáticas são pintadas no chão uma vez; as animadas viram atlas de poucos quadros (menos quadros = atlas menor).
    props: [
        { prop: 'moss', per100kPx: 12 },
        { prop: 'leaves', per100kPx: 22 },
        { prop: 'pebbles', per100kPx: 6 },
        { prop: 'root', per100kPx: 0.9 },
        { prop: 'stump', per100kPx: 0.45, avoidCenter: 90, maxTries: 60 },
        { prop: 'rock', per100kPx: 0.4, avoidCenter: 90, maxTries: 60 },
        { prop: 'fern', per100kPx: [0.8, 0.45, 0.2], frames: [10, 6, 4], variants: 3, size: 1.8, cycleSeconds: 3.4, avoidCenter: 70 },
        { prop: 'grass', per100kPx: [1.4, 0.7, 0], frames: [8, 6, 4], variants: 3, size: 1.7, cycleSeconds: 3.4, avoidCenter: 70 },
        { prop: 'mushroom', per100kPx: [0.5, 0.3, 0.15], frames: [8, 6, 4], variants: 2, size: 1.9, cycleSeconds: 2.6, avoidCenter: 70 },
        // Arbustos: só enfeite (antigo poder Ambush Bush); no fim da receita para não mexer no sorteio das outras peças
        { prop: 'bush', per100kPx: 0.2, avoidCenter: 90, maxTries: 60 }
    ],

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
