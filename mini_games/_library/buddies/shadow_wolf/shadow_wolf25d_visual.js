import { SHADOW_WOLF_BUDDY_VISUALS } from './shadow_wolf_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../../monsters/25d/creature25d.js';

// --- DADOS VISUAIS: Lobo Sombrio aliado 2.5D (buddy, shadow_wolf25d.js) ---
// O corpo de lobo 2.5D (monsters/25d/wolf25d.js) do Shadow Wolf do Rowan: maior, agachado e peludo, com as CORES de shadow_wolf_visual.js.
// Medidas em unidades do boneco (o herói tem ~25 de altura).
export const SHADOW_WOLF_BUDDY_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: { ...BASE_COLORS, ...SHADOW_WOLF_BUDDY_VISUALS.colors },
    strideSpeed: 13,

    // Corpo: um pouco maior que o lobo inimigo e agachado para o ataque (ombros altos, garupa baixa)
    bodyLength: 11.5,
    bodyWidth: 6,
    hipHeight: 7,
    shoulderHeight: 9.6,
    bounce: 0.5,               // sobe e desce do galope
    // Pescoço e cabeça: baixos e para a frente, como quem vai morder
    neckLength: 3.8,
    headHeight: 7.8,
    headRadius: 3,
    snoutLength: 4.8,
    snoutWidth: 2.5,
    mouthOpen: 2.3,
    earLength: 3.2,
    eyeGlow: 2.6,
    // Patas
    legWidth: 2,
    legSpread: 2.7,
    stride: 3.8,
    footLift: 2.2,

    // Pelo e chama roxa
    maneTufts: 11,
    maneLength: 6,
    backTufts: 8,
    flankTufts: 4,
    tailLength: 9,
    tailFlames: 4,
    flames: 6,
    flameRise: 0.55,           // quão rápido a chama sobe (ciclos por segundo)
    flameHeight: 9,            // até onde sobe antes de sumir

    auraRadius: 20,
    auraAlpha: SHADOW_WOLF_BUDDY_VISUALS.auraAlpha,
    focusZ: 10.5,
    focusA: 11,
    scalePerRadius: 0.2,
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão do monstro
    center: 6
};
