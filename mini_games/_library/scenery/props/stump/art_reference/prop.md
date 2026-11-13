# Peça: Toco

- **id:** `stump` (`registerProp` em `../stump.js`; valores padrão em `../stump_visual.js`)
- **Tipo:** estática
- **Papel:** toco de árvore cortada, visto de cima: o corte com os anéis do tronco
- **Feito a partir de:** a Floresta da Névoa (primeira fase do yara-rpg) vista de cima; extraída do cenário `dark_forest_2` em 2026-11-12, sem mudar nenhum pixel (comparação de 108 imagens antes e depois).

## Como é desenhada

sombra, 3 raízes curtas e arredondadas, casca, o corte mais claro, dois anéis e uma mancha de musgo.

## O que a paleta controla

`bark` (casca e raízes), `top` (o corte), `ring` (anéis), `moss` e `radius`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintado uma vez; zero por quadro.

## Decisões

- Rejeitado: raízes pontudas e compridas (pareciam espinhos de armadilha e podiam ser confundidas com perigo).
- Ficou: 3 raízes curtas e grossas, e o corte maior e mais claro para os anéis serem legíveis.

## Ajuste

`tools/prop_tuner.html?prop=stump` mostra a peça de perto, ao vivo (as animadas, com todos os quadros do atlas), em vários fundos, e tem um
controle para cada valor. Grave com **Copiar alterados**, cole em `stump_visual.js` e rode `ruby mini_games/_library/sync.rb`.
