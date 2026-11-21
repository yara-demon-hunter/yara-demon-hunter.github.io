# Peça: Ossos

- **id:** `bones` (`registerProp` em `../bones.js`; valores padrão em `../bones_visual.js`)
- **Tipo:** estática
- **Papel:** ossos espalhados (castelo, pântano, estrada) que contam que ali houve luta
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

dois ossos longos cruzados, com pontas em dois nós e sombra; às vezes uma costela (3 arcos) e, raramente, um crânio com órbitas escuras.

## O que a paleta controla

`bone`, `shade` e `length` (mín., máx.). Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=bones`; grave com **Copiar alterados**, cole em `bones_visual.js` e rode `ruby mini_games/_library/sync.rb`.
