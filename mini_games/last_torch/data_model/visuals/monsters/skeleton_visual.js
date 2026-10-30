// --- DADOS VISUAIS: Esqueleto. ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

// --- ESQUELETO (monstro SKELETON, o monstro normal) ---
// Referência de arte: art_reference/skeleton. Vista de cima: crânio rachado com olhos verdes,
// caixa torácica com a alma (chama verde) dentro, braços esticados à frente e passada dura.
// Só afeta o desenho; o tamanho de colisão e a velocidade ficam em MONSTER_MODELS.SKELETON.
export const SKELETON_VISUALS = {
    // Escala visual do desenho em relação ao raio do monstro
    scale: 1.35,

    colors: {
        bone: '#e3dcc6',
        boneShade: '#a89f86',
        boneDark: '#5c5444',
        socket: '#120f0a',
        soul: '#86efac',
        soulCore: '#f0fdf4',
        soulGlow: 'rgba(74, 222, 128, 0.4)',
        aura: '#22c55e',
        rag: '#3b2f25',
        ragEdge: '#57463a',
        hurtFlash: '#ffffff'
    },

    // Medidas (em múltiplos do raio, antes da escala)
    boneWidth: 0.11,
    jointRadius: 0.07,
    skullX: 0.6,
    skullLength: 0.3,
    skullWidth: 0.27,
    jawLength: 0.14,
    jawOpenMax: 0.07,
    shoulderX: 0.14,
    shoulderSpread: 0.42,
    pelvisX: -0.42,
    pelvisWidth: 0.26,
    hipSpread: 0.2,
    ribPairs: 4,
    ribSpan: 0.34,
    ribTop: 0.08,
    ribGap: 0.12,

    // Braços esticados à frente (cotovelo e mão)
    elbowX: 0.36,
    elbowSpread: 0.54,
    handX: 0.72,
    handSpread: 0.34,
    clawLength: 0.13,
    armSwing: 0.1,

    // Passada
    walkHz: 1.8,                 // passos por segundo na velocidade de referência
    walkReferenceSpeed: 70,
    strideLength: 0.3,
    footLength: 0.16,
    swayAmount: 0.1,             // cambaleio do corpo (radianos)
    turnSmoothing: 8,

    // Cabeça e mandíbula
    chatterHz: 5.4,
    twitchHz: 0.35,              // frequência dos trancos de cabeça
    twitchAngle: 0.45,

    // Alma e olhos
    soulX: -0.08,
    soulRadius: 0.13,
    soulPulseHz: 1.8,
    soulGlowRadius: 0.6,
    eyeGlowRadius: 0.18,
    auraAlpha: 0.1,
    auraRadius: 1.6,

    // Trapo preso à bacia
    ragStrips: 3,
    ragLength: 0.42,
    ragFlutterHz: 3.6,

    // Levar dano: ossos chacoalham e piscam em branco
    rattleSeconds: 0.25,
    rattleAmount: 0.06,

    // Sombra
    shadowAlpha: 0.25,

    // Barra de vida acima do monstro
    healthBarOffset: 12
};
