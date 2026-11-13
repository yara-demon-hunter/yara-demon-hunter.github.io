# Cenário: Floresta da Névoa

- **id:** `dark_forest_2` (`registerScenery` em `../dark_forest_2.js`; números em `../dark_forest_2_visual.js`)
- **Clima:** floresta azul-esverdeada coberta de névoa, fria e silenciosa; cogumelos e esporos azulados brilham no escuro
- **Feito a partir de:** a primeira fase do yara-rpg (região `dark-forest`, "Floresta da Névoa"), que é vista de lado, num
  diorama inclinado. Refeita para a câmera de cima do Last Torch.
  - `images/yara_rpg_palco_origem.png`: o palco do yara-rpg com a cena montada (árvores retorcidas, samambaias, tocos,
    cogumelos que brilham, esporos, névoa em camadas).
  - `images/yara_rpg_arte_da_regiao.webp`: a arte da região (pixel art: galhos retorcidos, névoa azul, o portal de luz ao fundo).
  - Paleta e fileiras de origem: `mini_games/yara-rpg/js/data/visuals/stage.js` → `scenes['dark-forest']`.
- **Resultado:** `images/dark_forest_2_resultado.png` (o Last Torch em execução com este cenário)

## Feito de peças

Desde 2026-11-12 este cenário é uma **base + receita de peças**: [dark_forest_2.js](../dark_forest_2.js) só desenha o chão (terra mais clara
no centro e o lago de luz do portal) e a lista `props` do [arquivo de dados](../dark_forest_2_visual.js) escolhe as peças da biblioteca
(`scenery/props/`: musgo, folha caída, pedrinha, raiz, toco, pedra, samambaia, capim e cogumelo que brilha), com quantidade, tamanho,
quadros do atlas e, se quiser, uma paleta própria. Cada peça tem a sua ficha (`props/<id>/art_reference/prop.md`) e pode ser usada por
outros cenários. A migração foi provada com **108 imagens idênticas antes e depois**.

## Como foi criado

Pedido do usuário: recriar o cenário da primeira fase do yara-rpg em 2D, com o mesmo estilo e movimento nas coisas **sem gastar
memória**, como nos monstros. As cores vêm direto do RPG (tronco `#08161b`, luz fria `#1f4651`, musgo `#2f5a4a`, samambaia, capim,
cogumelo `#8ef0ff`, esporos `rgba(170, 240, 255, 0.9)`). O que no RPG é fileira de adereços em profundidade (árvores, pinheiros,
copa), de cima vira chão: samambaias, tocos, pedras e raízes. As árvores altas não entram: de cima só dá para ver a copa, e uma
copa por cima da ação esconderia o que o jogador enfrenta.

| Camada | Elemento | Como ficou | Custo |
|---|---|---|---|
| chão | Terra azul-esverdeada, mais clara no centro | degradê radial `ground[0] → [2]` | pintado uma vez |
| chão | Luz fria do "portal" | lago de luz pálida fora do centro (`portal`) | pintado uma vez |
| chão | Musgo | círculos de degradê em 3 tons verde-azulados | pintado uma vez |
| chão | Folhas caídas | elipses marrons, laranja queimado e verde-azuladas (como na arte da região) | pintado uma vez |
| chão | Pedrinhas, pedras (topo iluminado + musgo), tocos (corte com anéis e raízes curtas), raízes | formas simples com sombra | pintado uma vez |
| `renderSway` | **Samambaias**: folhas que saem do centro e arqueiam, cada uma balançando em fase própria | atlas de 10/6/4 quadros × 3 variações | 1 `drawImage` cada |
| `renderSway` | **Capim**: lâminas que se curvam com a rajada | atlas de 8/6/4 quadros × 3 variações (some no detalhe 2) | 1 `drawImage` cada |
| `renderSway` | **Cogumelos** com o brilho azulado pulsando | atlas de 8/6/4 quadros × 2 variações, ciclo próprio de 2,6 s | 1 `drawImage` cada |
| `renderAmbient` | Esporos de luz azul-gelo que vagam e piscam (8 / 4 / 0) | kit (`fireflies`) | por quadro, barato |
| `renderOverlay` | Névoa azul-esverdeada em 3 camadas + manchas, tom frio e vinheta | kit | tela pequena, a cada 55 a 125 ms |

(Os números `a/b/c` são os níveis de detalhe 0, 1 e 2.)

## O movimento sem gastar memória

É a mesma técnica dos monstros do Last Torch (`monster_sprites.js`): **o desenho animado roda uma vez por quadro de animação, na
hora de montar o cenário, e cada quadro vai para um atlas pequeno**. Em cena, cada samambaia, tufo ou cogumelo é um recorte do
atlas (`buildSpriteSheet` + `drawSheetFrame` + `frameAt`, no `scenery_kit.js`). Nada de curva traçada por quadro.

