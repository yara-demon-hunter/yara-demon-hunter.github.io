// --- LÂMINA: o guerreiro. Força bruta, matar tudo, ser cercado de propósito ---
// Cada nó leva o próprio `cost` (pontos de skill por nível). Para mudar um preço, edite o número aqui, no nó.
// Campos e regras dos nós: skill_tree/README.md.
import { formatPercent, req } from '../helpers.js';

export const BLADE_NODES = [
    { id: 'damage', cost: 1, branch: 'blade', kind: 'stat', key: 'damage', x: 0, y: 1.5, requires: [] },
    // Linha da Fúria: matar alimenta matar
    { id: 'furySkill', cost: 1, branch: 'blade', kind: 'stat', key: 'furySkill', x: 1, y: 0, requires: [req('damage')],
      levelText: (mods) => `Fury charge: +${Math.round(mods.furyCharge * 100)}%`, mods: { furyCharge: 0.06 } },
    { id: 'bloodlust', cost: 2, branch: 'blade', kind: 'power', key: 'bloodlust', x: 2, y: 0, requires: [req('furySkill', 2)] },
    { id: 'bloodlustEvolve', cost: 4, branch: 'blade', kind: 'evolve', key: 'bloodlust', x: 3, y: 0, requires: [req('bloodlust', 5)] },
    // Linha do aço: o golpe cada vez mais largo e mortal
    { id: 'atkSpeed', cost: 1, also: ['slashArc'], branch: 'blade', kind: 'stat', key: 'atkSpeed', x: 1, y: 1, requires: [req('damage')] },
    { id: 'finalBlow', cost: 2, branch: 'blade', kind: 'passive', key: 'finalBlow', x: 2, y: 1, requires: [req('atkSpeed', 2)] },
    { id: 'shadowWhirl', cost: 4, branch: 'blade', kind: 'passive', key: 'shadowWhirl', x: 3, y: 1, requires: [req('finalBlow')] },
    { id: 'keenEye', cost: 3, branch: 'blade', kind: 'power', key: 'keenEye', x: 4, y: 1, requires: [req('shadowWhirl')] },
    { id: 'executioner', cost: 5, branch: 'blade', kind: 'passive', key: 'executioner', x: 4, y: 0, requires: [req('bloodlustEvolve')] },
    // Linha da força: quebrar o chão
    { id: 'radius', cost: 1, also: ['knockback'], branch: 'blade', kind: 'stat', key: 'radius', x: 1, y: 2, requires: [req('damage')] },
    { id: 'shatterStrike', cost: 3, branch: 'blade', kind: 'passive', key: 'shatterStrike', x: 2, y: 2, requires: [req('radius')] },
    { id: 'earthbreaker', cost: 4, branch: 'blade', kind: 'power', key: 'earthbreaker', x: 3, y: 2, requires: [req('shatterStrike')] },
    // 27/11/2026: o Cataclysm (a evolução do Earthbreaker) saiu; no lugar dele entra a Spectral Blade: lâminas fantasmas que aparecem, giram por um tempo, somem e entram em recarga
    { id: 'spectralBlade', cost: 4, branch: 'blade', kind: 'power', key: 'spectralBlade', x: 4, y: 2, requires: [req('earthbreaker', 5)] },
    // Linha do corpo: aguentar o cerco (Parry -> Hero Health -> Blood Edge -> War Cry)
    { id: 'parry', cost: 2, branch: 'blade', kind: 'passive', key: 'parry', x: 1, y: 3, requires: [req('damage')] },
    { id: 'playerHp', cost: 2, branch: 'blade', kind: 'stat', key: 'playerHp', x: 2, y: 3, requires: [req('parry')],
      levelText: (mods) => `${formatPercent(-mods.damageTaken)} less damage taken, monsters come +${formatPercent(mods.provoke)} farther`,
      mods: { damageTaken: -0.04, provoke: 0.25 } },
    { id: 'bloodEdge', cost: 3, branch: 'blade', kind: 'power', key: 'bloodEdge', x: 3, y: 3, requires: [req('playerHp', 2)] },
    { id: 'warCry', cost: 4, branch: 'blade', kind: 'passive', key: 'warCry', x: 4, y: 3, requires: [req('bloodEdge')] },
    { id: 'oathSlaughter', cost: 4, branch: 'blade', kind: 'passive', key: 'oathSlaughter', oath: true, x: 5, y: 1.5, requires: [req('executioner'), req('spectralBlade')] }
];
