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
        desc: 'Your final combo hit becomes a whirlwind: a long, sharp purple cut that spins around you like a small tornado, striking every enemy in a much wider circle.'
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
            return `Every ${SHADOW_SHACKLE.cooldownSeconds}s you hurl a chain at the strongest monster within dagger range. It stays nailed to that spot for ${SHADOW_SHACKLE.holdSeconds}s, but only ${Math.round(SHADOW_SHACKLE.holdSeconds * SHADOW_SHACKLE.bossRatio)}s on a boss. A chained monster can still attack, and a boss can still teleport, but neither can walk.`;
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
            return `Crimson Tide evolves: every swing throws ${EXECUTIONER.crescents} blood crescents in a fan instead of one, each hitting as hard as the original.`;
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
        desc: 'Your daggers become fireballs. They burst on impact, scorching everything nearby, setting it ablaze and leaving the ground burning. Everything that improves your daggers still counts, and your magic damage multiplies the fireball on top (its hits show in blue). The price: you stand still for a moment, unable to do anything, while the fire grows in your hand. Hold the dagger button to charge it into a huge fireball that deals up to 4x damage and bursts over a wide area.',
        warning: 'Charged fireballs do not ricochet, and Ricochet is lost while you hold the fire.'
    },
    fireTornado: {
        name: 'Fire Tornado',
        icon: '🌪️',
        cost: 130,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Every ${FIRE_TORNADO.cooldownSeconds}s a tornado of fire forms over the torch and rages for ${FIRE_TORNADO.durationSeconds}s, scorching everything within ${FIRE_TORNADO.radius} range of the torch (as far as a maxed Hearth Ring reaches) for ${formatMultiplier(FIRE_TORNADO.damage)} torch fire damage every ${FIRE_TORNADO.tickSeconds}s and setting it ablaze. It counts as the torch's fire.`;
        }
    },
    hearthPhoenix: {
        name: 'Flaming Phoenix',
        icon: '🐦‍🔥',
        cost: 130,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `A fire phoenix rises from the torch and circles it, hurling fireballs every ${HEARTH_PHOENIX.cooldownSeconds}s at monsters near the flame for ${formatMultiplier(HEARTH_PHOENIX.boltDamage)} spell damage, and every ${HEARTH_PHOENIX.breathCooldown}s it breathes a ${HEARTH_PHOENIX.breathSeconds}s torrent of fire that scorches everything in its path. They count as the torch's fire.`;
        }
    },
    blueTorch: {
        name: 'Blue Torch',
        icon: '🔵',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `The torch burns blue, and so does everything it does: its bolts, rings and light. Its light and warmth reach ${formatPercent(BLUE_TORCH.light)} and ${formatPercent(BLUE_TORCH.warmth)} farther, the torch's fire hits ${formatPercent(BLUE_TORCH.fireDamage)} harder, and the cold flame slows every monster inside its warmth by ${formatPercent(BLUE_TORCH.chill)}. Monsters slowed this way take ${formatPercent(BLUE_TORCH.brittle)} more damage from the torch's fire hits only.`;
        }
    },
    phoenixPact: {
        name: 'Phoenix Pact',
        icon: '🦅',
        cost: 130,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        desc: 'A phoenix flies at your shoulder and hurls fireballs. When you fall, it gives its life to raise you in a storm of fire. If the torch goes out, it dives into the flame and relights it at half health, shielding you both. Either way, it is reborn the next wave.'
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

    // --- NATUREZA ---
    thornBurst: {
        name: 'Thorn Burst',
        icon: '🌵',
        cost: 120,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `A monster that dies while pinned by roots bursts into thorns: ${formatMultiplier(THORN_BURST.damage)} spell damage to everything within ${THORN_BURST.radius} range.`;
        }
    },
    // Só o Rowan (hero: 'rowan' no nó da árvore): as rosas escurecem e ferem mais. Vale como mod de dano da adaga (knifeDamage),
    // então soma com o Dagger Mastery e tudo o mais que melhora a adaga
    darkRoses: {
        name: 'Dark Roses',
        icon: '🥀',
        cost: 140,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Your roses wither and turn black: +${formatPercent(this.mods.knifeDamage)} dagger damage, and a monster they hit is marked with a black rose for ${THORN_ROSES.markSeconds}s. If it dies marked, thorn roses burst from the ground where it fell and hurt everything that crosses them for ${THORN_ROSES.patchSeconds}s. Only Rowan can learn this. Every skill that improves daggers works on roses.`;
        },
        mods: { knifeDamage: 0.6 }
    },
    oathWild: {
        name: 'Oath of the Wild',
        icon: '🦌',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        oath: true, gear: 'wild', tagline: 'The forest remembers',
        get desc() {
            const mods = this.mods;
            return `You heal ${mods.hpRegen} health per second, gain ${formatPercent(mods.maxHp)} max health, roots hold ${formatPercent(mods.rootSeconds)} longer and spells deal ${formatPercent(mods.spellDamage)} more damage. The price: your Fury deals no damage. It still shields you and slows monsters, but the wild gives life, not rage.`;
        },
        mods: { hpRegen: 1.2, maxHp: 0.15, rootSeconds: 0.5, spellDamage: 0.15, furyNoDamage: 1 }
    },

    // Lâmina benta (só o Avgustino): a água benta na arma; cada golpe da lâmina também queima com magia (uma parte pequena dela)
    blessedBlade: {
        name: 'Blessed Blade',
        icon: '🗡️',
        cost: 0,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `You anoint your blade with holy water. Every blade hit also burns for ${Math.round(this.magicRatio * 100)}% of your magic damage (a blue number next to the white one): physical and holy at once.`;
        },
        magicRatio: 0.2     // parte do dano de magia que cada golpe da lâmina soma (baixa: é um tempero, não o total da magia)
    },
    // Conversão (só o Avgustino): de tempos em tempos ele reza por um monstro comum perto dele, que passa para o lado dele
    // até o fim da noite. Os convertidos se acumulam (até maxAllies), lutam contra os outros e os provocam: os monstros
    // comuns por perto vão bater neles em vez de no herói. Lógica em js/systems/conversion.js; desenho em js/render/entities.js.
    conversion: {
        name: 'Conversion',
        icon: '🙏',
        cost: 0,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Every ${this.cooldownSeconds}s you pray over a common monster near you and it joins your side for the rest of the night, with its normal health (full, even if it was wounded). It never heals. Converts stack up to ${this.maxAllies}: they fight the monsters near them and provoke them, so the horde attacks them instead of you. Bosses and elites cannot be converted. Only Avgustino can learn this.`;
        },
        cooldownSeconds: 20,     // entre uma reza e outra (a primeira vem logo: firstDelaySeconds)
        firstDelaySeconds: 3,
        range: 260,             // distância do herói até o monstro que ele converte
        maxAllies: 6,           // quantos convertidos ao mesmo tempo (acumulam pela noite; um que morre libera a vaga)
        damageScale: 1.4,       // dano por golpe = dano dele × isto
        hitSeconds: 0.8,        // tempo entre golpes do convertido
        speedScale: 1.15,       // um pouco mais rápido que antes, para acompanhar o herói
        seekRange: 360,         // o convertido procura monstros até esta distância dele
        provokeRadius: 220,     // monstros comuns até esta distância de um convertido vão atrás dele
        followDistance: 90,     // sem inimigo por perto, fica a esta distância do herói
        enemyHitSeconds: 0.7    // tempo entre golpes de um monstro no convertido
    },
    // Runa Soberana (só o Gudran, no Curse Path): os raios arcanos do cajado furam o primeiro monstro e estouram onde acabam
    sovereignRune: {
        name: 'Sovereign Rune',
        icon: '🔷',
        cost: 0,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        get desc() {
            return `Your arcane bolts pierce ${this.pierce} extra monster${this.pierce === 1 ? '' : 's'} and burst in blue light where they end, hurting everything within ${this.burstRadius} range for ${formatPercent(this.burstDamage)} of the bolt's damage. Only Gudran can learn this.`;
        },
        pierce: 1,
        burstRadius: 70,
        burstDamage: 0.6
    },
    oathFaith: {
        name: 'Oath of Faith',
        icon: '🕯️',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/tree.js)
        oath: true, gear: 'faith', tagline: 'Light answers the dark',
        get desc() {
            const mods = this.mods;
            const S = this.shields;
            return `${S.count} shields of light circle you, striking every monster that comes close for ${Math.round(S.damage * 100)}% of your magic damage and pushing it back. Spells deal ${formatPercent(mods.spellDamage)} more damage, you heal ${mods.hpRegen} health per second, the torch gains ${mods.torchHp} health and holds ${formatPercent(mods.torchGuard)} more against hits. The price: the faithful do not flee. You can no longer dash.`;
        },
        // Os escudos de luz que giram em volta do herói (js/systems/skills_light.js; desenho em js/render/light.js)
        shields: { count: 3, orbit: 46, spin: 2.2, size: 11, damage: 0.55, hitSeconds: 0.6, knockback: 160 },
        mods: { spellDamage: 0.2, hpRegen: 1, torchHp: 40, torchGuard: 0.15, noDash: 1 }
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
        mods: { bladeDamage: 0.25, attackSpeed: 0.05, furyCharge: 0.4, killHeal: 1, provoke: 0.5, noWarmthHeal: 1, noKnives: 1 }
    },
    oathWhispers: {
        name: 'Oath of Whispers',
        icon: '🤫',
        cost: 300,
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
        mods: { torchGuard: 0.25, maxHp: 0.3, warmth: 1, warmthBurn: 0.4, moveSpeed: -0.25 }
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
    lightFingers: { name: 'Light Fingers', icon: '🧤', cost: 300, maxLvl: 1, desc: 'Coins and loot leap into your hands: your pickup range doubles.', mods: { magnet: 1 } },
    pickpocket: { name: 'Pickpocket', icon: '👛', cost: 900, maxLvl: 1, desc: 'Every monster you kill drops 2 extra gold.', mods: { killGold: 2 } },
    coinRush: { name: 'Coin Rush', icon: '💰', cost: 2000, maxLvl: 1, desc: 'Every coin you grab shaves 0.05s off your dagger and dash recharge. Gold buys speed.', mods: { coinHaste: 0.05 } },
    thiefNose: { name: "Thief's Nose", icon: '👃', cost: 3800, maxLvl: 1, desc: 'You smell what others miss: monsters drop items 60% more often.', mods: { pickupRate: 0.6 } },
    masterThief: {
        name: 'Master Thief',
        icon: '🦝',
        cost: 6500,
        maxLvl: 1,
        desc: 'Dash through monsters to pick their pockets. A Perfect Dodge steals a fistful of gold.'
    },
    greedyIdol: {
        name: 'Greedy Idol',
        icon: '🗿',
        cost: 300,
        maxLvl: 1,
        desc: '+35% gold, but -12% max health.',
        mods: { gold: 0.35, maxHp: -0.12 }
    },
    emberFlask: {
        name: 'Ember Flask',
        icon: '🏺',
        cost: 300,
        maxLvl: 1,
        desc: 'The torch slowly recovers: +1 health every 8 seconds.',
        mods: { torchRegen: 0.12 }
    },
    secondPrayer: {
        name: 'Second Prayer',
        icon: '📿',
        cost: 4800,
        maxLvl: 1,
        desc: 'Rise once with half your health when you fall.',
        mods: { revives: 1 }
    },
    boneCharm: {
        name: 'Bone Charm',
        icon: '🦴',
        cost: 2000,
        maxLvl: 1,
        desc: '+1 dash charge.',
        mods: { dashCharges: 1 }
    },
    witchEye: {
        name: "Witch's Eye",
        icon: '👁️',
        cost: 2000,
        maxLvl: 1,
        desc: 'Every third level grants an extra skill point.',
        mods: { levelPoints: 0.34 }
    },
    berserkDraught: {
        name: 'Berserk Draught',
        icon: '🧪',
        cost: 300,
        maxLvl: 1,
        desc: '+60% damage while under 35% health.',
        mods: { lowHpDamage: 0.6 }
    },
    thornCrown: {
        name: 'Crown of Thorns',
        icon: '👑',
        cost: 900,
        maxLvl: 1,
        desc: 'Monsters that touch you take 150% of your blade damage.',
        mods: { thorns: 1.5 }
    },
    ironHeart: {
        name: 'Iron Heart',
        icon: '🫀',
        cost: 2000,
        maxLvl: 1,
        desc: 'Take 18% less damage.',
        mods: { damageTaken: -0.18 }
    },
    luckyCoin: {
        name: 'Lucky Coin',
        icon: '🍀',
        cost: 900,
        maxLvl: 1,
        desc: 'Chests give +1 skill point and you find 10% more gold.',
        mods: { chestPoints: 1, gold: 0.1 }
    },
    hunterMark: {
        name: 'Hunter Mark',
        icon: '🎖️',
        cost: 900,
        maxLvl: 1,
        desc: 'Daggers deal +50% damage and recharge 20% faster.',
        mods: { knifeDamage: 0.5, knifeCooldown: 0.2 }
    },
    warmCloak: {
        name: 'Warm Cloak',
        icon: '🧥',
        cost: 900,
        maxLvl: 1,
        desc: 'The warmth of the torch reaches 15% farther and heals you 4.5% faster.',
        mods: { warmth: 0.15 }
    },
    furyStone: {
        name: 'Fury Stone',
        icon: '💢',
        cost: 2000,
        maxLvl: 1,
        desc: 'Fury lasts 2 seconds longer and charges 5% faster.',
        mods: { furyDuration: 2, furyCharge: 0.05 }
    },
    // --- RELÍQUIAS DA NATUREZA: reforçam o ramo Nature (carvalho, raízes, esporos, lobos, regeneração) ---
    acornPouch: { name: 'Acorn Pouch', icon: '🌰', cost: 300, maxLvl: 1, desc: 'Seeds, saplings and oaks grow 30% faster.', mods: { oakGrowth: 0.3 } },
    mossyStone: { name: 'Mossy Stone', icon: '🪨', cost: 900, maxLvl: 1, desc: 'Roots hold monsters 30% longer.', mods: { rootSeconds: 0.3 } },
    sporeJar: { name: 'Spore Jar', icon: '🫙', cost: 2000, maxLvl: 1, desc: 'Spore clouds and poison hit 25% harder.', mods: { poison: 0.25 } },
    wolfTotem: { name: 'Wolf Totem', icon: '🐾', cost: 3800, maxLvl: 1, desc: 'Your wolf bites 20% harder and has 20% more health.', mods: { wolfPower: 0.2 } },
    dewVial: { name: 'Dew Vial', icon: '💧', cost: 300, maxLvl: 1, desc: 'Recover 0.5 health per second.', mods: { hpRegen: 0.5 } },
    sunpetal: { name: 'Sunpetal', icon: '🌼', cost: 900, maxLvl: 1, desc: '+12% spell damage, -6% spell recharge.', mods: { spellDamage: 0.12, spellHaste: 0.06 } },
    lotusBloom: { name: 'Lotus Bloom', icon: '🪷', cost: 2000, maxLvl: 1, desc: '+10% max health and recover 0.4 health per second.', mods: { maxHp: 0.1, hpRegen: 0.4 } },
    autumnCharm: { name: 'Autumn Charm', icon: '🍂', cost: 3800, maxLvl: 1, desc: '+10% spell damage, -10% spell recharge, +10% XP.', mods: { spellDamage: 0.1, spellHaste: 0.1, xp: 0.1 } },
    // --- RELÍQUIAS POR CLASSE: cada uma reforça um ramo da árvore de skills (Blade, Shadow, Flame, Curse) ---
    sharpenedEdge: { name: 'Sharpened Edge', icon: '🪚', cost: 6500, maxLvl: 1, desc: 'For blade fighters: +15% blade damage, +8% attack speed.', mods: { bladeDamage: 0.15, attackSpeed: 0.08 } },
    shadeQuiver: { name: 'Shade Quiver', icon: '🪶', cost: 6500, maxLvl: 1, desc: 'For shadow stalkers: +20% dagger damage, -8% dagger recharge, +4% critical chance.', mods: { knifeDamage: 0.2, knifeCooldown: 0.08, critChance: 0.04 } },
    occultTome: { name: 'Occult Tome', icon: '🪬', cost: 300, maxLvl: 1, desc: 'For curse casters: +15% spell damage, -8% spell recharge.', mods: { spellDamage: 0.15, spellHaste: 0.08 } },
    emberLantern: { name: 'Ember Lantern', icon: '🪔', cost: 3800, maxLvl: 1, desc: 'For flame keepers: the torch heals 0.12/s and its warmth reaches 10% farther.', mods: { torchRegen: 0.12, warmth: 0.1 } },
    phantomVeil: { name: 'Phantom Veil', icon: '🧣', cost: 6500, maxLvl: 1, desc: 'For shadow dodgers: -12% dash recharge, +5% move speed.', mods: { dashCooldown: 0.12, moveSpeed: 0.05 } },
    wizardsWand: { name: "Wizard's Wand", icon: '🪄', cost: 900, maxLvl: 1, desc: 'For curse casters: +20% spell damage, -6% spell recharge.', mods: { spellDamage: 0.2, spellHaste: 0.06 } },
    owlsWisdom: { name: "Owl's Wisdom", icon: '🦉', cost: 2000, maxLvl: 1, desc: 'For curse casters: -12% spell recharge, +10% XP.', mods: { spellHaste: 0.12, xp: 0.1 } },
    stoneHeart: { name: 'Stone Heart', icon: '💎', cost: 7500, maxLvl: 1, desc: 'For blade bruisers: +15% max health, -6% damage taken.', mods: { maxHp: 0.15, damageTaken: -0.06 } },
    merchantSeal: { name: "Merchant's Seal", icon: '⚖️', cost: 6500, maxLvl: 1, desc: '+20% gold, items drop 15% more often.', mods: { gold: 0.2, pickupRate: 0.15 } },
    gildedSignet: { name: 'Gilded Signet', icon: '💍', cost: 3800, maxLvl: 1, desc: '+10% gold, +10% XP.', mods: { gold: 0.1, xp: 0.1 } },
    hearthstone: { name: 'Hearthstone', icon: '🧱', cost: 300, maxLvl: 1, desc: '+30 torch health.', mods: { torchHp: 30 } },
    oldScars: { name: 'Old Scars', icon: '🩹', cost: 900, maxLvl: 1, desc: '+20 hero health.', mods: { maxHpFlat: 20 } },
    whetstone: { name: 'Whetstone', icon: '⚒️', cost: 300, maxLvl: 1, desc: '+12% damage.', mods: { damage: 0.12 } },
    wornBoots: { name: 'Worn Boots', icon: '👢', cost: 3800, maxLvl: 1, desc: '+6% move speed.', mods: { moveSpeed: 0.06 } },
    coinPurse: { name: 'Coin Purse', icon: '🪙', cost: 300, maxLvl: 1, desc: '+15% gold.', mods: { gold: 0.15 } },
    hunterLore: { name: 'Hunter Lore', icon: '📖', cost: 900, maxLvl: 1, desc: '+10% XP.', mods: { xp: 0.1 } },
    smolderingRage: { name: 'Smoldering Rage', icon: '🧨', cost: 3800, maxLvl: 1, desc: '+20% Fury charge.', mods: { furyCharge: 0.2 } },
    // grantPoints: pontos de skill entregues uma vez, na compra
    huntersNotes: { name: "Hunter's Notes", icon: '📜', cost: 3800, maxLvl: 1, desc: 'Gain 2 skill points right away.', grantPoints: 2 },
    treasureSense: { name: 'Treasure Sense', icon: '🗝️', cost: 2000, maxLvl: 1, desc: 'Chests give +1 skill point.', mods: { chestPoints: 1 } },
    lastPrayer: { name: 'Last Prayer', icon: '🙏', cost: 3300, maxLvl: 1, desc: 'Rise once more when you fall.', mods: { revives: 1 } }
};

