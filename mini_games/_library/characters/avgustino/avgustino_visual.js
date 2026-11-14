import { HERO_VISUALS } from '../hunter/hero_visual.js';

// --- PADRE AVGUSTINO (avgustino25d.js). Referência: art_reference/ (nesta pasta) ---
// Homem magro e pálido, de chapéu preto de abas largas, óculos redondos escuros, bigode fino e cavanhaque grisalhos,
// sobretudo longo preto de corte clerical, camisa preta abotoada, crucifixo prateado no peito e botas pretas.
// Segue as imagens de art_reference/images (priest-avgustino-body.webp e priest-avgustino.webp).
// Cores e medidas do boneco de avgustino25d.js. As chaves de colors são as mesmas de HERO_VISUALS.colors (hunter/hero_visual.js).
export const AVGUSTINO_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        // O sobretudo usa as cores da capa
        cape: '#2a2630',
        capeFold: '#1d1a22',
        capeEdge: '#3a3541',
        capeInner: '#15131a',
        body: '#2a2630',
        sleeve: '#2a2630',
        glove: '#d9b9a2',
        sash: '#1d1a22',
        boots: '#17151b',
        // Lâmina de prata benta: brilho frio e branco
        blade: '#c9ced8',
        bladeCore: '#f4f6fb',
        runes: '#f4f6fb',
        bladeGlow: '#e2e8f0',
        bladeGlowSoft: 'rgba(226, 232, 240, 0.45)',
        bladeGlowFrenzy: '#fde68a',
        bladeGlowSoftFrenzy: 'rgba(253, 230, 138, 0.75)',
        buckle: '#a8aab3',
        eyeGlint: '#cbd5e1',
        metal: '#8e929d',

        skin: '#d9b9a2',
        skinShade: '#b08f7a',
        skinLight: '#ead0bd',
        outline: '#0e0c12',
        mouth: '#6a4a44',
        hair: '#8d8d96',
        hairShade: '#5e5e68',
        hairLight: '#b3b3bb',
        beard: '#8d8d96',
        beardShade: '#5e5e68',
        // Só dele
        coat: '#2a2630',
        coatShade: '#1d1a22',
        coatLight: '#3f3a48',
        shirt: '#1b1920',
        shirtShade: '#121016',
        shirtLight: '#2c2933',
        hat: '#2b2832',
        hatShade: '#1c1a22',
        hatLight: '#423e4c',
        hatBand: '#14121a',
        lens: '#0b0a0e',
        lensGlint: '#6b6877',
        frame: '#2a2a30',
        cross: '#d5d9e2',
        crossShade: '#8e929d',
        chain: '#aeb3bf',
        pants: '#1f1c25',
        pantsShade: '#15131a',
        boot: '#17151b',
        bootShade: '#0e0c12',
        bootLight: '#34303c'
    },

    // Magro e de altura normal (um pouco mais alto que o Demon Hunter, por causa do chapéu)
    bodyScale: 1.04,

    // Cabeça: rosto magro, queixo fino
    headRadius: 2.8,
    faceTilt: 0.42,
    faceTiltFront: 0.21,
    faceTurn: 0.57,
    face: [[1.85, 0.9], [2.05, 0], [1.95, -1.15], [1.6, -2.3], [0.9, -3.0], [0, -3.15]],
    jawForward: 1.5,
    faceOut: -0.33,
    earLength: 0.3,
    // Cabelo grisalho curto nas têmporas (o resto fica sob o chapéu)
    hairline: 0.9,
    hairPuff: 1,
    hairBumps: 0.02,
    hairOpacity: 1,
    bangSpikes: 0,
    bangDepth: 0,
    sideburn: 0.2,
    recede: 0,

    // Posições do rosto (coordenadas de uma cabeça de raio 3: s = para o lado, u = para cima; 0 = centro)
    eyeX: 0.87,
    eyeY: -0.3,
    eyeWidth: 0.45,
    eyeOpen: 0.49,
    irisSize: 0.2,
    noseY: -1.15,
    noseLength: 0.9,
    mouthY: -2.1,
    mouthWidth: 0.4,
    earX: 0.15,
    earY: 0.05,
    earSize: 0.45,
    earWidth: 0.9,
    // Óculos redondos escuros
    lensSize: 0.72,
    lensY: -0.3,
    lensX: 0.88,
    // Bigode fino e cavanhaque
    mustacheY: -1.65,
    mustacheWidth: 0.95,
    goateeLength: 1.35,
    goateeWidth: 0.55,

    // Chapéu de abas largas (medidas em raios de cabeça)
    hatBrim: 1.95,
    hatBrimZ: 0.55,
    hatBrimDroop: 0.14,
    hatCrownRadius: 1.0,
    hatCrownHeight: 1.05,
    hatBandHeight: 0.28,

    // Corpo magro, ombros de sobretudo estruturados
    shoulderScale: 1.0,
    waistScale: 0.95,
    armScale: 0.9,
    legWidth: 2.6,
    strideSpeed: 10.2,

    // Lâmina de prata benta (espada curta)
    bladeLength: 15,
    bladeWidth: 1.8,
    glowScale: 0.5,
    handScale: 0.85
};
