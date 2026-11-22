# Peça: Árvore morta

- **id:** `dead_tree` (`registerProp` em `../dead_tree.js`; valores padrão em `../dead_tree_visual.js`)
- **Tipo:** estática
- **Papel:** a floresta morta (`dark_forest_2` e outras): árvores secas, retorcidas, sem folhas
- **Feito a partir de:** código (2026-11-22), a pedido do usuário: "na dark forest eu preciso de árvores mortas".

## Como é desenhada

Vista de cima e de frente (2,5D), com o pé no ponto do objeto. Raízes que saem do chão, tronco retorcido que afina para cima (largo na base), com lado de luz e lado de sombra, veios da casca, rachaduras fundas e nós. 40% são ocas e 35% têm o topo partido (dentes e madeira clara). Musgo na base. De 5 a 9 galhos secos que se abrem com ramos finos; 28% dos galhos terminam quebrados (ponta de madeira clara). Cada árvore sai diferente (tamanho, curva, inclinação, galhos); `R` no editor sorteia outra.

## O que a paleta controla

`bark`, `barkDark`, `barkLight`, `wood`, `moss`, `height` (mín., máx. da altura sorteada) e `fixedHeight` (altura exata, em 📏 Medidas no editor: aumenta ou diminui a árvore inteira sem mudar o desenho).

## Custo

pintada uma vez; zero por quadro. Para esconder quem passa atrás dela, ligue "Esconde quem passa atrás" no objeto (vira sprite) e desenhe áreas azuis.

## Decisões

- Nada rejeitado ainda (peça nova, ainda não vista no jogo). Sem folhas e sem animação (vento), para ficar leve; um corvo ou balanço seria outra peça.
- Não bloqueia ninguém: para um tronco que barra, ponha uma área de contato (círculo) na base.

## Ajuste

`tools/prop_tuner.html?prop=dead_tree`; grave com **Copiar alterados**, cole em `dead_tree_visual.js` e rode `ruby mini_games/_library/sync.rb`.
