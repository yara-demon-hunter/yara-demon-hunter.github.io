# Cenário: Cemitério

- **id:** `graveyard` (`registerScenery` em `../graveyard.js`)
- **Clima:** noite fria num cemitério antigo: capim cinzento, lápides tortas, fogos-fátuos pálidos e névoa
- **Feito a partir de:** código (2026-11-21), sem foto; base da Floresta da Névoa para névoa, vinheta e esporos.
- **Resultado:** `images/graveyard_resultado.png` (a gerar no tuner)

## Como foi criado
Pedido do usuário: "pensei em uma tela do cemitério também". Chão de capim, trilha de cascalho serpenteando do portão de ferro (entre dois pilares, na borda de cima) até a borda de baixo, e lápides espalhadas fora da trilha (`avoidRect`). Peça nova: `tombstone`; reaproveita `fence` (paleta de ferro), `bones`, `wisp`, `mushroom` (paleta roxa), `stump`, `grass`.

## O que foi rejeitado
- Nada ainda (cenário novo, ainda não visto no jogo).

## Desempenho
Chão pintado uma vez; animadas por atlas de poucos quadros; lápides estáticas. Medir com `tools/scenery_perf.py` antes de ligar no jogo.
