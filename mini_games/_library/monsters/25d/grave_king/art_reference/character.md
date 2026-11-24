# Monstro 2.5D (chefe): Rei do Cemitério (Grave King)

- **id do boneco:** `grave_king` (em `../grave_king25d.js`; medidas e cores em `../grave_king25d_visual.js`); chefe `GRAVE_KING` do **Graveyard** (onda 12)
- **Imagem de referência:** `images/grave-king.webp`
- **Feito a partir de:** o corpo de gente (`../../human25d.js`), o mesmo do Cavaleiro de Placas, com peças novas ligadas em `look`

## Descrição (pela imagem, 2026-11-24)

Um rei morto que ainda veste a armadura de guerra. **Armadura negra de placas**, gasta e riscada, com **frisos de bronze escuro** e rebites em todas as bordas.
Na cabeça, um **elmo de espinhos** aberto na frente: dentro dele a **caveira** amarelada, de **olhos vermelhos** acesos e a fileira de dentes à mostra;
na testa uma faixa de bronze com uma caveirinha, e no topo um pino de onde sai um **rabo de crina vermelha** que cai para trás.
As **ombreiras** são enormes, com **espinhos** e um **medalhão de caveira** de bronze. Das manoplas saem **mãos de esqueleto**, ossos finos e longos.
Por baixo do peitoral, **cota de malha** até os joelhos e um cinto de couro com **fivela de caveira**. Atrás dele, uma **capa preta comprida e rasgada**,
em tiras. Nas mãos, um **espadão** largo e gasto, de guarda com pontas curvas, que ele **arrasta pelo chão** ao andar.

## Como foi montado

| Peça | Opção (`look` / cor) |
|---|---|
| Elmo de espinhos com a caveira, faixa de bronze, pino e rabo de crina | `helmet: 'skull'` + `plume` (`C.plume`, `C.plumeLight`) |
| Armadura negra com frisos de bronze | `torso: 'plate'`, `legs: 'greaves'`, `C.trim` / `C.trimDark` |
| Ombreiras com espinhos e medalhão de caveira | `pauldrons`, `spikes` |
| Mãos de esqueleto | `boneHands` |
| Cota de malha e fivela de caveira | `mail`, `skullBuckle` |
| Capa comprida rasgada | `cape` com `capeLength` 1,05 (a barra dentada da capa faz o rasgado) |
| Espadão arrastando | `weapon: 'greatsword'` (a ponta vai para trás e raspa o chão) |

## Decisões

- 2026-11-24: refeito do zero. A 1ª versão (esqueleto guerreiro maior com carne podre) não lembrava a imagem.

## Ajuste

`tools/tuner.html?model=grave_king` (Chefes); grave com **Copiar alterados**, cole em `grave_king25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
