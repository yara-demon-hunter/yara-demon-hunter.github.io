# Peça: Cerca de madeira (vertical)

- **id:** `fence_v` (`registerProp` em `../fence_v.js`; valores padrão em `../fence_v_visual.js`)
- **Tipo:** estática
- **Papel:** a cerca da vila no sentido de cima para baixo da tela (a `fence` é a horizontal)
- **Feito a partir de:** código (2026-11-21), a pedido do usuário: "uma na horizontal e outra no sentido vertical". Mesma paleta e medidas da `fence`.

## Como é desenhada

2,5D: fila de mourões de cima para baixo (30% das cercas têm um quebrado), dois trilhos finos entre eles (um mais alto, outro mais baixo) e sombra ao longo da fila. Inclinação aleatória leve; dá para girar no editor.

## O que a paleta controla

`post`, `rail`, `top`, `length` (mín., máx.) e `spacing`. A receita de um cenário pode trocar qualquer valor só para ele (`palette`).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=fence_v`; grave com **Copiar alterados**, cole em `fence_v_visual.js` e rode `ruby mini_games/_library/sync.rb`.
