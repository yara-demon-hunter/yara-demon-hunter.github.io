// --- PASSIVAS ---
// type 'skill': aprendidas na árvore de skills, com pontos (data_model/skill_tree).
// Sem type (relíquias): compradas com ouro na árvore de relíquias do acampamento (data_model/relics.js),
// onde cost é o preço base em moedas.
// mods: efeitos simples, somados por js/systems/modifiers.js. As skills têm mecânica própria.

const formatPercent = (value) => `${Number((value * 100).toFixed(1))}%`;
const formatMultiplier = (value) => `${Number(value.toFixed(2))}×`;
const formatNumber = (value) => String(Number(value.toFixed(2)));

// --- SKILLS PASSIVAS COM NÍVEIS ---
// Algumas passivas têm 3 níveis (maxLvl 3): o ÚLTIMO nível é o valor equilibrado da skill; os de antes são mais fracos, na ordem. As tabelas
// ficam aqui, o campo da constante (ex.: FEATHER_DODGE.cooldownSeconds) passa a valer o nível atual (scaleByLevel, no fim do arquivo) e a
// árvore trava o nó seguinte até certo nível (data_model/skill_tree/nodes). Antes de aprender, vale o nível 1.
export const levelSource = { of: () => 1 };          // js/core/state.js liga isto ao nível de cada passiva
export const LEVELS = {
    shadowRaven: { cooldownSeconds: [3.6, 3, 2.4], range: [220, 260, 300], damage: [0.7, 0.9, 1.1], markSeconds: [1.2, 1.6, 2], markDamage: [0.1, 0.18, 0.25] },
    featherDodge: { cooldownSeconds: [12, 10, 8], immuneSeconds: [1, 1.25, 1.5], feathers: [18, 24, 30] },
    featherRain: { cooldownSeconds: [8, 6.5, 5.5], targets: [1, 2, 2], quills: [8, 12, 15], damage: [0.25, 0.3, 0.35] },
    roseWhip: { cooldownSeconds: [26, 23, 20], holdSeconds: [4, 5, 6], lashDamage: [2.2, 2.7, 3.2], thornDps: [0.45, 0.55, 0.7] },
    rosePetals: { cooldownSeconds: [24, 20, 17], durationSeconds: [3.5, 4.2, 5], radius: [120, 145, 170], damage: [0.6, 0.75, 0.9] }
};
const atLevel = (key, values) => values[Math.max(1, Math.min(values.length, levelSource.of(key) || 1)) - 1];
const byLevel = (values, format = formatNumber) => values.map(format).join(' / ');       // "12 / 10 / 8": o texto mostra os três níveis
function scaleByLevel(model, key) {
    for (const [field, values] of Object.entries(LEVELS[key])) {
        Object.defineProperty(model, field, { get: () => atLevel(key, values), enumerable: true, configurable: true });
    }
    return model;
}

