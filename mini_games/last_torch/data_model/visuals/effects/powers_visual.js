// --- DADOS VISUAIS: Poderes e itens. ---
// Lidos por js/render/powers.js e js/render/pickups.js. Só afeta o desenho.
export const POWERS_VISUALS = {
    orbit: { glow: 'rgba(103, 232, 249, 0.75)', evolvedGlow: 'rgba(253, 224, 71, 0.85)', scale: 0.72, glowRadius: 17 },
    fire: {
        colors: ['rgba(234, 88, 12, 0.8)', 'rgba(251, 146, 60, 0.8)', 'rgba(253, 224, 71, 0.85)'],
        glow: 'rgba(249, 115, 22, 0.75)',
        hostileColors: ['rgba(185, 28, 28, 0.85)', 'rgba(239, 68, 68, 0.85)', 'rgba(251, 146, 60, 0.9)'],
        hostileGlow: 'rgba(220, 38, 38, 0.75)',
        evolvedColors: ['rgba(220, 38, 38, 0.85)', 'rgba(249, 115, 22, 0.9)', 'rgba(254, 240, 138, 0.95)'],
        tongues: 3
    },
    lightning: { color: '#bae6fd', core: '#ffffff', glow: 'rgba(56, 189, 248, 0.35)', width: 3, coreWidth: 1.2, glowWidth: 11 },
    bolt: { glow: 'rgba(249, 115, 22, 0.9)', core: '#fff7ed', mid: '#fb923c', radius: 5, trail: 4, trailGap: 6 },
    star: { color: '#fde68a', glow: 'rgba(253, 224, 71, 0.9)', ring: 'rgba(253, 224, 71, 0.55)', height: 460, tail: 90 },
    chill: { ring: 'rgba(165, 243, 252, 0.35)', fill: 'rgba(103, 232, 249, 0.05)', flake: '#e0f2fe', flakes: 10 },
    frost: { color: 'rgba(186, 230, 253, 0.55)' },
    dashGhost: { color: 'rgba(56, 189, 248, 0.5)', core: 'rgba(224, 242, 254, 0.55)', radius: 13 },
    pickup: {
        meat: '#b45309', meatLight: '#f59e0b', bone: '#f5f5f4',
        oil: '#92400e', oilLight: '#fb923c', oilGlass: '#fed7aa',
        magnet: '#dc2626', magnetTip: '#e2e8f0',
        nova: '#fef08a', novaCore: '#ffffff',
        chest: '#78350f', chestLight: '#b45309', chestBand: '#fbbf24', chestLock: '#fef3c7',
        scale: 1.3,
        glowRadius: 26
    },
    elite: { ringWidth: 2.4, ringGap: 8, labelFont: "800 10px Inter, sans-serif" }
};
