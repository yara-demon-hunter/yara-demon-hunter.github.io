# Peça: Folha caída

- **id:** `leaves` (`registerProp` em `../leaves.js`; valores padrão em `../leaves_visual.js`)
- **Tipo:** estática
- **Papel:** folhas pequenas espalhadas; as marrons e laranja queimado dão calor ao chão azulado (como na arte da região do RPG)
- **Feito a partir de:** a Floresta da Névoa (primeira fase do yara-rpg) vista de cima; extraída do cenário `dark_forest_2` em 2026-11-12, sem mudar nenhum pixel (comparação de 108 imagens antes e depois).

## Como é desenhada

uma elipse pequena girada, com cor sorteada da lista.

## O que a paleta controla

`colors` (lista) e as faixas `length` e `width`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Na 1ª versão eram tantas que pareciam poeira laranja; hoje o cenário usa 22 por 100 mil unidades.

## Ajuste

`tools/prop_tuner.html?prop=leaves` mostra a peça de perto, ao vivo (as animadas, com todos os quadros do atlas), em vários fundos, e tem um
controle para cada valor. Grave com **Copiar alterados**, cole em `leaves_visual.js` e rode `ruby mini_games/_library/sync.rb`.
