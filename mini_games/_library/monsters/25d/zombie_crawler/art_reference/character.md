# Monstro 2.5D: Zumbi Rastejante

- **id do boneco:** `zombie_crawler` (`registerBody` em `../zombie_crawler25d.js`; medidas e cores em `../zombie_crawler25d_visual.js`)
- **Papel:** meio zumbi que se arrasta com as mãos; pensado para a tela **graveyard_2 (Cemitério)**
- **Feito a partir de:** o Esqueleto Rastejante (`../skeleton_crawler/`), sem imagem de referência (desenhado por código)
- **Pedido do usuário (2026-11-23):** "um Zombie que se arrasta e não tem a metade do corpo, fica aparecendo só os ossinhos da coluna e ele se arrastando".

## Como foi criado

| Peça | Como ficou em 2.5D |
|---|---|
| Corpo | só peito e braços; costelas à mostra com carne podre grudada; no corte da bacia, ferida e tripa balançando |
| Coluna | vértebras soltas (`tailBones`) seguem para trás pelo chão, ondulando, até uma ponta quebrada |
| Pernas | não existem (`noLegs`) |
| Cabeça | pele verde-acinzentada (`fleshHead`), olhos amarelos, mandíbula caída |
| Movimento | mãos vão ao chão uma de cada vez puxando o corpo (`crawl*`), devagar |

## Decisões

- 1ª versão em 2026-11-23. Opções novas no `skeleton25d.js` (`noLegs`, `noSoul`, `fleshHead`, `fleshTorso`, `tailBones`, `tailGap`); o Esqueleto não muda.
- Nasce saindo do chão e ataca por contato.

## Ajuste

`tools/tuner.html?model=zombie_crawler`; grave com **Copiar alterados**, cole em `zombie_crawler25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
