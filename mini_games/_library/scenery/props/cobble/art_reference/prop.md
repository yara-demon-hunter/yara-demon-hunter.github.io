# Peça: Calçada

- **id:** `cobble` (`registerProp` em `../cobble.js`; valores padrão em `../cobble_visual.js`)
- **Tipo:** estática
- **Papel:** chão de pedras redondas para estradas e pátios
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

um punhado de 4 a 8 pedras ovais com junta escura embaixo, cor que varia por pedra e um brilho no alto-esquerda.

## O que a paleta controla

`stone`, `dark` (junta), `light`, `count` (mín., máx.) e `spread`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=cobble`; grave com **Copiar alterados**, cole em `cobble_visual.js` e rode `ruby mini_games/_library/sync.rb`.
