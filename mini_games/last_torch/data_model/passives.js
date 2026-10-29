// --- SKILLS PASSIVAS ---
// Compradas com pontos de skill (ganhos ao subir de nível), não com moedas.
export const SKILL_POINTS_PER_LEVEL = 1;

export const PASSIVE_SKILL_MODELS = {
    shadowWhirl: {
        name: 'Shadow Whirl',
        icon: '🌀',
        cost: 2,
        maxLvl: 1,
        desc: 'The 3rd combo hit becomes a 360° spin that strikes every enemy in range.'
    },
    mirrorWard: {
        name: 'Mirror Ward',
        icon: '🛡️',
        cost: 2,
        maxLvl: 1,
        desc: 'Reflects an incoming enemy shot at the nearest monster. Recharges in 8s.'
    }
};

// Mirror Ward: rebate o tiro que chega perto do herói para o monstro mais próximo
export const MIRROR_WARD = {
    cooldownSeconds: 8,
    catchRadius: 34,            // distância do herói em que o tiro é rebatido (além do raio do tiro)
    speedMultiplier: 1.5,
    damageMultiplier: 2.5,      // dano do tiro original (vira dano no monstro)
    minimumDamage: 40,
    homingTurnRate: 4           // rad/s: o tiro rebatido curva suave até o alvo
};

export function createPassives() {
    return Object.fromEntries(
        Object.entries(PASSIVE_SKILL_MODELS).map(([key, model]) => [key, { ...model, lvl: 0 }])
    );
}
