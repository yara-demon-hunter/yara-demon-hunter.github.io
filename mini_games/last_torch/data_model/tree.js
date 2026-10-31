// --- ÁRVORE DE SKILLS ---
// Cada nível do herói dá pontos de skill, gastos aqui (medalhão de status). A árvore recomeça a cada noite
// e tudo está disponível desde a primeira partida: o que abre cada nó é só o que aparece na própria árvore.
// kind: stat (sobe um atributo), power (sobe um poder), evolve (transforma um poder no nível máximo),
// mod (efeito simples por nível, `mods` em js/systems/modifiers.js),
// passive (skill passiva única de data_model/passives.js).
// Conceito de cada ramo, formatos e regras de custo: SKILLS.md.
// x = coluna (0 a 5, da esquerda para a direita), y = linha dentro do ramo (0 a 2).
// requires: o nó anterior na árvore, como req(id, nível mínimo). O pré-requisito vem SEMPRE do nó anterior
// (a linha que chega nele): quem já cumpriu a cadeia até ali não esbarra em exigências de nós mais atrás.
// Se um nó mais atrás precisa ter mais nível, suba o nível pedido no nó do meio. O painel de detalhe mostra
// tudo o que falta de uma vez, e `kills` entra como pedido extra.
// kills: { type, count, label } exige matar `count` monstros daquele tipo NA NOITE ATUAL (type 'ANY' = qualquer).
// O custo vem de TREE_COSTS (por ramo e tipo de nó). `cost` no nó só para uma exceção. maxLvl padrão 5.
export const TREE_POINTS = {
    perLevel: 1                 // pontos por nível do herói
};

// Pontos por nível: quanto mais habilidade o ramo exige do jogador, mais barato ele é.
// basic = stats e efeitos simples; power = poderes; special = passivas e evoluções
export const TREE_COSTS = {
    shadow: { basic: 1, power: 1, special: 2 },
    blade: { basic: 1, power: 2, special: 3 },
    flame: { basic: 1, power: 3, special: 4 },
    curse: { basic: 1, power: 3, special: 4 }
};

export const TREE_LAYOUT = {
    labelWidth: 1.5,            // coluna do nome do ramo, em células
    tiers: 6,
    branchGap: 0.3
};

export const TREE_BRANCHES = {
    blade: { name: 'BLADE', icon: '🤺', color: '#67e8f9', style: 'Warrior: raw strength, kill everything.' },
    shadow: { name: 'SHADOW', icon: '🌑', color: '#a5b4fc', style: 'Thief: technical and cheap, takes skill.' },
    flame: { name: 'FLAME', icon: '🕯️', color: '#fb923c', style: 'Keeper: defensive, calm and cautious.' },
    curse: { name: 'CURSE', icon: '🌙', color: '#e879f9', style: 'Sorcerer: spells, area and distance.' }
};

// req(id) = nível 1 do nó; req(id, 3) = nível 3
export const req = (id, lvl = 1) => ({ id, lvl });

