// --- ÁRVORE DE SKILLS ---
// Cada nível do herói dá pontos de skill, gastos aqui (medalhão de status). A árvore recomeça a cada noite
// e tudo está disponível desde a primeira partida: o que abre cada nó é só o que aparece na própria árvore.
// kind: stat (sobe um atributo), power (sobe um poder), evolve (transforma um poder no nível máximo),
// mod (efeito simples por nível, `mods` em js/systems/modifiers.js),
// passive (skill passiva única de data_model/passives.js; custa `cost` pontos).
// x = coluna (0 a 5, da esquerda para a direita), y = linha dentro do ramo (0 a 2).
// requires: o nó anterior na árvore, como req(id, nível mínimo). O pré-requisito vem SEMPRE do nó anterior
// (a linha que chega nele): quem já cumpriu a cadeia até ali não esbarra em exigências de nós mais atrás.
// Se um nó mais atrás precisa ter mais nível, suba o nível pedido no nó do meio. O painel de detalhe mostra
// tudo o que falta de uma vez, e `kills` entra como pedido extra.
// kills: { type, count, label } exige matar `count` monstros daquele tipo NA NOITE ATUAL (type 'ANY' = qualquer).
// cost = pontos por nível (padrão 1; evolução 3). maxLvl padrão 5.
export const TREE_POINTS = {
    perLevel: 1                 // pontos por nível do herói
};

export const TREE_LAYOUT = {
    labelWidth: 1.5,            // coluna do nome do ramo, em células
    tiers: 6,
    branchGap: 0.3
};

export const TREE_BRANCHES = {
    blade: { name: 'BLADE', icon: '🤺', color: '#67e8f9' },
    shadow: { name: 'SHADOW', icon: '🌑', color: '#a5b4fc' },
    flame: { name: 'FLAME', icon: '🕯️', color: '#fb923c' },
    curse: { name: 'CURSE', icon: '🌙', color: '#e879f9' }
};

// req(id) = nível 1 do nó; req(id, 3) = nível 3
export const req = (id, lvl = 1) => ({ id, lvl });

