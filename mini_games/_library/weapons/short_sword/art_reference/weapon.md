# Arma: Espada curta

- **pasta:** `weapons/short_sword/` (arquivo: short_sword.js)
- **Função:** `drawShortSword(rig, hand, dir, alpha, Y)`
- **Quem usa:** Yara
- **Como é:** lâmina reta e larga, cabo de couro, guarda e pomo de metal escuro.

## O que é da arma e o que é do personagem

O desenho (formas, camadas, brilho) é da arma e mora aqui. As medidas e as cores continuam no personagem (a paleta dele,
`rig.C`, e o `<id>_visual.js` dele, que também mexem no tuner e nos Juramentos): a função recebe as medidas como último
argumento. Medidas: `characters/yara/yara_visual.js`. Cores: `leather`, `metal`, `blade`, `bladeCore`.

## Custo

Desenhada a cada quadro só enquanto o herói a empunha (peças simples de `limb`/`ball`); as armas de arremesso viram sprite uma vez.

## Ajuste

Pelo tuner do personagem: `tools/tuner.html?model=<id do personagem>` (medidas e cores). Depois, `ruby mini_games/_library/sync.rb`.
