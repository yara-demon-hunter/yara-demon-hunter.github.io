# Peça: Tábua

- **id:** `plank` (`registerProp` em `../plank.js`; valores padrão em `../plank_visual.js`)
- **Tipo:** estática
- **Papel:** tábuas soltas e quebradas: pontes, vila, restos
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

um retângulo girado de leve com sombra, borda escura, madeira de tom variável e três veios.

## O que a paleta controla

`wood`, `grain`, `edge`, `length` (mín., máx.) e `width`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro (usa save/restore só ao montar).

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=plank`; grave com **Copiar alterados**, cole em `plank_visual.js` e rode `ruby mini_games/_library/sync.rb`.
