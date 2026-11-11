import { WITCH_VISUALS } from '../../topdown/witch/witch_visual.js';
import { HERO_VISUALS } from '../../../characters/hunter/hero_visual.js';

// --- DADOS VISUAIS: Bruxa 2.5D (witch25d.js) ---
// A Bruxa do Last Torch (topdown/witch: velha corcunda no manto roxo esfarrapado, capuz, rosto pálido de olho vermelho,
// cabelo grisalho, mãos com garras, bola de magia que suga partículas) misturada com a do palco do yara-rpg (perfil de
// nariz comprido e queixo, ponta do capuz caindo para trás, cordão com nó, faíscas subindo da bola), num boneco 2.5D
// para qualquer câmera. As cores são as de topdown/witch/witch_visual.js: mudar lá muda os dois desenhos.
// Medidas em unidades do boneco (o herói tem ~25 de altura). Só afeta o desenho; vida, tiro e velocidade ficam no jogo.
const C = WITCH_VISUALS.colors;

export const WITCH_25D_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        ...C,
        outline: C.robeShade
    },

    // Sem arma (a magia é desenhada à parte)
    bladeLength: 6,
    bladeWidth: 1,
    glowScale: 0,
    // Anda mancando, devagar
    strideSpeed: 6.5,
    bodyScale: 1,

    // Corcunda: tronco inclinado à frente, cabeça baixa e à frente dos ombros
    hunch: 3.2,
    headDrop: 2.6,
    headForward: 1.4,
    hobble: 0.7,               // balanço de lado a lado ao mancar (unidades)

    // Manto: cone do peito até o chão, com a barra rasgada que arrasta e ondula
    robeChest: 3.6,            // raio do manto no peito
    robeHem: 7.2,              // raio na barra
    robeHemBack: 2.2,          // a barra arrasta mais para trás
    robeHemHeight: 0.4,
    robeStrips: 14,
    robeJag: 0.9,              // fundo dos rasgos da barra
    robeWave: 0.45,
    robeWaveHz: 1.8,
    robeFolds: 5,

    // Cordão na cintura com nó e a ponta pendurada
    ropeHeight: 10.2,
    ropeEnd: 3.4,

    // Capuz e rosto
    hoodRadius: 3.4,
    hoodTipLength: 5,
    faceRadius: 1.35,
    noseLength: 1.3,
    eyeGlowRadius: 1.1,

    // Cabelo grisalho saindo do capuz, dos dois lados
    hairLocks: 4,
    hairLength: 5,

    // Braços: manga larga; a mão da frente conjura, a de trás fica junto ao corpo
    sleeveWidth: 2.2,
    sleeveFlare: 1.0,          // a manga abre no punho
    castReach: 6.5,            // mão da magia à frente do ombro
    castLift: 1.5,             // e sobe ao carregar
    handRadius: 0.55,
    clawLength: 1.3,
    clawCount: 4,

    // Bola de magia
    orbHeight: 2.0,            // acima da mão
    orbMinRadius: 1.0,
    orbMaxRadius: 2.4,
    orbGlow: 3.2,
    orbSpinHz: 1.8,
    sparks: 4,
    particleCount: 7,
    particleOrbit: 6,
    previewCharge: 0.35,       // no tuner e nas prévias: 0 = sem feitiço, 1 = bola cheia

    // Brilho roxo em volta (aura) e quanto o feitiço demora a carregar no jogo
    auraRadius: 26,
    auraAlpha: WITCH_VISUALS.auraAlpha,
    chargeSeconds: WITCH_VISUALS.chargeSeconds,

    // Tamanho no Last Torch: px por unidade = raio do monstro × isto (o desenho de cima usa raio × 1,7)
    scalePerRadius: 0.16
};
