# Peça: Pedrinha

- **id:** `pebbles` (`registerProp` em `../pebbles.js`; valores padrão em `../pebbles_visual.js`)
- **Tipo:** estática
- **Papel:** pontinhos de pedra que quebram a uniformidade do chão
- **Feito a partir de:** a Floresta da Névoa (primeira fase do yara-rpg) vista de cima; extraída do cenário `dark_forest_2` em 2026-11-12, sem mudar nenhum pixel (comparação de 108 imagens antes e depois).

## Como é desenhada

uma elipse minúscula, cinza-azulada e translúcida.

## O que a paleta controla

`color` e as faixas `length` e `width`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Foram reduzidas a pedido do usuário (muito "mato" no jogo).

## Ajuste

`tools/prop_tuner.html?prop=pebbles` mostra a peça de perto, ao vivo (as animadas, com todos os quadros do atlas), em vários fundos, e tem um
controle para cada valor. Grave com **Copiar alterados**, cole em `pebbles_visual.js` e rode `ruby mini_games/_library/sync.rb`.
