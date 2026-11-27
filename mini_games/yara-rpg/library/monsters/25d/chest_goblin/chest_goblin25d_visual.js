// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/chest_goblin/chest_goblin25d_visual.js e rode o sync.
import { HUMAN_DEFAULTS, HUMAN_COLORS } from '../human25d_visual.js';

// --- DADOS VISUAIS: Goblin do Baú 2.5D (chest_goblin25d.js) ---
// Goblin pequeno e magrelo, de pele verde, cabeça grande, orelhas enormes, sorrisão cheio de dentes e o BAÚ do jogo amarrado nas costas.
// Medidas em unidades do boneco; cores aqui mesmo. As cores do baú (chest*) são as do item Treasure do Last Torch (powers_visual.js > pickups).
export const CHEST_GOBLIN_25D_VISUALS = {
    ...HUMAN_DEFAULTS,
    look: { legs: 'cloth', torso: 'tunic', pauldrons: false, tabard: null, helmet: 'cap', plume: false, weapon: 'none', shield: false, tail: false, wings: false, cape: false, claws: false, ears: true, grin: true, backChest: true },
    colors: {
        ...HUMAN_COLORS,
        aura: 'rgba(250, 204, 21, 0.45)',
        skin: '#7fb04a', skinShade: '#4f7a2c',
        cloth: '#6b4a2a', clothDark: '#3d2a18', clothLight: '#8a6238',
        eye: '#fef08a', hair: '#2b3a14',
        hat: '#16a34a', hatDark: '#15803d', hatLight: '#4ade80', hatBand: '#fbbf24',      // o chapeuzinho verde
        // O baú do jogo (data_model/visuals/effects/powers_visual.js): madeira, tampa clara, cintas e fecho dourados
        chest: '#78350f', chestDark: '#5a2808', chestLight: '#b45309', chestBand: '#fbbf24', chestLock: '#fef3c7'
    },
    chest: { halfWidth: 3.1, halfDepth: 2.1, halfHeight: 2.1, behind: 3.2, drop: 3.4 },
    earLength: 3.4,
    fangs: true,
    headRadius: 3.1,                 // cabeção
    armWidth: 1.4, legWidth: 1.7, handRadius: 1,
    strideSpeed: 10,
    bodyScale: 0.8,
    hurtFlashSeconds: 0.1,
    scalePerRadius: 0.16
};
