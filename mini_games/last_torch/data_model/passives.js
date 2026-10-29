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
    },
    longThrow: {
        name: 'Long Throw',
        icon: '🎯',
        cost: 2,
        maxLvl: 1,
        desc: 'Thrown daggers fly 60% farther and faster.'
    },
    fanOfKnives: {
        name: 'Fan of Knives',
        icon: '🗡️',
        cost: 2,
        maxLvl: 1,
        desc: 'Throws 3 daggers at once in a fan. Combines with Long Throw.'
    }
};

// Long Throw: a adaga vai mais longe e mais rápido (vale para todas as adagas do leque)
export const LONG_THROW = {
    rangeMultiplier: 1.6,
    speedMultiplier: 1.25
};

// Fan of Knives: várias adagas de uma vez, abertas em leque em volta da mira
export const FAN_OF_KNIVES = {
    count: 3,
    spreadDegrees: 14           // ângulo entre uma adaga e a vizinha
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
