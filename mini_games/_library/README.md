# Biblioteca de personagens, monstros, objetos e cenários

Um lugar só para a arte de cada personagem, monstro, objeto e cenário: o desenho em código, as cores e medidas e a referência de arte
(imagens e ficha). Qualquer mini game pode usar; hoje estão ligados o Last Torch e o yara-rpg.

## A regra

**Edite sempre aqui** e depois rode, na raiz do repositório:

```bash
ruby mini_games/_library/sync.rb
```

Cada jogo continua independente: ele carrega a **própria cópia** da biblioteca (no Last Torch, `last_torch/library/`),
nunca esta pasta (no yara-rpg, `yara-rpg/library/`). O sync apaga e refaz essa cópia, então nada editado lá sobrevive. Para conferir se alguma cópia está
desatualizada ou foi editada à mão (sai com erro se estiver):

```bash
ruby mini_games/_library/sync.rb --check
```

Quais jogos recebem a cópia, e onde, está em `sync.json` (`"enabled": true` liga). O sync copia tudo menos
`art_reference/`, os `.md` e os arquivos do próprio sync; na cópia ele gera `README.md`, `CLAUDE.md` e `AGENTS.md`
(instruções para pessoas e IAs) e põe na primeira linha de cada `.js` um aviso com o caminho do original. Esta pasta começa com `_`, então o Jekyll não a publica.

## O que tem aqui

```
core/                      usado por todos
  canvas.js                o ctx onde tudo é desenhado (o jogo liga com setCtx)
  host.js                  o que a arte pergunta ao jogo: se está animando e onde está o alvo dos monstros (setHost)
  glow.js, easing.js, clock.js, random.js   brilho em cache, curvas de easing, relógio do desenho, aleatório com semente
  sprite_sheet.js          atlas de animação (buildSpriteSheet, drawSheetFrame, frameAt), makeCanvas e taper: o movimento sem gastar memória, usado por cenários e objetos
characters/
  hunter/                  Demon Hunter: o boneco 2.5D BASE, de quem os outros heróis partem
    hero25d.js             o motor do boneco (câmera, pose, golpes especiais, capa, espada) e o desenho do Demon Hunter
    hero25d_visual.js      câmera e medidas do corpo; golpes especiais (moves: duração e instante do impacto)
    hero_visual.js         paleta, ritmos da animação, combo, empurrão ao levar dano
    hero_anim.js           estado de animação de cada corpo (createHeroAnim, updateHeroAnim)
    hero_hooks.js          o que o jogo pode acrescentar ao boneco (setHeroHooks; ver abaixo)
    body_registry.js       registro dos outros bonecos (registerBody) e a lista dos ganchos de cada um
    kit25d.js              geometria compartilhada pelos bonecos com rosto (cabeça, membros com contorno, fitas)
    hero_topdown.js        o Demon Hunter antigo, visto de cima
  azael/                   azael25d.js (o boneco) e azael_visual.js; exporta a orelha e a bandagem que a Yara usa
  brutos/                  brutos25d.js (o boneco) e brutos_visual.js
  yara/, zeph/, oskar/     os heróis do yara-rpg, no mesmo esquema (<id>25d.js e <id>_visual.js)
  rowan/                   o druida do Last Torch (molde do Zeph com galhada, folhas e cajado); ficha em art_reference/character.md
objects/                   objetos do jogo que não são personagem nem cenário (a tocha 2,5D); um por pasta: <id>.js, <id>_visual.js e art_reference/object.md
  torch/                   a tocha 2,5D: poste e gaiola em dois sprites (atrás e na frente do fogo), fogo num atlas de poucos quadros (createTorch25D); a regra da vida fica no jogo
scenery/                   o chão do jogo: terreno, névoa, luz, clima (manual: scenery/README.md)
  compose.js, props/       a receita de peças e o catálogo de PEÇAS que compõem os cenários (musgo, pedra, toco, samambaia, cogumelo...)
  scenery.js, scenery_kit.js   o motor (cache, camadas, luzes) e as peças prontas (vento, névoa, vinheta, vaga-lumes)
  <id>/                    um por cenário: <id>.js (o chão e o que balança), <id>_visual.js (números) e art_reference/
                           dark_forest (Floresta Sombria, o atual do Last Torch) e dark_forest_2 (Floresta da Névoa, do yara-rpg)
monsters/
  topdown/<id>/            o desenho plano, visto de cima (o que o Last Torch usa): <id>.js (o desenho, função
                           render...), <id>_visual.js (cores e medidas) e art_reference/
                           bat, bloater, moth, wraith, zombie_wolf, shadow_wolf, headless_knight, skeleton,
                           bone_colossus, witch, vampire, demon_lord (boss)
  25d/<id>/                o mesmo monstro no boneco 2.5D dos heróis, para qualquer câmera: <id>25d.js,
                           <id>25d_visual.js (cores lidas do topdown) e art_reference/ (a ficha de como foi criado).
                           Todos os do topdown têm versão 2.5D, mais o skeleton_crawler (Esqueleto Rastejante).
                           O Last Torch fica no desenho de cima; o 2.5D é para o yara-rpg e jogos futuros
  25d/monster25d.js        desenha qualquer monstro 2.5D a partir do monstro do jogo (animação, giro, tamanho, aura)
  25d/creature25d.js       monstros sem corpo de gente (registerCreature) e peças comuns: polígonos, chama, tronco,
                           montante, corrente que afina
  25d/wolf25d.js           corpo de lobo em galope, comum ao shadow_wolf e ao zombie_wolf
```

