# Peça: Fogo-fátuo

- **id:** `wisp` (`registerProp` em `../wisp.js`; valores padrão em `../wisp_visual.js`)
- **Tipo:** animada (atlas)
- **Papel:** luz de pântano que paira e pulsa, o toque de assombração
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

uma bolinha clara com halo, rastro curto abaixo e uma poça de luz no chão; sobe e desce em ciclo.

## O que a paleta controla

`glow` ("r, g, b"), `core`, `bob` e `pulse`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

atlas de poucos quadros; 1 drawImage por fogo-fátuo.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=wisp`; grave com **Copiar alterados**, cole em `wisp_visual.js` e rode `ruby mini_games/_library/sync.rb`.
