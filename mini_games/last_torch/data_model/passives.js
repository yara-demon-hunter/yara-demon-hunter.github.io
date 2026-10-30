// --- SKILLS PASSIVAS ---
// Compradas com o ouro que os monstros dropam (cost = moedas). Os pontos de skill vão para os stats.

export const PASSIVE_SKILL_MODELS = {
    shadowWhirl: {
        name: 'Shadow Whirl',
        icon: '🌀',
        cost: 80,
        maxLvl: 1,
        desc: 'The 3rd combo hit becomes a 360° spin that strikes every enemy in range.'
    },
    mirrorWard: {
        name: 'Mirror Ward',
        icon: '🛡️',
        cost: 60,
        maxLvl: 1,
        desc: 'Reflects an incoming enemy shot at the nearest monster. Recharges in 8s.'
    },
    longThrow: {
        name: 'Long Throw',
        icon: '🎯',
        cost: 40,
        maxLvl: 1,
        desc: 'Thrown daggers fly 60% farther and faster.'
    },
    fanOfKnives: {
        name: 'Fan of Knives',
        icon: '🗡️',
        cost: 110,
        maxLvl: 1,
        desc: 'Throws 3 daggers at once in a fan. Combines with Long Throw.'
    },
    shadowClone: {
        name: 'Shadow Clone',
        icon: '👥',
        cost: 150,
        maxLvl: 1,
        desc: 'A shadow reflection walks and throws daggers with you, and slashes any monster that enters its own circle. If it falls, it returns after a while.'
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

// Shadow Clone: reflexo de sombra do herói. Fica sempre na mesma posição em relação a ele, anda junto,
// arremessa adagas junto (mesma direção) e solta as lâminas da Fúria junto. A espada é dele: golpeia
// sozinho quando um monstro entra no círculo dele. Usa os stats do herói com os multiplicadores abaixo.
// Leva dano de monstros e tiros como o herói; se morrer, volta depois de respawnSeconds. Não carrega a Fúria.
export const SHADOW_CLONE = {
    // DISTÂNCIA ENTRE O HERÓI E O CLONE (unidades do mundo). Maior = mais longe.
    // Com ~80 os círculos de alcance dos dois quase se encostam.
    followDistance: 150,
    // LADO EM QUE O CLONE FICA (graus): 0 = direita, 90 = abaixo, 180 = esquerda, 270 = acima
    offsetAngleDegrees: 180,
    damageMultiplier: 0.3,      // golpes e adagas do clone
    knockbackMultiplier: 0.3,
    radiusMultiplier: 0.9,      // alcance da lâmina do clone (círculo vermelho dele)
    cooldownMultiplier: 1,      // x recarga do golpe do herói (maior = golpeia mais devagar)
    // VIDA DO CLONE: fração da vida máxima do herói (sobe junto com o upgrade Hero Health)
    hpRatio: 0.5,
    // TEMPO PARA VOLTAR depois de morrer (segundos)
    respawnSeconds: 12
};
