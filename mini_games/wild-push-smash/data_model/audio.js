// --- SONS (sintetizados): [onda, freq. inicial, freq. final, duração (s), volume, atraso (s)] ---
// Onda 'noise' = chiado filtrado (as frequências são do filtro), bom para foguete, vento e explosão.
export const SOUNDS = {
    hit:   [['triangle', 300, 30, 0.18, 0.5]],
    coin:  [['sine', 800, 1200, 0.1, 0.2]],
    dash:  [['sine', 150, 600, 0.12, 0.3]],
    jump:  [['sine', 200, 450, 0.1, 0.15]],
    ko:    [['sawtooth', 400, 40, 0.6, 0.4]],
    smash: [['square', 130, 35, 0.3, 0.4], ['triangle', 700, 80, 0.15, 0.3]],
    land:  [['triangle', 160, 40, 0.15, 0.35]],
    eat:   [['sine', 300, 700, 0.08, 0.25], ['sine', 500, 900, 0.08, 0.2, 0.07]],
    deny:  [['square', 140, 110, 0.15, 0.12]],
    buy:   [['sine', 600, 1400, 0.15, 0.25]],
    taunt: [['square', 700, 900, 0.06, 0.1], ['square', 750, 1000, 0.06, 0.1, 0.1]],
    boom:  [['sawtooth', 90, 25, 0.7, 0.6], ['square', 60, 20, 0.5, 0.3]],
    beep:  [['sine', 660, 661, 0.12, 0.2]],
    go:    [['sine', 880, 1320, 0.25, 0.25]],
    // SKY DROP: decolagem do foguete (chiado subindo + ronco)
    rocket: [['noise', 300, 3500, 0.9, 0.55], ['sawtooth', 60, 420, 0.8, 0.12], ['noise', 150, 600, 0.5, 0.4]]
};

// SKY DROP: assobio de bomba/avião caindo enquanto está lá em cima (suspense). O tom desce e o volume sobe
// do começo ao fim dos 5 s; para na hora em que ele solta.
export const WHISTLE = {
    wave: 'sine',
    from: 1700, to: 420,       // Hz
    volumeFrom: 0.03, volumeTo: 0.13,
    vibratoHz: 6, vibratoDepth: 0.012    // tremidinha (fração da frequência)
};

// --- MÚSICA: loop de 8 colcheias (baixo + arpejo), frequências em Hz ---
export const MUSIC = {
    beatSeconds: 0.2,
    bass: [55, 55, 82.4, 55, 65.4, 65.4, 98, 82.4],
    arp: [220, 261.6, 329.6, 261.6, 293.7, 349.2, 440, 329.6],
    bassVolume: 0.07,
    arpVolume: 0.018
};
