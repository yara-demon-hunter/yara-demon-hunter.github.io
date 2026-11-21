# Cenário: Travessia do Rio

- **id:** `river_crossing` (`registerScenery` em `../river_crossing.js`)
- **Clima:** noite fria à beira de um rio raso, com uma ponte de tábuas velhas no meio
- **Feito a partir de:** código (2026-11-21), sem foto de referência; base da Floresta da Névoa (`dark_forest_2`) para névoa, vinheta e esporos.
- **Resultado:** `images/river_crossing_resultado.png` (a gerar no tuner)

## Como foi criado
Base de `dark_forest_2` (névoa, vinheta, esporos). Chão de musgo, rio raso em faixa horizontal com margens onduladas, lama, correnteza em riscos e espuma. Ponte de tábuas no meio (onde fica a tocha). Receita: ondulações só na água, juncos nas duas margens, pedras só na água, nada nasce em cima da ponte (`avoidRect`). Peças novas: `ripple`, `reed`, `puddle`.

## O que foi rejeitado
- Nada ainda (cenário novo, ainda não visto no jogo).

## Desempenho
Chão pintado uma vez; animadas por atlas de poucos quadros; quantidades em listas por nível de detalhe. Medir com `tools/scenery_perf.py` antes de ligar no jogo (`WORLD.scenery`).
