// --- ELITES ---
// Qualquer monstro comum pode vir como elite: maior, mais duro, com aura colorida. Morto, solta um baú.
export const ELITE_MODIFIERS = {
    BRUTE: { label: 'Brute', color: '#ef4444', hp: 8, speed: 0.85, radiusScale: 1.55, damage: 1.5, knockbackResist: 0.75 },
    SWIFT: { label: 'Swift', color: '#38bdf8', hp: 5, speed: 1.65, radiusScale: 1.3, damage: 1.2, knockbackResist: 0.4 },
    BLAZING: { label: 'Blazing', color: '#f97316', hp: 6, speed: 1.05, radiusScale: 1.4, damage: 1.3, knockbackResist: 0.5, flameTrail: true }
};

// Monstros que podem virar elite
export const ELITE_TYPES = ['SKELETON', 'VAMPIRE', 'WRAITH', 'BLOATER'];

export function rollElite(random = Math.random) {
    const keys = Object.keys(ELITE_MODIFIERS);
    return ELITE_MODIFIERS[keys[Math.floor(random() * keys.length)]];
}
