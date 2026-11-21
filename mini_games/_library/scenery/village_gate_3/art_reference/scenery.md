# Cenário: Entrada da Vila sob a Chuva

- **id:** `village_gate_3` (`registerScenery` em `../village_gate_3.js`)
- **Clima:** noite chuvosa e fria: estrada de lama com poças, telhados azulados, poucos braseiros
- **Base:** `village_gate` (mesmo `paintBase`); Lama escura, poças na estrada, tom azul, poucos braseiros.
- **Feito a partir de:** código (2026-11-21), variante para comparar no Ateliê e escolher qual entra no jogo.
- **Resultado:** `images/village_gate_3_resultado.png` (a gerar no tuner)

## Como foi criado
Variante chuvosa: lama mais escura, poças na estrada, menos calçada e braseiros, telhados e luz azulados, névoa cinza-azul.

## O que foi rejeitado
- Nada ainda (variante nova, ainda não vista no jogo).

## Desempenho
Mesma ordem de custo de `village_gate`; conferir com `tools/scenery_perf.py` antes de ligar no jogo.

## Vila (2026-11-21)
Recebeu a vila de camponeses: chalés animados (fumaça e janela acesa) nas margens de cima e de baixo, poço, palheiros, carroça e barris. Peças novas: `cottage`, `well`, `haystack`, `cart`, `barrel`. Os chalés usam um atlas só (3 variantes, 6/4/3 quadros por nível de detalhe); medir memória com `tools/scenery_perf.py` antes de ligar no jogo.