export const TREE_NODES = [
    // --- LÂMINA ---
    { id: 'damage', branch: 'blade', kind: 'stat', key: 'damage', x: 0, y: 1, requires: [] },
    { id: 'atkSpeed', branch: 'blade', kind: 'stat', key: 'atkSpeed', x: 1, y: 0, requires: [req('damage')] },
    { id: 'radius', branch: 'blade', kind: 'stat', key: 'radius', x: 1, y: 1, requires: [req('damage')] },
    { id: 'slashArc', branch: 'blade', kind: 'stat', key: 'slashArc', x: 1, y: 2, requires: [req('damage')] },
    { id: 'keenEye', branch: 'blade', kind: 'power', key: 'keenEye', x: 2, y: 0, requires: [req('atkSpeed', 2)] },
    { id: 'orbitBlades', branch: 'blade', kind: 'power', key: 'orbitBlades', x: 2, y: 1, requires: [req('radius', 3)],
      kills: { type: 'SKELETON', count: 20, label: 'Skeletons' } },
    { id: 'knockback', branch: 'blade', kind: 'stat', key: 'knockback', x: 2, y: 2, requires: [req('slashArc', 2)] },
    { id: 'bloodEdge', branch: 'blade', kind: 'power', key: 'bloodEdge', x: 3, y: 0, requires: [req('keenEye', 2)],
      kills: { type: 'ANY', count: 40, label: 'monsters' } },
    { id: 'orbitEvolve', branch: 'blade', kind: 'evolve', key: 'orbitBlades', x: 3, y: 1, requires: [req('orbitBlades', 5)] },
    { id: 'shadowWhirl', branch: 'blade', kind: 'passive', key: 'shadowWhirl', x: 3, y: 2, requires: [req('knockback', 2)], cost: 3,
      kills: { type: 'BAT', count: 15, label: 'Bats' } },
    { id: 'corpseBurst', branch: 'blade', kind: 'power', key: 'corpseBurst', x: 4, y: 0, requires: [req('bloodEdge', 3)],
      kills: { type: 'SKELETON', count: 30, label: 'Skeletons' } },
    { id: 'corpseEvolve', branch: 'blade', kind: 'evolve', key: 'corpseBurst', x: 5, y: 0, requires: [req('corpseBurst', 5)] },

    // --- SOMBRA ---
    { id: 'moveSpeed', branch: 'shadow', kind: 'stat', key: 'moveSpeed', x: 0, y: 1, requires: [] },
    { id: 'ricochet', branch: 'shadow', kind: 'power', key: 'ricochet', x: 1, y: 0, requires: [req('moveSpeed')] },
    { id: 'phantomDash', branch: 'shadow', kind: 'power', key: 'phantomDash', x: 1, y: 1, requires: [req('moveSpeed', 2)],
      kills: { type: 'BAT', count: 15, label: 'Bats' } },
    { id: 'emberTrail', branch: 'shadow', kind: 'power', key: 'emberTrail', x: 1, y: 2, requires: [req('moveSpeed', 3)] },
    { id: 'quickHands', branch: 'shadow', kind: 'mod', x: 2, y: 0, requires: [req('ricochet', 2)],
      name: 'Quick Hands', icon: '🖐️', desc: 'Your daggers recharge faster.', levelText: '-6% dagger recharge', mods: { knifeCooldown: 0.06 } },
    { id: 'soulMagnet', branch: 'shadow', kind: 'power', key: 'soulMagnet', x: 2, y: 1, requires: [req('ricochet')] },
    { id: 'emberEvolve', branch: 'shadow', kind: 'evolve', key: 'emberTrail', x: 2, y: 2, requires: [req('emberTrail', 5)] },
    { id: 'daggerMastery', branch: 'shadow', kind: 'mod', x: 3, y: 0, requires: [req('quickHands', 2)],
      name: 'Dagger Mastery', icon: '🔪', desc: 'Thrown daggers cut deeper.', levelText: '+15% dagger damage', mods: { knifeDamage: 0.15 } },
    { id: 'shadowClone', branch: 'shadow', kind: 'passive', key: 'shadowClone', x: 3, y: 1, requires: [req('soulMagnet', 2)], cost: 4,
      kills: { type: 'VAMPIRE', count: 8, label: 'Vampires' } },
    { id: 'longThrow', branch: 'shadow', kind: 'passive', key: 'longThrow', x: 4, y: 0, requires: [req('daggerMastery', 2)], cost: 2 },
    { id: 'fleetFoot', branch: 'shadow', kind: 'mod', x: 4, y: 1, requires: [req('shadowClone')],
      name: 'Fleet Foot', icon: '💨', desc: 'The dash recharges faster.', levelText: '-7% dash recharge', mods: { dashCooldown: 0.07 } },
    { id: 'fanOfKnives', branch: 'shadow', kind: 'passive', key: 'fanOfKnives', x: 5, y: 0, requires: [req('longThrow')], cost: 3 },

    // --- CHAMA ---
    { id: 'frenzyNova', branch: 'flame', kind: 'stat', key: 'frenzyNova', x: 0, y: 1, requires: [] },
    { id: 'playerHp', branch: 'flame', kind: 'stat', key: 'playerHp', x: 1, y: 0, requires: [req('frenzyNova')] },
    { id: 'torchBolts', branch: 'flame', kind: 'power', key: 'torchBolts', x: 1, y: 1, requires: [req('frenzyNova', 3)] },
    { id: 'torchKeeper', branch: 'flame', kind: 'mod', x: 1, y: 2, requires: [req('frenzyNova')],
      name: 'Torch Keeper', icon: '🏮', desc: 'The torch holds more flame.', levelText: '+15 torch health', mods: { torchHp: 15 } },
    { id: 'emberHeart', branch: 'flame', kind: 'mod', x: 2, y: 0, requires: [req('playerHp', 2)],
      name: 'Ember Heart', icon: '🌋', desc: 'Fury charges faster.', levelText: '+12% Fury charge', mods: { furyCharge: 0.12 } },
    { id: 'sunEvolve', branch: 'flame', kind: 'evolve', key: 'torchBolts', x: 2, y: 1, requires: [req('torchBolts', 5)] },
    { id: 'warmHearth', branch: 'flame', kind: 'mod', x: 2, y: 2, requires: [req('torchKeeper', 2)],
      name: 'Warm Hearth', icon: '♨️', desc: 'The fire warms you and mends itself.', levelText: '+20% warmth, torch heals 0.2/s', mods: { warmth: 0.2, torchRegen: 0.2 } },
    { id: 'ironSkin', branch: 'flame', kind: 'mod', x: 3, y: 0, requires: [req('emberHeart', 3)],
      name: 'Iron Skin', icon: '🪨', desc: 'Blows land softer.', levelText: '-4% damage taken', mods: { damageTaken: -0.04 } },
    { id: 'mirrorWard', branch: 'flame', kind: 'passive', key: 'mirrorWard', x: 3, y: 2, requires: [req('warmHearth', 2)], cost: 3,
      kills: { type: 'WITCH', count: 10, label: 'Witches' } },

    // --- MALDIÇÃO ---
    { id: 'arcaneStudy', branch: 'curse', kind: 'mod', x: 0, y: 1, requires: [],
      name: 'Arcane Study', icon: '🧿', desc: 'You learn from every kill.', levelText: '+5% XP', mods: { xp: 0.05 } },
    { id: 'chillAura', branch: 'curse', kind: 'power', key: 'chillAura', x: 1, y: 0, requires: [req('arcaneStudy')] },
    { id: 'chainLightning', branch: 'curse', kind: 'power', key: 'chainLightning', x: 1, y: 1, requires: [req('arcaneStudy', 2)],
      kills: { type: 'BAT', count: 20, label: 'Bats' } },
    { id: 'darkPact', branch: 'curse', kind: 'mod', x: 1, y: 2, requires: [req('arcaneStudy')],
      name: 'Dark Pact', icon: '☠️', desc: 'The dead pay a tithe.', levelText: '+8% gold', mods: { gold: 0.08 } },
    { id: 'soulNova', branch: 'curse', kind: 'power', key: 'soulNova', x: 2, y: 0, requires: [req('chillAura', 3)],
      kills: { type: 'WITCH', count: 10, label: 'Witches' } },
    { id: 'wrathEvolve', branch: 'curse', kind: 'evolve', key: 'chainLightning', x: 2, y: 1, requires: [req('chainLightning', 5)] },
    { id: 'starfall', branch: 'curse', kind: 'power', key: 'starfall', x: 2, y: 2, requires: [req('darkPact', 2)],
      kills: { type: 'VAMPIRE', count: 15, label: 'Vampires' } },
    { id: 'novaEvolve', branch: 'curse', kind: 'evolve', key: 'soulNova', x: 3, y: 0, requires: [req('soulNova', 5)] }
];

export const TREE_BY_ID = Object.fromEntries(TREE_NODES.map(node => [node.id, node]));
