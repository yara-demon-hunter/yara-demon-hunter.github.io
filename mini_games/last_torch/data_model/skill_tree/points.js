// --- PONTOS DE SKILL ---
// De onde vêm os pontos que se gastam na árvore. Quanto CUSTA cada skill fica no próprio nó (skill_tree/nodes/<ramo>.js, campo `cost`).
export const TREE_POINTS = {
    perLevel: 1                 // pontos por nível do herói (2026-11-27: era 2; menos pontos = a build precisa de escolhas, nada de comprar a árvore toda) (js/systems/progression.js; passivas e mods podem somar mais)
};
