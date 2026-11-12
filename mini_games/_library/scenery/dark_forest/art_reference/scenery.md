# Cenário: Floresta Sombria

- **id:** `dark_forest` (`registerScenery` em `../dark_forest.js`; números em `../dark_forest_visual.js`)
- **Clima:** noite fria numa clareira da floresta; uma fonte de luz quente no centro e névoa azulada fechando em volta
- **Feito a partir de:** código. Foi o cenário original do Last Torch, desenhado direto em Canvas, sem foto de referência
  (por isso esta pasta não tem imagens de origem); movido para a biblioteca em 2026-11-12 sem mudar nenhum pixel.
- **Resultado:** `images/dark_forest_resultado.png` (o jogo em execução: tocha no centro, névoa e vinheta nas bordas)

## Como foi criado

O chão é vista de cima, escuro e frio, para a luz quente da tocha ser a coisa mais viva da tela. A migração separou o
que é do cenário do que é do jogo: aqui ficaram o chão, a grama que balança e os dados; a tocha e a regra de que a luz
encolhe com a vida dela ficaram no Last Torch (`js/render/scenery.js`).

| Camada | Elemento | Como ficou | Custo |
|---|---|---|---|
| chão | Terra escura + clareira | cor base `groundColor` e degradê radial claro no centro (`clearingColor`) | pintado uma vez |
| chão | Luar | degradê azulado suave um pouco acima e à esquerda do centro | pintado uma vez |
| chão | Manchas de musgo | círculos com degradê em 3 tons verde-azulados, tamanho 30 a 110 | pintado uma vez |
| chão | Folhas caídas | elipses pequenas giradas, 2 cores | pintado uma vez |
| chão | Pedras | elipses cinza-azuladas translúcidas | pintado uma vez |
| chão | Tufos de grama | 2 a 4 riscos curtos em leque | pintado uma vez |
| chão | Mato alto | tufos de 3 lâminas curvas, 3 cores, agrupados num só traçado por cor | pintado uma vez |
| chão | Brilho da fonte de luz | degradê quente aditivo no centro (a cor vem do jogo: é da tocha) | pintado uma vez |
| `renderSway` | Mato que balança | só os primeiros tufos da lista (80 / 0 / 0 por nível de detalhe) se curvam com o vento, num traçado só | por quadro, barato |
| `renderAmbient` | Vaga-lumes | pontos verde-azulados que vagam e piscam (10 / 5 / 0) | por quadro, barato |
| `renderOverlay` | Névoa | 3 camadas de textura rolando em direções diferentes + 12 manchas soltas que derivam e "respiram" | tela pequena, a cada 55 a 125 ms |
| `renderOverlay` | Tom da noite + vinheta | uma camada azul escura e um degradê nas bordas, juntos | pré-desenhada |
| `renderOverlay` | Luzes | a luz principal e a do herói apagam círculos da sombra | por redesenho da névoa |

## Cores

Todas em `dark_forest_visual.js`: chão `#02070a`, clareira azul-petróleo, luar azul claro a 10%, musgo em verde-azulado
escuro, mato verde-água (`rgba(46, 110, 100, ...)`), névoa azul-acinzentada (`170, 195, 215`), vaga-lumes verde-água, vinheta
quase preta azulada. A luz quente (laranja, `255, 150, 60`) **não** é daqui: vem da tocha do jogo.

## Decisões

- **Desempenho primeiro:** o celular fraco do Last Torch manda no desenho. Por isso o chão e quase todo o mato ficam
  pintados uma vez, a névoa vive numa tela de 1/4 da resolução e só uns poucos tufos balançam a cada quadro.
- **Seed fixo (`1337`):** o chão não "pula" ao redimensionar a janela ou girar o celular.
- **A névoa mede o perigo:** `danger` (vida da fonte de luz) engrossa a névoa em até +130%; o amanhecer (`dawn`) a
  dissolve. O cenário não sabe o que é "tocha" nem "núcleo", só quanto a luz está ameaçada.
- **Sem registro de versões rejeitadas:** como veio direto do código, não há histórico de alternativas descartadas.
  Mudanças futuras devem anotar aqui o que foi testado e rejeitado.
- **Migração sem mudança visual:** a cópia dentro do Last Torch foi comparada com a versão anterior em 108 imagens
  (4 tamanhos de tela × 3 níveis de detalhe × 9 situações) e todas ficaram idênticas.

## Ajuste

`tools/scenery_tuner.html?scenery=dark_forest`: vê o cenário renderizado pelo motor, com tocha e herói de referência, e um controle
para cada número do `dark_forest_visual.js`. Grave com **Copiar alterados**, cole no arquivo e rode `ruby mini_games/_library/sync.rb`.
