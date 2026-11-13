# Arma: Katana

- **pasta:** `weapons/katana/` (arquivo: katana.js)
- **Função:** `drawKatana(rig, hand, dir, alpha, A, color?)` e `drawGuard(rig, p, dir, A)`
- **Quem usa:** Azael
- **Como é:** lâmina curva e fina que afina na ponta, cabo trançado e guarda redonda (tsuba).

## O que é da arma e o que é do personagem

O desenho (formas, camadas, brilho) é da arma e mora aqui. As medidas e as cores continuam no personagem (a paleta dele,
`rig.C`, e o `<id>_visual.js` dele, que também mexem no tuner e nos Juramentos): a função recebe as medidas como último
argumento. Medidas: `characters/azael/azael_visual.js` (`bladeLength`, `bladeCurve`, `bladeWidth`, `guardOffset`, `guardSize`). Cores: `blade`, `bladeCore`, `hilt`, `tsuba`.

## Custo

Desenhada a cada quadro só enquanto o herói a empunha (peças simples de `limb`/`ball`); as armas de arremesso viram sprite uma vez.

## Ajuste

Pelo tuner do personagem: `tools/tuner.html?model=<id do personagem>` (medidas e cores). Depois, `ruby mini_games/_library/sync.rb`.
