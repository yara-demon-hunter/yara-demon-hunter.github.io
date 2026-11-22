# Peça: Catedral grande com sino

- **id:** `cathedral_grand` (`registerProp` em `../cathedral_grand.js`; valores padrão em `../cathedral_grand_visual.js`)
- **Tipo:** animada (atlas de 1 variante; `anim`: 10/8/6 quadros por nível de detalhe, escala 1,2, ciclo de 2,6 s)
- **Papel:** a catedral maior do cemitério/castelo, com o sino que bate (a `cathedral` é a menor, estática)
- **Feito a partir de:** código (2026-11-21), a pedido do usuário: "uma catedral maior com sino que bate".

## Como é desenhada

2,5D: nave comprida atrás, transepto em cruz, fachada com rosácea de vitral e portal, duas torres laterais com flecha e, no centro, a **torre do sino** (mais alta, com flecha e cruz). Na abertura em arco da torre, o sino de bronze balança como um pêndulo (preso no alto, com haste, lábio e badalo). Nos dois extremos do balanço (as batidas), duas ondas de som se abrem de cada lado da torre e somem. Um ciclo do atlas = um balanço completo = duas batidas.

## O que a paleta controla

`stone`, `stoneDark`, `stoneLight`, `roof`, `roofDark`, `spire`, `door`, `glass` ("r, g, b"), `bell`, `bellDark`, `sound` (cor das ondas) e `swing` (quanto o sino balança). No editor dá para trocar as cores de um objeto só (🎨 Cores).

## Custo

Atlas grande (~ 300×456 unidades por quadro): é a peça mais pesada da biblioteca em memória (uns 2 a 4 MB no detalhe 0; 1 a 2 MB nos mínimos), por isso use **uma** por cenário. 1 drawImage por quadro. Nada de áudio: o "bater" é só visual.

## Decisões

- Peça animada em vez de estática + sino separado, para o usuário pôr UM objeto só. Custo: o atlas repete a parte parada em todos os quadros.
- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=cathedral_grand`; grave com **Copiar alterados**, cole em `cathedral_grand_visual.js` e rode `ruby mini_games/_library/sync.rb`.
