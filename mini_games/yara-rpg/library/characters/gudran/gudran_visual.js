// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/characters/gudran/gudran_visual.js e rode o sync.
import { HERO_VISUALS } from '../hunter/hero_visual.js';

// --- GUDRAN, SENHOR DO CASTELO (gudran25d.js). Referência: art_reference/images/gudran.webp (a arte do yara-rpg) ---
// Velho feiticeiro de cabelo e barba longos e brancos, sobrancelhas pesadas e franzidas, túnica preta de gola alta com
// bordados dourados (runas), manto largo nos ombros e um cajado de madeira retorcida com uma esfera azul.
// Cores e medidas do boneco de gudran25d.js. As chaves de colors são as mesmas de HERO_VISUALS.colors (hunter/hero_visual.js).
export const GUDRAN_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        // A túnica usa as cores da capa
        cape: '#1b1d29', capeFold: '#12131c', capeEdge: '#2a2d3d', capeInner: '#0d0e15',
        body: '#1b1d29', sleeve: '#1b1d29', glove: '#c99a74', sash: '#d4a437', boots: '#14121a',
        // O golpe de espada do herói vira um corte de energia azul
        blade: '#93c5fd', bladeCore: '#eff6ff', runes: '#eff6ff', bladeGlow: '#3b82f6', bladeGlowSoft: 'rgba(59, 130, 246, 0.5)',
        bladeGlowFrenzy: '#fde68a', bladeGlowSoftFrenzy: 'rgba(253, 230, 138, 0.75)',
        buckle: '#d4a437', eyeGlint: '#e0f2fe', metal: '#8a6a1f',

        skin: '#c99a74', skinShade: '#9a7050', skinLight: '#e0b48d', outline: '#0b0a10', mouth: '#7a4f44',
        hair: '#e8ebf0', hairShade: '#aab2bf', hairLight: '#ffffff',
        beard: '#e8ebf0', beardShade: '#aab2bf',
        brow: '#f4f6fa', eye: '#1a110c',
        // Só dele
        coat: '#1b1d29', coatShade: '#12131c', coatLight: '#2c3044',
        shirt: '#14151e', shirtShade: '#0d0e15', shirtLight: '#262938',
        gold: '#d4a437', goldShade: '#8a6a1f', goldLight: '#f3d27a', gem: '#3b82f6', gemLight: '#bfe3ff',
        pants: '#16171f', pantsShade: '#0e0f15', boot: '#14121a', bootShade: '#0b0a10', bootLight: '#2c2836',
        // Cajado (lido por weapons/staff/staff.js): madeira escura retorcida e uma esfera azul
        leather: '#3b2a1a', leatherShade: '#251a10', leatherLight: '#5a4128',
        wood: '#5b3f25', woodShade: '#35220f', woodLight: '#85603a', leaf: '#3a2a18', leafShade: '#251a10', leafLight: '#5a4128',
        seed: '#3b82f6', seedCore: '#bfe3ff', seedGlow: 'rgba(96, 165, 250, 0.42)'
    },

    // Alto e de ombros largos, manto pesado
    bodyScale: 1.04,

    // Cabeça: rosto largo e marcado (velho), queixo forte
    headRadius: 2.85,
    faceTilt: 0.42,
    faceTiltFront: 0.21,
    faceTurn: 0.57,
    face: [[2.0, 0.9], [2.2, 0], [2.1, -1.15], [1.75, -2.3], [1.0, -3.0], [0, -3.15]],
    jawForward: 1.5,
    faceOut: -0.33,
    earLength: 0.3,
    // Cabelo branco: cobre a cabeça toda (não há chapéu) e cai atrás até os ombros
    hairline: 0.9,
    hairPuff: 1.08,
    hairBumps: 0.03,
    hairOpacity: 1,
    bangSpikes: 0,
    bangDepth: 0,
    sideburn: 0.9,
    recede: 0,

    // Posições do rosto (coordenadas de uma cabeça de raio 3: s = para o lado, u = para cima; 0 = centro)
    eyeX: 0.87,
    eyeY: -0.3,
    eyeWidth: 0.5,
    eyeOpen: 0.4,
    irisSize: 0.2,
    noseY: -1.15,
    noseLength: 1.1,
    mouthY: -2.2,
    mouthWidth: 0.5,
    earX: 0.15,
    earY: 0.05,
    earSize: 0.5,
    earWidth: 0.9,
    // Sobrancelhas grossas, franzidas (as pontas de fora mais altas)
    browY: 0.3,
    browWidth: 0.55,
    // Bigode e barba longa que desce pelo peito
    mustacheY: -1.7,
    mustacheWidth: 1.2,
    beardLength: 5.0,
    beardWidth: 2.2,
    hairFall: 3.4,

    // Corpo largo, ombros de manto
    shoulderScale: 1.2,
    waistScale: 1.0,
    armScale: 0.95,
    legWidth: 2.7,
    strideSpeed: 9.4,

    // Cajado: bladeLength = da mão até a esfera (é onde o brilho da "lâmina" aparece)
    bladeLength: 16.5,
    bladeWidth: 1.8,
    glowScale: 0.55,
    handScale: 0.85,
    staffBelow: 9.5,
    seedRadius: 1.5
};
