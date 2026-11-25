// --- AS MÚSICAS DO LAST TORCH ---
// O motor (sequenciador) fica na biblioteca: library/sounds/core/music.js. Aqui só o tom do jogo: compassos e climas.
// Climas: menu, hunt, boss, camp, dawn, silent. Tudo em ré menor, tirando o boss (mi frígio).
// Baixo por compasso e notas do arpejo: Dm - Bb - Gm - A
const HUNT_BARS = [
    { bass: 38, chord: [62, 65, 69, 74] },
    { bass: 34, chord: [58, 62, 65, 70] },
    { bass: 31, chord: [55, 58, 62, 67] },
    { bass: 33, chord: [57, 61, 64, 69] }
];
// Frígio: a segunda menor deixa tudo mais ameaçador
const BOSS_BARS = [
    { bass: 28, chord: [64, 67, 71, 76] },
    { bass: 29, chord: [65, 68, 72, 77] },
    { bass: 28, chord: [64, 67, 71, 76] },
    { bass: 26, chord: [62, 65, 69, 74] }
];
const CAMP_BARS = [
    { bass: 38, chord: [62, 69, 74, 77] },
    { bass: 41, chord: [65, 72, 77, 81] },
    { bass: 34, chord: [62, 65, 70, 74] },
    { bass: 33, chord: [61, 64, 69, 73] }
];
const DAWN_BARS = [
    { bass: 38, chord: [62, 66, 69, 74] },
    { bass: 43, chord: [62, 67, 71, 74] },
    { bass: 40, chord: [64, 67, 71, 76] },
    { bass: 45, chord: [61, 64, 69, 73] }
];

export const MOODS = {
    silent: null,
    menu: { bpm: 54, bars: CAMP_BARS, pad: 0.05, bass: 0, kick: 0, snare: 0, hat: 0, arp: 0.05, arpEvery: 4, bell: 0.05 },
    hunt: { bpm: 104, bars: HUNT_BARS, pad: 0.035, bass: 0.16, kick: 0.5, snare: 0.1, hat: 0.03, arp: 0.045, arpEvery: 2, bell: 0 },
    boss: { boss: true, bpm: 142, bars: BOSS_BARS, pad: 0.05, bass: 0.2, kick: 0.62, snare: 0.18, hat: 0.05, arp: 0.055, arpEvery: 1, bell: 0 },
    camp: { bpm: 66, bars: CAMP_BARS, pad: 0.05, bass: 0.05, kick: 0, snare: 0, hat: 0, arp: 0.08, arpEvery: 2, bell: 0 },
    dawn: { bpm: 72, bars: DAWN_BARS, pad: 0.08, bass: 0.06, kick: 0, snare: 0, hat: 0, arp: 0.08, arpEvery: 2, bell: 0.05 }
};
