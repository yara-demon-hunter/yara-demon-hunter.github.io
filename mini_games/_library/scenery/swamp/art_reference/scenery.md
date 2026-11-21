# Cenário: Pântano

- **id:** `swamp` (`registerScenery` em `../swamp.js`)
- **Clima:** noite abafada num brejo: água parada, névoa esverdeada e fogos-fátuos
- **Feito a partir de:** código (2026-11-21), sem foto de referência; base da Floresta da Névoa (`dark_forest_2`) para névoa, vinheta e esporos.
- **Resultado:** `images/swamp_resultado.png` (a gerar no tuner)

## Como foi criado
Base de `dark_forest_2`. Lama escura com 9 a 13 poças de água parada (borda de lama, lentilha-d'água), nunca perto do centro. Receita: juncos, fogos-fátuos, cogumelos amarelo-esverdeados (paleta trocada), ossos, raízes e tocos. Névoa verde-oliva mais densa. Peças novas: `wisp`, `reed`, `bones`, `puddle`.

## O que foi rejeitado
- Nada ainda (cenário novo, ainda não visto no jogo).

## Desempenho
Chão pintado uma vez; animadas por atlas de poucos quadros; quantidades em listas por nível de detalhe. Medir com `tools/scenery_perf.py` antes de ligar no jogo (`WORLD.scenery`).
