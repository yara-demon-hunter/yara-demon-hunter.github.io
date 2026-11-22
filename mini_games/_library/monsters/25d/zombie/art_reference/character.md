# Monstro 2.5D: Zumbi

- **id do boneco:** `zombie` (em `../zombie25d.js`; medidas e cores em `../zombie25d_visual.js`)
- **Papel:** morto-vivo lento e resistente; pensado para a tela **graveyard_2 (Cemitério)**
- **Feito a partir de:** gente (`human25d.js`) com `armsForward` e `armsBare`, sem imagem de referência (desenhado por código)
- **Pedido do usuário (2026-11-22):** "seria legal criar um zumbi pra tela do graveyard".

## Como foi criado

| Peça | Como ficou em 2.5D |
|---|---|
| Corpo | camisa rasgada e suja, calça de pano, braços sem manga e corpo curvado para a frente |
| Braços | esticados à frente, balançando com a passada, com garras pálidas |
| Cabeça | pele verde-acinzentada, boca aberta, olhos amarelos mortiços, feridas abertas no peito |

## Decisões

- 1ª versão em 2026-11-22. Nasce saindo do chão (como o esqueleto) e ataca por contato, sem arma.

## Ajuste

`tools/tuner.html?model=zombie`; grave com **Copiar alterados**, cole em `zombie25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
