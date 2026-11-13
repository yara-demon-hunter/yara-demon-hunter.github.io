# Peça: Samambaia

- **id:** `fern` (`registerProp` em `../fern.js`; valores padrão em `../fern_visual.js`)
- **Tipo:** animada (atlas)
- **Papel:** planta de folhagem que balança com o vento; é o que mais dá vida ao chão
- **Feito a partir de:** a Floresta da Névoa (primeira fase do yara-rpg) vista de cima; extraída do cenário `dark_forest_2` em 2026-11-12, sem mudar nenhum pixel (comparação de 108 imagens antes e depois).

## Como é desenhada

visto de cima: 9 a 12 folhas saem do centro e arqueiam, cada uma com folíolos e balançando em fase própria. Um atlas de poucos quadros (o ciclo emenda do último para o primeiro); em cena é 1 drawImage por samambaia.

## O que a paleta controla

`frond` (folhas e folíolos), `heart` (o miolo) e `sway` (quanto balança, em radianos). Estes são os valores padrão; a receita de um cenário pode trocar qualquer um só para ele (`palette` na entrada da receita).

## Custo

1 drawImage por peça por quadro; o atlas ocupa algumas centenas de KB (menos quadros nos detalhes baixos).

## Decisões

- As cores efetivas (`frond #2f5f50`, miolo preto) são as que o cenário sempre mostrou: o arquivo antigo do `dark_forest_2` tinha chaves duplicadas e as cores `#183f37` e `#33645a` nunca foram aplicadas. A migração preservou o visual aprovado.
- Aparece em menor número que na 1ª versão (muito "mato" no jogo).

## Ajuste

`tools/prop_tuner.html?prop=fern` mostra a peça de perto, ao vivo (as animadas, com todos os quadros do atlas), em vários fundos, e tem um
controle para cada valor. Grave com **Copiar alterados**, cole em `fern_visual.js` e rode `ruby mini_games/_library/sync.rb`.