Cada pasta de personagem ou monstro pode ter `art_reference/` com as imagens e a ficha (`character.md`). Elas nunca
são carregadas por jogo nenhum.

**Dependências entre pastas** (ao levar um para outro lugar, leve o que ele usa):
`yara`, `zeph` e `oskar` → `azael` (orelha e bandagem); `azael` e `brutos` → `hunter` → `core`;
`topdown/bone_colossus` → `topdown/skeleton`; cada `25d/<id>` → `topdown/<id>` (cores), `25d/monster25d.js` e `characters/hunter`; `25d/skeleton_crawler` e
`25d/bone_colossus` → `25d/skeleton`; os lobos → `25d/wolf25d.js`;
todos os monstros → `core`.

**O que não está aqui, e fica em cada jogo:** a fonte de luz do cenário e a regra dela (no Last Torch, a tocha), balanceamento (vida, dano, velocidade, ataques, quando aparece), regras
e efeitos do jogo (no Last Torch: adaga, Fúria, Juramentos, Shadow Clone, bosses que reaproveitam arte com outra
paleta, sprites em atlas, barras de vida) e as imagens de retrato que o jogo mostra.

## Como um jogo usa a biblioteca

Os arquivos são módulos ES (`import`/`export`). O jogo precisa ligar três coisas ao abrir; no Last Torch, as duas
primeiras estão em `js/core/state.js` e a terceira em `js/render/player25d.js`. O yara-rpg, que é feito de scripts
clássicos, carrega um módulo só (`js/stage/heroes.js`) que importa a biblioteca e a expõe em `window`:

1. **Onde desenhar:** `setCtx(canvas.getContext('2d'))` (`core/canvas.js`). `setCtx(outro)` troca o destino por um
   instante (para gerar sprites) e devolve o anterior.
2. **O que a arte pergunta ao jogo:** `setHost({ animating: () => ..., target: () => heroi })` (`core/host.js`).
   `animating` false congela as poses (jogo pausado); `target` é quem os monstros perseguem.
3. **Heróis (opcional):** `setHeroHooks({...})` (`characters/hunter/hero_hooks.js`) com o que o jogo acrescenta ao
   boneco: o gesto de arremesso e o que a mão segura, cortes do combo, lâmina acesa, brilhos e fogo na lâmina,
   equipamento extra. Tudo é opcional: sem ganchos o boneco anda, corre, golpeia, dá dash e faz os golpes especiais.

Depois é só chamar o desenho onde o jogo desenha:

```js
import { renderSkeleton } from '../library/monsters/topdown/skeleton/skeleton.js';
renderSkeleton(inimigo);              // { x, y, angle, hp, radius, ... }: os campos que cada render lê estão no arquivo dele

import '../library/characters/brutos/brutos25d.js';   // registra o boneco do Brutos
import { renderHero25D } from '../library/characters/hunter/hero25d.js';
import { createHeroAnim, updateHeroAnim } from '../library/characters/hunter/hero_anim.js';
const anim = createHeroAnim();
// a cada quadro (corpo: { x, y, angle, comboStep, dashTimer, hitTime, hitDirX, hitDirY, iFrames, move, castAge }):
updateHeroAnim(anim, corpo);
renderHero25D(corpo, anim, BRUTOS_VISUALS.colors, null, 'brutos');
```

**Outra câmera.** Sem mais nada, o boneco usa a câmera do Last Torch (quase de cima, em `hero25d_visual.js`). Um jogo
com outra câmera passa um sexto argumento, `view`: `{ camera: { heightScale, groundSquash, depthHeightWeight }, scale,
time, moves, knockback, frenzyGlow, body }` (ver o comentário de `renderHero25D`). O palco do yara-rpg é assim: vê
de lado, com os pés em `corpo.x, corpo.y`, e anima com `steerHeroAnim` (o jogo diz velocidade e direção) e
`startHeroSwing` em vez de `updateHeroAnim`.

### Ligar em outro jogo

1. Em `sync.json`, ponha `"enabled": true` no jogo (e ajuste `target`, a pasta da cópia dentro dele).
2. Rode o sync.
3. Faça os três passos acima no código do jogo e importe só o que ele usa da cópia (`<jogo>/library/...`).
4. Se o jogo tem build próprio (como `build-standalone.rb`), inclua a pasta `library` nele.

Jogo feito de scripts clássicos (sem `import`), como o yara-rpg: um `<script type="module">` que importa a
biblioteca e põe em `window` o que os outros scripts usam (`yara-rpg/js/stage/heroes.js`). Módulos rodam na ordem
junto com os scripts `defer`, então ele entra entre eles, antes de quem o usa.

## Criar um cenário