export const PASSIVE_SKILL_MODELS = {
    shadowWhirl: {
        name: 'Whirlwind',
        icon: '🌀',
        cost: 80,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Your final combo hit becomes a whirlwind that spins around you, striking every enemy in a wider circle.",
    },
    mirrorWard: {
        name: 'Return Fire',
        icon: '🪞',
        cost: 60,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Bats an incoming enemy shot back at the nearest monster.",
    },
    shadowShackle: {
        name: 'Shadow Shackle',
        icon: '⛓️',
        cost: 120,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "You hurl a chain at the strongest monster within dagger range and nail it to the spot (half as long on a boss). It can still attack, and a boss can still teleport, but neither can walk.",
    },
    fanOfKnives: {
        name: 'Fan of Knives',
        icon: '🔱',
        cost: 110,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Throws several daggers at once in a fan.",
    },
    shadowClone: {
        name: 'Shadow Clone',
        icon: '👥',
        cost: 150,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "A shadow keeps watch near the torch and cuts down whatever comes close. Monsters ignore it, but a stray hit can bring it down. It returns after a while.",
    },
    parry: {
        name: 'Parry',
        icon: '🤺',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "When a monster strikes you in melee, your sword turns the blow aside: no damage, the attacker is stunned and hit back, and its neighbours are stunned too. Bosses are stunned only briefly.",
    },
    warCry: {
        name: 'War Cry',
        icon: '📣',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "When surrounded, you roar: monsters are thrown back and stunned, and your blade hits harder for a moment.",
    },
    roseWhip: {
        name: 'Rose Whip',
        icon: '🌹',
        cost: 130,
        maxLvl: 3,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "A whip of thorns, a rose at its tip, cracks at the strongest monster in reach. It lashes, then stays wrapped around it (half as long on a boss): the monster is pinned and the thorns keep biting.",
    },
    rosePetals: {
        name: 'Rose Petals',
        icon: '🌷',
        cost: 130,
        maxLvl: 3,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "When monsters are near, a hurricane of roses and petals spins around you, hitting everything in range, pushing monsters back and slowing them.",
    },
    featherDodge: {
        name: 'Feather Dodge',
        icon: '🪶',
        cost: 130,
        maxLvl: 3,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "When a blow would hit you, you burst into raven feathers and slip through it: the blow misses and you are untouchable for a moment.",
    },
    featherRain: {
        name: 'Feather Rain',
        icon: '🪶',
        cost: 120,
        maxLvl: 3,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "A rain of raven quills falls on the monsters your raven has marked.",
    },
    ravenDecoy: {
        name: 'Raven Decoy',
        icon: '🪶',
        cost: 140,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Feather Dodge leaves a giant feather where you stood. Monsters nearby rush it, then it bursts into feathers that hurt them.",
    },
    finalBlow: {
        name: 'Final Blow',
        icon: '☄️',
        cost: 120,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "The 3rd strike of your combo deals extra damage. With Whirlwind, it hits everyone around you.",
    },
    shatterStrike: {
        name: 'Shatter Strike',
        icon: '💢',
        cost: 120,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Your blow hurls one monster far away. If it crashes into another monster, both take damage; if it slams into a wall or obstacle, it takes more and is dazed. Too heavy to throw: bosses, elites, Bone Colossi, Golems and Treants.",
    },
    executioner: {
        name: 'Executioner',
        icon: '🪓',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Crimson Tide evolves: every swing throws several blood crescents in a fan instead of one.",
    },
    smokeBomb: {
        name: 'Smoke Bomb',
        icon: '🌫️',
        cost: 70,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Every dash leaves a trail of smoke. Monsters inside it slow down, and the hits they take have a chance to be critical.",
    },
    flameBlade: {
        name: 'Flaming Sword',
        icon: '⚔️',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Your sword catches fire. Every cut burns monsters, and a burning monster that dies passes the fire to others nearby. Under the Oath of the Hearth, burn damage doubles.",
    },
    fireballs: {
        name: 'Fireballs',
        icon: '☄️',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Your daggers become fireballs: they burst on impact, ignite everything nearby and leave the ground burning. Your magic damage multiplies them. The price: you stand still while the fire grows in your hand. Hold the dagger button to charge a huge fireball.",
        warning: 'Charged fireballs do not ricochet, and Ricochet is lost while you hold the fire.'
    },
    fireTornado: {
        name: 'Fire Tornado',
        icon: '🌪️',
        cost: 130,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "A tornado of fire forms over the torch now and then, scorching and igniting everything inside the torch's circle. It counts as the torch's fire.",
    },
    hearthPhoenix: {
        name: 'Flaming Phoenix',
        icon: '🐦‍🔥',
        cost: 130,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "A fire phoenix circles the torch, hurling fireballs at nearby monsters and now and then breathing a torrent of fire. It counts as the torch's fire.",
    },
    blueTorch: {
        name: 'Blue Torch',
        icon: '🔵',
        cost: 90,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "The torch burns blue: more light and warmth, stronger fire, and a cold flame that slows monsters inside its warmth. Slowed monsters take extra damage from the torch's fire hits only.",
    },
    phoenixPact: {
        name: 'Phoenix Pact',
        icon: '🦅',
        cost: 130,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "A phoenix flies at your shoulder and hurls fireballs at nearby monsters. Learn Phoenix Reborn to let it give its life for you.",
    },
    phoenixReborn: {
        name: 'Phoenix Reborn',
        icon: '🔥',
        cost: 130,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "The phoenix gives its life for you. When you fall, it raises you in a storm of fire; if the torch goes out, it relights it at half health, shielding you both. It is reborn the next wave.",
    },

    shadowRaven: {
        name: 'Shadow Raven',
        icon: '🐦‍⬛',
        cost: 90,
        maxLvl: 3,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "A small raven circles at your shoulder and dives at the nearest monster, pecks it and flies back. A pecked monster is marked: it takes extra damage from every hit.",
    },

    // --- NATUREZA ---
    thornBurst: {
        name: 'Thorn Burst',
        icon: '🌵',
        cost: 120,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "A monster killed by a Nature skill sprouts into a Cactling. When a monster, or you, touches it, it bursts into thorns in every direction.",
    },
    // Só o Rowan (hero: 'rowan' no nó da árvore): as rosas escurecem e ferem mais. Vale como mod de dano da adaga (knifeDamage),
    // então soma com o Dagger Mastery e tudo o mais que melhora a adaga
    darkRoses: {
        name: 'Dark Roses',
        icon: '🥀',
        cost: 140,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "Your roses wither and turn black in every skill that uses them. Nature Path skills and daggers deal more damage, and a monster they hit is marked: if it dies marked, thorn roses burst where it fell and hurt whatever crosses them. Only Rowan can learn this.",
        mods: { knifeDamage: 0.6, natureDamage: 0.2 }
    },
    oathWild: {
        name: 'Oath of the Wild',
        icon: '🦌',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        oath: true, gear: 'wild', tagline: 'The forest remembers',
        desc: "You heal over time, gain max health, roots hold longer and spells hit harder. The price: your Fury deals no damage (it still shields you and slows monsters).",
        mods: { hpRegen: 1.2, maxHp: 0.15, rootSeconds: 0.5, spellDamage: 0.15, furyNoDamage: 1 }
    },

    // Lâmina benta (só o Avgustino): a água benta na arma; cada golpe da lâmina também queima com magia (uma parte pequena dela)
    blessedBlade: {
        name: 'Blessed Blade',
        icon: '🗡️',
        cost: 0,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "You anoint your blade with holy water: every blade hit also burns with a part of your magic damage (a blue number beside the white one).",
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
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        desc: "You pray over a common monster near you and it joins your side for the rest of the night, at full health (it never heals). Converts stack: they fight nearby monsters and provoke them, so the horde attacks them instead of you. Bosses and elites cannot be converted. Only Avgustino can learn this.",
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
    oathFaith: {
        name: 'Oath of Faith',
        icon: '🕯️',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        oath: true, gear: 'faith', tagline: 'Light answers the dark',
        desc: "Shields of light circle you, striking monsters that come close and pushing them back. Spells hit harder, you heal over time, and the torch gains health and holds against hits. The price: you can no longer dash.",
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
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        oath: true, gear: 'slaughter', tagline: 'Blood answers blood',
        desc: "More blade damage, attack speed and Fury charge, and kills heal you. Monsters are drawn to you from farther away. The price: the torch's warmth no longer heals you, and you can no longer throw daggers.",
        mods: { bladeDamage: 0.25, attackSpeed: 0.05, furyCharge: 0.4, killHeal: 1, provoke: 0.5, noWarmthHeal: 1, noKnives: 1 }
    },
    oathWhispers: {
        name: 'Oath of Whispers',
        icon: '🤫',
        cost: 300,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        oath: true, gear: 'whispers', tagline: 'Never where they strike',
        desc: "More dash charges, faster dash recharge, move speed, crit chance and dagger damage. Every few kills a shadow joins the torch. The price: less max health.",
        mods: { dashCharges: 1, dashCooldown: 0.2, moveSpeed: 0.15, critChance: 0.1, knifeDamage: 0.5, maxHp: -0.25 }
    },
    oathHearth: {
        name: 'Oath of the Hearth',
        icon: '🛡️',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        oath: true, gear: 'hearth', tagline: 'The flame will not die',
        desc: "The torch takes less damage, you gain max health, and its warmth reaches farther and burns monsters inside it. The price: less move speed.",
        mods: { torchGuard: 0.25, maxHp: 0.3, warmth: 1, warmthBurn: 0.4, moveSpeed: -0.3 }
    },
    oathRuin: {
        name: 'Oath of Ruin',
        icon: '📕',
        cost: 200,
        maxLvl: 1,
        type: 'skill',      // aprendida na árvore de skills, com pontos (custo em pontos: data_model/skill_tree)
        oath: true, gear: 'ruin', tagline: 'The dark pays in kind',
        desc: "Spells deal more damage and recharge faster. The price: your blade deals much less damage.",
        mods: { spellDamage: 0.2, spellHaste: 0.12, bladeDamage: -0.4 }
    },

    // Mãos de ladrão (ramo Fortune da árvore de relíquias)
    lightFingers: { name: 'Light Fingers', icon: '🧤', cost: 150, maxLvl: 1, desc: 'Coins and loot leap into your hands: your pickup range doubles.', mods: { magnet: 1 } },
    pickpocket: { name: 'Pickpocket', icon: '👛', cost: 200, maxLvl: 1, desc: 'Every monster you kill drops 2 extra gold.', mods: { killGold: 2 } },
    coinRush: { name: 'Coin Rush', icon: '💰', cost: 300, maxLvl: 1, desc: 'Every coin you grab shaves 0.05s off your dagger and dash recharge. Gold buys speed.', mods: { coinHaste: 0.05 } },
    thiefNose: { name: "Thief's Nose", icon: '👃', cost: 350, maxLvl: 1, desc: 'You smell what others miss: monsters drop items 60% more often.', mods: { pickupRate: 0.6 } },
    masterThief: {
        name: 'Master Thief',
        icon: '🦝',
        cost: 400,
        maxLvl: 1,
        desc: 'Dash through monsters to pick their pockets. A Perfect Dodge steals a fistful of gold.'
    },
    greedyIdol: {
        name: 'Greedy Idol',
        icon: '🗿',
        cost: 200,
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
// Thorn Burst: quem morre por um golpe do Nature Path vira um Caquito (cacto pequeno, no máximo maxCacti de uma vez); quando um monstro ou o herói encosta
// nele (depois de armSeconds), ele explode e solta `needles` espinhos em todas as direções (cada um fere o primeiro monstro que acerta).
export const THORN_BURST = {
    maxCacti: 3, lifeSeconds: 25, growSeconds: 0.3, armSeconds: 0.7, touchRadius: 15,
    needles: 12, maxPerMonster: 3, needleDamage: 0.7, needleSpeed: 430, needleLife: 0.5, needleRadius: 5, knockback: 70
};
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

// Parry (js/systems/skills_blade.js, tryParry): o golpe corpo a corpo que ia acertar o herói é desviado com a espada. Sem dano para ele;
// o monstro leva um contragolpe e fica atordoado, e os vizinhos (radius) também, pela metade do tempo. Chefe só perde bossStunRatio do
// atordoamento. Passiva única (antes era um poder de 5 níveis): os números são os do antigo nível 3.
export const PARRY = {
    cooldown: 5.5,              // segundos até poder aparar de novo
    stun: 1.4,                  // atordoamento de quem bateu
    damage: 1.5,                // contragolpe, x dano de arma
    radius: 60,                 // vizinhos do atacante também ficam atordoados (metade do tempo)
    knockback: 260,
    bossStunRatio: 0.35,
    invulnerableSeconds: 0.5    // o herói fica invulnerável depois do aparo
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

// Ataque básico arcano (Gudran e qualquer herói com basicAttack: 'arcane'): no lugar do golpe de lâmina, ele ergue o cajado e solta
// um raio de energia azul no monstro mais perto. Dano de MAGIA (número azul). Cada 3º raio é maior e empurra mais.
export const ARCANE_BOLT = {
    damageRatio: 1.0,       // dano do raio = dano de magia × isto (um raio por segundo, mais forte que um golpe)
    comboRatio: 1.7,        // o 3º raio do combo bate x vezes mais forte
    speed: 520,             // px/s
    radius: 5,              // tamanho do raio
    comboRadius: 8,
    knockback: 70,
    range: 380,             // até onde o raio voa, px (27/11/2026: o raio é o clique do Gudran; antes o alcance era o do ataque básico)
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
// Phoenix Reborn: a fênix se sacrifica (uma vez por hora): levanta o herói caído ou reacende a tocha apagada (js/systems/skills_flame.js,
// tryPhoenix e tryPhoenixTorch). Antes isso era parte do Phoenix Pact, que agora é só a ave que voa e atira.
export const PHOENIX_REBORN = {
    healRatio: 0.45,            // vida com que o herói levanta
    invulnerableSeconds: 2.5,
    radius: 300,                // o pulso de fogo em volta de quem foi salvo
    damage: 3,                  // x dano de feitiço
    knockback: 760
};

export const PHOENIX_PACT = {
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
    holdSeconds: 6,
    bossRatio: 0.5,             // num chefe a corrente segura só esta parte do tempo (50%: 5 s)
    speed: 800                  // velocidade da ponta da corrente
};

// (o bônus rootSeconds de quem o tem, como o Rowan, também estica o tempo que o chicote segura)
// Rose Petals (Nature; js/systems/skills_nature.js, updateRosePetals; desenho em js/render/rose_petals.js): um furacão de rosas e pétalas gira em volta do
// herói (e o acompanha) por durationSeconds, ferindo em pulsos tudo no raio grande.
export const ROSE_PETALS = {
    cooldownSeconds: 17,
    durationSeconds: 5,
    radius: 170,                // raio grande, em volta do herói
    tickSeconds: 0.4,
    damage: 0.9,                // x dano de feitiço, por pulso, em cada monstro dentro do raio
    knockback: 28,              // empurrão para fora a cada pulso
    slow: 0.25,                 // e a lentidão enquanto o furacão dura
    firstDelaySeconds: 6        // a primeira vez que se forma, depois de aprender
};

// Rose Whip (Nature; js/systems/skills_nature.js, updateRoseWhip; desenho em js/render/rose_whip.js): irmã do Shadow Shackle. O chicote voa até o
// monstro de mais vida ao alcance, açoita (lashDamage) e fica enrolado nele: prende no lugar (e.chained) e os espinhos mordem a cada tique.
// (evoluído, Crimson Surge: os números de EVOLUTIONS.roseWhip.levels trocam holdSeconds e somam o pulso de energia vermelha: pulseSeconds, pulseDamage, travelSeconds)
export const ROSE_WHIP = {
    cooldownSeconds: 20,        // conta a partir do lançamento
    range: 300,                 // alcance do chicote, a partir do herói
    holdSeconds: 6,             // quanto tempo fica enrolado
    bossRatio: 0.5,             // num chefe segura só esta parte do tempo
    speed: 900,                 // velocidade da ponta do chicote
    lashDamage: 3.2,            // o açoite, x dano de feitiço
    thornDps: 0.7,              // os espinhos, x dano de feitiço por segundo enquanto está enrolado
    tickSeconds: 0.5
};

// Feather Dodge (Shadow; js/systems/skills_shadow.js, tryFeatherDodge, chamado por hurtPlayer em js/systems/player.js): o golpe que ia acertar o herói erra,
// uma tempestade de penas de corvo aparece e ele fica intocável por immuneSeconds. Carrion Feast: quem morre marcado pelo corvo cura o herói e adianta a recarga.
export const FEATHER_DODGE = {
    cooldownSeconds: 8,
    immuneSeconds: 1.5,           // intocável depois de escapar (o herói pisca como em qualquer invulnerabilidade)
    feathers: 30                // quantas penas voam
};
// Feather Rain (Shadow; js/systems/skills_shadow.js, updateFeatherRain): a cada cooldownSeconds uma chuva de penas cai de cima nos monstros marcados pelo corvo.
export const FEATHER_RAIN = {
    cooldownSeconds: 5.5,
    targets: 2,                 // quantos marcados recebem a chuva de cada vez
    quills: 15,                  // penas por alvo
    damage: 0.35,                // dano de lâmina de cada pena
    stuckSeconds: 1.4,          // quanto tempo a pena fica fincada no chão antes de sumir
    fallSeconds: 0.45           // quanto uma pena demora para cair
};

// Raven Decoy (Shadow; js/systems/skills_shadow.js, tryFeatherDodge / updateFeathers; a isca atrai como o carvalho acordado, em js/systems/enemies.js):
// o Feather Dodge deixa uma pena gigante onde o herói estava; os monstros comuns correm para ela e, no fim, ela explode em penas.
export const RAVEN_DECOY = {
    seconds: 2,                 // quanto tempo a isca fica de pé
    lures: 320,                 // de que distância os monstros comuns a veem
    radius: 90,                 // área da explosão
    damage: 2,                  // dano de lâmina da explosão
    feathers: 24                // penas da explosão
};

// Final Blow (Blade; js/systems/skills_blade.js, getFinalBlowMultiplier; o multiplicador entra em js/systems/combat.js): o 3º golpe do combo causa o dobro de dano.
export const FINAL_BLOW = {
    damageMultiplier: 2
};
// Shatter Strike (Blade; js/systems/skills_blade.js, launchShatter e updateShatter): a cada `cooldownSeconds`, o golpe LANÇA um monstro muito mais longe do que um empurrão comum.
// Se ele bater em outro monstro, os dois levam dano; se bater numa parede, num obstáculo do cenário ou na borda da tela, ele leva um dano maior e fica tonto.
// Não funciona em monstros pesados: chefes, elites, Bone Colossus, Golem e Treant (`immune`). Dano em x do dano da lâmina.
export const SHATTER_STRIKE = {
    cooldownSeconds: 15,        // recarga
    launchSpeed: 900,           // velocidade do lançamento (px/s): voa ~350 px (um empurrão comum anda ~30)
    flightDamping: 0.965,       // freio por quadro durante o voo (o normal dos monstros é 0.88)
    flightSeconds: 0.75,        // o voo acaba depois disto, ou ao bater, ou ao ficar lento demais
    minSpeed: 170,              // abaixo desta velocidade o voo acabou
    hitDamage: 1.2,             // dano no monstro que ele atinge
    selfDamage: 0.8,            // dano no monstro lançado ao bater em outro monstro
    wallDamage: 1.5,            // dano no monstro lançado ao bater em parede, obstáculo ou borda
    knockback: 120,             // empurrão extra no monstro atingido
    dazeSeconds: 0.7,           // tontura depois da pancada
    immune: ['BONE_COLOSSUS', 'GOLEM', 'TREANT']       // além de chefes e elites
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

scaleByLevel(SHADOW_RAVEN, 'shadowRaven');
scaleByLevel(FEATHER_DODGE, 'featherDodge');
scaleByLevel(FEATHER_RAIN, 'featherRain');
scaleByLevel(ROSE_WHIP, 'roseWhip');
scaleByLevel(ROSE_PETALS, 'rosePetals');

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
