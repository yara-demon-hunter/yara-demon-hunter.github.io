// --- PASSIVAS ---
// type 'skill': aprendidas na árvore de skills, com pontos (data_model/tree.js).
// Sem type (relíquias): compradas com ouro na árvore de relíquias do acampamento (data_model/relics.js),
// onde cost é o preço base em moedas.
// mods: efeitos simples, somados por js/systems/modifiers.js. As skills têm mecânica própria.

export const PASSIVE_SKILL_MODELS = {
    shadowWhirl: {
        name: 'Shadow Whirl',
        icon: '🌀',
        cost: 80,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'The 3rd combo hit becomes a 360° spin that strikes every enemy in range.'
    },
    mirrorWard: {
        name: 'Mirror Ward',
        icon: '🪞',
        cost: 60,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Reflects an incoming enemy shot at the nearest monster. Recharges in 8s.'
    },
    longThrow: {
        name: 'Long Throw',
        icon: '🏹',
        cost: 40,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Thrown daggers fly 60% farther and faster.'
    },
    fanOfKnives: {
        name: 'Fan of Knives',
        icon: '🔱',
        cost: 110,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Throws 3 daggers at once in a fan. Combines with Long Throw.'
    },
    shadowClone: {
        name: 'Shadow Clone',
        icon: '👥',
        cost: 150,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'A shadow reflection walks with you and slashes any monster that enters its own circle. If it falls, it returns after a while.'
    },
    greedyIdol: {
        name: 'Greedy Idol',
        icon: '🗿',
        cost: 70,
        maxLvl: 1,
        desc: '+35% gold, but -12% max health.',
        mods: { gold: 0.35, maxHp: -0.12 }
    },
    emberFlask: {
        name: 'Ember Flask',
        icon: '🏺',
        cost: 90,
        maxLvl: 1,
        desc: 'The torch slowly recovers: +1 health every 2 seconds.',
        mods: { torchRegen: 0.5 }
    },
    secondPrayer: {
        name: 'Second Prayer',
        icon: '📿',
        cost: 170,
        maxLvl: 1,
        desc: 'Rise once with half your health when you fall.',
        mods: { revives: 1 }
    },
    boneCharm: {
        name: 'Bone Charm',
        icon: '🦴',
        cost: 85,
        maxLvl: 1,
        desc: '+1 dash charge.',
        mods: { dashCharges: 1 }
    },
    witchEye: {
        name: "Witch's Eye",
        icon: '🔮',
        cost: 130,
        maxLvl: 1,
        desc: 'Every third level grants an extra skill point.',
        mods: { levelPoints: 0.34 }
    },
    berserkDraught: {
        name: 'Berserk Draught',
        icon: '🧪',
        cost: 80,
        maxLvl: 1,
        desc: '+60% damage while under 35% health.',
        mods: { lowHpDamage: 0.6 }
    },
    thornCrown: {
        name: 'Crown of Thorns',
        icon: '👑',
        cost: 75,
        maxLvl: 1,
        desc: 'Monsters that touch you take 150% of your blade damage.',
        mods: { thorns: 1.5 }
    },
    ironHeart: {
        name: 'Iron Heart',
        icon: '🫀',
        cost: 120,
        maxLvl: 1,
        desc: 'Take 18% less damage.',
        mods: { damageTaken: -0.18 }
    },
    luckyCoin: {
        name: 'Lucky Coin',
        icon: '🍀',
        cost: 65,
        maxLvl: 1,
        desc: 'Chests give +1 skill point and you find 10% more gold.',
        mods: { chestPoints: 1, gold: 0.1 }
    },
    hunterMark: {
        name: 'Hunter Mark',
        icon: '🎖️',
        cost: 95,
        maxLvl: 1,
        desc: 'Daggers deal +50% damage and recharge 20% faster.',
        mods: { knifeDamage: 0.5, knifeCooldown: 0.2 }
    },
    warmCloak: {
        name: 'Warm Cloak',
        icon: '🧥',
        cost: 55,
        maxLvl: 1,
        desc: 'The warmth of the torch reaches twice as far and heals twice as fast.',
        mods: { warmth: 1 }
    },
    furyStone: {
        name: 'Fury Stone',
        icon: '💢',
        cost: 100,
        maxLvl: 1,
        desc: 'Fury lasts 2 seconds longer and charges 25% faster.',
        mods: { furyDuration: 2, furyCharge: 0.25 }
    }
};

// --- ACAMPAMENTO ---
// Fim de cada hora: o ouro compra relíquias na árvore do acampamento e também alimenta a tocha.
export const CAMP = {
    costMultiplier: 1.35,
    costGrowthPerHour: 0.15,        // relíquias ficam mais caras a cada hora
    fuel: { heal: 30, cost: 40, costPerHour: 12, costPerUse: 25 },
    rest: { healRatio: 0.5, cost: 30, costPerHour: 9, costPerUse: 20 }
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
// solta as lâminas da Fúria junto. A espada é dele: golpeia
// sozinho quando um monstro entra no círculo dele. Usa os stats do herói com os multiplicadores abaixo.
// Leva dano de monstros e tiros como o herói; se morrer, volta depois de respawnSeconds. Não carrega a Fúria.
export const SHADOW_CLONE = {
    // DISTÂNCIA ENTRE O HERÓI E O CLONE (unidades do mundo). Maior = mais longe.
    // Com ~80 os círculos de alcance dos dois quase se encostam.
    followDistance: 150,
    // LADO EM QUE O CLONE FICA (graus): 0 = direita, 90 = abaixo, 180 = esquerda, 270 = acima
    offsetAngleDegrees: 180,
    damageMultiplier: 0.3,      // golpes do clone
    knockbackMultiplier: 0.3,
    radiusMultiplier: 0.9,      // alcance da lâmina do clone (círculo vermelho dele)
    cooldownMultiplier: 1,      // x recarga do golpe do herói (maior = golpeia mais devagar)
    // VIDA DO CLONE: fração da vida máxima do herói (sobe junto com o upgrade Hero Health)
    hpRatio: 0.5,
    // TEMPO PARA VOLTAR depois de morrer (segundos)
    respawnSeconds: 12
};
