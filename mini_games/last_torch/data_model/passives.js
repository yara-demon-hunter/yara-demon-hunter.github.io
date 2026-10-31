// --- PASSIVAS ---
// type 'skill': aprendidas na árvore de skills, com pontos (data_model/tree.js).
// Sem type (relíquias): compradas com ouro na árvore de relíquias do acampamento (data_model/relics.js),
// onde cost é o preço base em moedas.
// mods: efeitos simples, somados por js/systems/modifiers.js. As skills têm mecânica própria.

export const PASSIVE_SKILL_MODELS = {
    shadowWhirl: {
        name: 'Whirlwind',
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
    masterThief: {
        name: 'Master Thief',
        icon: '🦝',
        cost: 60,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Dash through monsters to pick their pockets. A Perfect Dodge steals a fistful of gold.'
    },
    warCry: {
        name: 'War Cry',
        icon: '📣',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Surrounded by 5 monsters, you roar: they are thrown back and stunned, and your blade hits 30% harder for 4s.'
    },
    executioner: {
        name: 'Executioner',
        icon: '🪓',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Your blade finishes off monsters under 20% health in one brutal cut. Elites under 10%. Bosses are immune.'
    },
    smokeBomb: {
        name: 'Smoke Bomb',
        icon: '🌫️',
        cost: 70,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Every dash leaves a long trail of smoke that lingers for 7 seconds. Monsters inside it slow down, and every hit they take, from blade or dagger, is a critical hit.'
    },
    vigil: {
        name: 'Vigil',
        icon: '⚜️',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Stand still for a moment to raise a flame shield. It stops one hit and bursts, burning what is near. Returns after 6s.'
    },
    backdraft: {
        name: 'Backdraft',
        icon: '🎆',
        cost: 70,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Every monster that reaches the torch sets off a blast of fire around it.'
    },
    phoenixPact: {
        name: 'Phoenix Pact',
        icon: '🦅',
        cost: 130,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Once per hour, when you fall, the torch burns 30 of its health to raise you in a storm of fire.'
    },

    // --- JURAMENTOS ---
    // oath: true = só um por noite (js/systems/tree.js). Um modo de jogar inteiro, com bônus e um preço.
    // gear: forma do herói (data_model/visuals/characters/oath_visual.js)
    oathSlaughter: {
        name: 'Oath of Slaughter',
        icon: '☠️',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        oath: true, gear: 'slaughter', tagline: 'Blood answers blood',
        desc: '+35% blade damage, +10% attack speed, +40% Fury charge, every kill heals 1 and monsters come for you from farther away. The price: the warmth of the torch no longer heals you, and you can no longer throw daggers.',
        mods: { bladeDamage: 0.35, attackSpeed: 0.1, furyCharge: 0.4, killHeal: 1, provoke: 0.5, noWarmthHeal: 1, noKnives: 1 }
    },
    oathWhispers: {
        name: 'Oath of Whispers',
        icon: '🤫',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        oath: true, gear: 'whispers', tagline: 'Never where they strike',
        desc: '+1 dash charge, 20% shorter dash cooldown, +15% move speed, +10% crit and +50% dagger damage. The price: -25% max health.',
        mods: { dashCharges: 1, dashCooldown: 0.2, moveSpeed: 0.15, critChance: 0.1, knifeDamage: 0.5, maxHp: -0.25 }
    },
    oathHearth: {
        name: 'Oath of the Hearth',
        icon: '🛡️',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        oath: true, gear: 'hearth', tagline: 'The flame will not die',
        desc: 'The torch takes 35% less damage, +30% max health, its warmth reaches twice as far and burns monsters inside it. The price: -15% move speed.',
        mods: { torchGuard: 0.35, maxHp: 0.3, warmth: 1, warmthBurn: 0.4, moveSpeed: -0.15 }
    },
    oathRuin: {
        name: 'Oath of Ruin',
        icon: '📕',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        oath: true, gear: 'ruin', tagline: 'The dark pays in kind',
        desc: 'Spells deal 20% more damage and recharge 12% faster. The price: your blade deals 40% less damage.',
        mods: { spellDamage: 0.2, spellHaste: 0.12, bladeDamage: -0.4 }
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
    },
    hearthstone: { name: 'Hearthstone', icon: '🧱', cost: 70, maxLvl: 1, desc: '+30 torch health.', mods: { torchHp: 30 } },
    oldScars: { name: 'Old Scars', icon: '🩹', cost: 60, maxLvl: 1, desc: '+20 hero health.', mods: { maxHpFlat: 20 } },
    whetstone: { name: 'Whetstone', icon: '⚒️', cost: 85, maxLvl: 1, desc: '+12% damage.', mods: { damage: 0.12 } },
    wornBoots: { name: 'Worn Boots', icon: '👢', cost: 60, maxLvl: 1, desc: '+6% move speed.', mods: { moveSpeed: 0.06 } },
    coinPurse: { name: 'Coin Purse', icon: '🪙', cost: 55, maxLvl: 1, desc: '+15% gold.', mods: { gold: 0.15 } },
    hunterLore: { name: 'Hunter Lore', icon: '📖', cost: 70, maxLvl: 1, desc: '+10% XP.', mods: { xp: 0.1 } },
    smolderingRage: { name: 'Smoldering Rage', icon: '🧨', cost: 70, maxLvl: 1, desc: '+20% Fury charge.', mods: { furyCharge: 0.2 } },
    // grantPoints: pontos de skill entregues uma vez, na compra
    huntersNotes: { name: "Hunter's Notes", icon: '📜', cost: 110, maxLvl: 1, desc: 'Gain 2 skill points right away.', grantPoints: 2 },
    treasureSense: { name: 'Treasure Sense', icon: '🗝️', cost: 95, maxLvl: 1, desc: 'Chests give +1 skill point.', mods: { chestPoints: 1 } },
    lastPrayer: { name: 'Last Prayer', icon: '🙏', cost: 200, maxLvl: 1, desc: 'Rise once more when you fall.', mods: { revives: 1 } }
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

// War Cry: cercado por `monsters` monstros a menos de triggerRadius, o herói ruge
export const WAR_CRY = {
    monsters: 5,
    triggerRadius: 110,
    radius: 190,                // alcance do rugido
    cooldownSeconds: 14,
    knockback: 620,
    stunSeconds: 1,
    damage: 1.2,
    bladeBonus: 0.3,            // dano extra da lâmina depois do rugido
    bonusSeconds: 4
};

// Executioner: fração da vida abaixo da qual a lâmina termina o serviço
export const EXECUTIONER = {
    threshold: 0.2,
    eliteThreshold: 0.1,
    furyCharge: 4
};

// Smoke Bomb: o dash deixa um rasto de fumaça. Quem está nela anda devagar e todo golpe que recebe é crítico
export const SMOKE_BOMB = {
    seconds: 7,                 // quanto tempo cada nuvem fica
    radius: 58,
    spacing: 34,                // distância entre uma nuvem e a seguinte ao longo do dash
    slow: 0.65,
    maxClouds: 14
};

// Master Thief: dash atravessando monstros rouba ouro (uma vez de cada monstro, por dash)
export const MASTER_THIEF = {
    stealBase: 2,
    stealPerHour: 0.6,
    perfectDodgeGold: 14
};

// Vigil: parado por stillSeconds, ergue um escudo que para um golpe e estoura
export const VIGIL = {
    stillSeconds: 0.9,
    rechargeSeconds: 6,
    burstRadius: 120,
    burstDamage: 1.5,
    burstKnockback: 420
};

// Backdraft: explosão quando um monstro alcança a tocha
export const BACKDRAFT = {
    radius: 125,
    damage: 2,
    knockback: 420
};

// Phoenix Pact: a tocha paga com a própria vida para levantar o herói, uma vez por hora
export const PHOENIX_PACT = {
    torchCost: 30,
    healRatio: 0.6,
    invulnerableSeconds: 2.5,
    radius: 300,
    damage: 3,
    knockback: 760
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
