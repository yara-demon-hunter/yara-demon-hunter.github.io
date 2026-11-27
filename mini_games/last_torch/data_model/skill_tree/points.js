// --- PONTOS DE SKILL ---
// De onde vêm os pontos que se gastam na árvore. Quanto CUSTA cada skill fica no próprio nó (skill_tree/nodes/<ramo>.js, campo `cost`).
export const TREE_POINTS = {
    perLevel: 2                 // pontos por nível do herói (js/systems/progression.js; passivas e mods podem somar mais). 2026-11-27: ficou em 2; quem segura a quantidade de skills é a curva de XP exponencial (character.js, xpCurve)
};
