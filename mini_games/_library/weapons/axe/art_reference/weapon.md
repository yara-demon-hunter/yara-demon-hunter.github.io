# Arma: Machado de duas lâminas

- **pasta:** `weapons/axe/` (arquivo: axe.js)
- **Função:** `drawAxe(rig, hand, dir, alpha, O)`
- **Quem usa:** Oskar
- **Como é:** cabo comprido de madeira e cabeça de ferro dupla (borboleta) presa por uma amarração.

## O que é da arma e o que é do personagem

O desenho (formas, camadas, brilho) é da arma e mora aqui. As medidas e as cores continuam no personagem (a paleta dele,
`rig.C`, e o `<id>_visual.js` dele, que também mexem no tuner e nos Juramentos): a função recebe as medidas como último
argumento. Medidas: `characters/oskar/oskar_visual.js` (`bladeLength`, `axeHeadSize`). Cores: `haft`, `haftShade`, `binding`, `axeHead`, `axeDark`, `axeEdge`.

## Custo

Desenhada a cada quadro só enquanto o herói a empunha (peças simples de `limb`/`ball`); as armas de arremesso viram sprite uma vez.

## Ajuste

Pelo tuner do personagem: `tools/tuner.html?model=<id do personagem>` (medidas e cores). Depois, `ruby mini_games/_library/sync.rb`.
