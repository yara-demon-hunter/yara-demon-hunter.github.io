// --- ÁRVORE DE SKILLS ---
// Cada nível do herói dá pontos de skill, gastos aqui (medalhão de status). A árvore recomeça a cada noite
// e tudo está disponível desde a primeira partida: o que abre cada nó é só o que aparece na própria árvore.
// kind: stat (sobe um atributo), power (sobe um poder), evolve (transforma um poder no nível máximo),
// mod (efeito simples por nível, `mods` em js/systems/modifiers.js),
// passive (skill passiva única de data_model/passives.js; com `oath: true` é um Juramento: só um por noite, e abre com as duas skills que chegam nele).
// Conceito de cada ramo, formatos e regras de custo: SKILLS.md.
// x = coluna (0 a 6, da esquerda para a direita), y = linha dentro do ramo (0 a 3; 1.5 = entre duas linhas).
// requires: o nó anterior na árvore, como req(id, nível mínimo). O pré-requisito vem SEMPRE do nó anterior
// (a linha que chega nele): quem já cumpriu a cadeia até ali não esbarra em exigências de nós mais atrás.
// Se um nó mais atrás precisa ter mais nível, suba o nível pedido no nó do meio. O painel de detalhe mostra
// tudo o que falta de uma vez, e `kills` entra como pedido extra.
// kills: { type, count, label } exige matar `count` monstros daquele tipo NA NOITE ATUAL (type 'ANY' = qualquer).
// O custo vem de TREE_COSTS (por ramo e tipo de nó). `cost` no nó só para uma exceção. maxLvl padrão 5.
export const TREE_POINTS = {
    perLevel: 2                 // pontos por nível do herói
};

// Pontos por nível: quanto mais habilidade o ramo exige do jogador, mais barato ele é.
// basic = stats e efeitos simples; power = poderes; special = passivas e evoluções
export const TREE_COSTS = {
    shadow: { basic: 1, power: 1, special: 1 },
    blade: { basic: 1, power: 2, special: 3 },
    flame: { basic: 1, power: 3, special: 4 },
    curse: { basic: 1, power: 3, special: 4 }
};

