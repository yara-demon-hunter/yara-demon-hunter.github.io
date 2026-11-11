import { HERO_VISUALS } from '../hunter/hero_visual.js';

// --- ZEPH (zeph25d.js). Referência: art_reference/ (nesta pasta) ---
// Rapaz jovem e magro da floresta: cabelo castanho bagunçado, jaqueta verde de gola alta com remendos, alça de
// couro cruzando o peito com a bolsa no quadril esquerdo, cinto, calça verde enfiada em botas marrons e uma adaga.
// Cores e medidas do boneco de zeph25d.js. As chaves de colors são as mesmas de HERO_VISUALS.colors (hunter/hero_visual.js).
export const ZEPH_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        cape: '#4b6236',
        capeFold: '#33452a',
        capeEdge: '#637a48',
        capeInner: '#33452a',
        body: '#3b4a2e',
        sleeve: '#4b6236',
        glove: '#d9a476',
        sash: '#7a4f2c',
        boots: '#7a4f2c',
        // Adaga de aço, sem brilho mágico (só um reflexo frio)
        blade: '#c9d0d6',
        bladeCore: '#f1f4f6',
        runes: '#f1f4f6',
        bladeGlow: '#cbd5e1',
        bladeGlowSoft: 'rgba(203, 213, 225, 0.25)',
        bladeGlowFrenzy: '#60a5fa',
        bladeGlowSoftFrenzy: 'rgba(96, 165, 250, 0.7)',
        buckle: '#9aa3ad',
        eyeGlint: '#cbd5e1',

        skin: '#d9a476',
        skinShade: '#a8744c',
        skinLight: '#f0c49a',
        outline: '#1a1410',
        mouth: '#7a3f2e',
        hair: '#4a2e1a',
        hairShade: '#2e1c10',
        hairLight: '#6b4528',
        eyeWhite: '#ece6d6',
        eye: '#5f7a55',
        jacket: '#4b6236',
        jacketShade: '#33452a',
        jacketLight: '#637a48',
        patch: '#3a4c2c',
        pants: '#3b4a2e',
        pantsShade: '#283320',
        leather: '#7a4f2c',
        leatherShade: '#523319',
        leatherLight: '#9a6a40',
        guard: '#5d646b',
        grip: '#6b4423'
    },

    // Cabeça: rosto jovem, queixo reto; o mesmo truque de levantar e virar o rosto para a câmera
    headRadius: 2.97,
    faceTilt: 0.45,
    faceTiltFront: 0.45,
    faceTurn: 0.54,
    face: [[2, 0.9], [2.3, 0], [2.1, -1.1], [1.55, -2.1], [0.8, -2.7], [0, -2.85]],
    jawForward: -10,
    faceOut: -0.69,
    earLength: 1.79,
    // Linha do cabelo na testa (altura u onde a franja começa)
    hairline: 0.86,
    // Volume do cabelo: a massa fica maior que a cabeça (o rosto continua no tamanho da cabeça)
    hairPuff: 1.16,
    // Cabelo bagunçado: ondulação do volume no alto (fração do raio)
    hairBumps: 0.07,
    // Franja: quantas pontas (por meia volta) e quanto descem na testa (radianos)
    bangSpikes: 19.1,
    bangDepth: 0.43,
    // Costeletas na frente das orelhas (radianos a mais para baixo)
    sideburn: 0.37,

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
    browTilt: 0.12,
    browThickness: 0.26,
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

    // Corpo magro de rapaz: ombros um pouco estreitos, braços finos
    shoulderScale: 0.84,
    waistScale: 0.77,
    armScale: 0.85,
    legWidth: 2.57,
    // Ritmo das passadas deste personagem (maior = passos mais rápidos); sem ele, vale o strideSpeed geral do herói
    strideSpeed: 11.6,

    // Adaga: lâmina curta e reta
    bladeLength: 7.7,
    bladeWidth: 2.06,
    glowScale: 0.48,
    // Tamanho da mão (em relação ao handRadius do corpo)
    handScale: 0.75
};
