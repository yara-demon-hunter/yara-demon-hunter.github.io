# Peça: Lápide

- **id:** `tombstone` (`registerProp` em `../tombstone.js`; valores padrão em `../tombstone_visual.js`)
- **Tipo:** estática
- **Papel:** o cemitério: lápides, cruzes e obeliscos espalhados
- **Feito a partir de:** código (2026-11-21), para a tela do cemitério do mapa em 5+ telas.

## Como é desenhada

Sombra no chão, montinho de terra na frente (70%), corpo em 2,5D: arredondada, cruz ou obelisco, inclinada de leve; luz na borda esquerda, rachadura (40%) e musgo na base (50%).

## O que a paleta controla

`stone`, `light`, `moss`, `dirt`, `height`, `width` e `mound` (chance do montinho).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=tombstone`; grave com **Copiar alterados**, cole em `tombstone_visual.js` e rode `ruby mini_games/_library/sync.rb`.
