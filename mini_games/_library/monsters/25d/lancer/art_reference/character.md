# Monstro 2.5D: Lanceiro do Castelo

- **id do boneco:** `lancer` (em `../lancer25d.js`; medidas e cores em `../lancer25d_visual.js`)
- **Papel:** guarda de armadura escura com lança; pensado para a tela **castle_gate_2 (Castelo)**
- **Feito a partir de:** gente (human25d.js), sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): "homens com armadura e lança" para o castelo.**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Armadura | aço escuro, elmo fechado com pluma roxa e brilho lilás |
| Tabardo | roxo com a faixa prateada |
| Lança | comprida, com bandeirola roxa, mantida apontada à frente |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=lancer`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=lancer`; grave com **Copiar alterados**, cole em `lancer25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.

- 2026-11-22: ganhou capa (pedido do usuário): roxa. Capa curta (capeLength 0.55) porque a padrão do boneco ficava enorme.
