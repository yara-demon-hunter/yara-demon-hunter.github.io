// --- DADOS VISUAIS: Lobo Branco. ---
// Segue a arte de art_reference/images/white_wolf.webp: lobo de pelo branco-gelo com sombras verde-azuladas, contorno
// petróleo escuro, olhos azuis acesos e a boca aberta rosnando. O corpo inteiro arde num ESPECTRO verde-água: chamas
// sobem do lombo, a juba é feita de labaredas, as patas soltam fogo e a cauda é uma labareda grande curvada para cima.
// Só tem as CORES (o desenho é o 2.5D, white_wolf25d.js). É um BUDDY, não um monstro: o aliado do Rowan (The White Wolf,
// evolução do Shadow Wolf dele), por isso não há desenho de cima nem entrada em MONSTER_MODELS.
export const WHITE_WOLF_VISUALS = {
    scale: 1.45,
    colors: {
        fur: '#e8f7f8',
        furDark: '#93c4c8',
        furMid: '#c4e6e8',
        furLight: '#ffffff',
        ink: '#0c3a40',
        smoke: '#99f6e4',
        mouth: '#1b2b33',
        fang: '#ffffff',
        claw: '#f0fdfa',
        nose: '#0c2a30',
        eye: '#38bdf8',
        eyeGlow: 'rgba(56, 189, 248, 0.95)',
        // O espectro verde-água que envolve o corpo: da base escura à ponta clara
        flameDark: '#0d9488',
        flame: '#2dd4bf',
        flameLight: '#ccfbf1',
        aura: 'rgba(45, 212, 191, 0.8)'
    },
    gallopHz: 2.8,
    auraRadius: 2.4,
    auraAlpha: 0.32,
    shadowAlpha: 0.3,
    healthBarOffset: 10
};
