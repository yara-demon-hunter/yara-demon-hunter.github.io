import { HERO_VISUALS } from '../hunter/hero_visual.js';

// --- YARA (yara25d.js). Referência: art_reference/ (nesta pasta) ---
// Moça meio-demônio: cabelo metade preto (lado direito dela, +b) e metade branco (esquerdo, -b) em duas
// maria-chiquinhas, bandana e cachecol vermelhos, olhos vermelho (direito) e azul (esquerdo), top curto com a
// barriga à mostra, ombreira com pelo no ombro esquerdo, calça larga, botas altas e uma espada curta.
// Cores e medidas do boneco de yara25d.js. As chaves de colors são as mesmas de HERO_VISUALS.colors (hunter/hero_visual.js).
export const YARA_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        // Sem capa: o pano é o cachecol vermelho
        cape: '#9b1c1c',
        capeFold: '#6b1212',
        capeEdge: '#c2412d',
        capeInner: '#6b1212',
        body: '#2b211b',          // calça
        sleeve: '#c98f62',
        glove: '#5a3a22',
        sash: '#5a3a22',
        boots: '#5a3a22',
        // Espada curta de aço com brilho vermelho
        blade: '#d9dee5',
        bladeCore: '#ffffff',
        runes: '#ffffff',
        bladeGlow: '#ef4444',
        bladeGlowSoft: 'rgba(239, 68, 68, 0.45)',
        bladeGlowFrenzy: '#ff2a2a',
        bladeGlowSoftFrenzy: 'rgba(255, 42, 42, 0.75)',
        buckle: '#9aa3ad',
        eyeGlint: '#ef4444',

        skin: '#c98f62',
        skinShade: '#9a6440',
        skinLight: '#e3b48a',
        outline: '#1f1612',
        mouth: '#7a2e2a',
        mouthInner: '#b4534d',
        blush: 'rgba(232, 110, 110, 0.35)',
        hairDark: '#1b1a22',
        hairDarkShade: '#3a3946',
        hairLight: '#eeeef2',
        hairLightShade: '#b5b8c4',
        eyeWhite: '#fbf7f0',
        eyeRight: '#dc2626',
        eyeLeft: '#3b82f6',
        eyeGlowRight: 'rgba(239, 68, 68, 0.45)',
        eyeGlowLeft: 'rgba(96, 165, 250, 0.45)',
        warPaint: '#141414',
        bandana: '#9b1c1c',
        bandanaShade: '#6b1212',
        tieRight: '#b91c1c',      // elástico do cabelo preto
        tieLeft: '#1e3a5f',       // elástico do cabelo branco
        top: '#2f3530',
        topShade: '#1e2320',
        pendant: '#c9ced6',
        metal: '#6b737c',
        metalLight: '#a3abb4',
        fur: '#f1f1ee',
        furShade: '#c9c9c4',
        bandage: '#e9e6dc',
        bandageLine: '#bdb8aa',
        leather: '#5a3a22',
        leatherShade: '#3a2414',
        flap: '#e9e2d0',
        flapMark: '#9b1c1c',
        pants: '#2b211b',
        pantsShade: '#1a1410'
    },

    // Cabeça: um pouco menor que a do Azael; mesmo truque de levantar e virar o rosto para a câmera
    headRadius: 3.055,
    faceTilt: 0.45,
    faceTiltFront: 0.45,
    faceTurn: 0.45,
    // Rosto mais delicado: queixo fino e arredondado
    face: [[1.95, 0.7], [2.3, 0], [2.15, -1.1], [1.55, -2.15], [0.75, -2.8], [0, -2.95]],
    jawForward: 2.04,
    faceOut: -1.65,
    bandHeight: 1.07,
    bandWidth: 0.76,
    earLength: 2.75,
    // Maria-chiquinhas: presas no alto, dos lados, caem até o meio das costas e voam na corrida
    tailLength: 6.03,
    tailRunLength: 4.28,
    tailWidth: -1.51,
    tailWave: 1.48,
    // Ritmo das passadas deste personagem (maior = passos mais rápidos); sem ele, vale o strideSpeed geral do herói
    strideSpeed: 11.6,
    // Ponta do cachecol: sai do ombro esquerdo e voa para trás
    scarfTailLength: 9.45,

    // Corpo feminino: ombros mais estreitos, cintura fina, quadril largo, braços finos
    shoulderScale: 0.62,
    waistScale: 0.51,
    hipScale: 1.07,
    armScale: 0.7,
    legWidth: 2.925,
    bootHeight: 5,

    // Espada curta, reta e larga
    bladeLength: 13,
    bladeWidth: 2.85,
    glowScale: 0.37,
    // Tamanho da mão (em relação ao handRadius do corpo)
    handScale: 0.75
};
