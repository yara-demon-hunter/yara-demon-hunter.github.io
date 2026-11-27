# Monstro 2.5D: Goblin do Baú

- **id do boneco:** `chest_goblin` (`registerHuman` em `../human25d.js`)
- **Papel:** evento de onda do Last Torch. Ele não ataca: dá risadas, roda em volta da tocha, some e reaparece (blink) por uns 20 s. Se for morto, solta o baú
- **Feito a partir de:** o motor de gente (`human25d.js`, o mesmo do Miliciano) e o **baú que já existia no jogo** (o item Treasure, `drawChest` em `last_torch/js/render/pickups.js`; cores em `powers_visual.js`)
- **Resultado:** (ainda sem imagem do tuner)

## Como foi criado

| Peça | De onde veio | Como ficou em 2.5D |
|---|---|---|
| Corpo, pernas, braços | `human25d.js` com `look` de túnica, `bodyScale` 0,8 | goblin baixo e magro de pele verde |
| Cabeça grande | `headRadius` 3,1 | cabeção para parecer engraçado |
| Chapeuzinho verde | novo `look.helmet = 'cap'` | aba redonda, copa em cone caída para trás com a ponta clara e uma fita dourada (`#16a34a`, `#15803d`, `#4ade80`) |
| Orelhas | novo `look.ears` em `human25d.js` | duas orelhas compridas e pontudas para trás e para cima |
| Sorrisão | novo `look.grin` | boca larga curvada com fileira de dentes |
| **Baú nas costas** | novo `look.backChest`, copiando o baú do item Treasure | caixa de madeira (`#78350f`), tampa redonda clara (`#b45309`), cintas e fecho dourados (`#fbbf24`, `#fef3c7`), correias passando pelos ombros, brilho de ouro na tampa; só as faces voltadas para a câmera são desenhadas |

## Cores

Pele `#7fb04a`, túnica `#6b4a2a`, o baú igual ao do item Treasure. Se mudar a cor do baú do jogo, mude `chest*` em `chest_goblin25d_visual.js`.
