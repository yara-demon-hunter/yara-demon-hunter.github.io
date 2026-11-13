# Peça: Capim

- **id:** `grass` (`registerProp` em `../grass.js`; valores padrão em `../grass_visual.js`)
- **Tipo:** animada (atlas)
- **Papel:** tufos de capim que se curvam com a rajada de vento
- **Feito a partir de:** a Floresta da Névoa (primeira fase do yara-rpg) vista de cima; extraída do cenário `dark_forest_2` em 2026-11-12, sem mudar nenhum pixel (comparação de 108 imagens antes e depois).

## Como é desenhada

7 a 10 lâminas que afinam, curvando-se conforme a fase do ciclo; 1 drawImage por tufo.

## O que a paleta controla

`blade` (cor das lâminas) e `bend` (curvatura na rajada). Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

1 drawImage por peça por quadro; é a peça mais numerosa e discreta, então é a primeira a cortar: some no detalhe 2.

## Decisões

- Mesma observação das cores efetivas da samambaia (chaves duplicadas no arquivo antigo).

## Ajuste

`tools/prop_tuner.html?prop=grass` mostra a peça de perto, ao vivo (as animadas, com todos os quadros do atlas), em vários fundos, e tem um
controle para cada valor. Grave com **Copiar alterados**, cole em `grass_visual.js` e rode `ruby mini_games/_library/sync.rb`.
