# Buddy: Fênix

- **pasta:** `buddies/phoenix/`
- **Papel:** Last Torch: Phoenix Pact. Ave de fogo que voa no ombro do herói, atira bolas de fogo e, quando ele cai, morre para levantá-lo.
- **Funções:** `phoenix.js`: `preparePhoenix(mobile)`, `drawPhoenixSprite(g, x, y, size, facing, tilt, alpha)`, `phoenixBeak(x, y, facing)`, `renderPhoenixBuddy(g, bird, quality)` e `drawPhoenixArt(g, phase)`. Também exporta `feather` e `ramp`, que o corvo reaproveita.

## Como é desenhada

Muitas penas com degradê, asa em duas partes (braço e mão), pluma de cauda, cabeça com crista. A ave inteira é desenhada uma vez por quadro da batida de asa (16 quadros) num atlas; em campo é um `drawImage` por quadro. Brilho laranja, fagulhas caindo da cauda e uma brasa que cresce quando ela nasce.

## O que a paleta e as medidas controlam

`phoenix_visual.js`: tamanho (`scale`), quadros e velocidade, pixels do atlas (desktop e celular), cores das penas, corpo, bico, olho, cauda, brilho e fagulhas. Valores padrão; mudar aqui muda o buddy em todos os jogos (depois do sync).

## O que é do jogo e não mora aqui

O jogo (js/render/phoenix.js) guarda o estado do buddy (`state.phoenix`: posição, direção, inclinação, `flash` ao atirar, `rise` ao nascer) e chama `renderPhoenixBuddy`. O voo, o tiro e a ressurreição ficam em js/systems/skills_flame.js.

## Origem

Feita no Last Torch antes da biblioteca (o desenho e as cores vieram de `js/render/phoenix.js` e `data_model/visuals/effects/phoenix_visual.js`); movida para cá em 2026-11-13 sem mudar nenhum pixel.

## Imagens

`images/` guarda a referência (foto, ilustração, rabisco) e o resultado (captura do tuner ou do jogo). Ainda vazia: coloque aqui a arte de referência.

## Ajuste

Lobos: `tools/tuner.html?model=phoenix` (ajuste ao vivo; grave com **Copiar alterados**). Aves e caveira: edite o `_visual.js` e rode `ruby mini_games/_library/sync.rb`.
