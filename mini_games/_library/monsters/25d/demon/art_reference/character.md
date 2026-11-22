# Monstro 2.5D: Demônio Soldado

- **id do boneco:** `demon` (em `../demon25d.js`; medidas e cores em `../demon25d_visual.js`)
- **Papel:** demônio menor de pele vermelha; pensado para a tela **castle_gate_2 (Castelo)**
- **Feito a partir de:** gente (human25d.js), sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): "demônio" para o castelo.**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Corpo | pele vermelho-escura, chifres curvos, presas, garras e o peito em brasa |
| Asas e rabo | asas pequenas de morcego que batem e rabo com ponta de lança |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=demon`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=demon`; grave com **Copiar alterados**, cole em `demon25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
