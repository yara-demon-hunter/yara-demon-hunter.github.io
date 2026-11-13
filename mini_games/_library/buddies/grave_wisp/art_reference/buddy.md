# Buddy: Caveira voadora (Grave Wisp)

- **pasta:** `buddies/grave_wisp/`
- **Papel:** Last Torch: Grave Wisp. Caveira em chamas roxas que flutua perto do herói e atira nos monstros.
- **Funções:** `grave_wisp.js`: `drawGraveWisp(g, x, y, t, flash)`.

## Como é desenhada

Crânio de osso com mandíbula e dentes, olhos roxos e três línguas de fogo subindo. Desenho ao vivo (é pequena): sem atlas. A chama cresce quando ela acabou de atirar (`flash`).

## O que a paleta e as medidas controlam

`grave_wisp_visual.js`: cores do osso, dos olhos e da chama. Valores padrão; mudar aqui muda o buddy em todos os jogos (depois do sync).

## O que é do jogo e não mora aqui

O jogo (js/render/skills.js, `renderWisp`) guarda a posição (`state.wisp`) e chama `drawGraveWisp`. O tiro fica em js/systems/skills_curse.js.

## Origem

Movida do Last Torch (`renderWisp`, em `js/render/skills.js`, e a chave `wisp` de `skills_visual.js`) em 2026-11-13, sem mudar nenhum pixel.

## Imagens

`images/` guarda a referência (foto, ilustração, rabisco) e o resultado (captura do tuner ou do jogo). Ainda vazia: coloque aqui a arte de referência.

## Ajuste

Lobos: `tools/tuner.html?model=grave_wisp` (ajuste ao vivo; grave com **Copiar alterados**). Aves e caveira: edite o `_visual.js` e rode `ruby mini_games/_library/sync.rb`.
