// --- DADOS VISUAIS: corrente do Shadow Shackle. ---
// Lidos por js/render/shackle.js. Só afeta o desenho.
export const SHACKLE_VISUALS = {
    pixels: 3,                  // pixels do sprite por unidade do mundo
    link: { length: 11, width: 7, spacing: 8.5 },   // elo (a distância entre elos é menor que o elo: eles se encaixam)
    sag: 0.06,                  // quanto a corrente lançada barriga, em relação ao comprimento
    stakes: 4,                  // estacas em volta do monstro preso
    stakeGap: 20,               // distância da estaca até a borda do monstro
    groundSquash: 0.62,         // o anel de estacas é achatado, como um círculo visto no chão
    fadeSeconds: 1.2,           // nos últimos segundos a corrente pisca, avisando que vai soltar
    breakLinks: 14,             // fagulhas quando a corrente arrebenta

    metal: { dark: '#1e1b3a', mid: '#5b5694', light: '#c7d2fe', edge: '#0b0a18' },
    glow: 'rgba(124, 58, 237, 0.5)',
    glowHot: 'rgba(196, 181, 253, 0.8)',
    burstColor: '#a78bfa'
};
