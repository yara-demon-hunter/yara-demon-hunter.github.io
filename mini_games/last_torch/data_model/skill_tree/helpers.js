// Pequenos ajudantes dos nós da árvore (skill_tree/nodes/*.js).
export const formatPercent = (value) => `${Number((value * 100).toFixed(1))}%`;

// req(id) = nível 1 do nó; req(id, 3) = nível 3
export const req = (id, lvl = 1) => ({ id, lvl });

// Texto acumulado de um nível de skill `mod`: mostra o TOTAL que o jogador terá com o nível seguinte (1 nível 10%, 2 níveis 20%...).
// per = o valor de UM nível; fmt formata o número (padrão: porcentagem). Usado no levelText(mods, nível) dos nós.
export const num = (value) => String(Number(value.toFixed(2)));
export const stacked = (lvl, per, fmt = formatPercent) => fmt(per * lvl);
