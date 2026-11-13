# Peça: Raiz

- **id:** `root` (`registerProp` em `../root.js`; valores padrão em `../root_visual.js`)
- **Tipo:** estática
- **Papel:** raízes que atravessam o chão e dão a sensação de floresta antiga
- **Feito a partir de:** a Floresta da Névoa (primeira fase do yara-rpg) vista de cima; extraída do cenário `dark_forest_2` em 2026-11-12, sem mudar nenhum pixel (comparação de 108 imagens antes e depois).

## Como é desenhada

um traço grosso que afina, mais um fio de luz por cima, deslocado, para dar volume.

## O que a paleta controla

`color`, `light` (o fio de luz), `length` e `width`. Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Eram finas e pretas e pareciam riscos ou rachaduras; ficaram mais curtas e grossas, com o fio de luz.

## Ajuste

`tools/prop_tuner.html?prop=root` mostra a peça de perto, ao vivo (as animadas, com todos os quadros do atlas), em vários fundos, e tem um
controle para cada valor. Grave com **Copiar alterados**, cole em `root_visual.js` e rode `ruby mini_games/_library/sync.rb`.
