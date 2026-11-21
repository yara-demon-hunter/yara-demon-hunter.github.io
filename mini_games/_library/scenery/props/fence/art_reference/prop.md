# Peça: Cerca

- **id:** `fence` (`registerProp` em `../fence.js`; valores padrão em `../fence_visual.js`)
- **Tipo:** estática
- **Papel:** cerca de madeira da vila, em trechos (algumas com um mourão faltando)
- **Feito a partir de:** código (2026-11-21), para os cenários do novo mapa em 5 telas (travessia do rio, pântano, vila, castelo do Gudran).

## Como é desenhada

dois trilhos horizontais, mourões a cada ~22 unidades com a ponta clara, sombra embaixo; 30% têm um mourão quebrado.

## O que a paleta controla

`post`, `rail`, `top`, `length` (mín., máx.) e `spacing`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo).

## Ajuste

`tools/prop_tuner.html?prop=fence`; grave com **Copiar alterados**, cole em `fence_visual.js` e rode `ruby mini_games/_library/sync.rb`.
