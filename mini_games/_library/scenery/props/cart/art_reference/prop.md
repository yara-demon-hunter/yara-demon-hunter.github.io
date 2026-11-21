# Peça: Carroça

- **id:** `cart` (`registerProp` em `../cart.js`; valores padrão em `../cart_visual.js`)
- **Tipo:** estática
- **Papel:** carroça de camponês, parada na beira da estrada
- **Feito a partir de:** código (2026-11-21), para a vila do mapa (nada de arte de terceiros: mesmo estilo 2.5D das outras peças).

## Como é desenhada

sombra, duas rodas vistas de lado, caçamba de tábuas, às vezes carregada de palha, e a haste do varal para a mula.

## O que a paleta controla

`wood`, `woodDark`, `wheel` e `hay`. A receita de um cenário pode trocar qualquer valor só para ele (`palette`).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo). Ficam nas margens, longe da ação: nunca cobrem monstros.

## Ajuste

`tools/prop_tuner.html?prop=cart`; grave com **Copiar alterados**, cole em `cart_visual.js` e rode `ruby mini_games/_library/sync.rb`.
