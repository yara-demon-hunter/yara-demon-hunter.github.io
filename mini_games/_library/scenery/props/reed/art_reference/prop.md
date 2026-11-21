# Peça: Junco

- **id:** `reed` (`registerProp` em `../reed.js`; valores padrão em `../reed_visual.js`)
- **Tipo:** animada (atlas)
- **Papel:** junco/taboa nas margens e na água rasa
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

10 folhas finas que saem do pé e balançam em fases diferentes; 40% têm espiga marrom na ponta.

## O que a paleta controla

`blade`, `blade2`, `head` e `sway`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

atlas de poucos quadros; 1 drawImage por touceira.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=reed`; grave com **Copiar alterados**, cole em `reed_visual.js` e rode `ruby mini_games/_library/sync.rb`.
