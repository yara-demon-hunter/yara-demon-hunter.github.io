# Arma: Rosa de arremesso

- **pasta:** `weapons/rose/` (arquivo: rose.js)
- **Função:** `drawRose(ctx, t, dark)`
- **Quem usa:** Rowan (no lugar da adaga)
- **Como é:** caule com espinhos e uma folha, e a flor na ponta (pétalas escuras por fora, cheias por dentro, miolo em espiral); a versão `dark` é a Rosa Negra.

## O que é da arma e o que é do personagem

O desenho (formas, camadas, brilho) é da arma e mora aqui. As medidas e as cores continuam no personagem (a paleta dele,
`rig.C`, e o `<id>_visual.js` dele, que também mexem no tuner e nos Juramentos): a função recebe as medidas como último
argumento. Cores e formato: `rose_visual.js` (vermelha e negra). Entra pelo registro `thrown.js` (estilos `rose` e `darkRose`). É a arma nova: criada em 2026-11-13 a pedido do dono do projeto.

## Custo

Desenhada a cada quadro só enquanto o herói a empunha (peças simples de `limb`/`ball`); as armas de arremesso viram sprite uma vez.

## Ajuste

Pelo tuner do personagem: `tools/tuner.html?model=<id do personagem>` (medidas e cores). Depois, `ruby mini_games/_library/sync.rb`.
