# Monstro 2.5D: Miliciano da Vila

- **id do boneco:** `militia` (em `../militia25d.js`; medidas e cores em `../militia25d_visual.js`)
- **Papel:** camponês armado e acolchoado; pensado para a tela **village_gate_3 (Vila)**
- **Feito a partir de:** gente (human25d.js), sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): "humanos com armadura" para a vila.**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Roupa | gibão acolchoado de linho e couro com costuras e remendo |
| Cabeça | chapéu de ferro de aba larga |
| Armas | machado de lenhador e escudo redondo de madeira com a marca vermelha da vila |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=militia`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=militia`; grave com **Copiar alterados**, cole em `militia25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.

- 2026-11-22: ganhou capa (pedido do usuário): verde, para disfarçar na mata. Capa curta (capeLength 0.55) porque a padrão do boneco ficava enorme.
