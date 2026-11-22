# Peça: Catedral

- **id:** `cathedral` (`registerProp` em `../cathedral.js`; valores padrão em `../cathedral_visual.js`)
- **Tipo:** estática (grande: ~170 de largura e ~270 de altura em escala 1)
- **Papel:** a igreja do cemitério (`graveyard_2`); serve para qualquer cenário com um povoado ou cemitério
- **Feito a partir de:** código (2026-11-21), a pedido do usuário. Sem arte de terceiros.

## Como é desenhada

2,5D (de cima e de frente): sombra no chão; atrás, o telhado comprido da nave (fiadas, cumeeira, lado na sombra) com contrafortes e o transepto em cruz; na frente, a fachada de pedra com fiadas, empena com cruz, rosácea de vitral (raios e luz), portal em arco ogival, e duas torres com abertura de sino, vitrais e flechas pontudas. O pé fica no meio da fachada.

## O que a paleta controla

`stone`, `stoneDark`, `stoneLight`, `roof`, `roofDark`, `spire`, `door`, `glass` ("r, g, b": a luz dos vitrais) e `width` (largura da fachada). No editor de cenários dá para trocar as cores de um objeto só (🎨 Cores).

## Custo

pintada uma vez; zero por quadro. Se for marcada "na frente" no editor, vira um sprite de um quadro (grande: ~ 400×400 unidades de célula).

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo). Por ser grande e pintada no chão, o herói e os monstros andam "sobre" ela: ponha-a nas bordas, longe do centro, como as casas da vila.

## Ajuste

`tools/prop_tuner.html?prop=cathedral`; grave com **Copiar alterados**, cole em `cathedral_visual.js` e rode `ruby mini_games/_library/sync.rb`.