// Natureza: o estouro de espinhos e a casca do carvalho (js/systems/skills_nature.js)
export const THORN_BURST = { radius: 80, damage: 1.2, knockback: 90 };
// Dark Roses (só o Rowan): o monstro atingido por uma rosa negra fica marcado por markSeconds; se morrer marcado, brotam rosas de
// espinho no lugar (patchSeconds) que ferem quem passa (damage = dano da adaga x isto, a cada tickSeconds) e desaceleram
export const THORN_ROSES = { markSeconds: 10, patchSeconds: 6, radius: 34, damage: 0.35, tickSeconds: 0.5, slow: 0.35, growSeconds: 0.25 };

// --- ACAMPAMENTO ---
// Fim de cada hora: o ouro compra relíquias na árvore do acampamento e também alimenta a tocha.
export const CAMP = {
    costMultiplier: 1,              // o preço de cada relíquia já está escrito em `cost` dela: sobe pela coluna na árvore de relíquias (300 · 900 · 2.000 · 3.800 · 6.500)
    costGrowthPerHour: 0,           // 0 = preço fixo em todas as ondas (o ouro por onda já cresce com mais abates)
    priceStep: 10,                  // preços arredondados para múltiplos disto
    freeTorchHeal: 0,               // a tocha recupera isto de graça ao chegar no acampamento (zero: quem cura é o Feed)
    fuel: { heal: 22, cost: 40, costPerHour: 12, costPerUse: 25 },
    rest: { healRatio: 0.4, cost: 30, costPerHour: 9, costPerUse: 20 }
};

