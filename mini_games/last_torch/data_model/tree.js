// --- ÁRVORE DE SKILLS ---
// Cada nível do herói dá pontos de skill, gastos aqui (medalhão de status). A árvore recomeça a cada noite;
// o que muda entre partidas é o que está destravado: nós de poder liberados por Trials e nós extras
// comprados com brasas no Hearth (lock.embers).
// kind: stat (sobe um atributo), power (sobe um poder), evolve (transforma um poder no nível máximo),
// mod (efeito simples por nível, `mods` em js/systems/modifiers.js),
// passive (skill passiva única de data_model/passives.js; custa `cost` pontos).
// x = coluna (0 a 5, da esquerda para a direita), y = linha dentro do ramo (0 a 2).
// requires: nós que precisam ter pelo menos 1 nível para este abrir (linhas da árvore).
// cost = pontos por nível (padrão 1; evolução 3). maxLvl padrão 5.
export const TREE_POINTS = {
    perLevel: 1                 // pontos por nível do herói
};

export const TREE_LAYOUT = {
    labelWidth: 1.5,            // coluna do nome do ramo, em células
    tiers: 6,
    rows: 3,
    branchGap: 0.45
};

export const TREE_BRANCHES = {
    blade: { name: 'BLADE', icon: '🤺', color: '#67e8f9' },
    shadow: { name: 'SHADOW', icon: '🌑', color: '#a5b4fc' },
    flame: { name: 'FLAME', icon: '🕯️', color: '#fb923c' },
    curse: { name: 'CURSE', icon: '🌙', color: '#e879f9' }
};

