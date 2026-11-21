# Peça: Palheiro

- **id:** `haystack` (`registerProp` em `../haystack.js`; valores padrão em `../haystack_visual.js`)
- **Tipo:** estática
- **Papel:** palheiro: cor quente e silhueta redonda para a vila
- **Feito a partir de:** código (2026-11-21), para a vila do mapa (nada de arte de terceiros: mesmo estilo 2.5D das outras peças).

## Como é desenhada

sombra, cúpula de palha em duas camadas (escura atrás, clara na luz) e 9 riscos de palha.

## O que a paleta controla

`straw`, `strawDark` e `radius` (mín., máx.). A receita de um cenário pode trocar qualquer valor só para ele (`palette`).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo). Ficam nas margens, longe da ação: nunca cobrem monstros.

## Ajuste

`tools/prop_tuner.html?prop=haystack`; grave com **Copiar alterados**, cole em `haystack_visual.js` e rode `ruby mini_games/_library/sync.rb`.