// Fan of Knives: várias adagas de uma vez, abertas em leque em volta da mira
export const FAN_OF_KNIVES = {
    count: 3,
    spreadDegrees: 14           // ângulo entre uma adaga e a vizinha
};

// Mirror Ward: rebate o tiro que chega perto do herói para o monstro mais próximo
export const MIRROR_WARD = {
    cooldownSeconds: 5,
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

// Whirlwind: o giro puxa os monstros comuns até `pullRadiusRatio` x o alcance do golpe, `pullFraction` do caminho até o herói (parando a `minDistance` px do centro), antes de bater
export const WHIRLWIND = { radiusRatio: 1.6 };

// Executioner: evolução do golpe da Crimson Tide: a meia-lua de sangue vira `crescents` em leque, abertas `spread` radianos uma da outra
export const EXECUTIONER = {
    crescents: 3,
    spread: 0.3
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

// Flaming Sword: o corte deixa o monstro queimando (fração do dano do golpe, por segundo)
// Blessed Blade (Avgustino): a parte da magia que cada golpe da lâmina soma (js/systems/combat.js)
export const BLESSED_BLADE = PASSIVE_SKILL_MODELS.blessedBlade;
export const CONVERSION = PASSIVE_SKILL_MODELS.conversion;
export const SOVEREIGN_RUNE = PASSIVE_SKILL_MODELS.sovereignRune;

// Ataque básico arcano (Gudran e qualquer herói com basicAttack: 'arcane'): no lugar do golpe de lâmina, ele ergue o cajado e solta
// um raio de energia azul no monstro mais perto. Dano de MAGIA (número azul). Cada 3º raio é maior e empurra mais.
export const ARCANE_BOLT = {
    damageRatio: 1.0,       // dano do raio = dano de magia × isto (um raio por segundo, mais forte que um golpe)
    comboRatio: 1.7,        // o 3º raio do combo bate x vezes mais forte
    speed: 520,             // px/s
    radius: 5,              // tamanho do raio
    comboRadius: 8,
    knockback: 70,
    flightHeight: 30,       // altura do voo na tela (px): sai da esfera do cajado erguido, acima da cabeça
    spawnForward: 22
};

export const FLAME_BLADE = {
    burnRatio: 0.4,
    burnSeconds: 3,
    oathMultiplier: 2,          // sob o Oath of the Hearth
    spreadRadius: 90            // monstro em chamas que morre passa o fogo (com o mesmo dano) a quem está perto
};

// Fireballs: a adaga continua sendo adaga (dano, alcance, Death Mark, carga, Ricochet); ao acertar, explode
export const FIREBALLS = {
    // Segurar o botão da adaga carrega a bola (era a Charged Dagger Throw): até `seconds` segurando, ela cresce até `maxScale` vezes e
    // leva `damage` x o dano a mais; abaixo de minCharge é um arremesso normal. A bola carregada explode no primeiro monstro (não
    // atravessa) e NÃO ricocheteia.
    charge: { seconds: 1.4, minCharge: 0.25, damage: 3, maxScale: 2.4 },
    castSeconds: 0.55,          // a bola cresce na mão e o herói fica parado, sem golpear nem dar dash
    splashRadius: 70,           // cresce com o tamanho da adaga carregada
    splashRatio: 0.6,           // dano nos vizinhos, em fração do dano da adaga
    burnRatio: 0.25,            // queimadura por segundo, em fração do dano da adaga
    burnSeconds: 3,
    patchSeconds: 2,            // o chão queima onde a bola explodiu (dano em fração do feitiço, por segundo)
    patchDps: 0.5
};

// Blue Torch: a tocha azul (chama, luz, golpes). Luz e calor maiores, fogo da tocha mais forte e frio que atrasa e fragiliza
export const BLUE_TORCH = {
    light: 0.25,                // raio da luz da tocha
    warmth: 0.2,                // alcance do calor (onde cura o herói)
    fireDamage: 0.3,            // dano dos golpes da tocha (Flame Sentinel, Hearth Ring, Solar Wall)
    chill: 0.25,                // lentidão em quem está dentro do calor
    brittle: 0.15,              // quem está lento leva mais dano dos golpes de fogo da tocha
    color: '#60a5fa'
};

// Fire Tornado: a cada tanto um furacão de fogo se forma sobre a tocha e castiga tudo dentro do círculo tracejado dela (o calor da tocha)
export const FIRE_TORNADO = {
    cooldownSeconds: 32,
    durationSeconds: 5,
    radius: 190,                // alcance fixo: o mesmo raio máximo do Hearth Ring (não segue o calor da tocha)
    tickSeconds: 0.25,
    damage: 1.1,                // x dano do fogo da tocha, por pulso, em cada monstro dentro do círculo
    burnSeconds: 2,             // quem foi pego segue queimando
    pull: 55,                   // quanto o furacão puxa os monstros para o centro (pixels por segundo)
    firstDelaySeconds: 8        // a primeira vez que se forma, depois de aprender
};

// Flaming Phoenix: a fênix da tocha rodeia a chama e atira nos monstros perto dela (o fogo da tocha: a Blue Torch também vale)
export const HEARTH_PHOENIX = {
    cooldownSeconds: 2.6,
    range: 360,                 // a partir da tocha
    speed: 330,
    turnRate: 8,
    boltDamage: 1.7,            // x dano de feitiço
    hoverY: -170,               // acima da chama
    orbit: 125,                 // raio do voo em volta da tocha
    orbitFlat: 0.5,             // achatamento da elipse (1 = círculo)
    orbitSpeed: 0.7,            // voltas em radianos por segundo
    followSpeed: 4,
    riseSeconds: 0.9,
    // Sopro de fogo: de tempos em tempos ela para de lançar bolas e cospe um jato de chamas contínuo no monstro mais perto
    breathCooldown: 8,          // segundos entre sopros
    breathSeconds: 1.6,         // duração do jato
    breathRange: 270,           // comprimento do jato a partir do bico
    breathArc: 0.6,             // abertura do cone (radianos, do lado de fora de um lado ao outro)
    breathTick: 0.15,           // segundos entre os danos
    breathDamage: 0.55,         // x dano do fogo da tocha, por pulso (em todos no cone)
    breathBurnSeconds: 3,       // quem foi pego segue queimando
    breathTurn: 2.2             // velocidade com que o jato acompanha o alvo (rad/s)
};

// Phoenix Pact: a fênix voa no ombro do herói e atira bolas de fogo. Quando ele cai, ela morre para levantá-lo
// (uma vez por hora) e renasce na hora seguinte.
export const PHOENIX_PACT = {
    healRatio: 0.45,
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
    cooldownSeconds: 2.4,
    range: 340,
    speed: 330,
    turnRate: 8,
    boltDamage: 2.2,            // x dano de feitiço
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
    bossRatio: 0.5,             // num chefe a corrente segura só esta parte do tempo (50%: 5 s)
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
        maxShadows: 5
    }
};
