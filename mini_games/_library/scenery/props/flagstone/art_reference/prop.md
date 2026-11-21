# Peça: Laje de pedra

- **id:** `flagstone` (`registerProp` em `../flagstone.js`; valores padrão em `../flagstone_visual.js`)
- **Tipo:** estática
- **Papel:** lajes soltas ou rachadas por cima do chão de pedra do castelo
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

um retângulo girado de leve, sombra, luz nas duas bordas de cima e, na maioria, uma rachadura de 4 pontos.

## O que a paleta controla

`slab`, `light`, `crack`, `width` e `height` (mín., máx.). Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=flagstone`; grave com **Copiar alterados**, cole em `flagstone_visual.js` e rode `ruby mini_games/_library/sync.rb`.
