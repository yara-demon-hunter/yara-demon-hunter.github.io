# Peça: Braseiro

- **id:** `brazier` (`registerProp` em `../brazier.js`; valores padrão em `../brazier_visual.js`)
- **Tipo:** animada (atlas)
- **Papel:** luz de fogo fixa: castelo e vila (o brilho pulsa, a chama dança)
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

bacia de pedra com brasa por dentro, 3 línguas de fogo (laranja, amarelo, creme) que dançam e uma poça de luz no chão que pulsa.

## O que a paleta controla

`bowl`, `bowlLight`, `flame` (3 cores), `glow` ("r, g, b") e `flicker`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

atlas de poucos quadros; 1 drawImage por braseiro. É só enfeite: a luz de verdade do jogo continua sendo a da tocha.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=brazier`; grave com **Copiar alterados**, cole em `brazier_visual.js` e rode `ruby mini_games/_library/sync.rb`.
