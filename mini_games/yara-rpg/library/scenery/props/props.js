// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/props.js e rode o sync.
// --- REGISTRO DAS PEÇAS ---
// Uma peça é um item do chão que qualquer cenário pode usar: pedra, toco, cogumelo, samambaia... Cada uma mora na sua
// pasta (props/<id>/) com o desenho, os valores padrão (cores e medidas, em <id>_visual.js) e a ficha (art_reference/prop.md).
// O cenário só escolhe quais usar e quantas, na receita dele (composeScenery, em ../compose.js).
//
// DOIS TIPOS (as duas técnicas do projeto):
//   kind 'static'    carimbada no chão UMA vez, ao montar o cenário. Custo por quadro: zero.
//     previewSize           (opcional) lado da amostra no tuner de peças, em unidades do mundo
//     roll(r, p)            sorteia os atributos da peça (tamanho, formato, cor). r = aleatório com semente
//     draw(g, x, y, a, p)   desenha em (x, y) do mundo; a = o que o roll devolveu
//   kind 'animated'  vira um atlas de poucos quadros (buildSpriteSheet, no kit); em cena é 1 drawImage por peça.
//     cell [largura, altura], anchor [x, y] (0 a 1; onde fica o "pé"), variants (quantos desenhos diferentes)
//     paint(g, r, phase, p)  desenha UM quadro com a origem no pé; phase de 0 a 1, o último emenda com o primeiro
//
// `p` é a PALETA: os valores padrão da peça (visual) por cima dos quais a receita do cenário pode trocar o que quiser
// (palette: { glow: '255, 80, 60' } faz o mesmo cogumelo brilhar vermelho). Por isso a peça nunca guarda cor no código.
//
// ALEATÓRIO: a ordem das chamadas a r() em roll/paint não pode mudar depois de aprovada (o mesmo seed dá o mesmo cenário).
const registry = new Map();

export function registerProp(def) {
    registry.set(def.id, def);
}

export function getProp(id) {
    const prop = registry.get(id);
    if (!prop) throw new Error(`Peça "${id}" não está registrada (propIds(): ${[...registry.keys()].join(', ') || 'vazio'})`);
    return prop;
}

export function propIds() {
    return [...registry.keys()];
}
