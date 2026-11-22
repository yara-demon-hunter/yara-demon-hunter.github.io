// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/lancer/lancer25d_visual.js e rode o sync.
import { HUMAN_DEFAULTS, HUMAN_COLORS } from '../human25d_visual.js';

// --- DADOS VISUAIS: Lanceiro do Castelo 2.5D (lancer25d.js) ---
// Guarda do castelo do Gudran: armadura de aço escuro, elmo fechado de pluma roxa, tabardo roxo com a faixa prateada e uma lança comprida com bandeirola. Mantém a lança apontada à frente.
// Montado por human25d.js (as escolhas ficam em `look`). Medidas em unidades do boneco; cores aqui mesmo.
export const LANCER_25D_VISUALS = {
    ...HUMAN_DEFAULTS,
    look: { legs: 'greaves', torso: 'plate', pauldrons: true, tabard: '#3b1d5a', helmet: 'great', plume: true, weapon: 'spear', shield: false, tail: false, wings: false, cape: true, claws: false },
    colors: {
        ...HUMAN_COLORS,
        aura: 'rgba(167, 139, 250, 0.45)',
        armor: '#59627a', armorDark: '#2c3344', armorLight: '#98a3bd', rust: '#6b3a2a',
        tabardTrim: '#c4b5fd', glow: '#a78bfa', eye: '#ede9fe', plume: '#6d28d9', pennant: '#7c3aed',
        metal: '#aab3c8', metalDark: '#404860', metalLight: '#eef2ff',
        wood: '#6a4a2c', woodDark: '#2e2012',
        cape: '#5b21b6', capeFold: '#3b1478', capeEdge: '#7c3aed', capeInner: '#2a0f55'
    },
    capeSpread: 1.0, capeHemSpread: 1.1, capeLength: 0.55,
    strideSpeed: 6.8,
    weaponLength: 15.5,
    bodyScale: 1.1,
    chestWiden: 1.1,
    legWidth: 2.5,
    armWidth: 2.0,
    plumeLength: 5,
};
