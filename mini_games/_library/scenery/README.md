# Cenários

O chão onde o jogo acontece: terreno, vegetação, névoa, luz, clima. Segue o mesmo padrão dos personagens e monstros:
a arte mora aqui, cada cenário tem uma **ficha** (`art_reference/scenery.md`), e os jogos carregam a própria cópia pelo
`sync.rb` (nunca esta pasta). Hoje existem dois: `dark_forest` (Floresta Sombria, o atual do Last Torch) e `dark_forest_2` (Floresta da Névoa, a primeira
fase do yara-rpg recriada de cima, com samambaias, capim e cogumelos animados por atlas).

## A ideia em uma frase

**Um cenário é um chão pintado uma vez + poucas coisas que se mexem + uma camada de sombra com buracos de luz.** Quase
tudo é igual de um cenário para outro; o que muda é o chão e o clima. Por isso o motor e o kit são compartilhados, e um
cenário novo só escreve o que o torna único.

## As quatro camadas (de baixo para cima)

| # | Camada | O que é | Quem faz |
|---|---|---|---|
| 1 | `renderGround` | chão pré-pintado num canvas fora da tela; em cena é uma cópia 1:1 | o cenário pinta (`paintGround`), o motor guarda e copia |
| 2 | `renderSway` | o que se mexe: grama, samambaias, cogumelos que pulsam. **Animado por atlas** (veja abaixo) | o cenário (`buildSway` + `drawSway`), opcional |
| | | *o jogo desenha monstros, herói e efeitos aqui* | |
| 3 | `renderAmbient` | pontos de luz que vagam e piscam: vaga-lumes, brasas, poeira | o kit, ligado por dados (`fireflies`) |
| 4 | `renderOverlay` | névoa rolando + tom da noite + vinheta, numa tela pequena; as luzes abrem buracos nela | o kit, ligado por dados |

Clima sem névoa (deserto, dia claro)? Zere `fogLayers`/`fogBlobs` e as alfas no visual. Sem vaga-lumes? `fireflies: [0, 0, 0]`.

## Movimento sem gastar memória: atlas de animação

Para dar vida ao cenário sem pesar, **não trace curvas a cada quadro**: use a técnica dos monstros do Last Torch. O desenho
animado roda **uma vez por quadro de animação**, ao montar o cenário, e cada quadro vai para um atlas pequeno. Em cena,
cada peça é só um `drawImage` de um recorte do atlas. O kit já traz as três peças (`scenery_kit.js`):

```js
const sheet = buildSpriteSheet({ cell: [48, 48], anchor: [0.5, 0.5], frames: 10, variants: 3, res: env.res, seed,
    paint(g, r, phase) { /* desenha UM quadro; phase de 0 a 1; r recomeça igual em todo quadro */ } });
// em cena, por peça:
drawSheetFrame(ctx, sheet, peca.variant, frameAt(sheet, t, cicloEmSegundos, peca.offset), peca.x, peca.y, peca.scale);
```

Regras: o último quadro emenda com o primeiro (balanço com `Math.sin(phase * Math.PI * 2)`); a forma vem de `r` (não pula entre
quadros); `offset` defasa as vizinhas pela posição, para parecer vento passando; o tamanho final entra na célula e no desenho
(não estique um atlas pequeno); menos quadros nos níveis de detalhe baixos; **sem atlas para o que não aparece** (quantidade
zero no nível). Exemplo completo: `dark_forest_2/dark_forest_2.js` (samambaia, capim, cogumelo).

## Nada fica por cima da ação

O jogador precisa sempre ver o que enfrenta. Nenhuma camada de cenário desenha por cima dos monstros além da névoa suave,
da vinheta e dos pontos de luz. Galhos, copas e troncos em primeiro plano foram testados e **rejeitados** (cobriam monstros que
entram pela borda). Quem quiser a moldura da câmera lateral (como no yara-rpg) precisa de outro jeito que não cubra a luta.

## Peças: o que compõe um cenário (`props/`)

Um cenário não precisa desenhar cada pedra e cada cogumelo: ele escolhe **peças** da biblioteca (`scenery/props/<id>/`), no mesmo
molde dos monstros: desenho, valores padrão e ficha. Hoje: musgo, folha caída, pedrinha, raiz, toco, pedra, arbusto (**estáticas**, carimbadas
no chão uma vez) e samambaia, capim, cogumelo que brilha (**animadas**, atlas de poucos quadros). O catálogo está no Ateliê
(`tools/prop_tuner.html`), com cada peça de perto, ao vivo e com todos os quadros.

