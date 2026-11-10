# Biblioteca de personagens e monstros

Um lugar só para a arte de cada personagem e monstro: o desenho em código, as cores e medidas e a referência de arte
(imagens e ficha). Qualquer mini game pode usar; hoje só o Last Torch está ligado.

## A regra

**Edite sempre aqui** e depois rode, na raiz do repositório:

```bash
ruby mini_games/_library/sync.rb
```

Cada jogo continua independente: ele carrega a **própria cópia** da biblioteca (no Last Torch, `last_torch/library/`),
nunca esta pasta. O sync apaga e refaz essa cópia, então nada editado lá sobrevive. Para conferir se alguma cópia está
desatualizada ou foi editada à mão (sai com erro se estiver):

```bash
ruby mini_games/_library/sync.rb --check
```

Quais jogos recebem a cópia, e onde, está em `sync.json` (`"enabled": true` liga). O sync copia tudo menos
`art_reference/`, os `.md` e os arquivos do próprio sync. Esta pasta começa com `_`, então o Jekyll não a publica.

## O que tem aqui

```
core/                      usado por todos
  canvas.js                o ctx onde tudo é desenhado (o jogo liga com setCtx)
  host.js                  o que a arte pergunta ao jogo: se está animando e onde está o alvo dos monstros (setHost)
  glow.js, easing.js, clock.js, random.js   brilho em cache, curvas de easing, relógio do desenho, aleatório com semente
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
  azael/                   azael25d.js (o boneco) e azael_visual.js
  brutos/                  brutos25d.js (o boneco) e brutos_visual.js
monsters/<id>/             <id>.js (o desenho, função render...) e <id>_visual.js (cores e medidas)
                           bat, bloater, moth, wraith, zombie_wolf, shadow_wolf, headless_knight, skeleton,
                           bone_colossus, witch, vampire, demon_lord (boss)
```

Cada pasta de personagem ou monstro pode ter `art_reference/` com as imagens e a ficha (`character.md`). Elas nunca
são carregadas por jogo nenhum.

**Dependências entre pastas** (ao levar um para outro lugar, leve o que ele usa):
`azael` e `brutos` → `hunter` → `core`; `bone_colossus` → `skeleton`; todos os monstros → `core`.

**O que não está aqui, e fica em cada jogo:** balanceamento (vida, dano, velocidade, ataques, quando aparece), regras
e efeitos do jogo (no Last Torch: adaga, Fúria, Juramentos, Shadow Clone, bosses que reaproveitam arte com outra
paleta, sprites em atlas, barras de vida) e as imagens de retrato que o jogo mostra.

## Como um jogo usa a biblioteca

Os arquivos são módulos ES (`import`/`export`). O jogo precisa ligar três coisas ao abrir; no Last Torch, as duas
primeiras estão em `js/core/state.js` e a terceira em `js/render/player25d.js`:

1. **Onde desenhar:** `setCtx(canvas.getContext('2d'))` (`core/canvas.js`). `setCtx(outro)` troca o destino por um
   instante (para gerar sprites) e devolve o anterior.
2. **O que a arte pergunta ao jogo:** `setHost({ animating: () => ..., target: () => heroi })` (`core/host.js`).
   `animating` false congela as poses (jogo pausado); `target` é quem os monstros perseguem.
3. **Heróis (opcional):** `setHeroHooks({...})` (`characters/hunter/hero_hooks.js`) com o que o jogo acrescenta ao
   boneco: o gesto de arremesso e o que a mão segura, cortes do combo, lâmina acesa, brilhos e fogo na lâmina,
   equipamento extra. Tudo é opcional: sem ganchos o boneco anda, corre, golpeia, dá dash e faz os golpes especiais.

Depois é só chamar o desenho onde o jogo desenha:

```js
import { renderSkeleton } from '../library/monsters/skeleton/skeleton.js';
renderSkeleton(inimigo);              // { x, y, angle, hp, radius, ... }: os campos que cada render lê estão no arquivo dele

import '../library/characters/brutos/brutos25d.js';   // registra o boneco do Brutos
import { renderHero25D } from '../library/characters/hunter/hero25d.js';
import { createHeroAnim, updateHeroAnim } from '../library/characters/hunter/hero_anim.js';
const anim = createHeroAnim();
// a cada quadro (corpo: { x, y, angle, comboStep, dashTimer, hitTime, hitDirX, hitDirY, iFrames, move, castAge }):
updateHeroAnim(anim, corpo);
renderHero25D(corpo, anim, BRUTOS_VISUALS.colors, null, 'brutos');
```

### Ligar em outro jogo

1. Em `sync.json`, ponha `"enabled": true` no jogo (e ajuste `target`, a pasta da cópia dentro dele).
2. Rode o sync.
3. Faça os três passos acima no código do jogo e importe só o que ele usa da cópia (`<jogo>/library/...`).
4. Se o jogo tem build próprio (como `build-standalone.rb`), inclua a pasta `library` nele.

O yara-rpg ainda está desligado: ele carrega scripts clássicos (sem `import`), então precisa passar a carregar a
biblioteca como módulos antes. Até lá, o Azael dele (`yara-rpg/js/stage/azael25d.js`) continua uma cópia adaptada à mão.

## Criar um personagem ou monstro

- **Monstro:** pasta `monsters/<id>/` com `<id>_visual.js` (cores e medidas) e `<id>.js` com uma função
  `render<Nome>(e)` que desenha no `ctx` de `core/canvas.js`, centrado em `e.x, e.y` e virado para `e.angle`. Use
  `renderNow()` (`core/clock.js`) para o tempo da animação e `host.animating()` antes de avançar o estado dela. Copie
  um parecido (o `wraith` é o mais curto).
- **Herói com corpo humano:** pasta `characters/<id>/` com `<id>_visual.js` (copie o do Azael: `colors` com as
  mesmas chaves de `HERO_VISUALS.colors`, `bladeLength`, `bladeWidth`, `glowScale`, `strideSpeed`) e `<id>25d.js`
  com as peças e um `registerBody('<id>', { vis, ... })` no fim. Os ganchos possíveis estão em
  `characters/hunter/body_registry.js`; o que faltar usa o desenho do Demon Hunter.
- Depois: sync, e no jogo os passos dele (no Last Torch, "Como criar um herói novo" no README do jogo).

## Referência de arte

`art_reference/` na pasta do personagem: `character.md` (a ficha) e `images/`. Serve para a IA entender forma, cores
e movimento e recriar tudo em código; para pedir, aponte a pasta ("crie a animação de
`characters/<id>/art_reference` seguindo o plano visual").

- Os jogos são **vistos de cima**: a imagem mais útil é o personagem visto de cima ou em 3/4.
- **Fundo liso** (de preferência escuro) e personagem centralizado.
- Silhueta clara importa mais que detalhes: tudo vira formas simples (polígonos, arcos, gradientes).
- Para animações, **poses-chave** (início, meio e fim do movimento) bastam; o código interpola o resto.
- Rabiscos e esboços servem, com setas indicando movimento.
