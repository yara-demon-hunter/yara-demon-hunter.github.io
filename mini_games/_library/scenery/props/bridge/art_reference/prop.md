# Peça: Ponte de madeira

- **id:** `bridge` (`registerProp` em `../bridge.js`; valores padrão em `../bridge_visual.js`)
- **Tipo:** estática
- **Papel:** a ponte do cenário do rio; dá para pôr várias, em qualquer tamanho e direção
- **Feito a partir de:** a ponte que era desenhada no chão-base de `river_crossing` (2026-11-22), a pedido do usuário: "a ponte como objeto para poder colocar mais de uma".

## Como é desenhada

Vista de cima, de madeira velha: sombra, água escura por baixo e duas vigas; tábuas atravessadas, cada uma com comprimento, espessura, tom, leve giro, veios, pregos e pontas escurecidas; algumas **quebradas** (faltando, com a água e as vigas aparecendo; pela metade, com a ponta em dentes; ou rachadas, com um pedaço afundado e torto); musgo nas pontas, manchas de umidade; corrimão em trechos e mourões tortos ou faltando. A chance de quebra (`brokenChance`) e de mourão faltando (`postMissing`) se ajustam sem sortear de novo; **R** no editor sorteia outra ponte. O centro fica no ponto do objeto. O comprimento corre de cima para baixo da tela; gire 90° para atravessar de lado.

## O que a paleta controla

`plank` (3 tons de tábua), `rail`, `length` (comprimento) e `width` (largura do tabuleiro). Comprimento e largura aparecem em 📏 Medidas no editor de cenários, por objeto; as cores em 🎨 Cores.

## Custo

pintada uma vez; zero por quadro.

## Decisões

- Nada rejeitado ainda. A ponte NÃO bloqueia nem libera nada (é só desenho): o rio é raso e dá para andar nele. Para barrar a travessia fora da ponte, use áreas de contato.
- Substitui a ponte fixa do chão de `river_crossing` (`paintBase`): o desenho antigo só roda enquanto o cenário não tiver nenhum objeto `bridge`.

## Ajuste

`tools/prop_tuner.html?prop=bridge`; grave com **Copiar alterados**, cole em `bridge_visual.js` e rode `ruby mini_games/_library/sync.rb`.
