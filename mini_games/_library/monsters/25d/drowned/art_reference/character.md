# Monstro 2.5D: Afogado

- **id do boneco:** `drowned` (em `../drowned25d.js`; medidas e cores em `../drowned25d_visual.js`)
- **Papel:** morto do rio, de pele azul-acinzentada; pensado para a tela **river_crossing_2 (Travessia do Rio)**
- **Feito a partir de:** gente (human25d.js), sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): segundo monstro d'água para o rio.**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Corpo | peito nu inchado e marcado, calça rasgada verde-azulada |
| Cabeça | cabelo de algas pesado, boca aberta e olhos ciano que brilham |
| Mãos | garras pálidas |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=drowned`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=drowned`; grave com **Copiar alterados**, cole em `drowned25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