export const TREE_NODES = [
    // --- LÂMINA: o guerreiro. Força bruta, vida e Fúria ---
    { id: 'damage', branch: 'blade', kind: 'stat', key: 'damage', x: 0, y: 1, requires: [] },
    // Linha da Fúria
    { id: 'frenzyNova', branch: 'blade', kind: 'stat', key: 'frenzyNova', x: 1, y: 0, requires: [req('damage')] },
    { id: 'emberHeart', branch: 'blade', kind: 'mod', x: 2, y: 0, requires: [req('frenzyNova', 2)],
      name: 'Battle Rage', icon: '💢', desc: 'Fury charges faster.', levelText: '+12% Fury charge', mods: { furyCharge: 0.12 } },
    { id: 'keenEye', branch: 'blade', kind: 'power', key: 'keenEye', x: 3, y: 0, requires: [req('emberHeart', 2)] },
    { id: 'slashArc', branch: 'blade', kind: 'stat', key: 'slashArc', x: 4, y: 0, requires: [req('keenEye', 2)] },
    { id: 'shadowWhirl', branch: 'blade', kind: 'passive', key: 'shadowWhirl', x: 5, y: 0, requires: [req('slashArc', 2)],
      kills: { type: 'BAT', count: 15, label: 'Bats' } },
    // Linha do aço
    { id: 'atkSpeed', branch: 'blade', kind: 'stat', key: 'atkSpeed', x: 1, y: 1, requires: [req('damage')] },
    { id: 'radius', branch: 'blade', kind: 'stat', key: 'radius', x: 2, y: 1, requires: [req('atkSpeed')] },
    { id: 'orbitBlades', branch: 'blade', kind: 'power', key: 'orbitBlades', x: 3, y: 1, requires: [req('radius', 3)],
      kills: { type: 'SKELETON', count: 20, label: 'Skeletons' } },
    { id: 'orbitEvolve', branch: 'blade', kind: 'evolve', key: 'orbitBlades', x: 4, y: 1, requires: [req('orbitBlades', 5)] },
    // Linha do corpo
    { id: 'playerHp', branch: 'blade', kind: 'stat', key: 'playerHp', x: 1, y: 2, requires: [req('damage')] },
    { id: 'knockback', branch: 'blade', kind: 'stat', key: 'knockback', x: 2, y: 2, requires: [req('playerHp')] },
    { id: 'ironSkin', branch: 'blade', kind: 'mod', x: 3, y: 2, requires: [req('knockback', 2)],
      name: 'Iron Skin', icon: '🪨', desc: 'Blows land softer.', levelText: '-4% damage taken', mods: { damageTaken: -0.04 } },
    { id: 'bloodEdge', branch: 'blade', kind: 'power', key: 'bloodEdge', x: 4, y: 2, requires: [req('ironSkin', 2)],
      kills: { type: 'ANY', count: 40, label: 'monsters' } },

    // --- SOMBRA: o ladrão. Velocidade, adagas, esquiva e ouro ---
    { id: 'moveSpeed', branch: 'shadow', kind: 'stat', key: 'moveSpeed', x: 0, y: 1, requires: [] },
    // Linha das adagas
    { id: 'ricochet', branch: 'shadow', kind: 'power', key: 'ricochet', x: 1, y: 0, requires: [req('moveSpeed')] },
    { id: 'quickHands', branch: 'shadow', kind: 'mod', x: 2, y: 0, requires: [req('ricochet', 2)],
      name: 'Quick Hands', icon: '🖐️', desc: 'Your daggers recharge faster.', levelText: '-6% dagger recharge', mods: { knifeCooldown: 0.06 } },
    { id: 'daggerMastery', branch: 'shadow', kind: 'mod', x: 3, y: 0, requires: [req('quickHands', 2)],
      name: 'Dagger Mastery', icon: '🔪', desc: 'Thrown daggers cut deeper.', levelText: '+15% dagger damage', mods: { knifeDamage: 0.15 } },
    { id: 'longThrow', branch: 'shadow', kind: 'passive', key: 'longThrow', x: 4, y: 0, requires: [req('daggerMastery', 2)] },
    { id: 'fanOfKnives', branch: 'shadow', kind: 'passive', key: 'fanOfKnives', x: 5, y: 0, requires: [req('longThrow')] },
    { id: 'soulLance', branch: 'shadow', kind: 'power', key: 'soulLance', x: 5, y: 1, requires: [req('longThrow')] },
    { id: 'lanceEvolve', branch: 'shadow', kind: 'evolve', key: 'soulLance', x: 5, y: 2, requires: [req('soulLance', 5)] },
    // Linha da esquiva
    { id: 'phantomDash', branch: 'shadow', kind: 'power', key: 'phantomDash', x: 1, y: 1, requires: [req('moveSpeed', 2)],
      kills: { type: 'BAT', count: 15, label: 'Bats' } },
    { id: 'fleetFoot', branch: 'shadow', kind: 'mod', x: 2, y: 1, requires: [req('phantomDash')],
      name: 'Fleet Foot', icon: '💨', desc: 'The dash recharges faster.', levelText: '-7% dash recharge', mods: { dashCooldown: 0.07 } },
    { id: 'shadowClone', branch: 'shadow', kind: 'passive', key: 'shadowClone', x: 3, y: 1, requires: [req('fleetFoot', 2)],
      kills: { type: 'VAMPIRE', count: 8, label: 'Vampires' } },
    // Linha do ladrão
    { id: 'lightFingers', branch: 'shadow', kind: 'mod', x: 1, y: 2, requires: [req('moveSpeed')], maxLvl: 3,
      name: 'Light Fingers', icon: '🧤', desc: 'Coins and loot find their way to your hands.', levelText: '+60% pickup range', mods: { magnet: 0.6 } },
    { id: 'pickpocket', branch: 'shadow', kind: 'mod', x: 2, y: 2, requires: [req('lightFingers')],
      name: 'Pickpocket', icon: '👛', desc: 'Every corpse has something worth taking.', levelText: '+8% gold', mods: { gold: 0.08 } },
    { id: 'treasureNose', branch: 'shadow', kind: 'mod', x: 3, y: 2, requires: [req('pickpocket', 2)],
      name: "Thief's Nose", icon: '👃', desc: 'You sniff out what others miss. Monsters drop items more often.', levelText: '+10% item drops', mods: { pickupRate: 0.1 } },
    { id: 'masterThief', branch: 'shadow', kind: 'passive', key: 'masterThief', x: 4, y: 2, requires: [req('treasureNose', 2)] },

    // --- CHAMA: o guardião. A tocha, o calor e o fogo ---
    { id: 'torchKeeper', branch: 'flame', kind: 'mod', x: 0, y: 1, requires: [],
      name: 'Torch Keeper', icon: '🏮', desc: 'The torch holds more flame.', levelText: '+15 torch health', mods: { torchHp: 15 } },
    // Linha do calor
    { id: 'warmHearth', branch: 'flame', kind: 'mod', x: 1, y: 0, requires: [req('torchKeeper')],
      name: 'Warm Hearth', icon: '♨️', desc: 'The fire warms you and mends itself.', levelText: '+20% warmth, torch heals 0.2/s', mods: { warmth: 0.2, torchRegen: 0.2 } },
    { id: 'sacredGround', branch: 'flame', kind: 'mod', x: 2, y: 0, requires: [req('warmHearth', 2)],
      name: 'Sacred Ground', icon: '🔥', desc: 'You hit harder inside the warmth of the torch.', levelText: '+8% damage in the warmth', mods: { warmthDamage: 0.08 } },
    { id: 'undyingFlame', branch: 'flame', kind: 'mod', x: 3, y: 0, requires: [req('sacredGround', 2)],
      name: 'Undying Flame', icon: '🕯️', desc: 'The torch refuses to go out.', levelText: '+20 torch health, heals 0.3/s', mods: { torchHp: 20, torchRegen: 0.3 } },
    // Linha da sentinela
    { id: 'torchBolts', branch: 'flame', kind: 'power', key: 'torchBolts', x: 1, y: 1, requires: [req('torchKeeper', 2)] },
    { id: 'sunEvolve', branch: 'flame', kind: 'evolve', key: 'torchBolts', x: 2, y: 1, requires: [req('torchBolts', 5)] },
    // Linha da brasa
    { id: 'emberTrail', branch: 'flame', kind: 'power', key: 'emberTrail', x: 1, y: 2, requires: [req('torchKeeper')] },
    { id: 'emberEvolve', branch: 'flame', kind: 'evolve', key: 'emberTrail', x: 2, y: 2, requires: [req('emberTrail', 5)] },

    // --- MALDIÇÃO: o feiticeiro. Magia, morte e conhecimento ---
    { id: 'arcaneStudy', branch: 'curse', kind: 'mod', x: 0, y: 1, requires: [],
      name: 'Arcane Study', icon: '🧿', desc: 'You learn from every kill.', levelText: '+5% XP', mods: { xp: 0.05 } },
    // Linha do gelo e da força
    { id: 'chillAura', branch: 'curse', kind: 'power', key: 'chillAura', x: 1, y: 0, requires: [req('arcaneStudy')] },
    { id: 'soulNova', branch: 'curse', kind: 'power', key: 'soulNova', x: 2, y: 0, requires: [req('chillAura', 3)],
      kills: { type: 'WITCH', count: 10, label: 'Witches' } },
    { id: 'novaEvolve', branch: 'curse', kind: 'evolve', key: 'soulNova', x: 3, y: 0, requires: [req('soulNova', 5)] },
    { id: 'mirrorWard', branch: 'curse', kind: 'passive', key: 'mirrorWard', x: 3, y: 1, requires: [req('soulNova', 2)],
      kills: { type: 'WITCH', count: 10, label: 'Witches' } },
    // Linha da tempestade
    { id: 'chainLightning', branch: 'curse', kind: 'power', key: 'chainLightning', x: 1, y: 1, requires: [req('arcaneStudy', 2)],
      kills: { type: 'BAT', count: 20, label: 'Bats' } },
    { id: 'wrathEvolve', branch: 'curse', kind: 'evolve', key: 'chainLightning', x: 2, y: 1, requires: [req('chainLightning', 5)] },
    { id: 'starfall', branch: 'curse', kind: 'power', key: 'starfall', x: 3, y: 2, requires: [req('chainLightning', 3)],
      kills: { type: 'VAMPIRE', count: 15, label: 'Vampires' } },
    // Linha da morte
    { id: 'corpseBurst', branch: 'curse', kind: 'power', key: 'corpseBurst', x: 1, y: 2, requires: [req('arcaneStudy')],
      kills: { type: 'SKELETON', count: 30, label: 'Skeletons' } },
    { id: 'corpseEvolve', branch: 'curse', kind: 'evolve', key: 'corpseBurst', x: 2, y: 2, requires: [req('corpseBurst', 5)] }
];

export const TREE_BY_ID = Object.fromEntries(TREE_NODES.map(node => [node.id, node]));
