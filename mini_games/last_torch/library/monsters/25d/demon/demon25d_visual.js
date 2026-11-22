// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/demon/demon25d_visual.js e rode o sync.
import { HUMAN_DEFAULTS, HUMAN_COLORS } from '../human25d_visual.js';

// --- DADOS VISUAIS: Demônio Soldado 2.5D (demon25d.js) ---
// Demônio menor do castelo: pele vermelho-escura, chifres curvos, presas, asas pequenas de morcego, rabo com ponta de lança, garras e o peito em brasa. Postura agachada e agressiva.
// Montado por human25d.js (as escolhas ficam em `look`). Medidas em unidades do boneco; cores aqui mesmo.
export const DEMON_25D_VISUALS = {
    ...HUMAN_DEFAULTS,
    look: { legs: 'cloth', torso: 'bare', pauldrons: false, tabard: null, helmet: 'horned', plume: false, weapon: 'none', shield: false, tail: true, wings: true, cape: false, claws: true },
    colors: {
        ...HUMAN_COLORS,
        aura: 'rgba(251, 146, 60, 0.5)',
        skin: '#b4332a', skinShade: '#7a1d18', hair: '#2a1410', horn: '#2a1c14', glow: '#fb923c', eye: '#fef08a', ink: '#1a0806',
        claw: '#f1e6d0', wing: '#5c1a1a', wingBone: '#220a0a', fang: '#fff7ed', wound: '#fb923c', boot: '#3a1410'
    },
    strideSpeed: 7.5,
    eyeGlow: 2.2,
    fangs: true,
    chestGlow: 5,
    bodyScale: 1.08,
    armWidth: 2.0,
    legWidth: 2.4,
    clawLength: 1.8,
    tailLength: 8,
    wingSpan: 8,
    wingHeight: 8,
    wounds: [[0, 0, 0.9], [0.1, -1.4, 0.5], [0.1, 1.4, 0.5]],
};
