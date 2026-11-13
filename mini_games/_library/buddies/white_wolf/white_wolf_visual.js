// --- DADOS VISUAIS: Lobo Branco. ---
// O mesmo lobo do Lobo Sombrio (topdown/shadow_wolf), em outras cores: pelo branco-prateado com mechas de gelo, juba
// desgrenhada, olhos azul-gelo e a traseira se desfazendo em névoa clara (no lugar da fumaça preta).
// Só tem as CORES (o desenho é o 2.5D, white_wolf25d.js). É um BUDDY, não um monstro: o aliado do Rowan (The White Wolf,
// evolução do Shadow Wolf dele), por isso não há desenho de cima nem entrada em MONSTER_MODELS.
export const WHITE_WOLF_VISUALS = {
    scale: 1.45,
    colors: {
        fur: '#dde6f0',
        furDark: '#97a8bf',
        furMid: '#c4d0de',
        furLight: '#ffffff',
        ink: '#1f2638',
        smoke: '#e8f1fb',
        mouth: '#b4506b',
        fang: '#ffffff',
        claw: '#f4fffd',
        nose: '#2a2f3d',
        eye: '#7dd3fc',
        eyeGlow: 'rgba(125, 211, 252, 0.9)',
        // O espectro que sai do corpo, como o do Lobo Sombrio mas verde-azulado claro: da base escura à ponta clara
        flameDark: '#0f766e',
        flame: '#2dd4bf',
        flameLight: '#ccfbf1',
        aura: 'rgba(94, 234, 212, 0.75)'
    },
    gallopHz: 2.8,
    auraRadius: 2.1,
    auraAlpha: 0.22,
    shadowAlpha: 0.3,
    healthBarOffset: 10
};
