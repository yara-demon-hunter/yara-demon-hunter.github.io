# Monstro 2.5D: Zumbi de Armadura

- **id do boneco:** `armored_zombie` (em `../armored_zombie25d.js`; medidas e cores em `../armored_zombie25d_visual.js`)
- **Papel:** versão maior e mais forte do Zumbi, um soldado medieval morto-vivo; tela **graveyard_2 (Cemitério)**
- **Feito a partir de:** gente (`human25d.js`) com `armsForward` e `dragLeg`, mais a armadura de placas do Cavaleiro; sem imagem de referência
- **Pedido do usuário (2026-11-22):** "um Zumbi com armadura medieval, um pouco maior e mais forte".

## Como foi criado

| Peça | Como ficou em 2.5D |
|---|---|
| Armadura | peitoral, ombreiras e grevas de aço velho e enferrujado, tabardo marrom-avermelhado rasgado, chapéu de ferro |
| Cabeça | rosto verde apodrecido de boca aberta e olhos amarelos mortiços |
| Braços e pernas | braços esticados à frente em manoplas, uma perna que arrasta; anda manquejando |
| Tamanho | 1,2x o corpo normal (`bodyScale`) e raio maior no jogo |

## Decisões

- 1ª versão em 2026-11-22. No jogo: mais vida, mais dano e resistente a empurrão, mais lento que o Zumbi.

## Ajuste

`tools/tuner.html?model=armored_zombie`; grave com **Copiar alterados**, cole no arquivo de medidas e rode `ruby mini_games/_library/sync.rb`.