Pasta `scenery/<id>/` com `<id>.js`, `<id>_visual.js` e **sempre** `art_reference/scenery.md` (a ficha, com a referência
e o que foi rejeitado). Contrato, camadas, orçamento de desempenho, passo a passo a partir de uma foto e modelo da ficha:
**`scenery/README.md`**. Depois: uma linha em `scenery/index.js`, sync e, no jogo, o id em `WORLD.scenery`.

## Criar um personagem ou monstro

- **Monstro 2.5D:** pasta `monsters/25d/<id>/` com `<id>25d_visual.js` (cores lidas do topdown), `<id>25d.js` (as
  peças num `registerBody`, como o Esqueleto) e **sempre** `art_reference/character.md`: de onde veio (topdown, outro
  jogo, imagens), a tabela de peças, as decisões e o que foi rejeitado, mais uma imagem do resultado no tuner.
- **Monstro:** pasta `monsters/topdown/<id>/` com `<id>_visual.js` (cores e medidas) e `<id>.js` com uma função
  `render<Nome>(e)` que desenha no `ctx` de `core/canvas.js`, centrado em `e.x, e.y` e virado para `e.angle`. Use
  `renderNow()` (`core/clock.js`) para o tempo da animação e `host.animating()` antes de avançar o estado dela. Copie
  um parecido (o `wraith` é o mais curto).
- **Herói com corpo humano:** pasta `characters/<id>/` com `<id>_visual.js` (copie o do Azael: `colors` com as
  mesmas chaves de `HERO_VISUALS.colors`, `bladeLength`, `bladeWidth`, `glowScale`, `strideSpeed`) e `<id>25d.js`
  com as peças e um `registerBody('<id>', { vis, ... })` no fim. Os ganchos possíveis estão em
  `characters/hunter/body_registry.js`; o que faltar usa o desenho do Demon Hunter.
- Depois: sync, e no jogo os passos dele (no Last Torch, "Como criar um herói novo" no README do jogo).

## Ajuste ao vivo

**Comece pelo Ateliê:** `tools/index.html` é a página-mãe, com um cartão para cada ferramenta abaixo e atalhos diretos para cada herói, monstro, cenário e peça.

`tools/tuner.html`: no topo, **Heróis** ou **Monstros**. Nos monstros, a caixa **Topdown** troca entre os bonecos 2.5D
(os 13 monstros) e os 12 desenhos 2D de cima do Last Torch (`?model=td_<pasta>`, ex.: `td_witch`),
cada um com as suas cores e medidas. Os heróis e os monstros 2.5D aparecem nas **duas câmeras**: a do Last Torch (quase de
cima) e a do palco do yara-rpg (de lado, rosto em 3/4). Os controles deslizantes mexem nas medidas, posições e cores e
o boneco muda na hora. O Demon Hunter é o boneco base: o bloco dele (`hero25d_visual.js`) é o corpo de todos.

```bash
cd mini_games && python3 -m http.server 8010
# abra http://localhost:8010/_library/tools/tuner.html  (?model=azael, brutos, yara, zeph, oskar)
```

Para gravar: **Copiar alterados** gera as linhas já com o arquivo de cada uma; cole no `*_visual.js` indicado e rode o
sync. A página não grava nada sozinha. `tools/` não vai para os jogos.

**Cenários:** `tools/scenery_tuner.html` (`?scenery=dark_forest_2&preset=mobP&quality=1`), uma página própria: o cenário
renderizado pelo motor, com um controle para cada número do `<id>_visual.js`; num cenário feito de peças, um grupo por peça da receita
(quantidade, tamanho, quadros) e a paleta dela, para trocar cores só naquele cenário (detalhes em `scenery/README.md`).

**Objetos:** `tools/object_tuner.html?object=torch`: a tocha com a chama cheia, pela metade e quase apagada, ao lado da imagem de referência, e um controle para cada número.

**Peças:** `tools/prop_tuner.html?prop=mushroom`: cada peça dos cenários de perto, ao vivo (as animadas com todos os quadros do atlas),
em vários fundos, e um controle para cada valor padrão dela.

**Ateliê (página-mãe):** `tools/index.html` (`http://localhost:8010/_library/tools/`): um cartão para cada ferramenta acima e atalhos
diretos para cada herói, monstro, cenário, objeto e peça (as listas de cenários e peças saem do registro: item novo aparece sozinho).

## Referência de arte

`art_reference/` na pasta do personagem: `character.md` (a ficha) e `images/`. Serve para a IA entender forma, cores
e movimento e recriar tudo em código; para pedir, aponte a pasta ("crie a animação de
`characters/<id>/art_reference` seguindo o plano visual").

- Os jogos são **vistos de cima**: a imagem mais útil é o personagem visto de cima ou em 3/4.
- **Fundo liso** (de preferência escuro) e personagem centralizado.
- Silhueta clara importa mais que detalhes: tudo vira formas simples (polígonos, arcos, gradientes).
- Para animações, **poses-chave** (início, meio e fim do movimento) bastam; o código interpola o resto.
- Rabiscos e esboços servem, com setas indicando movimento.
