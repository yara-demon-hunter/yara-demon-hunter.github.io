// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/treant/treant25d_visual.js e rode o sync.
import { CREATURE_DEFAULTS, BASE_COLORS } from '../../monsters/25d/creature25d.js';

// --- DADOS VISUAIS: Treant 2.5D (buddy: a árvore andante, treant25d.js) ---
// O carvalho evoluído (Ancient Grove, no Last Torch) arranca as raízes do chão e sai andando: tronco grosso com uma cara
// entalhada, copa de folhas, dois braços de galho e duas pernas de raiz. Medidas em unidades do boneco (o herói tem ~25 de
// altura; o treant tem ~34). Só afeta o desenho; vida, golpe e andar ficam no jogo.
export const TREANT_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: {
        ...BASE_COLORS,
        bark: '#5b3b22',
        barkDark: '#33200f',
        barkLight: '#8a5d36',
        moss: '#4d7c0f',
        leaf: '#2f8f46',
        leafDark: '#1b5a2c',
        leafLight: '#74d66b',
        eye: '#fbbf24',
        eyeGlow: 'rgba(251, 191, 36, 0.95)',
        mouth: '#140a04',
        ink: '#120a05',
        aura: 'rgba(74, 222, 128, 0.55)'
    },
    strideSpeed: 7,                // passos lentos e pesados

    // Corpo
    hipHeight: 14,
    chestHeight: 26,
    trunkWidth: 6.6,               // grossura do tronco
    legWidth: 3.2,
    legSpread: 3.6,
    stride: 4.2,
    footLift: 2.4,
    bounce: 0.5,
    // Braços de galho
    armWidth: 2.6,
    armLength: 15,
    // Copa
    crownHeight: 33,
    crownRadius: 8.5,
    crownBlobs: 9,

    auraRadius: 22,
    auraAlpha: 0.2,
    focusZ: 18,
    focusA: 14,
    scalePerRadius: 0.18,
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão
    center: 16
};