- **Ciclo sem emenda:** o último quadro volta ao primeiro. Medido: depois de um ciclo inteiro, 0 pixels de diferença.
- **Vento passando:** a fase de cada peça depende da posição (`windWaveLength`), então as vizinhas balançam em sequência, como
  uma rajada atravessando a tela.
- **A forma não pula:** o sorteio que decide a forma de cada peça recomeça igual em todo quadro; só o balanço muda.
- **Atlas pelo que aparece:** o capim não gera atlas nenhum no detalhe 2, e menos quadros por nível de detalhe encolhem os outros.

## Custo medido

Medido no jogo real (Chrome, 400 renderizações; `msPerRender` é só o custo do cenário mais o resto do desenho do quadro):

| | `dark_forest` (atual) | `dark_forest_2` |
|---|---|---|
| Computador, ms por quadro | 0,27 | 0,26 |
| Celular deitado, ms por quadro | 0,16 | 0,17 |
| Canvas a mais (computador / celular) | | +0,8 MB / +0,3 MB |

Os dois ficam iguais dentro da margem de medição (varia ±0,08 ms entre execuções), com cerca de 30 vezes mais pixels em movimento
(78 mil contra 2,4 mil em um quarto de ciclo). O orçamento do quadro a 60 FPS é 16,7 ms.

## Cores

Todas em `dark_forest_2_visual.js`. As da Floresta da Névoa do RPG: chão `#214248 → #16313a → #0b1c22`, tronco `#08161b`, luz fria
`#1f4651`, musgo `#2f5a4a`, pedra `#22363b` / `#3b5a60`, samambaia `#1d4a40` / `#3b7461` (um pouco mais claras que no RPG, para
aparecerem de cima), cogumelo `#8ef0ff`, névoa `127, 178, 186`. A luz quente do centro **não** é daqui: vem da tocha do jogo.

## Decisões

- **Sem galhos nos cantos (rejeitado):** a 1ª versão tinha galhos retorcidos escuros nos quatro cantos, por cima de tudo,
  como moldura. Foi retirada a pedido do usuário: podem atrapalhar o jogador, cobrindo monstros que entram pela borda.
  Regra daqui para a frente: **nada fica por cima da ação**. O motor também perdeu o gancho de "camada por cima" que existia só para isso.
- **Sem trilha de terra (retirada a pedido):** a 1ª versão tinha uma trilha serpenteando de um lado ao outro, como a do RPG.
  Não é necessária agora; sem ela, folhas, pedras, tocos e plantas se espalham por todo o chão, sempre longe da tocha.
- **Tocos arredondados:** na 1ª versão as raízes pontudas pareciam espinhos de armadilha. Ficaram 3 raízes curtas e grossas.
- **Cogumelos legíveis:** o brilho engolia a forma e eles pareciam luas. A tampa ganhou borda, lâminas e pintas, e o brilho ficou
  mais discreto e pulsa.
- **Tamanho dentro do desenho:** o atlas nasce já no tamanho final (a célula e o desenho crescem juntos), em vez de esticar um atlas
  pequeno, que ficaria borrado.
- **"Mato" demais (cortado a pedido):** o chão estava cheio e brigava com os monstros. Quantidades por 100 mil unidades: samambaias
  1,6 → 0,8; capim 4,5 → 1,4; cogumelos 0,8 → 0,5; folhas 46 → 22; pedrinhas 22 → 6; pedras 1,5 → 0,4; esporos 12 → 8 (detalhe 0).
  As células dos atlas foram apertadas ao tamanho real das peças.
- **Chão mais escuro:** a pedido, ficou mais perto da Floresta Sombria (`ground` `#12292f → #0b1c22 → #050e12`, tom da noite 36%).
- **Chaves duplicadas (achado na migração para peças):** o arquivo de dados antigo tinha `fern` e `grass` duas vezes (uma como cor, outra
  como configuração), então as cores `#183f37` e `#33645a` nunca foram aplicadas: samambaia e capim saíam sempre em `#2f5f50`, com o miolo
  da samambaia preto. As peças guardam essas cores efetivas, para o visual aprovado não mudar.

## Como usar no Last Torch

Em `data_model/world.js`, troque `scenery: 'dark_forest'` por `scenery: 'dark_forest_2'`. O resto (tocha, luz do herói,
névoa que engrossa com o perigo) funciona igual.

## Ajuste

`tools/scenery_tuner.html?scenery=dark_forest_2`: um controle para cada número do `dark_forest_2_visual.js` (inclusive quantidades,
quadros e tamanhos dos atlas). Grave com **Copiar alterados** e rode `ruby mini_games/_library/sync.rb`.