export const TREE_LAYOUT = {
    labelWidth: 1.5,            // coluna do nome do ramo, em células
    tiers: 7,
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
    // --- LÂMINA: o guerreiro. Força bruta, matar tudo, ser cercado de propósito ---
    { id: 'damage', branch: 'blade', kind: 'stat', key: 'damage', x: 0, y: 1.5, requires: [] },
    // Linha da Fúria: matar alimenta matar
    { id: 'frenzyNova', branch: 'blade', kind: 'stat', key: 'frenzyNova', x: 1, y: 0, requires: [req('damage')] },
    { id: 'emberHeart', branch: 'blade', kind: 'mod', x: 2, y: 0, requires: [req('frenzyNova', 2)],
      name: 'Battle Rage', icon: '💢', desc: 'Fury charges faster.', levelText: '+12% Fury charge', mods: { furyCharge: 0.12 } },
    { id: 'bloodlust', branch: 'blade', kind: 'power', key: 'bloodlust', x: 3, y: 0, requires: [req('emberHeart', 2)] },
    { id: 'bloodlustEvolve', branch: 'blade', kind: 'evolve', key: 'bloodlust', x: 4, y: 0, requires: [req('bloodlust', 5)] },
    // Linha do aço: o golpe cada vez mais largo e mortal
    { id: 'atkSpeed', branch: 'blade', kind: 'stat', key: 'atkSpeed', x: 1, y: 1, requires: [req('damage')] },
    { id: 'keenEye', branch: 'blade', kind: 'power', key: 'keenEye', x: 2, y: 1, requires: [req('atkSpeed', 2)] },
    { id: 'slashArc', branch: 'blade', kind: 'stat', key: 'slashArc', x: 3, y: 1, requires: [req('keenEye', 2)] },
    { id: 'shadowWhirl', branch: 'blade', kind: 'passive', key: 'shadowWhirl', x: 4, y: 1, requires: [req('slashArc', 2)],
      kills: { type: 'BAT', count: 15, label: 'Bats' } },
    { id: 'executioner', branch: 'blade', kind: 'passive', key: 'executioner', x: 5, y: 1, requires: [req('shadowWhirl')] },
    // Linha da força: quebrar o chão
    { id: 'radius', branch: 'blade', kind: 'stat', key: 'radius', x: 1, y: 2, requires: [req('damage')] },
    { id: 'provoke', branch: 'blade', kind: 'mod', x: 2, y: 2, requires: [req('radius')],
      name: 'Provoke', icon: '🗯️', desc: 'Monsters leave the torch and come for you from farther away.', levelText: '+25% provoke range', mods: { provoke: 0.25 } },
    { id: 'knockback', branch: 'blade', kind: 'stat', key: 'knockback', x: 3, y: 2, requires: [req('provoke')] },
    { id: 'earthbreaker', branch: 'blade', kind: 'power', key: 'earthbreaker', x: 4, y: 2, requires: [req('knockback', 2)],
      kills: { type: 'SKELETON', count: 20, label: 'Skeletons' } },
    { id: 'earthbreakerEvolve', branch: 'blade', kind: 'evolve', key: 'earthbreaker', x: 5, y: 2, requires: [req('earthbreaker', 5)] },
    // Linha do corpo: aguentar o cerco
    { id: 'playerHp', branch: 'blade', kind: 'stat', key: 'playerHp', x: 1, y: 3, requires: [req('damage')] },
    { id: 'ironSkin', branch: 'blade', kind: 'mod', x: 2, y: 3, requires: [req('playerHp', 2)],
      name: 'Iron Skin', icon: '🪨', desc: 'Blows land softer.', levelText: '-4% damage taken', mods: { damageTaken: -0.04 } },
    { id: 'bloodEdge', branch: 'blade', kind: 'power', key: 'bloodEdge', x: 3, y: 3, requires: [req('ironSkin', 2)],
      kills: { type: 'ANY', count: 40, label: 'monsters' } },
    { id: 'warCry', branch: 'blade', kind: 'passive', key: 'warCry', x: 4, y: 3, requires: [req('bloodEdge')] },
    { id: 'oathSlaughter', branch: 'blade', kind: 'passive', key: 'oathSlaughter', oath: true, x: 6, y: 1.5, requires: [req('executioner'), req('earthbreakerEvolve')] },

    // --- SOMBRA: o ladrão. Técnica, combos, esquiva e ouro. Barato: o preço é saber jogar ---
    { id: 'moveSpeed', branch: 'shadow', kind: 'stat', key: 'moveSpeed', x: 0, y: 1.5, requires: [] },
    // Linha das adagas
    { id: 'ricochet', branch: 'shadow', kind: 'power', key: 'ricochet', x: 1, y: 0, requires: [req('moveSpeed')] },
    { id: 'quickHands', branch: 'shadow', kind: 'mod', x: 2, y: 0, requires: [req('ricochet', 2)],
      name: 'Quick Hands', icon: '🖐️', desc: 'Your daggers recharge faster.', levelText: '-6% dagger recharge', mods: { knifeCooldown: 0.06 } },
    { id: 'daggerMastery', branch: 'shadow', kind: 'mod', x: 3, y: 0, requires: [req('quickHands', 2)],
      name: 'Dagger Mastery', icon: '🔪', desc: 'Thrown daggers cut deeper.', levelText: '+15% dagger damage', mods: { knifeDamage: 0.15 } },
    { id: 'longThrow', branch: 'shadow', kind: 'passive', key: 'longThrow', x: 4, y: 0, requires: [req('daggerMastery', 2)] },
    { id: 'fanOfKnives', branch: 'shadow', kind: 'passive', key: 'fanOfKnives', x: 5, y: 0, requires: [req('longThrow')] },
    // Linha da técnica: marcar e carregar
    { id: 'deathMark', branch: 'shadow', kind: 'power', key: 'deathMark', x: 1, y: 1, requires: [req('moveSpeed')] },
    { id: 'soulLance', branch: 'shadow', kind: 'power', key: 'soulLance', x: 2, y: 1, requires: [req('deathMark', 2)] },
    { id: 'lanceEvolve', branch: 'shadow', kind: 'evolve', key: 'soulLance', x: 3, y: 1, requires: [req('soulLance', 5)] },
    // Linha da esquiva: Move Speed -> Phantom Rush -> Shadow Clone -> Smoke Bomb -> Fleet Foot
    { id: 'phantomDash', branch: 'shadow', kind: 'power', key: 'phantomDash', x: 1, y: 2, requires: [req('moveSpeed', 2)] },
    { id: 'phantomEvolve', branch: 'shadow', kind: 'evolve', key: 'phantomDash', x: 0, y: 3, requires: [req('phantomDash', 5)] },
    { id: 'shadowClone', branch: 'shadow', kind: 'passive', key: 'shadowClone', x: 2, y: 2, requires: [req('phantomDash', 2)] },
    { id: 'smokeBomb', branch: 'shadow', kind: 'passive', key: 'smokeBomb', x: 4, y: 1, requires: [req('shadowClone')] },
    { id: 'fleetFoot', branch: 'shadow', kind: 'mod', x: 5, y: 1, requires: [req('smokeBomb')],
      name: 'Fleet Foot', icon: '💨', desc: 'The dash recharges faster.', levelText: '-7% dash recharge', mods: { dashCooldown: 0.07 } },
    // Linha do ladrão
    { id: 'lightFingers', branch: 'shadow', kind: 'mod', x: 1, y: 3, requires: [req('moveSpeed')], maxLvl: 3,
      name: 'Light Fingers', icon: '🧤', desc: 'Coins and loot find their way to your hands.', levelText: '+60% pickup range', mods: { magnet: 0.6 } },
    { id: 'pickpocket', branch: 'shadow', kind: 'mod', x: 2, y: 3, requires: [req('lightFingers')],
      name: 'Pickpocket', icon: '👛', desc: 'Every corpse has something worth taking.', levelText: '+8% gold', mods: { gold: 0.08 } },
    { id: 'coinRush', branch: 'shadow', kind: 'mod', x: 3, y: 3, requires: [req('pickpocket', 2)],
      name: 'Coin Rush', icon: '💰', desc: 'Picking up coins speeds up your dash and daggers.', levelText: '-0.04s recharge per coin', mods: { coinHaste: 0.04 } },
    { id: 'treasureNose', branch: 'shadow', kind: 'mod', x: 4, y: 3, requires: [req('coinRush', 2)],
      name: "Thief's Nose", icon: '👃', desc: 'You sniff out what others miss. Monsters drop items more often.', levelText: '+10% item drops', mods: { pickupRate: 0.1 } },
    { id: 'masterThief', branch: 'shadow', kind: 'passive', key: 'masterThief', x: 5, y: 3, requires: [req('treasureNose')] },
    { id: 'oathWhispers', branch: 'shadow', kind: 'passive', key: 'oathWhispers', oath: true, cost: 5, x: 6, y: 1.5, requires: [req('fanOfKnives'), req('shadowClone')] },

    // --- CHAMA: o guardião. Paciência, a tocha, muralhas de fogo ---
    { id: 'torchKeeper', branch: 'flame', kind: 'mod', x: 0, y: 1.5, requires: [],
      name: 'Torch Keeper', icon: '🏮', desc: 'The torch holds more flame.', levelText: '+15 torch health', mods: { torchHp: 15 } },
    // Linha do calor: a tocha não morre
    { id: 'warmHearth', branch: 'flame', kind: 'mod', x: 1, y: 0, requires: [req('torchKeeper')],
      name: 'Warm Hearth', icon: '♨️', desc: 'The fire warms you and mends itself.', levelText: '+20% warmth, torch heals 0.2/s', mods: { warmth: 0.2, torchRegen: 0.2 } },
    { id: 'sacredGround', branch: 'flame', kind: 'mod', x: 2, y: 0, requires: [req('warmHearth', 2)],
      name: 'Sacred Ground', icon: '🔥', desc: 'You hit harder inside the warmth of the torch.', levelText: '+8% damage in the warmth', mods: { warmthDamage: 0.08 } },
    { id: 'undyingFlame', branch: 'flame', kind: 'mod', x: 3, y: 0, requires: [req('sacredGround', 2)],
      name: 'Undying Flame', icon: '🕯️', desc: 'The torch refuses to go out.', levelText: '+20 torch health, heals 0.3/s', mods: { torchHp: 20, torchRegen: 0.3 } },
    { id: 'phoenixPact', branch: 'flame', kind: 'passive', key: 'phoenixPact', x: 4, y: 0, requires: [req('undyingFlame', 2)] },
    // Linha da guarda: quem fica parado é recompensado
    { id: 'steadyStance', branch: 'flame', kind: 'mod', x: 1, y: 1, requires: [req('torchKeeper')],
      name: 'Steady Stance', icon: '⛰️', desc: 'Your blade is faster while you stand your ground.', levelText: '+8% attack speed standing still', mods: { stillAttack: 0.08 } },
    { id: 'vigil', branch: 'flame', kind: 'passive', key: 'vigil', x: 2, y: 1, requires: [req('steadyStance', 2)] },
    { id: 'backdraft', branch: 'flame', kind: 'passive', key: 'backdraft', x: 3, y: 1, requires: [req('vigil')] },
    // Linha da muralha
    { id: 'torchBolts', branch: 'flame', kind: 'power', key: 'torchBolts', x: 1, y: 2, requires: [req('torchKeeper', 2)] },
    { id: 'sunEvolve', branch: 'flame', kind: 'evolve', key: 'torchBolts', x: 2, y: 2, requires: [req('torchBolts', 5)] },
    { id: 'fireRing', branch: 'flame', kind: 'power', key: 'fireRing', x: 3, y: 2, requires: [req('steadyStance', 2)] },
    { id: 'fireRingEvolve', branch: 'flame', kind: 'evolve', key: 'fireRing', x: 4, y: 2, requires: [req('fireRing', 5)] },
    // Linha da brasa
    { id: 'emberTrail', branch: 'flame', kind: 'power', key: 'emberTrail', x: 1, y: 3, requires: [req('torchKeeper')] },
    { id: 'emberEvolve', branch: 'flame', kind: 'evolve', key: 'emberTrail', x: 2, y: 3, requires: [req('emberTrail', 5)] },
    { id: 'oathHearth', branch: 'flame', kind: 'passive', key: 'oathHearth', oath: true, x: 6, y: 1.5, requires: [req('phoenixPact'), req('fireRingEvolve')] },

    // --- MALDIÇÃO: o feiticeiro. Magia, área e distância ---
    { id: 'arcaneStudy', branch: 'curse', kind: 'mod', x: 0, y: 1.5, requires: [],
      name: 'Arcane Study', icon: '🧿', desc: 'You learn from every kill.', levelText: '+5% XP', mods: { xp: 0.05 } },
    // Linha do gelo e da força
    { id: 'chillAura', branch: 'curse', kind: 'power', key: 'chillAura', x: 1, y: 0, requires: [req('arcaneStudy')] },
    { id: 'soulNova', branch: 'curse', kind: 'power', key: 'soulNova', x: 2, y: 0, requires: [req('chillAura', 2)],
      kills: { type: 'WITCH', count: 10, label: 'Witches' } },
    { id: 'novaEvolve', branch: 'curse', kind: 'evolve', key: 'soulNova', x: 3, y: 0, requires: [req('soulNova', 5)] },
    { id: 'starfall', branch: 'curse', kind: 'power', key: 'starfall', x: 4, y: 0, requires: [req('chainLightning', 2)],
      kills: { type: 'VAMPIRE', count: 15, label: 'Vampires' } },
    { id: 'mirrorWard', branch: 'curse', kind: 'passive', key: 'mirrorWard', x: 5, y: 0, requires: [req('starfall')] },
    // Linha da tempestade: à distância
    { id: 'graveWisp', branch: 'curse', kind: 'power', key: 'graveWisp', x: 1, y: 1, requires: [req('arcaneStudy')] },
    { id: 'occultFocus', branch: 'curse', kind: 'mod', x: 2, y: 1, requires: [req('graveWisp')],
      name: 'Occult Focus', icon: '🔮', desc: 'Your spells return to your hand faster.', levelText: '-6% spell recharge', mods: { spellHaste: 0.06 } },
    { id: 'chainLightning', branch: 'curse', kind: 'power', key: 'chainLightning', x: 3, y: 1, requires: [req('occultFocus', 2)],
      kills: { type: 'BAT', count: 20, label: 'Bats' } },
    { id: 'wrathEvolve', branch: 'curse', kind: 'evolve', key: 'chainLightning', x: 4, y: 1, requires: [req('chainLightning', 5)] },
    // Linha do vazio: em área
    { id: 'creepingHex', branch: 'curse', kind: 'power', key: 'creepingHex', x: 1, y: 2, requires: [req('arcaneStudy')] },
    { id: 'darkKnowledge', branch: 'curse', kind: 'mod', x: 2, y: 2, requires: [req('creepingHex')],
      name: 'Dark Knowledge', icon: '📚', desc: 'Forbidden words hit harder.', levelText: '+10% spell damage', mods: { spellDamage: 0.1 } },
    { id: 'voidRift', branch: 'curse', kind: 'power', key: 'voidRift', x: 3, y: 2, requires: [req('darkKnowledge', 2)],
      kills: { type: 'ANY', count: 60, label: 'monsters' } },
    { id: 'voidRiftEvolve', branch: 'curse', kind: 'evolve', key: 'voidRift', x: 4, y: 2, requires: [req('voidRift', 5)] },
    // Linha da morte
    { id: 'corpseBurst', branch: 'curse', kind: 'power', key: 'corpseBurst', x: 1, y: 3, requires: [req('arcaneStudy')],
      kills: { type: 'SKELETON', count: 30, label: 'Skeletons' } },
    { id: 'corpseEvolve', branch: 'curse', kind: 'evolve', key: 'corpseBurst', x: 2, y: 3, requires: [req('corpseBurst', 5)] },
    { id: 'orbitBlades', branch: 'curse', kind: 'power', key: 'orbitBlades', x: 3, y: 3, requires: [req('darkKnowledge', 2)],
      kills: { type: 'SKELETON', count: 20, label: 'Skeletons' } },
    { id: 'orbitEvolve', branch: 'curse', kind: 'evolve', key: 'orbitBlades', x: 4, y: 3, requires: [req('orbitBlades', 5)] },
    { id: 'oathRuin', branch: 'curse', kind: 'passive', key: 'oathRuin', oath: true, x: 6, y: 1.5, requires: [req('wrathEvolve'), req('voidRiftEvolve')] }
];

export const TREE_BY_ID = Object.fromEntries(TREE_NODES.map(node => [node.id, node]));
