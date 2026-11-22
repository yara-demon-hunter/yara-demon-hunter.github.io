# Peça: Portão de ferro

- **id:** `iron_gate` (`registerProp` em `../iron_gate.js`; valores padrão em `../iron_gate_visual.js`)
- **Tipo:** estática
- **Papel:** o portão de entrada do cemitério ou do castelo (par da `iron_fence`)
- **Feito a partir de:** código (2026-11-21), a pedido do usuário: o portão e a cerca que eram desenhados no chão-base do cemitério viraram peças que se posicionam no editor.

## Como é desenhada

2,5D: dois pilares de pedra (fiadas, capitel e bola no alto), duas folhas de barras que sobem em arco para o centro com ponta de lança, três trilhos e um aro dourado no meio. `ajar` entreabre a folha da direita.

## O que a paleta controla

`iron`, `tip`, `light`, `stone`, `stoneDark`, `stoneLight`, `ornament`, `gap` (vão), `height`, `arch` e `ajar`. No editor de cenários dá para trocar as cores de um objeto só (🎨 Cores).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=iron_gate`; grave com **Copiar alterados**, cole em `iron_gate_visual.js` e rode `ruby mini_games/_library/sync.rb`.
