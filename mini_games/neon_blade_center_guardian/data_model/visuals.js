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

    // Ataques do combo (1: corte, 2: corte de volta, 3: giro 360°)
    combo: {
        1: { seconds: 0.12, from: 1, to: -1, extraArc: 0.35, glow: 18 },
        2: { seconds: 0.12, from: -1, to: 1, extraArc: 0.6, glow: 22 },
        3: { seconds: 0.2, spin: true, glow: 30 }
    },
    restBladeAngle: 2.0,

    // Dano
    hurtSquashSeconds: 0.1,
    hurtSquash: 0.22,

    // Rastro de sombra (quase imperceptível)
    shadowTrailAlpha: 0.18,
    shadowTrailRadius: 9
};
