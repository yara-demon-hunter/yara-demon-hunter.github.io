import { BLOATER_VISUALS } from '../../topdown/bloater/bloater_visual.js';
import { HERO_VISUALS } from '../../../characters/hunter/hero_visual.js';

// --- DADOS VISUAIS: Inchado (Bloater) 2.5D (bloater25d.js) ---
// O mesmo Inchado de topdown/bloater (corpo enorme e esverdeado, bolsas de gás que brilham e pulsam mais rápido perto de
// estourar, bracinhos curtos, boca costurada e olhos miúdos na frente), montado no boneco 2.5D: uma esfera sobre
// perninhas, para qualquer câmera. As cores são as de topdown/bloater/bloater_visual.js: mudar lá muda os dois desenhos.
// Medidas em unidades do boneco (o herói tem ~25 de altura). Só afeta o desenho; vida, dano e explosão ficam no jogo.
const C = BLOATER_VISUALS.colors;

export const BLOATER_25D_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        ...C,
        outline: C.stitch
    },

    // Sem arma
    bladeLength: 6,
    bladeWidth: 1,
    glowScale: 0,
    // Passos curtos e pesados
    strideSpeed: 6,
    bodyScale: 1,

    // Corpo: esfera grande sobre as pernas
    bodyRadius: 8.5,
    bodyHeight: 12.4,          // altura do centro da esfera
    bodySquash: 0.92,          // a esfera é um pouco mais baixa que larga
    waddle: 0.6,               // balanço de um lado para o outro a cada passo (unidades)

    // Pulso: incha e desincha; mais rápido e mais forte conforme perde vida
    pulseHz: BLOATER_VISUALS.pulseHz,
    pulseHzLowHp: BLOATER_VISUALS.pulseHzLowHp,
    pulseAmount: BLOATER_VISUALS.pulseAmount,
    previewHurt: 0,            // no tuner e nas prévias: 0 = vida cheia, 1 = quase estourando

    // Pernas curtas e grossas
    hipHeight: 5.2,
    legWidth: 2.6,
    footLength: 1.6,

    // Bracinhos dos lados
    armHeight: 12.8,           // altura do ombro
    armWidth: 2.1,
    armReach: 3.2,             // mão à frente do ombro
    armOut: 1.2,               // mão para fora
    handRadius: 1.1,

    // Bolsas de gás na pele: quantas, tamanho e brilho
    sacCount: 9,
    sacRadius: 1.1,
    sacGlow: 2.4,

    // Rosto na frente da esfera (latitude da linha dos olhos e da boca, em relação ao raio)
    eyeHeight: 0.38,
    eyeSpread: 0.28,
    eyeRadius: 0.5,
    mouthHeight: 0.05,
    mouthWidth: 0.42,
    stitches: 5,

    // Brilho verde em volta (aura)
    auraRadius: 30,
    auraAlpha: BLOATER_VISUALS.auraAlpha,

    // Tamanho no Last Torch: px por unidade = raio do monstro × isto (o desenho de cima usa raio × 1,28)
    scalePerRadius: 0.16
};
