// --- DADOS VISUAIS: Captain Brutos (herói 2.5D). Referência: art_reference/captain-brutos. ---
// Capitão alto e massudo de armadura negra: ombreiras, peitoral de placas, cota de malha aparecendo, grevas e
// joelheiras, capa preta longa e um machado de duas lâminas sempre nas duas mãos. Cabelo curto preto, barba densa e
// uma cicatriz que corta a parte de cima do rosto.
// Lido por js/render/player25d.js e js/render/brutos25d.js. Mesmas medidas de corpo e câmera do herói 2.5D
// (hero25d_visual.js); aqui ficam só a paleta e as peças que mudam. Lados: direita = +b, esquerda = -b.
import { HERO_VISUALS } from './hero_visual.js';

export const BRUTOS_VISUALS = {
    // Mesmas chaves de HERO_VISUALS.colors (os Juramentos e o resto do jogo continuam funcionando) + as do Brutos
    colors: {
        ...HERO_VISUALS.colors,
        // Capa preta pesada
        cape: '#0f0f13',
        capeFold: '#1b1b22',
        capeEdge: '#26262e',
        capeInner: '#0a0a0e',
        // body: calça de couro escura; sleeve/glove: pele (braços nus por baixo das ombreiras)
        body: '#2e2418',
        sleeve: '#c98a5e',
        glove: '#c98a5e',
        sash: '#3a2a1c',
        boots: '#2a1f16',
        // Espada: o machado tem desenho próprio; aqui só o brilho em volta, frio e fraco (é aço, não magia)
        blade: '#aab0b8',
        bladeCore: '#dfe3e8',
        runes: '#ffffff',
        bladeGlow: '#c8d2e0',
        bladeGlowSoft: 'rgba(200, 210, 224, 0.3)',
        bladeGlowFrenzy: '#ff4d4d',
        bladeGlowSoftFrenzy: 'rgba(255, 77, 77, 0.7)',
        buckle: '#9aa3ad',

        // Só do Brutos
        skin: '#c98a5e',
        skinShade: '#9a5f3c',
        skinLight: '#e0a679',
        outline: '#14110f',
        hair: '#15110f',
        hairShade: '#0a0807',
        beard: '#15110f',
        beardShade: '#050403',
        mouth: '#3a1f1a',
        eye: '#3a2a1c',
        eyeWhite: '#cfc9b8',
        scar: '#8a4a42',
        scarLight: '#b7766b',
        // Armadura negra: placas, sombra, luz e rebites
        armor: '#26282d',
        armorShade: '#15161a',
        armorLight: '#3d4047',
        armorEdge: '#5a5e66',
        // Cota de malha e couro
        mail: '#5d6169',
        mailShade: '#2f3136',
        leather: '#5a3d24',
        leatherShade: '#3b2716',
        pantsShade: '#1c150d',
        // Ferro escurecido (grevas, joelheiras)
        iron: '#34363b',
        ironLight: '#50535a',
        // Machado
        axeHead: '#aab0b8',
        axeEdge: '#dfe3e8',
        axeDark: '#50555c',
        haft: '#5e3d1f',
        haftShade: '#3f2713',
        binding: '#2c2c30'
    },

    // Tamanho do boneco inteiro em relação ao herói (visual; não muda a colisão)
    bodyScale: 1.1,

    // Cabeça: mandíbula larga; a mesma geometria do Azael (kit em azael25d.js), com o rosto virado para a câmera
    headRadius: 3.1,
    faceTilt: 0.46,
    faceTiltFront: 0.3,
    faceTurn: 0.5,
    face: [[2.25, 0.95], [2.6, 0], [2.55, -1.2], [2.2, -2.4], [1.3, -3.1], [0, -3.3]],
    jawForward: 1.7,
    faceOut: -0.36,
    // Cabelo curto e preto: quase colado, linha do cabelo baixa, sem franja
    hairline: 1.7,
    // Até onde o cabelo desce na nuca (latitude, radianos; mais perto de 0 = mais curto)
    hairNape: -0.5,
    hairPuff: 1.01,
    hairBumps: 0.02,
    hairOpacity: 1,
    sideburn: 0.5,
    recede: 0.08,

    // Posições do rosto (coordenadas de uma cabeça de raio 3: s = para o lado, u = para cima; 0 = centro)
    eyeX: 0.92,
    eyeY: -0.3,
    eyeWidth: 0.46,
    eyeOpen: 0.45,
    irisSize: 0.2,
    browY: 0.46,
    browWidth: 0.62,
    browTilt: 0.2,
    browThickness: 0.38,
    noseY: -1.15,
    noseLength: 0.9,
    mouthY: -2.1,
    mouthWidth: 0.44,
    earX: 0.15,
    earY: 0.05,
    earSize: 0.45,
    earWidth: 0.9,
    // Barba densa e alinhada: das costeletas pela mandíbula até abaixo do queixo, bigode acima da boca
    beardTop: 0.55,
    beardChin: -4.4,
    beardWidth: 3.05,
    mustacheY: -1.75,
    // Cicatriz: do alto da testa, atravessando a sobrancelha e o olho direito, até a bochecha
    // (pontos [s, u] no rosto; s positivo = lado direito dele)
    scar: [[0.25, 1.35], [0.85, 0.65], [1.35, -0.05], [1.75, -0.95]],
    scarWidth: 0.34,

    // Corpo massudo: ombros e peito largos, braços e pernas grossos
    shoulderScale: 1.08,
    waistScale: 1.0,
    armScale: 1.15,
    legWidth: 3.2,
    // Ritmo das passadas (maior = passos mais rápidos): passos pesados, mais lentos que os do Azael
    strideSpeed: 9.6,

    // Machado de duas lâminas: cabo longo, cabeça dupla larga
    bladeLength: 11,
    bladeWidth: 0.9,
    axeHeadSize: 5.6,
    // Distância entre as duas mãos no cabo
    gripSpread: 4,

    // Ombros e braços (a = frente, b = lado: + direita, z = altura). Os de ombro valem sempre; os de cotovelo e mão
    // somem no golpe. A mão DIREITA leva o machado; a ESQUERDA fica no cabo, a gripSpread da direita.
    rightShoulderOffset: [-1, -1.1, -0.3],
    rightElbowOffset: [0, 0, 0],
    rightHandOffset: [0, 0, 0],
    leftShoulderOffset: [-0.6, 0.4, 0.25],
    leftElbowOffset: [0, 0, 0],
    leftHandOffset: [0, 0, 0],
    // Ombreiras: raio em relação ao braço
    pauldronScale: 0.95,
    // Brilho em volta do machado (aço, fraco)
    glowScale: 0.6
};
