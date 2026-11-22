# Monstro 2.5D: Esqueleto Arqueiro

- **id do boneco:** `skeleton_archer` (em `../skeleton_archer25d.js`; medidas e cores em `../skeleton_archer25d_visual.js`)
- **Papel:** esqueleto atirador; pensado para a tela **graveyard_2 (Cemitério)**
- **Feito a partir de:** Esqueleto 2.5D com `S.hold`, `S.hood` e `S.quiver`, sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): "mais esqueletos" para o cemitério.**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Capuz | capuz rasgado cinza-arroxeado (S.hood) |
| Arco | arco de madeira na esquerda com a flecha encaixada e a corda puxada pela direita (S.hold = "bow") |
| Aljava | nas costas, com penas vermelhas (S.quiver) |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=skeleton_archer`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=skeleton_archer`; grave com **Copiar alterados**, cole em `skeleton_archer25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