export const TREE_NODES = [
    // --- LÂMINA ---
    { id: 'damage', branch: 'blade', kind: 'stat', key: 'damage', x: 0, y: 1, requires: [] },
    { id: 'atkSpeed', branch: 'blade', kind: 'stat', key: 'atkSpeed', x: 1, y: 0, requires: ['damage'] },
    { id: 'radius', branch: 'blade', kind: 'stat', key: 'radius', x: 1, y: 1, requires: ['damage'] },
    { id: 'slashArc', branch: 'blade', kind: 'stat', key: 'slashArc', x: 1, y: 2, requires: ['damage'] },
    { id: 'keenEye', branch: 'blade', kind: 'power', key: 'keenEye', x: 2, y: 0, requires: ['atkSpeed'] },
    { id: 'orbitBlades', branch: 'blade', kind: 'power', key: 'orbitBlades', x: 2, y: 1, requires: ['radius'] },
    { id: 'knockback', branch: 'blade', kind: 'stat', key: 'knockback', x: 2, y: 2, requires: ['slashArc'] },
    { id: 'bloodEdge', branch: 'blade', kind: 'power', key: 'bloodEdge', x: 3, y: 0, requires: ['keenEye'] },
    { id: 'orbitEvolve', branch: 'blade', kind: 'evolve', key: 'orbitBlades', x: 3, y: 1, requires: ['orbitBlades'] },
    { id: 'corpseBurst', branch: 'blade', kind: 'power', key: 'corpseBurst', x: 4, y: 0, requires: ['bloodEdge'] },
    { id: 'corpseEvolve', branch: 'blade', kind: 'evolve', key: 'corpseBurst', x: 5, y: 0, requires: ['corpseBurst'] },
    { id: 'shadowWhirl', branch: 'blade', kind: 'passive', key: 'shadowWhirl', x: 3, y: 2, requires: ['knockback'], cost: 3 },

    // --- SOMBRA ---
    { id: 'moveSpeed', branch: 'shadow', kind: 'stat', key: 'moveSpeed', x: 0, y: 1, requires: [] },
    { id: 'ricochet', branch: 'shadow', kind: 'power', key: 'ricochet', x: 1, y: 0, requires: ['moveSpeed'] },
    { id: 'phantomDash', branch: 'shadow', kind: 'power', key: 'phantomDash', x: 1, y: 1, requires: ['moveSpeed'] },
    { id: 'emberTrail', branch: 'shadow', kind: 'power', key: 'emberTrail', x: 1, y: 2, requires: ['moveSpeed'] },
    { id: 'quickHands', branch: 'shadow', kind: 'mod', x: 2, y: 0, requires: ['ricochet'],
      name: 'Quick Hands', icon: '🖐️', desc: 'Your daggers recharge faster.', levelText: '-6% dagger recharge', mods: { knifeCooldown: 0.06 } },
    { id: 'soulMagnet', branch: 'shadow', kind: 'power', key: 'soulMagnet', x: 2, y: 1, requires: ['ricochet'] },
    { id: 'emberEvolve', branch: 'shadow', kind: 'evolve', key: 'emberTrail', x: 2, y: 2, requires: ['emberTrail'] },
    { id: 'daggerMastery', branch: 'shadow', kind: 'mod', x: 3, y: 0, requires: ['quickHands'],
      name: 'Dagger Mastery', icon: '🔪', desc: 'Thrown daggers cut deeper.', levelText: '+15% dagger damage', mods: { knifeDamage: 0.15 } },
    { id: 'shadowClone', branch: 'shadow', kind: 'passive', key: 'shadowClone', x: 3, y: 1, requires: ['soulMagnet'], cost: 4 },
    { id: 'longThrow', branch: 'shadow', kind: 'passive', key: 'longThrow', x: 4, y: 0, requires: ['daggerMastery'], cost: 2 },
    { id: 'fanOfKnives', branch: 'shadow', kind: 'passive', key: 'fanOfKnives', x: 5, y: 0, requires: ['longThrow'], cost: 3 },
    { id: 'fleetFoot', branch: 'shadow', kind: 'mod', x: 4, y: 1, requires: ['shadowClone'], lock: { embers: 40 },
      name: 'Fleet Foot', icon: '💨', desc: 'The dash recharges faster.', levelText: '-7% dash recharge', mods: { dashCooldown: 0.07 } },

    // --- CHAMA ---
    { id: 'frenzyNova', branch: 'flame', kind: 'stat', key: 'frenzyNova', x: 0, y: 1, requires: [] },
    { id: 'playerHp', branch: 'flame', kind: 'stat', key: 'playerHp', x: 1, y: 0, requires: ['frenzyNova'] },
    { id: 'torchBolts', branch: 'flame', kind: 'power', key: 'torchBolts', x: 1, y: 1, requires: ['frenzyNova'] },
    { id: 'torchKeeper', branch: 'flame', kind: 'mod', x: 1, y: 2, requires: ['frenzyNova'],
      name: 'Torch Keeper', icon: '🏮', desc: 'The torch holds more flame.', levelText: '+15 torch health', mods: { torchHp: 15 } },
    { id: 'emberHeart', branch: 'flame', kind: 'mod', x: 2, y: 0, requires: ['playerHp'],
      name: 'Ember Heart', icon: '🌋', desc: 'Fury charges faster.', levelText: '+12% Fury charge', mods: { furyCharge: 0.12 } },
    { id: 'sunEvolve', branch: 'flame', kind: 'evolve', key: 'torchBolts', x: 2, y: 1, requires: ['torchBolts'] },
    { id: 'warmHearth', branch: 'flame', kind: 'mod', x: 2, y: 2, requires: ['torchKeeper'],
      name: 'Warm Hearth', icon: '♨️', desc: 'The fire warms you and mends itself.', levelText: '+20% warmth, torch heals 0.2/s', mods: { warmth: 0.2, torchRegen: 0.2 } },
    { id: 'mirrorWard', branch: 'flame', kind: 'passive', key: 'mirrorWard', x: 3, y: 2, requires: ['warmHearth'], cost: 3 },
    { id: 'ironSkin', branch: 'flame', kind: 'mod', x: 3, y: 0, requires: ['emberHeart'], lock: { embers: 60 },
      name: 'Iron Skin', icon: '🪨', desc: 'Blows land softer.', levelText: '-4% damage taken', mods: { damageTaken: -0.04 } },

    // --- MALDIÇÃO ---
    { id: 'arcaneStudy', branch: 'curse', kind: 'mod', x: 0, y: 1, requires: [],
      name: 'Arcane Study', icon: '🧿', desc: 'You learn from every kill.', levelText: '+5% XP', mods: { xp: 0.05 } },
    { id: 'chillAura', branch: 'curse', kind: 'power', key: 'chillAura', x: 1, y: 0, requires: ['arcaneStudy'] },
    { id: 'chainLightning', branch: 'curse', kind: 'power', key: 'chainLightning', x: 1, y: 1, requires: ['arcaneStudy'] },
    { id: 'darkPact', branch: 'curse', kind: 'mod', x: 1, y: 2, requires: ['arcaneStudy'],
      name: 'Dark Pact', icon: '☠️', desc: 'The dead pay a tithe.', levelText: '+8% gold', mods: { gold: 0.08 } },
    { id: 'soulNova', branch: 'curse', kind: 'power', key: 'soulNova', x: 2, y: 0, requires: ['chillAura'] },
    { id: 'wrathEvolve', branch: 'curse', kind: 'evolve', key: 'chainLightning', x: 2, y: 1, requires: ['chainLightning'] },
    { id: 'starfall', branch: 'curse', kind: 'power', key: 'starfall', x: 2, y: 2, requires: ['darkPact'] },
    { id: 'novaEvolve', branch: 'curse', kind: 'evolve', key: 'soulNova', x: 3, y: 0, requires: ['soulNova'] }
];

export const TREE_BY_ID = Object.fromEntries(TREE_NODES.map(node => [node.id, node]));
