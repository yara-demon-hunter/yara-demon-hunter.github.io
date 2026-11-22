# Peça: Correnteza

- **id:** `water_current` (`registerProp` em `../water_current.js`; valores em `../water_current_visual.js`)
- **Tipo:** animada (um atlas; 1 drawImage por peça)
- **Papel:** dá fluxo à água de um rio: filetes claros e finos que deslizam na direção da correnteza
- **Feito a partir de:** código (2026-11-22), a pedido do usuário: "um rio poderia ter algum efeito de correnteza".

## Como é desenhada

3 filetes curvos por peça, de comprimentos e espessuras diferentes, que andam pelo quadro na direção `dir` (1 = direita, -1 = esquerda) e nascem/somem por transparência. O ciclo emenda sozinho.

## Ritmo

`desync`: cada peça tem ponto de partida e duração de ciclo próprios (de 0,75x a 1,35x do ciclo da receita), calculados pela posição, sem gastar sorteio. Por isso nunca ficam sincronizadas.

## O que a paleta controla

`color`, `streaks`, `length`, `dir`. Na receita: `palette: { dir: -1 }` inverte o sentido.

## Custo

um atlas pequeno por entrada da receita (20 quadros no detalhe cheio, 12 e 8 nos menores); zero desenho novo por quadro além de 1 drawImage por peça.
