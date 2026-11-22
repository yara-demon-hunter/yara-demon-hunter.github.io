# Monstro 2.5D: Esqueleto Guerreiro

- **id do boneco:** `skeleton_warrior` (em `../skeleton_warrior25d.js`; medidas e cores em `../skeleton_warrior25d_visual.js`)
- **Papel:** esqueleto armado; pensado para a tela **graveyard_2 (Cemitério)**
- **Feito a partir de:** Esqueleto 2.5D com `S.hold`, `S.armor` e `S.helmet`, sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): "mais esqueletos" para o cemitério.**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Armadura | capacete e peitoral enferrujados (S.helmet, S.armor) |
| Armas | espada gasta na mão direita e escudo de madeira rachado na esquerda (S.hold = "sword") |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=skeleton_warrior`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=skeleton_warrior`; grave com **Copiar alterados**, cole em `skeleton_warrior25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
