# Monstro 2.5D: Lodo Vivo

- **id do boneco:** `bog_slime` (em `../bog_slime25d.js`; medidas e cores em `../bog_slime25d_visual.js`)
- **Papel:** massa de lodo verde que borbulha; pensado para a tela **swamp (Pântano)**
- **Feito a partir de:** criatura (registerCreature), sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): segundo monstro verde para o pântano.**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Corpo | bola que aperta e estica, pseudópodes em volta, brilho molhado no alto |
| Por dentro | bolhas claras subindo e um crânio meio dissolvido |
| Rosto | dois olhos amarelos e a boca escura |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=bog_slime`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=bog_slime`; grave com **Copiar alterados**, cole em `bog_slime25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
