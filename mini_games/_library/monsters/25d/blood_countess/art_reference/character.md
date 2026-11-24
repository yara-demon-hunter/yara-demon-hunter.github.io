# Monstro 2.5D (chefe): Blood Countess

- **id do boneco:** `blood_countess` (em `../blood_countess25d.js`; medidas e cores em `../blood_countess25d_visual.js`); chefe `BLOOD_COUNTESS` do **Castle** (onda 16)
- **Imagem de referência:** `images/blood-countess.webp` (enviada em 2026-11-24)
- **Feito a partir de:** o corpo do Vampiro (`../vampire/vampire25d.js`, função `registerVampireVariant`), com armadura ligada e outras cores

## O que a imagem mostra (e o boneco segue)

- Pele cinza-pálida, rosto severo, orelhas pontudas, **olhos vermelhos brilhantes**.
- **Cabelo prateado** penteado para trás.
- **Gola alta** preta com forro vinho, em duas pontas.
- **Armadura escura** com filigrana prateada em espiral nas ombreiras e no peito.
- **Joia vermelha** presa no colo, com moldura prateada.
- Capa preta por trás.

## Decisões

- 1ª versão em 2026-11-24. O Vampiro comum não muda: a variante só troca as medidas (`S`) enquanto desenha as peças dela.

## Ajuste

`tools/tuner.html?model=blood_countess` (Chefes); grave com **Copiar alterados**, cole em `blood_countess25d_visual.js` e rode `ruby mini_games/_library/sync.rb`.
