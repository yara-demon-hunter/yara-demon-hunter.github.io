# Monstro 2.5D: Sapo do Pântano

- **id do boneco:** `bog_toad` (em `../bog_toad25d.js`; medidas e cores em `../bog_toad25d_visual.js`)
- **Papel:** sapo gigante verde que pula; pensado para a tela **swamp (Pântano)**
- **Feito a partir de:** criatura (registerCreature), sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): "algo verde" para o pântano.**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Corpo | bola grande com laterais cheias, barriga clara e verrugas escuras nas costas |
| Cabeça | boca larga, papo amarelo que infla e desinfla, dois olhos saltados cor de âmbar com pupila em fenda |
| Pernas | traseiras dobradas em Z que se esticam a cada pulo (só ao andar), dianteiras curtas |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=bog_toad`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=bog_toad`; grave com **Copiar alterados**, cole em `bog_toad25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
