# Peça: Pedra

- **id:** `rock` (`registerProp` em `../rock.js`; valores padrão em `../rock_visual.js`)
- **Tipo:** estática
- **Papel:** pedras de tamanhos variados, com o topo iluminado e musgo
- **Feito a partir de:** a Floresta da Névoa (primeira fase do yara-rpg) vista de cima; extraída do cenário `dark_forest_2` em 2026-11-12, sem mudar nenhum pixel (comparação de 108 imagens antes e depois).

## Como é desenhada

um polígono de 9 pontos irregulares, sombra deslocada, uma cópia menor mais clara no alto-esquerda e duas manchas de musgo.

## O que a paleta controla

`rock`, `light` (o topo), `moss` e `radius`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Foram reduzidas a pedido do usuário (de 1,5 para 0,4 por 100 mil unidades no cenário).

## Ajuste

`tools/prop_tuner.html?prop=rock` mostra a peça de perto, ao vivo (as animadas, com todos os quadros do atlas), em vários fundos, e tem um
controle para cada valor. Grave com **Copiar alterados**, cole em `rock_visual.js` e rode `ruby mini_games/_library/sync.rb`.
