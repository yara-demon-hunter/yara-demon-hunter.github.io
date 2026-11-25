// --- NATUREZA: o druida. Controle e paciência: prender no chão, drenar a vida, esconder-se atrás do que cresce ---
// Cada nó leva o próprio `cost` (pontos de skill por nível). Para mudar um preço, edite o número aqui, no nó.
// Campos e regras dos nós: skill_tree/README.md.
import { req } from '../helpers.js';

export const NATURE_NODES = [

    { id: 'wildHeart', cost: 1, branch: 'nature', kind: 'mod', x: 0, y: 1.5, requires: [],
      name: 'Wild Heart', icon: '🌱', desc: 'The forest mends your wounds, slowly and always.',
      levelText: (mods) => `Heal ${mods.hpRegen} health per second`, mods: { hpRegen: 0.3 } },
    // Quatro linhas. Duas delas terminam no Oath of the Wild (raízes e carvalho); a rosa negra fica sozinha na última.
    // Linha 1, as raízes: Grasping Roots -> Strangling Grove -> Thorn Burst -> Oath
    { id: 'graspingRoots', cost: 3, branch: 'nature', kind: 'power', key: 'graspingRoots', x: 1, y: 0, requires: [req('wildHeart')] },
    { id: 'rootsEvolve', cost: 3, branch: 'nature', kind: 'evolve', key: 'graspingRoots', x: 2, y: 0, requires: [req('graspingRoots', 5)] },
    { id: 'thornBurst', cost: 3, branch: 'nature', kind: 'passive', key: 'thornBurst', x: 3, y: 0, requires: [req('rootsEvolve')] },
    // Linha 2, o carvalho: Wicked Oak -> Ancient Grove -> Leech Vine (as videiras saem do carvalho) -> Oath
    { id: 'shelterOak', cost: 3, branch: 'nature', kind: 'power', key: 'shelterOak', x: 1, y: 1, requires: [req('wildHeart')] },
    { id: 'oakEvolve', cost: 3, branch: 'nature', kind: 'evolve', key: 'shelterOak', x: 2, y: 1, requires: [req('shelterOak', 5)] },
    { id: 'leechVine', cost: 3, branch: 'nature', kind: 'power', key: 'leechVine', x: 3, y: 1, requires: [req('oakEvolve')] },
    // Linha 3, os esporos e o lobo: Spore Pods -> Plague Garden -> Shadow Wolf -> The White Wolf
    { id: 'sporePods', cost: 3, branch: 'nature', kind: 'power', key: 'sporePods', x: 1, y: 2, requires: [req('wildHeart')] },
    { id: 'sporeEvolve', cost: 3, branch: 'nature', kind: 'evolve', key: 'sporePods', x: 2, y: 2, requires: [req('sporePods', 5)] },
    { id: 'spiritWolves', cost: 3, branch: 'nature', kind: 'power', key: 'spiritWolves', x: 3, y: 2, requires: [req('sporeEvolve')] },
    { id: 'wolvesEvolve', cost: 3, branch: 'nature', kind: 'evolve', key: 'spiritWolves', x: 4, y: 2, requires: [req('spiritWolves', 5)] },
    // Linha 4, o chicote e a rosa negra: Rose Whip (de todos) -> Dark Roses (só do Rowan: o nó fica selado para os outros e conta como cumprido)
    { id: 'roseWhip', cost: 4, branch: 'nature', kind: 'passive', key: 'roseWhip', x: 1, y: 3, requires: [req('wildHeart')] },
    { id: 'darkRoses', cost: 3, hero: 'rowan', branch: 'nature', kind: 'passive', key: 'darkRoses', x: 2, y: 3, requires: [req('roseWhip')] },

    { id: 'oathWild', cost: 3, branch: 'nature', kind: 'passive', key: 'oathWild', oath: true, x: 6, y: 1.5, requires: [req('thornBurst'), req('leechVine')] }
];
