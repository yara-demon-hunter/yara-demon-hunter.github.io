# Monstro 2.5D: Cavaleiro de Placas

- **id do boneco:** `plate_knight` (em `../plate_knight25d.js`; medidas e cores em `../plate_knight25d_visual.js`)
- **Papel:** cavaleiro em armadura completa; pensado para a tela **village_gate_3 (Vila)**
- **Feito a partir de:** gente (human25d.js), sem imagem de referência (desenhado por código, no estilo dos monstros 2.5D que já existem)
- **Pedido do usuário (2026-11-22): "humanos com armadura" para a vila. A capa foi tirada (ficava enorme e dentada).**

## Como foi criado

Montado no boneco 2.5D (`characters/hunter/hero25d.js`): o motor cuida da câmera, da passada e da ordem de desenho; aqui ficam só as peças próprias.

| Peça | Como ficou em 2.5D |
|---|---|
| Armadura | peitoral, ombreiras e grevas de aço, elmo fechado com fenda de brilho vermelho e pluma |
| Tabardo | branco com a faixa vermelha |
| Armas | espada e escudo de aço |

## Decisões e o que foi rejeitado

- 1ª versão feita em 2026-11-22. Ainda não foi ligado ao Last Torch (o jogo continua usando o desenho de cima dos monstros); está no Ateliê (`tools/tuner.html?model=plate_knight`) e em `monsters/25d/index.js` para quando for ligado.
- Tamanho no jogo: `scalePerRadius` e `center` no arquivo de medidas.

## Ajuste

`tools/tuner.html?model=plate_knight`; grave com **Copiar alterados**, cole em `plate_knight25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.

- 2026-11-22: ganhou capa (pedido do usuário): vermelha. Capa curta (capeLength 0.55) porque a padrão do boneco ficava enorme.
