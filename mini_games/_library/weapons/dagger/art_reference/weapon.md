# Arma: Adaga

- **pasta:** `weapons/dagger/` (arquivo: dagger.js (na mão do Zeph) e thrown_dagger.js (a adaga de arremesso))
- **Função:** `drawDagger(rig, hand, dir, alpha, Z)`; `drawThrownDagger(ctx, t)`
- **Quem usa:** Zeph (na mão) e o Demon Hunter (arremesso)
- **Como é:** lâmina curta, reta e pontuda, guarda pequena de ferro e cabo de couro; a de arremesso é a mesma ideia desenhada de lado, com pomo de gema e runas.

## O que é da arma e o que é do personagem

O desenho (formas, camadas, brilho) é da arma e mora aqui. As medidas e as cores continuam no personagem (a paleta dele,
`rig.C`, e o `<id>_visual.js` dele, que também mexem no tuner e nos Juramentos): a função recebe as medidas como último
argumento. Medidas na mão: `characters/zeph/zeph_visual.js`. A adaga de arremesso: `dagger_visual.js` (cores e formato); voo, altura e rastro ficam no jogo (`KNIFE_VISUALS`).

## Custo

Desenhada a cada quadro só enquanto o herói a empunha (peças simples de `limb`/`ball`); as armas de arremesso viram sprite uma vez.

## Ajuste

Pelo tuner do personagem: `tools/tuner.html?model=<id do personagem>` (medidas e cores). Depois, `ruby mini_games/_library/sync.rb`.
