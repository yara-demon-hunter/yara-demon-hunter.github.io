# Arma: Cajado

- **pasta:** `weapons/staff/` (arquivo: staff.js)
- **Função:** `drawStaff(rig, hand, dir, alpha, Z)`
- **Quem usa:** Rowan
- **Como é:** madeira retorcida que desce até perto do chão e termina numa espiral em volta de uma esfera laranja que pulsa.

## O que é da arma e o que é do personagem

O desenho (formas, camadas, brilho) é da arma e mora aqui. As medidas e as cores continuam no personagem (a paleta dele,
`rig.C`, e o `<id>_visual.js` dele, que também mexem no tuner e nos Juramentos): a função recebe as medidas como último
argumento. Medidas: `characters/rowan/rowan_visual.js` (`bladeLength`, `staffBelow`, `seedRadius`). Cores: `wood*`, `seed*`.

## Custo

Desenhada a cada quadro só enquanto o herói a empunha (peças simples de `limb`/`ball`); as armas de arremesso viram sprite uma vez.

## Ajuste

Pelo tuner do personagem: `tools/tuner.html?model=<id do personagem>` (medidas e cores). Depois, `ruby mini_games/_library/sync.rb`.