```
props/
  props.js          o registro (registerProp, getProp, propIds) e o contrato de uma peça
  index.js          uma linha por peça
  <id>/  <id>.js  <id>_visual.js  art_reference/prop.md
```

**A peça não tem cor no código:** recebe a *paleta* (os valores padrão do `<id>_visual.js`) e a receita do cenário pode trocar o que quiser só
para ele. O mesmo cogumelo brilha azul na floresta e vermelho numa caverna com `palette: { glow: '255, 80, 60' }`.

**A receita** é a lista `props` no `<id>_visual.js` do cenário; `composeScenery` (`scenery/compose.js`) lê a lista, pinta as estáticas no chão
(depois da base), monta um atlas por peça animada e posiciona tudo:

```js
// dark_forest_2_visual.js
props: [
    { prop: 'moss', per100kPx: 12 },                                              // estática: quantidade por 100 mil unidades quadradas
    { prop: 'rock', per100kPx: 0.4, avoidCenter: 90, maxTries: 60 },              // sem nascer perto da tocha
    { prop: 'mushroom', per100kPx: [0.5, 0.3, 0.15], frames: [8, 6, 4], variants: 2, size: 1.9,
      cycleSeconds: 2.6, avoidCenter: 70, palette: { glow: '255, 80, 60' } }      // animada: listas por nível de detalhe
]
```

O arquivo do cenário (`<id>.js`) fica só com a **base** (chão, luz, clima): `registerScenery(composeScenery({ id, name, visual, paintBase }))`.
Cada campo da receita está explicado no topo de `compose.js`. Regras: a ordem da receita é a ordem em que as estáticas são pintadas e o
sorteio é consumido (mudar a ordem muda o cenário); peça animada só gera atlas se aparecer no nível de detalhe; nenhuma peça cobre a ação.

### Criar uma peça nova

1. Pasta `props/<id>/` com `<id>_visual.js` (todos os valores padrão), `<id>.js` com `registerProp({...})` (copie uma parecida: `rock` para
   estática, `fern` para animada) e `art_reference/prop.md` (ficha curta: papel, como é desenhada, o que a paleta controla, custo, decisões).
2. Uma linha em `props/index.js` e `ruby mini_games/_library/sync.rb`.
3. Veja e ajuste em `tools/prop_tuner.html`; use na receita de um cenário.

Peças estáticas: `roll(r, p)` sorteia os atributos (a ordem das chamadas a `r()` não pode mudar depois de aprovada) e `draw(g, x, y, atributos, p)` desenha.
Peças animadas: `cell`, `anchor`, `variants` e `paint(g, r, phase, p)` (veja "Movimento sem gastar memória").

## Quem é dono de quê

```
scenery/
  scenery.js         o MOTOR: registro (registerScenery), cache, ordem das camadas, névoa, luzes. Igual para todos.
  compose.js         composeScenery: monta um cenário a partir da base + a receita de peças (props)
  props/             o catálogo de PEÇAS que compõem os cenários (veja a seção acima)
  scenery_kit.js     o KIT: peças prontas (vento, névoa, vinheta, vaga-lumes, brilho da fonte, cutLight). Escolha o que usar.
                     (o atlas de animação e o taper moram em core/sprite_sheet.js; o kit os reexporta)
  index.js           importa todos os cenários (uma linha por cenário) e exporta createScenery
  <id>/
    <id>.js          a definição: paintGround (+ buildSway/drawSway) e o registerScenery no fim
    <id>_visual.js   TODOS os números: cores, densidades, vento, névoa, vaga-lumes, vinheta
    art_reference/
      scenery.md     a ficha (como foi criado)
      images/        a referência (foto, ilustração, rabisco) e o resultado
```

**O que é do jogo e nunca entra aqui:** a fonte de luz e sua regra (no Last Torch, a tocha: o raio encolhe com a vida
do núcleo), a câmera e o tamanho do mundo. O jogo traduz isso para o cenário a cada quadro (veja "O que o jogo passa").

## O contrato com o jogo

O jogo cria o cenário com `createScenery(id)` e a cada quadro preenche **um objeto `env` reaproveitado** (nunca crie um
novo por quadro) e chama as camadas.

| Campo do `env` | Significado |
|---|---|
| `width`, `height` | tamanho do mundo em unidades do jogo |
| `res` | pixels do canvas por unidade do mundo (escala da tela × pixelRatio): o chão é pintado nessa resolução |
| `quality` | detalhe, 0 (cheio) a 2 (mínimo): escolhe o item das listas `[a, b, c]` do visual |
| `danger` | 0 a 1: o quanto a fonte de luz está ameaçada (a névoa engrossa) |
| `dawn` | 0 a 1: amanhecer (névoa e vinheta somem) |
| `scaled` | `true` = chão esticado (durante um zoom); `false` = cópia 1:1 |
| `source` | brilho da fonte no chão: `{ glowColor: '255, 150, 60', glowAlpha, radiusRatio }`, ou `null` |
| `lights(t)` | função chamada a cada redesenho da névoa: devolve as luzes `[{ x, y, radius, solid, strength, shape }]` |

