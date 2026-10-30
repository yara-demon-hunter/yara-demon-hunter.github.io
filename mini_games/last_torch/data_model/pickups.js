// --- ITENS NO CHÃO ---
// Soltos pelos monstros. O herói pega ao passar por cima (ou no fim da hora, junto com o ouro).
export const PICKUP_MODELS = {
    MEAT: { label: 'Roast', color: '#fca5a5', weight: 0.42, healRatio: 0.3 },
    OIL: { label: 'Torch Oil', color: '#fdba74', weight: 0.3, torchHeal: 14 },
    MAGNET: { label: 'Magnet', color: '#7dd3fc', weight: 0.16 },
    NOVA: { label: 'Holy Flare', color: '#fef08a', weight: 0.12, damageRatio: 5, knockback: 420 },
    CHEST: { label: 'Treasure', color: '#fbbf24', weight: 0 }      // só de elites e bosses
};

export const PICKUP_DROP = {
    chancePerKill: 0.04,
    pityKills: 30,              // sem nenhum item há tantas mortes: o próximo cai com certeza
    lifeSeconds: 16,            // some depois disso (pisca nos últimos segundos)
    blinkSeconds: 4,
    radius: 15,                 // distância extra para pegar (somada ao raio do herói)
    bobHeight: 3,
    maxOnGround: 6
};

// Baú: pontos de skill para a árvore (sorteio com pesos)
export const CHEST_REWARDS = [
    { points: 1, weight: 0.85 },
    { points: 2, weight: 0.15 }
];

export function rollPickupType(random = Math.random) {
    const types = Object.keys(PICKUP_MODELS).filter(type => PICKUP_MODELS[type].weight > 0);
    const total = types.reduce((sum, type) => sum + PICKUP_MODELS[type].weight, 0);
    let roll = random() * total;
    for (const type of types) {
        roll -= PICKUP_MODELS[type].weight;
        if (roll < 0) return type;
    }
    return 'MEAT';
}

export function rollChestPoints(random = Math.random) {
    let roll = random();
    for (const reward of CHEST_REWARDS) {
        roll -= reward.weight;
        if (roll < 0) return reward.points;
    }
    return CHEST_REWARDS[0].points;
}
