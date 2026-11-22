# Monstro 2.5D: Enguia do Rio

- **id do boneco:** `river_eel` (em `../river_eel25d.js`; medidas e cores em `../river_eel25d_visual.js`)
- **Papel:** serpente d'água azul que ondula; pensado para a tela **river_crossing_2 (Travessia do Rio)**
- **Feito a partir de:** criatura (registerCreature), sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): "algo relacionado a monstro de água / azul" para o rio.**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Corpo | fila de 11 bolas que ondula em S (mais rápido ao andar), engrossa na cabeça e afina até a cauda |
| Nadadeira e manchas | triângulos de nadadeira nas costas e manchas ciano que brilham |
| Cabeça | erguida, focinho claro, boca aberta com 4 dentes, dois olhos que brilham e barbatanas no pescoço |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=river_eel`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=river_eel`; grave com **Copiar alterados**, cole em `river_eel25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
