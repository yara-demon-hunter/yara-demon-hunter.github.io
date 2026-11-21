# Cenário: Entrada da Vila

- **id:** `village_gate` (`registerScenery` em `../village_gate.js`)
- **Clima:** fim de tarde na estrada de terra que leva à vila: braseiros acesos, cercas e telhados ao longe
- **Feito a partir de:** código (2026-11-21), sem foto de referência; base da Floresta da Névoa (`dark_forest_2`) para névoa, vinheta e esporos.
- **Resultado:** `images/village_gate_resultado.png` (a gerar no tuner)

## Como foi criado
Base de `dark_forest_2`, tom quente de fim de tarde (brasas cor de laranja em vez de esporos azuis). Estrada de terra horizontal com sulcos e sujeira nas beiras; telhados vistos de cima nas bordas de cima e de baixo (sob a vinheta). Receita: calçada de pedras só na estrada, cercas nas faixas laterais, braseiros ao lado da estrada, ossos e tábuas na estrada. Peças novas: `cobble`, `plank`, `fence`, `brazier`, `bones`.

## O que foi rejeitado
- Nada ainda (cenário novo, ainda não visto no jogo).

## Desempenho
Chão pintado uma vez; animadas por atlas de poucos quadros; quantidades em listas por nível de detalhe. Medir com `tools/scenery_perf.py` antes de ligar no jogo (`WORLD.scenery`).
