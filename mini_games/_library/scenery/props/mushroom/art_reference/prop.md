# Peça: Cogumelo que brilha

- **id:** `mushroom` (`registerProp` em `../mushroom.js`; valores padrão em `../mushroom_visual.js`)
- **Tipo:** animada (atlas)
- **Papel:** o toque mágico da Floresta da Névoa: cogumelos azulados que pulsam no escuro
- **Feito a partir de:** a Floresta da Névoa (primeira fase do yara-rpg) vista de cima; extraída do cenário `dark_forest_2` em 2026-11-12, sem mudar nenhum pixel (comparação de 108 imagens antes e depois).

## Como é desenhada

2,5D (de cima e de frente ao mesmo tempo): caule claro, tampa em cúpula (borda escura, topo claro, lâminas embaixo, pintas), reflexo que pulsa, e o brilho no ar e no chão. O atlas guarda o pulso (ciclo próprio de 2,6 s); 1 drawImage por grupo.

## O que a paleta controla

`glow` ("r, g, b": troque para um cogumelo vermelho ou verde), `pulse`, `cap`, `capRim`, `capUnder`, `stem` e `spot`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

1 drawImage por peça por quadro; atlas de 8/6/4 quadros × 2 variações.

## Decisões

- Rejeitado: cogumelo visto 100% de cima (virava uma bolinha brilhante; parecia uma lua).
- Ficou: 2,5D, com caule e cúpula. É o caule e a cúpula que dizem "cogumelo".
- Rejeitado: halo grande e forte (engolia a forma da tampa).

## Ajuste

`tools/prop_tuner.html?prop=mushroom` mostra a peça de perto, ao vivo (as animadas, com todos os quadros do atlas), em vários fundos, e tem um
controle para cada valor. Grave com **Copiar alterados**, cole em `mushroom_visual.js` e rode `ruby mini_games/_library/sync.rb`.
