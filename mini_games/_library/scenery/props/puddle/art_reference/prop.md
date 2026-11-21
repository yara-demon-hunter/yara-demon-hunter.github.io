# Peça: Poça

- **id:** `puddle` (`registerProp` em `../puddle.js`; valores padrão em `../puddle_visual.js`)
- **Tipo:** estática
- **Papel:** poças de água parada que refletem um pouco de luz
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

uma elipse de água com aro escuro e um reflexo claro no alto-esquerda; achatada (45 a 65% da largura).

## O que a paleta controla

`water`, `rim`, `shine` e `radius` (mín., máx.). Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=puddle`; grave com **Copiar alterados**, cole em `puddle_visual.js` e rode `ruby mini_games/_library/sync.rb`.
