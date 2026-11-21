# Peça: Chalé de camponês

- **id:** `cottage` (`registerProp` em `../cottage.js`; valores padrão em `../cottage_visual.js`)
- **Tipo:** animada (atlas)
- **Papel:** a casa da vila: o que faz a tela parecer um povoado
- **Feito a partir de:** código (2026-11-21), para a vila do mapa (nada de arte de terceiros: mesmo estilo 2.5D das outras peças).

## Como é desenhada

2,5D: sombra e luz da janela no chão, parede da frente com vigas, porta em arco, janela acesa que tremula, telhado inclinado (palha, ardósia ou telha, sorteado) e chaminé com 4 baforadas de fumaça em ciclo. 3 variantes (lado da porta e da janela, largura, telhado).

## O que a paleta controla

`wall`, `timber`, `roofs` (lista de telhados), `roofDark`, `door`, `window` ("r, g, b"), `flicker` e `smoke`. A receita de um cenário pode trocar qualquer valor só para ele (`palette`).

## Custo

atlas de 112×104 com poucos quadros; 1 drawImage por chalé. Usar poucos (4 a 6 por tela).

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo). Ficam nas margens, longe da ação: nunca cobrem monstros.

## Ajuste

`tools/prop_tuner.html?prop=cottage`; grave com **Copiar alterados**, cole em `cottage_visual.js` e rode `ruby mini_games/_library/sync.rb`.
