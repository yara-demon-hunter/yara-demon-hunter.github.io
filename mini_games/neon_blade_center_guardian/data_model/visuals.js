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
        hurtRim: '#fb7185',
        hurtRing: '#fb7185',
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

    // Dano: o herói é empurrado para longe do golpe e volta (só visual, sem piscar branco)
    knockback: {
        seconds: 0.32,
        distance: 15,          // px de recuo visual
        peakAt: 0.3,           // fração da animação em que o recuo é máximo
        squash: 0.28,          // achata na direção do empurrão
        tilt: 0.38,            // inclinação (radianos) do corpo
        rimSeconds: 0.12,      // contorno rosado logo no impacto
        ringSeconds: 0.35,     // anel de impacto
        ringStartRadius: 8,
        ringEndRadius: 34
    },
    invulnerableAlphaMin: 0.6, // pulso suave de transparência enquanto invulnerável
    invulnerablePulseMs: 110,

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

// --- TOCHA (CENTER TOWER) ---
// A luz da tocha abre um círculo sem névoa. O raio acompanha a vida do núcleo.
export const TORCH_VISUALS = {
    // Raio da luz (fração do menor lado da tela): cheio com 100% de vida, mínimo com 0%
    lightRadiusMaxRatio: 0.62,
    lightRadiusMinRatio: 0.13,
    lightShrinkCurve: 0.85,        // <1: encolhe mais rápido no começo; >1: mais devagar
    lightSmoothing: 2.5,           // suavidade ao mudar de tamanho (maior = mais rápido)
    lightFlicker: 0.03,            // tremida da luz (fração do raio)
    lightEdgeSoftness: 0.45,       // 0 = borda dura; 1 = degradê até o centro
    groundGlowColor: '255, 150, 60',
    groundGlowAlpha: 0.3,

    // Corpo da tocha (visto de cima)
    baseColor: '#1b1410',
    baseRimColor: '#4a3322',
    flameColors: ['rgba(234, 88, 12, 0.85)', 'rgba(251, 146, 60, 0.85)', 'rgba(253, 224, 71, 0.9)'],
    flameCoreColor: '#fff7ed',
    flameGlowColor: 'rgba(251, 146, 60, 0.9)',
    flameMinScale: 0.45,           // tamanho da chama com a vida zerada
    tongues: 6,
    embers: 8,
    emberColor: '#fdba74'
};
