# Peça: Barris e caixotes

- **id:** `barrel` (`registerProp` em `../barrel.js`; valores padrão em `../barrel_visual.js`)
- **Tipo:** estática
- **Papel:** barris e caixotes empilhados perto das casas e da estrada
- **Feito a partir de:** código (2026-11-21), para a vila do mapa (nada de arte de terceiros: mesmo estilo 2.5D das outras peças).

## Como é desenhada

2 ou 3 itens lado a lado, cada um com sombra: barril (corpo, 2 cintas de ferro, tampa clara) ou caixote (tábuas e diagonal).

## O que a paleta controla

`wood`, `band`, `top` e `crate`. A receita de um cenário pode trocar qualquer valor só para ele (`palette`).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo). Ficam nas margens, longe da ação: nunca cobrem monstros.

## Ajuste

`tools/prop_tuner.html?prop=barrel`; grave com **Copiar alterados**, cole em `barrel_visual.js` e rode `ruby mini_games/_library/sync.rb`.
