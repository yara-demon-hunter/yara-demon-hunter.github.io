// --- DADOS VISUAIS: Sensação de impacto. ---
// Tudo que responde a um golpe: clarão no monstro, números de dano, pedaços, manchas no chão, ondas
// de choque. Lidos por js/systems/effects.js e js/render/effects.js. Só afeta o desenho.
export const JUICE_VISUALS = {
    hitFlashSeconds: 0.09,
    hitRecoil: 3,               // quanto o monstro treme ao ser atingido
    hitStopCooldownSeconds: 0.22,

    // Números de dano
    number: {
        seconds: 0.62,
        rise: 34,
        outline: '#0b0f19',
        outlineWidth: 3,
        popSeconds: 0.09,
        popScale: 1.6,
        maxActive: [22, 14, 8]      // por nível de detalhe
    },

    // Estilos dos números (cada um vira um atlas em js/render/fx/numbers.js)
    numberStyles: {
        normal: { font: '800 15px Inter, sans-serif', size: 15, color: '#f1f5f9' },
        crit: { font: '900 22px Cinzel, serif', size: 22, color: '#fde047' },
        storm: { font: '800 15px Inter, sans-serif', size: 15, color: '#bae6fd' },
        hurt: { font: '800 14px Inter, sans-serif', size: 14, color: '#fb7185' },
        heal: { font: '800 14px Inter, sans-serif', size: 14, color: '#86efac' },
        torch: { font: '800 14px Inter, sans-serif', size: 14, color: '#fb923c' }
    },

    // Textos que sobem (ouro, cura, avisos)
    floater: { seconds: 1, rise: 40, font: "800 14px Inter, sans-serif", outline: '#0b0f19', outlineWidth: 3 },

    // Pedaços que voam ao morrer
    gibs: {
        maxActive: [44, 26, 12],    // por nível de detalhe
        gravity: 520,
        bounce: 0.35,
        speedMin: 70,
        speedMax: 240,
        liftMin: 90,
        liftMax: 240,
        lifeMin: 0.7,
        lifeMax: 1.3
    },
    // Quantidade e cores dos pedaços por monstro
    deathBits: {
        SKELETON: { count: 6, colors: ['#e7e0cf', '#b9b09a', '#8f8772'], shape: 'bone', stain: 'rgba(14, 12, 9, 0.5)' },
        BAT: { count: 4, colors: ['#3b1d5c', '#7c3aed', '#2a1740'], shape: 'shard', stain: 'rgba(24, 8, 44, 0.5)' },
        VAMPIRE: { count: 6, colors: ['#7f1d1d', '#1c1917', '#b91c1c'], shape: 'shard', stain: 'rgba(48, 6, 10, 0.62)' },
        WITCH: { count: 6, colors: ['#581c87', '#f50bca', '#2e1065'], shape: 'shard', stain: 'rgba(30, 8, 48, 0.55)' },
        MOTH: { count: 4, colors: ['#d6b98a', '#8a6d47', '#f5e6c8'], shape: 'shard', stain: 'rgba(30, 22, 12, 0.42)' },
        BLOATER: { count: 8, colors: ['#a3e635', '#4d7c0f', '#d9f99d'], shape: 'blob', stain: 'rgba(30, 48, 6, 0.62)' },
        WRAITH: { count: 5, colors: ['#a5f3fc', '#0e7490', '#ecfeff'], shape: 'shard', stain: 'rgba(6, 30, 38, 0.42)' },
        NECROMANCER: { count: 6, colors: ['#86efac', '#14532d', '#e7e0cf'], shape: 'bone', stain: 'rgba(6, 30, 16, 0.55)' },
        HERO: { count: 20, colors: ['#07222d', '#0b2f3c', '#38bdf8', '#e8eef2'], shape: 'shard', stain: 'rgba(4, 14, 20, 0.6)' },
        BOSS: { count: 28, colors: ['#fde047', '#f97316', '#dc2626', '#f1f5f9'], shape: 'shard', stain: 'rgba(44, 6, 8, 0.7)' }
    },

    // Manchas no chão, para o campo de batalha contar o que aconteceu
    stains: { maxActive: 18, lifeSeconds: 12, fadeSeconds: 3, splatters: 3 },

    // Soco de zoom e clarão
    zoomPunchDecay: 7,
    flashDecay: 4.5,

    // Avisos no chão
    telegraph: {
        color: 'rgba(248, 113, 113, 0.95)',
        fill: 'rgba(220, 38, 38, 0.26)',
        lineCore: 'rgba(165, 243, 252, 0.95)',
        lineGlow: 'rgba(34, 211, 238, 0.25)'
    },

    // Olhos sobre a névoa (fora da luz da tocha e do herói)
    fogEyes: { color: 'rgba(248, 113, 113, 0.9)', core: '#fecaca', glowAlpha: 0.5, torchLightRatio: 0.62, heroLightRatio: 0.55 },

    // Fim de hora: onda de fogo saindo da tocha
    clearWave: { width: 46, color: '253, 186, 116', coreColor: '255, 247, 237' },

    // Amanhecer
    dawn: {
        sunX: 0.86,
        sunY: -0.08,
        sunColor: '255, 196, 120',
        skyColor: '255, 138, 92',
        horizonColor: '190, 110, 150',
        rays: [
            { angle: 1.75, width: 0.07, alpha: 0.3 },
            { angle: 2.05, width: 0.05, alpha: 0.24 },
            { angle: 2.32, width: 0.09, alpha: 0.28 },
            { angle: 2.62, width: 0.05, alpha: 0.22 },
            { angle: 2.9, width: 0.06, alpha: 0.2 }
        ]
    },

    // Tocha pedindo socorro e calor em volta dela
    torchAlarm: { color: 'rgba(248, 113, 113, 0.75)', pulseHz: 1.6 },
    warmth: { color: 'rgba(251, 146, 60, 0.12)', ringColor: 'rgba(253, 186, 116, 0.28)' }
};