A câmera (deslocamento e zoom) é lida do próprio `ctx`: o cenário **não importa nada do jogo**. Quem desenha é o
`ctx` de `core/canvas.js` (o jogo liga com `setCtx`, como faz para monstros e heróis).

No Last Torch a ponte é `js/render/scenery.js`, e o cenário em uso é `WORLD.scenery` em `data_model/world.js`.
**Trocar de cenário no jogo é trocar esse id.**

## Dados que o motor e o kit esperam em `<id>_visual.js`

O motor lê estas chaves de **todo** cenário (copie o `dark_forest_visual.js` e mude os valores):

- `seed`: o mesmo seed dá o mesmo cenário (nada "pula" ao redimensionar).
- Tom e vinheta: `nightTint`, `vignetteColor`, `vignetteInnerRatio`, `vignetteResolution`.
- Névoa: `fogColor`, `fogDensityBoostAtZeroHp`, `fogFrameMs [3]`, `fogResolution`, `fogTileSize`, `fogTilePixels`,
  `fogTilePuffs`, `fogLayers [{ speedX, speedY, scale, alpha }]`, `fogBlobs`, `fogMinRadius`, `fogMaxRadius`,
  `fogAlphaCenter`, `fogAlphaEdge`, `fogDriftSpeed`, `fogWobble`.
- Pontos de luz: `fireflies [3]`, `fireflySpeed`, `fireflyGlow`, `fireflyGlowRadius`.
- Vento (se usar `windAt`): `windSpeed`, `windWaveLength`, `windBase`.

Tudo o mais é do cenário (no `dark_forest`: `groundColor`, `mossColors`, `stonesPer100kPx`, `grassColors`...).

## Orçamento de desempenho (vale para todo cenário novo)

O jogo roda em celular fraco. Um cenário só entra se obedecer:

1. **O chão é pintado uma vez** e copiado 1:1. Pode ser caro de pintar; o que importa é o custo por quadro, que é uma cópia.
2. **`renderSway` é para poucas coisas** (dezenas, não milhares), e a quantidade vem de uma lista por nível de detalhe.
   O resto do mato/folhagem fica pintado no chão. **O movimento sai de atlas** (seção acima): nunca desenhe curvas a cada quadro.
3. **A névoa é desenhada numa tela pequena**, poucas vezes por segundo (`fogFrameMs`), e esticada nos outros quadros.
4. **Nada de gradiente novo, `shadowBlur`, `fillText` ou `ctx.save/restore` por objeto a cada quadro.** Gradientes e
   sprites são feitos no `prepare`, não no quadro.
5. **Três níveis de detalhe** (`quality` 0, 1, 2): quantidades em listas `[a, b, c]`; o jogo desce sozinho se o aparelho
   não sustentar ~42 FPS.
6. **Meça antes de entregar:** o custo por quadro e a memória do cenário novo, comparados com os do atual (`tools/scenery_perf.py`,
   modo de uso no topo do arquivo). Um cenário não pode deixar o jogo mais lento: se pesar, corte quantidade (as listas por nível de
   detalhe), quadros do atlas ou o tamanho das células, antes de cortar a arte.
7. **A ordem dos sorteios não pode mudar** depois de aprovada (`rand()` do `createRandom(seed)`): mudar a ordem muda o cenário.

## Workflow: criar um cenário novo (a partir de uma foto ou ideia)

1. **Referência.** Salve a foto (ou ilustração, rabisco) em `<id>/art_reference/images/`. O ideal para jogos vistos de
   cima é o chão visível, com uma fonte de luz marcante. Jogo de terceiros serve só de inspiração de clima e paleta:
   o conteúdo publicado precisa ser original.
2. **Leitura da referência.** Anote na ficha: clima, paleta (cores reais), elementos do chão, de onde vem a luz, o que
   se mexeria (vento, neve, brasas, névoa).
