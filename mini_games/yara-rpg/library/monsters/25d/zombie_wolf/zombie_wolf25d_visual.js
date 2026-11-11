// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/zombie_wolf/zombie_wolf25d_visual.js e rode o sync.
import { ZOMBIE_WOLF_VISUALS } from '../../topdown/zombie_wolf/zombie_wolf_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Lobo Zumbi 2.5D (zombie_wolf25d.js) ---
// O Lobo Zumbi de topdown/zombie_wolf (lobo magro em galope, costelas à mostra, chama roxa na espinha e na ponta da
// cauda, crânio exposto de um lado, olhos que brilham e coleira de ferro partida) no corpo de lobo 2.5D (../wolf25d.js).
// As cores são as de topdown/zombie_wolf/zombie_wolf_visual.js. Medidas em unidades do boneco.
export const ZOMBIE_WOLF_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: { ...BASE_COLORS, ...ZOMBIE_WOLF_VISUALS.colors },
    strideSpeed: 12,

    // Corpo magro
    bodyLength: 10.5,
    bodyWidth: 4.3,
    hipHeight: 8.4,
    shoulderHeight: 9.8,
    bounce: 0.7,
    // Pescoço e cabeça
    neckLength: 3.8,
    headHeight: 11.4,
    headRadius: 2.3,
    snoutLength: 4.6,
    snoutWidth: 1.9,
    mouthOpen: 1.7,
    earLength: 2.8,
    eyeGlow: 1.7,
    // Patas finas
    legWidth: 1.4,
    legSpread: 1.9,
    stride: 3.8,
    footLift: 2.4,

    // Costelas à mostra nos flancos
    ribs: 5,
    ribPatchLength: 3.6,
    // Chama da maldição: ao longo da espinha e na ponta da cauda
    spineFlames: 8,
    flameHeight: 4.2,
    flameWidth: 0.9,
    tailLength: 6,
    tailFlame: 3.4,

    auraRadius: 22,
    auraAlpha: ZOMBIE_WOLF_VISUALS.auraAlpha,
    focusZ: 11,
    focusA: 11,
    scalePerRadius: 0.18
};
