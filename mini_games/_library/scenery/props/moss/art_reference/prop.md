# Peça: Musgo

- **id:** `moss` (`registerProp` em `../moss.js`; valores padrão em `../moss_visual.js`)
- **Tipo:** estática
- **Papel:** manchas macias de musgo no chão; dão cor e variação ao terreno sem desenhar nada de definido
- **Feito a partir de:** a Floresta da Névoa (primeira fase do yara-rpg) vista de cima; extraída do cenário `dark_forest_2` em 2026-11-12, sem mudar nenhum pixel (comparação de 108 imagens antes e depois).

## Como é desenhada

um círculo com degradê radial que some nas bordas; a cor é sorteada de uma lista e o raio, de uma faixa.

## O que a paleta controla

`colors` (lista de cores; uma por mancha) e `radius` (raio mínimo e máximo). Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez no chão; custo por quadro zero.

## Decisões

- Nasceu na Floresta Sombria (`dark_forest`) e foi reescrita aqui para a Floresta da Névoa; o desenho do `dark_forest` continua o dele.

## Ajuste

`tools/prop_tuner.html?prop=moss` mostra a peça de perto, ao vivo (as animadas, com todos os quadros do atlas), em vários fundos, e tem um
controle para cada valor. Grave com **Copiar alterados**, cole em `moss_visual.js` e rode `ruby mini_games/_library/sync.rb`.
