// --- DADOS VISUAIS ---
// Cores, tamanhos e ritmos de animação. Os renderizadores (js/render/) leem daqui.
// Referência de arte: art_reference/<id>/

export const HERO_VISUALS = {
    // Escala visual do desenho (não altera o raio de colisão em CHARACTER_MODEL)
    scale: 1.45,

    // Paleta (art_reference/hero: caçador encapuzado, máscara de osso, espada rúnica azul)
    colors: {
        cape: '#07222d',
        capeFold: '#0b2f3c',
        capeEdge: '#103a49',
        body: '#0b1d26',
        sleeve: '#12232c',
        sash: '#1b2f38',
        boots: '#05121a',
        hood: '#0a1a22',
        hoodInner: '#010409',
        mask: '#e8eef2',
        maskShade: '#9fb1bc',
        maskEyes: '#020617',
        blade: '#7dd3fc',
        bladeCore: '#f0f9ff',
        runes: '#e0f2fe',
        bladeGlow: '#38bdf8',
        bladeGlowFrenzy: '#f0abfc',
        bladeGlowDoubleDmg: '#f59e0b',
        hurtFlash: '#ffffff',
        shadowTrail: '#0e3a4a'
    },

    // Tamanhos (px, antes da escala)
    hoodRadius: 6.5,
    shoulderWidth: 9.5,
    shoulderDepth: 5.5,
    maskOffset: 2.6,
    maskWidth: 3.8,
    maskHeight: 5.2,
    bladeLength: 19,
    bladeWidth: 2.8,
    runeCount: 4,
    handOffset: 8,
    bootLength: 3.4,
    strideLength: 3,
    strideSpeed: 16,

    // Capa
    capeBaseLength: 11,
    capeRunExtraLength: 13,
    capeTailWidth: 22,
    capeStrips: 9,
    capeWaveIdle: 1,
    capeWaveRun: 3,
    capeWaveSpeed: 9,

    // Idle: respiração ofegante
    breathPeriodSeconds: 1.1,
    breathAmount: 0.05,

    // Brilho pulsante da espada
    bladePulsePeriodSeconds: 0.9,
    bladeGlowMin: 8,
    bladeGlowMax: 16,

    // Corrida
    runLeanStretch: 0.1,
    runSpeedForFullEffect: 220,
    turnSmoothing: 14,

    // Ataques do combo (1: corte, 2: corte de volta, 3: corte pesado)
    // whirl: 3º golpe com a skill passiva Giro Sombrio (giro 360°)
    combo: {
        1: { seconds: 0.2, from: 1, to: -1, extraArc: 0.35, glow: 18 },
        2: { seconds: 0.22, from: -1, to: 1, extraArc: 0.6, glow: 22 },
        3: { seconds: 0.26, from: 1, to: -1, extraArc: 0.9, glow: 26 },
        whirl: { seconds: 0.3, spin: true, glow: 30 }
    },
    restBladeAngle: 2.0,

    // Dano
    hurtSquashSeconds: 0.1,
    hurtSquash: 0.22,

    // Rastro de sombra (quase imperceptível)
    shadowTrailAlpha: 0.18,
    shadowTrailRadius: 9
};

// --- EFEITO DO GOLPE (arco neon da lâmina) ---
// Cada passo do combo tem um visual próprio. Só afeta o desenho, não o dano.
export const SLASH_VISUALS = {
    1: { lifeSeconds: 0.2, from: 1, to: -1, color: '#06b6d4', lineWidth: 6, glow: 20, tail: 0.65, lines: 1 },
    2: { lifeSeconds: 0.22, from: -1, to: 1, color: '#38bdf8', lineWidth: 7, glow: 24, tail: 0.75, lines: 2 },
    3: { lifeSeconds: 0.26, from: 1, to: -1, color: '#a855f7', lineWidth: 10, glow: 28, tail: 0.85, lines: 1 },
    whirl: { lifeSeconds: 0.3, spin: true, color: '#a855f7', lineWidth: 9, glow: 30, tail: 1, lines: 1, shockwave: true },
    frenzyColor: '#f0abfc',
    frenzyExtraWidth: 3,
    coreColor: '#ffffff',
    coreWidth: 2.2,
    doubleLineGap: 7
};

// --- CENÁRIO: FLORESTA SOMBRIA (vista de cima) ---
// Clareira no centro (onde fica o núcleo), árvores nas bordas (de onde saem os monstros)
// e névoa se movendo por cima de tudo.
export const FOREST_VISUALS = {
    seed: 1337,

    // Chão
    groundColor: '#040a07',
    clearingColor: 'rgba(30, 52, 40, 0.55)',
    moonlightColor: 'rgba(120, 160, 190, 0.07)',
    mossColors: ['rgba(20, 45, 28, 0.35)', 'rgba(10, 28, 18, 0.45)', 'rgba(35, 40, 25, 0.25)'],
    mossPatchesPer100kPx: 14,
    grassColor: 'rgba(60, 110, 70, 0.28)',
    grassTuftsPer100kPx: 260,
    stoneColor: 'rgba(90, 105, 110, 0.18)',
    stonesPer100kPx: 10,
    leafColors: ['rgba(90, 60, 30, 0.25)', 'rgba(70, 80, 40, 0.22)'],
    leavesPer100kPx: 60,

    // Clareira: elipse proporcional à tela (0 = centro, 1 = borda)
    clearingRadiusRatio: 0.62,

    // Árvores: ficam numa faixa colada às bordas da tela
    treeEdgeBandRatio: 0.07,      // largura da faixa (fração do menor lado da tela)
    treeEdgeBandMin: 28,
    treeEdgeBandMax: 70,
    treeEdgeJitter: 22,           // irregularidade da linha das árvores (px)
    treeSpacing: 44,              // espaçamento base entre árvores (px)
    treeOverflow: 60,             // quanto as árvores passam da borda da tela (px)
    treeMinRadius: 26,
    treeMaxRadius: 58,
    treeVariants: 8,
    canopyColors: ['#071a10', '#0a2215', '#0d2a1a', '#0f3020'],
    canopyHighlight: 'rgba(110, 170, 150, 0.10)',
    canopyShadow: 'rgba(0, 0, 0, 0.55)',
    canopyAlpha: 0.96,
    swayAmount: 1.6,
    swaySpeed: 0.6,

    // Névoa: duas camadas de textura rolando em direções diferentes + manchas soltas
    fogColor: '200, 215, 225',
    fogTileSize: 512,
    fogTilePuffs: 70,
    fogLayers: [
        { speedX: 26, speedY: 7, scale: 1.6, alpha: 0.13 },
        { speedX: -16, speedY: -11, scale: 1.1, alpha: 0.09 }
    ],
    fogBlobs: 12,
    fogMinRadius: 120,
    fogMaxRadius: 260,
    fogAlphaCenter: 0.06,
    fogAlphaEdge: 0.2,
    fogDriftSpeed: 34,
    fogWobble: 50,

    // Vaga-lumes
    fireflies: 22,
    fireflyColor: '190, 255, 140',
    fireflySpeed: 18,
    fireflyRadius: 1.6,
    fireflyGlowRadius: 9,

    // Vinheta escura
    vignetteColor: 'rgba(0, 0, 0, 0.75)',
    vignetteInnerRatio: 0.45
};
