# Peça: Cerca de ferro

- **id:** `iron_fence` (`registerProp` em `../iron_fence.js`; valores padrão em `../iron_fence_visual.js`)
- **Tipo:** estática
- **Papel:** a cerca de ferro forjado de cemitérios e castelos (a `fence` é a de madeira)
- **Feito a partir de:** código (2026-11-21), a pedido do usuário: o portão e a cerca que eram desenhados no chão-base do cemitério viraram peças que se posicionam no editor.

## Como é desenhada

2,5D: barras verticais com ponta de lança entre dois trilhos e um pilar de pedra com bola em cada ponta; sombra no chão; 25% das cercas têm uma barra quebrada. Comprimento sorteado (90 a 130) e inclinação leve.

## O que a paleta controla

`iron`, `tip`, `light`, `post`, `length` (mín., máx.), `height` e `spacing`. No editor de cenários dá para trocar as cores de um objeto só (🎨 Cores).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=iron_fence`; grave com **Copiar alterados**, cole em `iron_fence_visual.js` e rode `ruby mini_games/_library/sync.rb`.
