# Peça: Ondulação

- **id:** `ripple` (`registerProp` em `../ripple.js`; valores padrão em `../ripple_visual.js`)
- **Tipo:** animada (atlas)
- **Papel:** água viva: anéis que se abrem e somem
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

2 anéis elípticos (achatados em 42%) que crescem e esvaem; um ciclo completo emenda com o primeiro.

## O que a paleta controla

`ring`, `rings` e `maxRadius`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

atlas pequeno (48×26); 1 drawImage por ondulação.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=ripple`; grave com **Copiar alterados**, cole em `ripple_visual.js` e rode `ruby mini_games/_library/sync.rb`.
