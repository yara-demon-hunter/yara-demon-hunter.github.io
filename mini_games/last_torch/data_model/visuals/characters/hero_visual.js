// --- DADOS VISUAIS: Herói (Caçador das Sombras). Referência: art_reference/hero. ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

export const HERO_VISUALS = {
    // Barrinha de vida em cima da cabeça
    hpBar: {
        width: 44,
        height: 5,
        offsetY: 54,
        back: 'rgba(15, 23, 42, 0.85)',
        fillLeft: '#10b981',
        fillRight: '#2dd4bf',
        border: 'rgba(167, 243, 208, 0.5)'
    },

    // Escala visual do desenho (não altera o raio de colisão em CHARACTER_MODEL)
    scale: 1.70,

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
        capeInner: '#0a2a37',
        glove: '#0a1218',
        strap: '#16262e',
        buckle: '#7e929c',
        hoodFold: '#0f2a34',
        eyeGlint: '#7dd3fc',
        bladeGlowSoft: 'rgba(56, 189, 248, 0.85)',
        bladeGlowSoftFrenzy: 'rgba(240, 171, 252, 0.85)',
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

    // Suavização dos movimentos (maior = acompanha mais rápido)
    speedSmoothing: 12,
    runSmoothing: 9,
    capeFollow: 7,                // quão rápido a capa "alcança" o corpo
    capeDragPerSpeed: 0.055,      // quanto a capa fica para trás por px/s de velocidade
    capeMaxLag: 14,
    capeTurnLag: 0.8,             // capa abre para o lado ao virar
    bobAmount: 0.045,             // sobe e desce do corpo na corrida
    armSwing: 3.2,                // balanço do braço livre na corrida

    // Golpe: preparação (puxa a lâmina para trás), corte e retorno suave
    windupFraction: 0.22,
    windupExtra: 0.3,
    recoverSeconds: 0.14,
    swingBlendRate: 16,
    ghostCount: 4,                // cópias fantasmas da lâmina (rastro do corte)
    ghostGapSeconds: 0.018,

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
