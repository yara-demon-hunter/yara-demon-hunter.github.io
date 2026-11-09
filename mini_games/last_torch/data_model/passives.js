// --- PASSIVAS ---
// type 'skill': aprendidas na árvore de skills, com pontos (data_model/tree.js).
// Sem type (relíquias): compradas com ouro na árvore de relíquias do acampamento (data_model/relics.js),
// onde cost é o preço base em moedas.
// mods: efeitos simples, somados por js/systems/modifiers.js. As skills têm mecânica própria.

const formatPercent = (value) => `${Number((value * 100).toFixed(1))}%`;
const formatMultiplier = (value) => `${Number(value.toFixed(2))}×`;

export const PASSIVE_SKILL_MODELS = {
    shadowWhirl: {
        name: 'Whirlwind',
        icon: '🌀',
        cost: 80,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Your final combo hit becomes a full spin that strikes every enemy in range.'
    },
    mirrorWard: {
        name: 'Return Fire',
        icon: '🪞',
        cost: 60,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Bats an incoming enemy shot back at the nearest monster. Recharges in ${MIRROR_WARD.cooldownSeconds}s.`;
        }
    },
    shadowShackle: {
        name: 'Shadow Shackle',
        icon: '⛓️',
        cost: 120,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Every ${SHADOW_SHACKLE.cooldownSeconds}s you hurl a chain at the strongest monster within dagger range. It stays nailed to that spot for ${SHADOW_SHACKLE.holdSeconds}s, bosses included. A chained monster can still attack, and a boss can still teleport, but neither can walk.`;
        }
    },
    fanOfKnives: {
        name: 'Fan of Knives',
        icon: '🔱',
        cost: 110,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Throws ${FAN_OF_KNIVES.count} daggers at once in a fan.`;
        }
    },
    shadowClone: {
        name: 'Shadow Clone',
        icon: '👥',
        cost: 150,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `A shadow keeps watch near the torch and walks out to cut down whatever comes close. Monsters ignore it, but a stray hit can still bring it down. It returns after ${SHADOW_CLONE.respawnSeconds}s.`;
        }
    },
    warCry: {
        name: 'War Cry',
        icon: '📣',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `When surrounded by ${WAR_CRY.monsters} monsters, you roar: they are thrown back and stunned, and your blade hits ${formatPercent(WAR_CRY.bladeBonus)} harder for ${WAR_CRY.bonusSeconds}s.`;
        }
    },
    executioner: {
        name: 'Executioner',
        icon: '🪓',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Your blade finishes off monsters under ${formatPercent(EXECUTIONER.threshold)} health in one brutal cut. Elites under ${formatPercent(EXECUTIONER.eliteThreshold)}. Bosses are immune.`;
        }
    },
    smokeBomb: {
        name: 'Smoke Bomb',
        icon: '🌫️',
        cost: 70,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Every dash leaves a trail of smoke that lingers for ${SMOKE_BOMB.seconds}s. Monsters inside it slow down, and every hit they take, from blade or dagger, has a ${formatPercent(SMOKE_BOMB.critChance)} chance to be a critical hit.`;
        }
    },
    vigil: {
        name: 'Vigil',
        icon: '⚜️',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Stand still for ${VIGIL.stillSeconds}s to raise a flame shield. It stops one hit, then bursts within ${VIGIL.burstRadius} range for ${formatMultiplier(VIGIL.burstDamage)} spell damage. Returns after ${VIGIL.rechargeSeconds}s.`;
        }
    },
    flameBlade: {
        name: 'Flaming Sword',
        icon: '⚔️',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Your sword catches fire. Every cut burns monsters for ${formatPercent(FLAME_BLADE.burnRatio)} of the hit's damage per second for ${FLAME_BLADE.burnSeconds}s. A burning monster that dies passes the fire to others within ${FLAME_BLADE.spreadRadius} range. Under the Oath of the Hearth, burn damage is multiplied by ${FLAME_BLADE.oathMultiplier}.`;
        }
    },
    fireballs: {
        name: 'Fireballs',
        icon: '☄️',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'Your daggers become fireballs. They burst on impact, scorching everything nearby, setting it ablaze and leaving the ground burning. Everything that improves your daggers still counts, and your magic damage multiplies the fireball on top (its hits show in blue). The price: you stand still for a moment, unable to do anything, while the fire grows in your hand.'
    },
    backdraft: {
        name: 'Backdraft',
        icon: '🎆',
        cost: 70,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Every monster that reaches the torch sets off a blast of fire within ${BACKDRAFT.radius} range for ${formatMultiplier(BACKDRAFT.damage)} spell damage.`;
        }
    },
    phoenixPact: {
        name: 'Phoenix Pact',
        icon: '🦅',
        cost: 130,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'A phoenix flies at your shoulder and hurls fireballs. When you fall, it gives its life to raise you in a storm of fire, and is reborn the next wave.'
    },

    shadowRaven: {
        name: 'Shadow Raven',
        icon: '🐦‍⬛',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `A small raven circles at your shoulder. Every ${SHADOW_RAVEN.cooldownSeconds}s it dives at the nearest monster within ${SHADOW_RAVEN.range} range, pecks it for ${formatMultiplier(SHADOW_RAVEN.damage)} blade damage and flies back. The pecked monster is marked for ${SHADOW_RAVEN.markSeconds}s: every hit it takes deals ${formatPercent(SHADOW_RAVEN.markDamage)} more damage.`;
        }
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
        get desc() {
            const { bladeDamage, attackSpeed, furyCharge, killHeal } = this.mods;
            return `+${formatPercent(bladeDamage)} blade damage, +${formatPercent(attackSpeed)} attack speed, +${formatPercent(furyCharge)} Fury charge, and each kill heals ${killHeal}. Monsters are drawn to you from farther away. The price: the warmth of the torch no longer heals you, and you can no longer throw daggers.`;
        },
        mods: { bladeDamage: 0.35, attackSpeed: 0.1, furyCharge: 0.4, killHeal: 1, provoke: 0.5, noWarmthHeal: 1, noKnives: 1 }
    },
    oathWhispers: {
        name: 'Oath of Whispers',
        icon: '🤫',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        oath: true, gear: 'whispers', tagline: 'Never where they strike',
        get desc() {
            const mods = this.mods;
            return `+${mods.dashCharges} dash charge, ${formatPercent(mods.dashCooldown)} shorter dash cooldown, +${formatPercent(mods.moveSpeed)} move speed, +${formatPercent(mods.critChance)} critical chance and +${formatPercent(mods.knifeDamage)} dagger damage. Every ${SHADOW_CLONE.whispers.killsPerShadow} kills a shadow joins the torch (up to ${SHADOW_CLONE.whispers.maxShadows}). The price: ${formatPercent(Math.abs(mods.maxHp))} less max health.`;
        },
        mods: { dashCharges: 1, dashCooldown: 0.2, moveSpeed: 0.15, critChance: 0.1, knifeDamage: 0.5, maxHp: -0.25 }
    },
    oathHearth: {
        name: 'Oath of the Hearth',
        icon: '🛡️',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        oath: true, gear: 'hearth', tagline: 'The flame will not die',
        get desc() {
            const mods = this.mods;
            return `The torch takes ${formatPercent(mods.torchGuard)} less damage, you gain ${formatPercent(mods.maxHp)} max health, and its warmth reaches ${formatMultiplier(1 + mods.warmth)} as far and burns monsters inside it. The price: ${formatPercent(Math.abs(mods.moveSpeed))} less move speed.`;
        },
        mods: { torchGuard: 0.35, maxHp: 0.3, warmth: 1, warmthBurn: 0.4, moveSpeed: -0.25 }
    },
    oathRuin: {
        name: 'Oath of Ruin',
        icon: '📕',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        oath: true, gear: 'ruin', tagline: 'The dark pays in kind',
        get desc() {
            const mods = this.mods;
            return `Spells deal ${formatPercent(mods.spellDamage)} more damage and recharge ${formatPercent(mods.spellHaste)} faster. The price: your blade deals ${formatPercent(Math.abs(mods.bladeDamage))} less damage.`;
        },
        mods: { spellDamage: 0.2, spellHaste: 0.12, bladeDamage: -0.4 }
    },

    // Mãos de ladrão (ramo Fortune da árvore de relíquias)
    lightFingers: { name: 'Light Fingers', icon: '🧤', cost: 50, maxLvl: 1, desc: 'Coins and loot leap into your hands: your pickup range doubles.', mods: { magnet: 1 } },
    pickpocket: { name: 'Pickpocket', icon: '👛', cost: 70, maxLvl: 1, desc: 'Every monster you kill drops 2 extra gold.', mods: { killGold: 2 } },
    coinRush: { name: 'Coin Rush', icon: '💰', cost: 80, maxLvl: 1, desc: 'Every coin you grab shaves 0.05s off your dagger and dash recharge. Gold buys speed.', mods: { coinHaste: 0.05 } },
    thiefNose: { name: "Thief's Nose", icon: '👃', cost: 85, maxLvl: 1, desc: 'You smell what others miss: monsters drop items 60% more often.', mods: { pickupRate: 0.6 } },
    masterThief: {
        name: 'Master Thief',
        icon: '🦝',
        cost: 100,
        maxLvl: 1,
        desc: 'Dash through monsters to pick their pockets. A Perfect Dodge steals a fistful of gold.'
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
        icon: '👁️',
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
        desc: 'The warmth of the torch reaches 40% farther and heals you 20% faster.',
        mods: { warmth: 0.4 }
    },
    furyStone: {
        name: 'Fury Stone',
        icon: '💢',
        cost: 100,
        maxLvl: 1,
        desc: 'Fury lasts 2 seconds longer and charges 25% faster.',
        mods: { furyDuration: 2, furyCharge: 0.25 }
    },
    // --- RELÍQUIAS POR CLASSE: cada uma reforça um ramo da árvore de skills (Blade, Shadow, Flame, Curse) ---
    sharpenedEdge: { name: 'Sharpened Edge', icon: '🪚', cost: 110, maxLvl: 1, desc: 'For blade fighters: +15% blade damage, +8% attack speed.', mods: { bladeDamage: 0.15, attackSpeed: 0.08 } },
    shadeQuiver: { name: 'Shade Quiver', icon: '🪶', cost: 120, maxLvl: 1, desc: 'For shadow stalkers: +20% dagger damage, -8% dagger recharge, +4% critical chance.', mods: { knifeDamage: 0.2, knifeCooldown: 0.08, critChance: 0.04 } },
    occultTome: { name: 'Occult Tome', icon: '🪬', cost: 120, maxLvl: 1, desc: 'For curse casters: +15% spell damage, -8% spell recharge.', mods: { spellDamage: 0.15, spellHaste: 0.08 } },
    emberLantern: { name: 'Ember Lantern', icon: '🪔', cost: 100, maxLvl: 1, desc: 'For flame keepers: the torch heals 0.5/s and its warmth reaches 30% farther.', mods: { torchRegen: 0.5, warmth: 0.3 } },
    phantomVeil: { name: 'Phantom Veil', icon: '🧣', cost: 110, maxLvl: 1, desc: 'For shadow dodgers: -12% dash recharge, +5% move speed.', mods: { dashCooldown: 0.12, moveSpeed: 0.05 } },
    wizardsWand: { name: "Wizard's Wand", icon: '🪄', cost: 130, maxLvl: 1, desc: 'For curse casters: +20% spell damage, -6% spell recharge.', mods: { spellDamage: 0.2, spellHaste: 0.06 } },
    owlsWisdom: { name: "Owl's Wisdom", icon: '🦉', cost: 140, maxLvl: 1, desc: 'For curse casters: -12% spell recharge, +10% XP.', mods: { spellHaste: 0.12, xp: 0.1 } },
    stoneHeart: { name: 'Stone Heart', icon: '💎', cost: 150, maxLvl: 1, desc: 'For blade bruisers: +15% max health, -6% damage taken.', mods: { maxHp: 0.15, damageTaken: -0.06 } },
    merchantSeal: { name: "Merchant's Seal", icon: '⚖️', cost: 130, maxLvl: 1, desc: '+20% gold, items drop 15% more often.', mods: { gold: 0.2, pickupRate: 0.15 } },
    gildedSignet: { name: 'Gilded Signet', icon: '💍', cost: 110, maxLvl: 1, desc: '+10% gold, +10% XP.', mods: { gold: 0.1, xp: 0.1 } },
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
    costMultiplier: 1.8,
    costGrowthPerHour: 0.15,        // relíquias ficam mais caras a cada hora
    freeTorchHeal: 0,               // a tocha recupera isto de graça ao chegar no acampamento (zero: quem cura é o Feed)
    fuel: { heal: 30, cost: 40, costPerHour: 12, costPerUse: 25 },
    rest: { healRatio: 0.5, cost: 30, costPerHour: 9, costPerUse: 20 }
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
    bladeBonus: 0.2,            // dano extra da lâmina depois do rugido
    bonusSeconds: 3.5
};

// Executioner: fração da vida abaixo da qual a lâmina termina o serviço
export const EXECUTIONER = {
    threshold: 0.15,
    eliteThreshold: 0.08,
    furyCharge: 4
};

// Smoke Bomb: o dash deixa um rasto de fumaça. Quem está nela anda devagar e cada golpe que recebe tem uma chance extra de ser crítico
export const SMOKE_BOMB = {
    seconds: 7,                 // quanto tempo cada nuvem fica
    radius: 58,
    spacing: 34,                // distância entre uma nuvem e a seguinte ao longo do dash
    slow: 0.65,
    critChance: 0.25,           // chance extra de crítico em quem está na fumaça
    maxClouds: 14
};

// Master Thief: dash atravessando monstros rouba ouro (uma vez de cada monstro, por dash)
export const MASTER_THIEF = {
    stealBase: 2,
    stealPerHour: 0.6,
    perfectDodgeGold: 14
};

// Vigil: parado por stillSeconds, ergue um escudo que para um golpe e estoura
// Flaming Sword: o corte deixa o monstro queimando (fração do dano do golpe, por segundo)
export const FLAME_BLADE = {
    burnRatio: 0.4,
    burnSeconds: 3,
    oathMultiplier: 2,          // sob o Oath of the Hearth
    spreadRadius: 90            // monstro em chamas que morre passa o fogo (com o mesmo dano) a quem está perto
};

// Fireballs: a adaga continua sendo adaga (dano, alcance, Death Mark, carga, Ricochet); ao acertar, explode
export const FIREBALLS = {
    castSeconds: 0.55,          // a bola cresce na mão e o herói fica parado, sem golpear nem dar dash
    splashRadius: 70,           // cresce com o tamanho da adaga carregada
    splashRatio: 0.6,           // dano nos vizinhos, em fração do dano da adaga
    burnRatio: 0.25,            // queimadura por segundo, em fração do dano da adaga
    burnSeconds: 3,
    patchSeconds: 2,            // o chão queima onde a bola explodiu (dano em fração do feitiço, por segundo)
    patchDps: 0.5
};

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

// Phoenix Pact: a fênix voa no ombro do herói e atira bolas de fogo. Quando ele cai, ela morre para levantá-lo
// (uma vez por hora) e renasce na hora seguinte.
export const PHOENIX_PACT = {
    healRatio: 0.6,
    invulnerableSeconds: 2.5,
    radius: 300,
    damage: 3,
    knockback: 760,
    // Voo
    shoulderX: 28,              // ao lado do herói, sempre do lado de trás de quem anda
    shoulderY: -42,
    followSpeed: 6,
    riseSeconds: 0.9,           // tempo para renascer da brasa
    // Bola de fogo
    cooldownSeconds: 1.5,
    range: 340,
    speed: 330,
    turnRate: 8,
    boltDamage: 1.4,            // x dano de feitiço
    splashRadius: 52,
    splashRatio: 0.5,           // dano nos vizinhos, em relação ao golpe
    burnRatio: 0.35,            // queimadura por segundo, em relação ao golpe
    burnSeconds: 2
};

// Shadow Shackle: a corrente voa até o monstro mais forte ao alcance da adaga e o prende naquele ponto. Só tira o andar:
// ele continua atacando, e o boss que se teleporta leva a corrente junto e fica preso no ponto novo.
export const SHADOW_SHACKLE = {
    cooldownSeconds: 15,        // conta a partir do lançamento
    holdSeconds: 10,
    speed: 800                  // velocidade da ponta da corrente
};

// Companheiros em voo (fênix, Grave Wisp, Shadow Raven): rodeiam devagar o ponto onde ficam e demoram mais para
// alcançar o herói depois do dash (js/systems/companions.js)
export const COMPANIONS = {
    wander: { radius: 9, sway: 4, speed: 0.7 },     // volta lenta (raio, rad/s) e balanço extra, em unidades do mundo
    dashLag: { follow: 0.3, afterSeconds: 0.35, recover: 1.6 }   // fração da velocidade no dash, tempo de atraso depois dele, ritmo da volta
};

// Shadow Raven: um corvo pequeno voa em volta do herói, mergulha no monstro mais perto, bica e volta
export const SHADOW_RAVEN = {
    // Pousos em volta do herói, do preferido ao último. side: 1 = do lado de trás de quem anda, -1 = do lado da frente,
    // 0 = em cima. Ele fica no primeiro que não está colado em outro companheiro (fênix, Grave Wisp)
    spots: [
        { side: 1, x: 30, y: -46 },
        { side: 0, x: 0, y: -84 },
        { side: -1, x: 30, y: -46 },
        { side: 1, x: 48, y: -14 },
        { side: -1, x: 48, y: -14 }
    ],
    spotClearance: 48,          // distância mínima de outro companheiro (unidades do mundo)
    followSpeed: 7,
    riseSeconds: 0.7,           // tempo para surgir da sombra
    // Mergulho
    cooldownSeconds: 2.4,
    range: 300,                 // monstro mais perto do herói dentro deste raio
    diveSpeed: 540,
    reach: 6,                   // distância da borda do monstro para a bicada
    maxDiveSeconds: 1,          // desiste se o alvo escapar
    damage: 1.1,                // x dano da lâmina
    knockback: 140,
    markSeconds: 2,             // o monstro bicado fica em mira vermelha
    markDamage: 0.25            // e leva este bônus em todo golpe (lâmina, adaga, feitiço, sombras) enquanto a mira durar
};

export function createPassives() {
    return Object.fromEntries(
        Object.entries(PASSIVE_SKILL_MODELS).map(([key, model]) => [key, { ...model, key, lvl: 0, evolved: false }])
    );
}

// Shadow Clone: uma sombra que guarda a tocha. Tem uma área em volta da chama (areaRadius) onde anda livremente, e
// nunca sai dela. Espera parada no posto, a postRadius da chama. Quando um monstro chega perto da área, ela anda em
// linha reta até ele, golpeia com a espada do herói (os multiplicadores abaixo) e volta ao posto quando acaba. Os monstros não correm atrás dela, mas quem esbarra nela ou acerta um tiro
// nela a machuca. Cai, e volta depois de respawnSeconds. Evoluída (Shadow Legion), são três sombras, cada uma cuidando
// de um monstro. Solta as lâminas da Fúria junto com o herói. Não carrega a Fúria.
export const SHADOW_CLONE = {
    areaRadius: 200,            // área em volta da tocha onde as sombras se movem (unidades do mundo)
    postRadius: 110,            // distância da tocha em que cada sombra espera, dentro da área
    moveSpeed: 165,             // px/s: indo até o monstro (um pouco mais devagar que o herói)
    returnSpeed: 120,           // px/s: voltando ao posto
    damageMultiplier: 0.35,     // golpes da sombra
    knockbackMultiplier: 0.3,
    radiusMultiplier: 0.9,      // alcance da lâmina da sombra
    cooldownMultiplier: 1,      // x recarga do golpe do herói (maior = golpeia mais devagar)
    // VIDA DA SOMBRA: fração da vida máxima do herói (sobe junto com o upgrade Hero Health)
    hpRatio: 0.5,
    // TEMPO PARA VOLTAR depois de cair (segundos)
    respawnSeconds: 10,
    // EXPLOSÃO ao cair: adagas em todas as direções, com o dano, o alcance, a velocidade e o Ricochet do herói
    burst: {
        knives: 8,
        fanBonus: 4,            // adagas a mais com Fan of Knives
        damageMultiplier: 1     // x o dano de uma adaga do herói
    },
    // OATH OF WHISPERS: uma sombra nova a cada tantas mortes na noite, até o total máximo (as caídas renascem)
    whispers: {
        killsPerShadow: 5,
        maxShadows: 8
    }
};
