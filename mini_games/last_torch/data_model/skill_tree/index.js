// --- ÁRVORE DE SKILLS ---
// Cada nível do herói dá pontos de skill, gastos na árvore (medalhão de status). A árvore recomeça a cada noite e tudo está
// disponível desde a primeira partida: o que abre cada nó é só o que aparece na própria árvore.
//
//   skill_tree/points.js    quantos pontos o herói ganha por nível
//   skill_tree/nodes/*.js   os nós de cada ramo, CADA UM COM O PRÓPRIO `cost` (preço em pontos por nível)
//   skill_tree/branches.js  nome, cor e layout dos ramos; afinidade dos heróis
//   skill_tree/README.md    campos de um nó e como adicionar uma skill
//
// Os números da skill em si (dano, recarga, níveis) ficam em data_model/powers.js e data_model/passives.js.
import { BLADE_NODES } from './nodes/blade.js';
import { SHADOW_NODES } from './nodes/shadow.js';
import { FLAME_NODES } from './nodes/flame.js';
import { CURSE_NODES } from './nodes/curse.js';
import { NATURE_NODES } from './nodes/nature.js';
import { LIGHT_NODES } from './nodes/light.js';

export { req, formatPercent } from './helpers.js';
export { TREE_POINTS } from './points.js';
export { AFFINITY_BONUS, TREE_BRANCHES, TREE_LAYOUT, affinityLabel } from './branches.js';

export const TREE_NODES = [...BLADE_NODES, ...SHADOW_NODES, ...FLAME_NODES, ...CURSE_NODES, ...NATURE_NODES, ...LIGHT_NODES];

export const TREE_BY_ID = Object.fromEntries(TREE_NODES.map(node => [node.id, node]));

// Falhar já ao abrir é melhor que quebrar em silêncio no meio da partida:
// - dois nós com o mesmo id (um apaga o outro e as ligações passam a apontar para o errado);
// - nó sem `cost` (o preço mora SEMPRE no nó: não há tabela por ramo nem regra escondida).
if (Object.keys(TREE_BY_ID).length !== TREE_NODES.length) {
    const seen = new Set();
    const repeated = TREE_NODES.map(n => n.id).filter(id => seen.has(id) || !seen.add(id));
    throw new Error(`data_model/skill_tree: id de nó repetido: ${[...new Set(repeated)].join(', ')}`);
}
const noCost = TREE_NODES.filter(n => !Number.isInteger(n.cost) || n.cost < 1).map(n => n.id);
if (noCost.length) throw new Error(`data_model/skill_tree: nó sem cost (inteiro >= 1): ${noCost.join(', ')}`);
