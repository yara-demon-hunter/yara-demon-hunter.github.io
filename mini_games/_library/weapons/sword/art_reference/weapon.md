# Arma: Espada (a lâmina do Demon Hunter)

- **pasta:** `weapons/sword/` (arquivo: sword.js)
- **Função:** `drawSword(rig, hand, dir, t, alpha, { bladeLength, bladeWidth, runeCount })`
- **Quem usa:** Demon Hunter
- **Como é:** lâmina larga e reta de aço-azul com fio brilhante, nervura central, guarda e cabo de luva, e runas que acendem em onda.

## O que é da arma e o que é do personagem

O desenho (formas, camadas, brilho) é da arma e mora aqui. As medidas e as cores continuam no personagem (a paleta dele,
`rig.C`, e o `<id>_visual.js` dele, que também mexem no tuner e nos Juramentos): a função recebe as medidas como último
argumento. Medidas: `characters/hunter/hero25d_visual.js` e os Juramentos (mudam o tamanho). Cores da paleta: `blade`, `bladeCore`, `runes`, `glove`, `buckle`.

## Custo

Desenhada a cada quadro só enquanto o herói a empunha (peças simples de `limb`/`ball`); as armas de arremesso viram sprite uma vez.

## Ajuste

Pelo tuner do personagem: `tools/tuner.html?model=<id do personagem>` (medidas e cores). Depois, `ruby mini_games/_library/sync.rb`.
