// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/zombie/zombie25d_visual.js e rode o sync.
import { HUMAN_DEFAULTS, HUMAN_COLORS } from '../human25d_visual.js';

// --- DADOS VISUAIS: Zumbi 2.5D (zombie25d.js) ---
// Morto-vivo do cemitério: cabeça de pele verde-acinzentada, camisa rasgada com as COSTELAS à mostra, BRAÇOS DE OSSO esticados à frente, PERNAS DE OSSO
// (uma delas ARRASTA no chão em vez de dar o passo) e o corpo curvado, manquejando. Olhos amarelos mortiços e boca aberta. Montado por human25d.js (as escolhas ficam em `look`).
export const ZOMBIE_25D_VISUALS = {
    ...HUMAN_DEFAULTS,
    look: { legs: 'cloth', torso: 'tunic', pauldrons: false, tabard: null, helmet: 'none', plume: false, weapon: 'none', shield: false, tail: false, wings: false, cape: false, claws: true, armsForward: true, armsBare: true, boneArms: true, boneLegs: true, ribs: true, dragLeg: true },
    colors: {
        ...HUMAN_COLORS,
        aura: 'rgba(132, 204, 22, 0.3)',
        skin: '#86a070', skinShade: '#55704a', cloth: '#5a4a38', clothDark: '#3a2f24', clothLight: '#75634c', boot: '#2a2018',
        eye: '#fde68a', glow: '#facc15', ink: '#1c130a', wound: '#5a1f2a', claw: '#cfd6b8', bone: '#e0d8c2', boneDark: '#5e5742', hair: '#3a3a28', belt: '#2a2018', buckle: '#6b5b3a'
    },
    strideSpeed: 3.2,      // anda arrastado, devagar
    limp: 0.9,
    dragSide: 1,
    eyeGlow: 1.2,
    openMouth: true,
    armReach: 6.2,
    armSpread: 0.6,
    armDrop: 1.2,
    armSwing: 1,
    slouch: 1.4,
    armWidth: 1.8,
    legWidth: 2.2,
    headRadius: 2.4,
    bodyScale: 1.04,
    wounds: [[0, 1.3, 0.9], [0.1, -1.2, 0.6]],
};