3. **Procure no catálogo** (`tools/prop_tuner.html`) quais elementos da foto já existem como peça. Crie só as que faltam (veja "Criar uma
   peça nova"). Se o cenário for feito de peças, o passo 4 é montar a receita; se for um desenho próprio, siga abaixo.
   Para um elemento sem peça: pintado no chão (barato, parado) ou em `renderSway` (animado,
   poucos)? Névoa/clima/vaga-lumes: ligue pelos dados do kit.
4. **Crie a pasta** copiando `dark_forest_2/` (base + receita; ou `dark_forest/` para um desenho próprio): renomeie os dois arquivos, o `id` no `registerScenery` e o export do visual.
   Troque o conteúdo de `paintGround` pelo seu chão e ajuste o visual.
5. **Registre:** uma linha em `scenery/index.js`.
6. **Sync:** `ruby mini_games/_library/sync.rb` (e `--check` para conferir).
7. **Ajuste no tuner** (`tools/scenery_tuner.html`, veja abaixo) até ficar parecido com a referência. Depois **veja no jogo:** troque `WORLD.scenery` no jogo, gere o pacote e confira em computador, celular deitado e em pé, nos três níveis de detalhe,
   com a luz no mínimo (vida baixa) e no amanhecer.
8. **Escreva a ficha** (`art_reference/scenery.md`, modelo abaixo) com as decisões e **o que foi rejeitado** e por quê,
   mais uma imagem do resultado.

## Modelo da ficha (`art_reference/scenery.md`)

```markdown
# Cenário: <nome>

- **id:** `<id>` (`registerScenery` em `../<id>.js`)
- **Clima:** <uma frase: hora do dia, temperatura, sensação>
- **Feito a partir de:** <imagens em images/..., ou "código", ou outro jogo>
- **Resultado:** `images/<id>_resultado.png`

## Como foi criado
<o pedido e o caminho, em poucas linhas>

| Camada | Elemento | Como ficou | Custo |
|---|---|---|---|
| chão | ... | pintado uma vez / `renderSway` | ... |

## Cores
<paleta e onde ela vive>

## Decisões
- <o que foi tentado, o que ficou, o que foi rejeitado e por quê>
```

## Ajuste ao vivo: `tools/scenery_tuner.html`

Uma página para ver o cenário **renderizado pelo motor de verdade** e mexer em tudo na hora, sem o jogo e sem sync.

```bash
cd mini_games && python3 -m http.server 8010
# abra http://localhost:8010/_library/tools/scenery_tuner.html?scenery=dark_forest
```

- **Cenário, tela e detalhe:** escolha o cenário, o formato (computador 16:9, celular deitado ou em pé, com as mesmas
  proporções do Last Torch) e o nível de detalhe 0, 1 ou 2.
- **Cena (só para ver):** a *vida da luz* (a névoa fecha e o círculo de luz encolhe, como quando a tocha enfraquece) e o
  *amanhecer*. O mouse sobre a imagem move a luz do herói. A tocha e o herói são círculos de referência de tamanho e **não
  fazem parte do cenário**; a luz usa os valores do Last Torch.
- **Um controle por número do `<id>_visual.js`:** barra + campo para números, seletor de cor (e transparência) para
  cores, agrupados em Chão, Névoa, Vento, Vinheta e Pontos de luz. Os alterados ficam em amarelo, e há um filtro por nome.
  O cenário é refeito logo depois que você solta a barra.
- **Copiar alterados:** gera as linhas das chaves mudadas, com o caminho do arquivo, prontas para colar no `<id>_visual.js`.
  **Desfazer tudo** volta aos valores do arquivo. Os ajustes ficam guardados no navegador até você desfazer.
- Qualquer cenário registrado em `scenery/index.js` aparece na lista sozinho: não é preciso mexer na página.
- É ferramenta de desenvolvimento: `tools/` não vai para os jogos pelo sync.

No workflow, é o passo 7: com a foto ao lado, ajuste cores e densidades aqui até ficar certo e só então grave.

## Medir o custo

Antes de trocar o cenário do jogo, compare o novo com o atual no jogo real: custo médio de `render()` (400 quadros, computador e celular
deitado) e a soma dos canvases criados (a memória). Em 2026-11-12: `dark_forest` 0,27 ms / 0,16 ms e `dark_forest_2` 0,26 ms / 0,17 ms por
quadro, com +0,8 MB / +0,3 MB de canvas. Se o seu cenário ficar acima disso, otimize antes de entregar (o orçamento do quadro a 60 FPS é 16,7 ms).

## Provar que nada quebrou

Ao mexer no motor ou no kit, ou ao migrar um cenário, compare o canvas antes e depois: `tools/scenery_regression.py`
(modo de uso no topo do arquivo). Ele renderiza o jogo com sorteio e relógio fixos em vários tamanhos de tela, níveis
de detalhe e situações (vida baixa da tocha, amanhecer, zoom, tremor) e compara o hash de cada imagem. Em 2026-11-12 a
migração da floresta para a biblioteca deu **108 de 108 imagens idênticas**.
