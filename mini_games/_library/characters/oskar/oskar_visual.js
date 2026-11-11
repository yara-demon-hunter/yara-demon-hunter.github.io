import { HERO_VISUALS } from '../hunter/hero_visual.js';

// --- OSKAR (oskar25d.js). Referência: art_reference/ (nesta pasta) ---
// Homem alto e massudo: barba cheia, cabelo ralo e curto, regata verde-oliva, alça cruzando o peito, cinto,
// calça marrom-escura, botas com faixas e o machado de duas lâminas sempre nas duas mãos.
// Cores e medidas do boneco de oskar25d.js. As chaves de colors são as mesmas de HERO_VISUALS.colors (hunter/hero_visual.js).
export const OSKAR_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        cape: '#4f5a32',
        capeFold: '#353d20',
        capeEdge: '#66713f',
        capeInner: '#353d20',
        body: '#3d2f22',
        sleeve: '#c98a5e',
        glove: '#c98a5e',
        sash: '#6b4a2a',
        boots: '#5a3d24',
        // Machado de ferro, sem brilho mágico (só um reflexo frio)
        blade: '#7d848b',
        bladeCore: '#c9ced3',
        runes: '#c9ced3',
        bladeGlow: '#cbd5e1',
        bladeGlowSoft: 'rgba(203, 213, 225, 0.2)',
        bladeGlowFrenzy: '#f97316',
        bladeGlowSoftFrenzy: 'rgba(249, 115, 22, 0.65)',
        buckle: '#9aa3ad',
        eyeGlint: '#cbd5e1',

        skin: '#c98a5e',
        skinShade: '#9a5f3c',
        skinLight: '#e0a679',
        outline: '#1a1410',
        mouth: '#24150e',
        hair: '#4a3020',
        hairShade: '#2e1d12',
        hairLight: '#6a4630',
        beard: '#4a3020',
        beardShade: '#2e1d12',
        eyeWhite: '#e6dfcf',
        eye: '#8a9a92',
        shirt: '#4f5a32',
        shirtShade: '#353d20',
        shirtLight: '#66713f',
        patch: '#3d4527',
        leather: '#6b4a2a',
        leatherShade: '#452e18',
        pants: '#3d2f22',
        pantsShade: '#281e15',
        boot: '#5a3d24',
        bootShade: '#3b2716',
        wrap: '#7a5a3a',
        wristband: '#3a2a1c',
        axeHead: '#7d848b',
        axeEdge: '#c9ced3',
        axeDark: '#4a4f55',
        haft: '#6b4423',
        haftShade: '#4a2e17',
        binding: '#8a6a44'
    },

    // Tamanho do boneco inteiro em relação aos outros (o mais alto do grupo)
    bodyScale: 1.15,

    // Cabeça: mandíbula larga; o mesmo truque de levantar e virar o rosto para a câmera
    headRadius: 2.85,
    faceTilt: 0.42,
    faceTiltFront: 0.21,
    faceTurn: 0.57,
    face: [[2.15, 0.9], [2.45, 0], [2.4, -1.15], [2.05, -2.25], [1.2, -2.9], [0, -3.05]],
    jawForward: 1.56,
    faceOut: -0.33,
    earLength: 0.3,
    // Cabelo ralo e curto: quase colado na cabeça, linha do cabelo alta (entradas), um pouco transparente
    hairline: 1.35,
    hairPuff: 1,
    hairBumps: 0.02,
    hairOpacity: 0.8,
    bangSpikes: 0,
    bangDepth: 0,
    sideburn: 0.45,
    // Entradas: quanto a linha do cabelo sobe nos cantos da testa (radianos)
    recede: 0.22,

    // Posições do rosto (coordenadas de uma cabeça de raio 3: s = para o lado, u = para cima; 0 = centro)
    eyeX: 0.87,
    eyeY: -0.3,
    eyeWidth: 0.45,
    eyeOpen: 0.49,
    irisSize: 0.2,
    browY: 0.5,
    browWidth: 0.6,
    browTilt: 0.18,
    browThickness: 0.34,
    noseY: -1.15,
    noseLength: 0.9,
    mouthY: -2.05,
    mouthWidth: 0.42,
    earX: 0.15,
    earY: 0.05,
    earSize: 0.45,
    earWidth: 0.9,
    // Barba: começa nas costeletas (altura u nos lados), cobre mandíbula e queixo; bigode acima da boca
    beardTop: 0.59,
    beardChin: -4.205,
    beardWidth: 2.925,
    mustacheY: -1.75,

    // Corpo massudo: ombros e peito bem largos, braços e pernas grossos
    shoulderScale: 1.05,
    waistScale: 1.0,
    armScale: 1.12,
    legWidth: 3.2,
    // Ritmo das passadas deste personagem (maior = passos mais rápidos); sem ele, vale o strideSpeed geral do herói
    strideSpeed: 11.6,

    // Machado de duas lâminas: cabo comprido, cabeça dupla larga
    bladeLength: 10,
    bladeWidth: 0.83,
    axeHeadSize: 5.34,
    // Distância entre as duas mãos no cabo
    gripSpread: 3.97,

    // Ombros e braços (a = frente, b = lado: + direita, z = altura). Os de ombro valem sempre; os de cotovelo e mão
    // somem no golpe. A mão DIREITA leva o machado junto; a ESQUERDA fica no cabo, a gripSpread da direita, e o
    // leftHandOffset ajusta a partir daí.
    rightShoulderOffset: [-1.04, -1.09, -0.32],
    rightElbowOffset: [0, 0, 0],
    rightHandOffset: [0, 0, 0],
    leftShoulderOffset: [-0.59, 0.4, 0.26],
    leftElbowOffset: [0, 0, 0],
    leftHandOffset: [0, 0, 0],
    glowScale: 0.59,
    // Tamanho da mão (em relação ao handRadius do corpo)
    handScale: 0.85
};
