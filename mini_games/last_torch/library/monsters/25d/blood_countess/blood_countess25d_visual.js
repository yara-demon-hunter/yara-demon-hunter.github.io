// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/blood_countess/blood_countess25d_visual.js e rode o sync.
import { VAMPIRE_25D_VISUALS } from '../vampire/vampire25d_visual.js';

// --- DADOS VISUAIS: Blood Countess 2.5D (blood_countess25d.js) ---
// Chefe da Castle (onda 16), pela imagem de referência (art_reference/images/blood-countess.webp): vampiro nobre de pele cinza-pálida, cabelo prateado
// penteado para trás, olhos vermelhos, gola alta preta com forro vinho, capa preta e armadura escura com filigrana prateada (ombreiras ornamentadas)
// e uma joia vermelha no colo. É o corpo do Vampiro (../vampire/) com `armor` ligado e outras cores.
export const BLOOD_COUNTESS_25D_VISUALS = {
    ...VAMPIRE_25D_VISUALS,
    colors: {
        ...VAMPIRE_25D_VISUALS.colors,
        cape: '#101015', capeShade: '#050507', capeEdge: '#2a2a33', outline: '#050507',
        lining: '#8e1b2a', liningLight: '#c02b3d', collar: '#14141a', collarLining: '#8e1b2a',
        skin: '#c9c7d6', skinShade: '#8e8ca3',
        hair: '#aeb5c2', hairShine: '#eef1f7',
        eye: '#ef4444', eyeGlow: 'rgba(239, 68, 68, 0.95)', fang: '#f8fafc',
        suit: '#1a1318', suitLight: '#30222a', body: '#1a1318', trim: '#bcc2d1',
        armor: '#22222b', armorLight: '#3b3b49',
        medallion: '#e11d2e', medallionRim: '#a8aebc', aura: 'rgba(190, 24, 44, 0.5)'
    },
    armor: true,
    medallionRadius: 0.85,
    headRadius: 2.8,
    collarHeight: 4.2,
    collarSpread: 4.2,
    capeSpread: 1.4,
    capeHemSpread: 1.4,
    bodyScale: 1.08,
    auraRadius: 22,
    center: 12.5
};
