# Cenário: Portões do Castelo de Gudran

- **id:** `castle_gate` (`registerScenery` em `../castle_gate.js`)
- **Clima:** pátio de pedra frio diante do portão de Gudran, com braseiros acesos e um tapete vermelho rasgado
- **Feito a partir de:** código (2026-11-21), sem foto de referência; base da Floresta da Névoa (`dark_forest_2`) para névoa, vinheta e esporos.
- **Resultado:** `images/castle_gate_resultado.png` (a gerar no tuner)

## Como foi criado
Base de `dark_forest_2`, tom frio azul-violeta com brasas laranja. Chão de lajes de 4 tons em fileiras alternadas com argamassa escura, escurecido para as bordas; tapete vermelho (borda dourada, desgaste) do portão até a borda de baixo; portão em arco com grade na borda de cima, fora da ação. Receita: lajes quebradas, ossos, pedras cinza, braseiros fora do tapete (`avoidRect`). Peças novas: `flagstone`, `bones`, `brazier`.

## O que foi rejeitado
- Nada ainda (cenário novo, ainda não visto no jogo).

## Desempenho
Chão pintado uma vez; animadas por atlas de poucos quadros; quantidades em listas por nível de detalhe. Medir com `tools/scenery_perf.py` antes de ligar no jogo (`WORLD.scenery`).
