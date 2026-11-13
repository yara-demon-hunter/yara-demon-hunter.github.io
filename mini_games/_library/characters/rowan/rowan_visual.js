import { HERO_VISUALS } from '../hunter/hero_visual.js';

// --- ROWAN, O DRUIDA (rowan25d.js). Ficha de como foi criado: art_reference/character.md ---
// Homem da floresta, robusto: cabelo castanho comprido em mechas grossas com folhas presas, barba longa trançada,
// ombreiras de couro, túnica verde-oliva com barra dourada e alças cruzadas, cinto com fivela de folha, manto
// verde-escuro longo, botas altas e um cajado retorcido com a ponta em espiral segurando uma esfera laranja.
// Segue as imagens de art_reference/images (rowan_druid_body.webp e rowan_perfil.webp).
// Cores e medidas do boneco de rowan25d.js. As chaves de colors são as mesmas de HERO_VISUALS.colors (hunter/hero_visual.js).
export const ROWAN_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        // O manto de folhas usa as cores da capa
        cape: '#2f5a28',
        capeFold: '#234a1e',
        capeEdge: '#4f7a3a',
        capeInner: '#1c3a17',
        body: '#5d6b34',
        sleeve: '#5d6b34',
        glove: '#c99a6c',
        sash: '#8a6a3a',
        boots: '#5b3c22',
        // "Lâmina" = a semente do cajado: é dela que sai o brilho (verde), e a Fúria a acende
        blade: '#fbbf24',
        bladeCore: '#fff7d6',
        runes: '#fff7d6',
        bladeGlow: '#f59e0b',
        bladeGlowSoft: 'rgba(245, 158, 11, 0.5)',
        bladeGlowFrenzy: '#a3e635',
        bladeGlowSoftFrenzy: 'rgba(163, 230, 53, 0.8)',
        buckle: '#c9a24a',
        eyeGlint: '#bbf7d0',

        skin: '#c99a6c',
        skinShade: '#9a6c44',
        skinLight: '#e2b88c',
        outline: '#17130d',
        mouth: '#6e3a2a',
        hair: '#6e4a26',
        hairShade: '#452d16',
        hairLight: '#93693a',
        eyeWhite: '#ece6d6',
        eye: '#4d8a4a',
        // A túnica reaproveita as chaves da jaqueta do Zeph (mesmo molde de tronco e braço)
        jacket: '#5d6b34',
        jacketShade: '#3f4a22',
        jacketLight: '#7a8a45',
        patch: '#4d5a2b',
        pants: '#4a3a28',
        pantsShade: '#33241a',
        leather: '#5b3c22',
        leatherShade: '#3d2815',
        leatherLight: '#7d5632',
        guard: '#6b4a2a',
        grip: '#5b3c22',
        // Só dele: madeira do cajado e da galhada, folhas e a semente
        wood: '#6b4a2a',
        woodShade: '#412b16',
        woodLight: '#8f6a3f',
        leaf: '#5fa33a',
        leafShade: '#33661f',
        leafLight: '#a3d65c',
        seed: '#f59e0b',
        seedCore: '#fde68a',
        seedGlow: 'rgba(251, 191, 36, 0.38)',
        // Barba (mesmo castanho do cabelo), anéis verdes das tranças e barra dourada da túnica
        beard: '#6e4a26',
        beardShade: '#452d16',
        braidRing: '#6f9a45',
        trim: '#c9a24a'
    },

    // Cabeça: rosto adulto, queixo reto; o mesmo truque de levantar e virar o rosto para a câmera
    headRadius: 2.97,
    faceTilt: 0.45,
    faceTiltFront: 0.45,
    faceTurn: 0.54,
    face: [[2, 0.9], [2.3, 0], [2.1, -1.1], [1.55, -2.1], [0.8, -2.7], [0, -2.85]],
    jawForward: -10,
    faceOut: -0.69,
    earLength: 1.79,
    // Linha do cabelo na testa (altura u onde a franja começa)
    hairline: 1.05,
    // Volume do cabelo: a massa fica maior que a cabeça (o rosto continua no tamanho da cabeça)
    hairPuff: 1.24,
    // Cabelo bagunçado: ondulação do volume no alto (fração do raio)
    hairBumps: 0.09,
    // Franja: quantas pontas (por meia volta) e quanto descem na testa (radianos)
    bangSpikes: 9,
    bangDepth: 0.14,
    // Costeletas na frente das orelhas (radianos a mais para baixo)
    sideburn: 0.55,

    // Posições do rosto (coordenadas de uma cabeça de raio 3: s = para o lado, u = para cima; 0 = centro).
    // Olhos: centro, meia largura, abertura e tamanho da íris
    eyeX: 0.98,
    eyeY: -0.36,
    eyeWidth: 0.53,
    eyeOpen: 0.36,
    irisSize: 0.27,
    // Sobrancelhas: altura acima do olho, meia largura, quanto o lado de dentro desce (franzido) e espessura
    browY: 0.7,
    browWidth: 0.57,
    browTilt: 0.2,
    browThickness: 0.32,
    // Nariz (centro e comprimento) e boca (altura e meia largura)
    noseY: -0.97,
    noseLength: 0.8,
    mouthY: -2.1,
    mouthWidth: 0.4,
    // Orelhas: para a frente (+) ou para trás (-), altura do centro, meia altura e espessura
    earX: 1,
    earY: 0.14,
    earSize: 0.15,
    earWidth: 0.69,

    // Corpo de homem adulto, robusto
    shoulderScale: 1.02,
    waistScale: 0.96,
    armScale: 1.0,
    legWidth: 2.75,
    // Ritmo das passadas deste personagem (maior = passos mais rápidos); sem ele, vale o strideSpeed geral do herói
    strideSpeed: 10.4,

    // Cajado: bladeLength = da mão até a semente (é onde o brilho da "lâmina" aparece)
    bladeLength: 16.5,
    bladeWidth: 1.1,
    glowScale: 0.7,
    // Tamanho da mão (em relação ao handRadius do corpo)
    handScale: 0.8,

    // Só dele
    // Cabelo comprido: quanto a linha do cabelo desce na nuca (radianos abaixo da do Zeph) e a mecha nas costas
    napeDrop: 0.85,
    maneLength: 5,
    // Folhas presas no cabelo (coroa)
    crownLeaves: 7,
    // Barba: largura, onde começa (costeletas), ponta do queixo, bigode, e as duas tranças que descem até o peito
    beardWidth: 2.7,
    beardTop: 0.45,
    beardChin: -4.4,
    mustacheY: -1.75,
    braidLength: 3.2,
    // Mechas soltas que caem pelos ombros e costas
    hairLocks: 7,
    // Cajado: quanto do cabo fica abaixo da mão e o raio da semente
    staffBelow: 9.5,
    seedRadius: 1.4
};
