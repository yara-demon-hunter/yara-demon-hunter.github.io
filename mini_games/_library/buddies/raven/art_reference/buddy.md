# Buddy: Corvo

- **pasta:** `buddies/raven/`
- **Papel:** Last Torch: Shadow Raven. Ave pequena que voa no ombro do herói, marca e mergulha nos monstros.
- **Funções:** `raven.js`: `prepareRaven(mobile)`, `drawRavenSprite(g, x, y, size, facing, tilt, alpha, speed)`, `renderRavenBuddy(g, bird)`.

## Como é desenhada

Mesma técnica da fênix: penas em degradê, asa em duas partes, 12 quadros de batida num atlas. Roxo e preto, brilho violeta; no mergulho a batida acelera e penas soltas ficam no rastro.

## O que a paleta e as medidas controlam

`raven_visual.js`: tamanho, quadros, pixels do atlas, cores, brilho e penas soltas. Valores padrão; mudar aqui muda o buddy em todos os jogos (depois do sync).

## O que é do jogo e não mora aqui

O jogo (js/render/raven.js) guarda o estado (`state.raven`: posição, direção, inclinação, `dive`, `rise`). A mira, a marca e o mergulho ficam em js/systems/skills_shadow.js.

## Origem

Movida do Last Torch (`js/render/raven.js`, `data_model/visuals/effects/raven_visual.js`) em 2026-11-13, sem mudar nenhum pixel.

## Imagens

`images/` guarda a referência (foto, ilustração, rabisco) e o resultado (captura do tuner ou do jogo). Ainda vazia: coloque aqui a arte de referência.

## Ajuste

Lobos: `tools/tuner.html?model=raven` (ajuste ao vivo; grave com **Copiar alterados**). Aves e caveira: edite o `_visual.js` e rode `ruby mini_games/_library/sync.rb`.
