# Cenário: Pátio do Castelo em Ruínas

- **id:** `castle_gate_2` (`registerScenery` em `../castle_gate_2.js`)
- **Clima:** o castelo depois do cerco: lajes quebradas, musgo, pedras caídas e ossos por todo lado
- **Base:** `castle_gate` (mesmo `paintBase`); Mais lajes quebradas, pedras e ossos, musgo, tapete esmaecido, menos braseiros.
- **Feito a partir de:** código (2026-11-21), variante para comparar no Ateliê e escolher qual entra no jogo.
- **Resultado:** `images/castle_gate_2_resultado.png` (a gerar no tuner)

## Como foi criado
Variante em ruínas: o dobro de lajes quebradas, mais ossos, pedras e musgo, tapete escuro e desbotado, metade dos braseiros.

## O que foi rejeitado
- Nada ainda (variante nova, ainda não vista no jogo).

## Desempenho
Mesma ordem de custo de `castle_gate`; conferir com `tools/scenery_perf.py` antes de ligar no jogo.
