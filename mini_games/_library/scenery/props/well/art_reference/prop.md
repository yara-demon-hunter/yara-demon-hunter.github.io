# Peça: Poço

- **id:** `well` (`registerProp` em `../well.js`; valores padrão em `../well_visual.js`)
- **Tipo:** estática
- **Papel:** o poço do povoado, ponto de luz e de cena
- **Feito a partir de:** código (2026-11-21), para a vila do mapa (nada de arte de terceiros: mesmo estilo 2.5D das outras peças).

## Como é desenhada

sombra, anel de pedra com água escura, dois postes, viga e um tetinho de duas águas.

## O que a paleta controla

`stone`, `stoneDark`, `water`, `wood` e `roof`. A receita de um cenário pode trocar qualquer valor só para ele (`palette`).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo). Ficam nas margens, longe da ação: nunca cobrem monstros.

## Ajuste

`tools/prop_tuner.html?prop=well`; grave com **Copiar alterados**, cole em `well_visual.js` e rode `ruby mini_games/_library/sync.rb`.
