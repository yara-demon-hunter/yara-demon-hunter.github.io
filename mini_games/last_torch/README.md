# Last Torch

Conceito dos ramos de skill, formatos dos nós e regras de custo: [SKILLS.md](SKILLS.md).

## Gerar standalone version
```bash
ruby mini_games/last_torch/build-standalone.rb

# Testing
python3 -m http.server 8000 --directory mini_games/last_torch/standalone-build
```

O pacote leva só as imagens `-small` (as versões de 1024px ficam para páginas e prévias) e lista todos os módulos em `modulepreload`.

## O jogo

Uma partida é **uma noite de 12 horas**. Sobreviva até o amanhecer com o herói vivo e a tocha acesa.

- **30 segundos:** matar monstros dá XP e ouro, e cada nível dá 2 pontos de skill. A escolha rápida (`js/ui/quick_pick.js`) vem sempre desligada ao abrir o jogo; ligada em Settings, ela pausa ao ganhar pontos e mostra três skills da árvore, de ramos diferentes: um toque gasta os pontos ali e a caça volta (as teclas 1, 2 e 3 escolhem; Esc guarda os pontos para depois). O medalhão no topo pulsa em vermelho quando há algo para aprender; a árvore de skills (SKILL TREE, na tela de status) tem 4 ramos, um para cada jeito de jogar (Blade agressivo, Shadow técnico, Flame defensivo, Curse estratégico), com stats, poderes, efeitos, evoluções, skills passivas e um Juramento no fim de cada ramo: só um por noite, com bônus e preço, e que transforma o herói. Baús dão pontos extras. Cada tipo de dano tem a sua cor nos números: branco (lâmina e adaga), azul (dano mágico: Curse, fênix, Vigil), amarelo (o que a tocha dispara), roxo (sombras); o crítico é dourado (`numberStyles` em `data_model/visuals/effects/juice_visual.js`). Sequências de mortes multiplicam pontos e ouro.
- **Uma hora (~45 s):** fechada a cota de pontos (ou morto o boss), para de nascer monstro e o jogador mata o que sobrou. Com a tela limpa, uma onda de fogo sai da tocha, o ouro do chão voa até o herói, sobra um tempo curto para pegar os itens e o jogo vai ao acampamento, onde o ouro compra relíquias na **árvore de relíquias** (3 ramos: Fortune, Ward, Wrath, cada relíquia abre a próxima) ou alimenta a tocha, que não se recupera de graça entre as horas (`CAMP.freeTorchHeal`). Durante a caçada, moedas e itens somem do chão depois de um tempo (`GOLD_DROP.lifeSeconds`, `PICKUP_DROP.lifeSeconds`); o ímã puxa tudo o que está na tela, baús inclusive. As horas 1 (o rival), 4, 8, 11 e 12 têm boss, e a hora 6 tem o semi-boss Captain Brutos (ver abaixo).
- **Entre partidas:** a árvore recomeça a cada noite e está toda aberta desde a primeira partida. Cada nó pede só a ligação com o nó anterior (o nível mínimo dele, como a linha do mapa mostra); não há exigência de matar monstros. O painel do nó mostra o que falta. O que persiste entre noites fica no **Santuário** (botão na tela inicial): troféus (marcos da jornada), façanhas (matar vários de uma vez, esquivar no último instante, terminar uma hora sem levar dano, sequências de mortes) e o bestiário, que mostra cada monstro e boss depois do primeiro abatido. Algumas conquistas liberam heróis, escolhidos na tela de escolha do herói, também na tela inicial. As moedas do jogo são só o ouro e os pontos de skill, e valem para a noite atual. Vencer abre a noite sem fim e os níveis de Escuridão.

Tudo persiste no `localStorage` do jogador (`js/core/save.js`).

## Desempenho

O jogo roda em celular fraco. Regras que mantêm isso de pé (ao mexer, meça com CPU limitada):

- **Monstros são sprites.** `js/render/monster_sprites.js` roda a arte procedural uma vez por quadro de animação e guarda num atlas; em campo cada monstro custa 2 `drawImage`. Só bosses e herói são desenhados a cada quadro. Monstro novo: a arte vai na biblioteca (`mini_games/_library/monsters/<id>/`, ver o README dela) e entra em `ART` e em `data_model/visuals/monsters/sprites_visual.js`.
- **Nada repetido é desenhado do zero:** moedas, adagas, tiros, brilhos e algarismos vêm de sprites (`js/render/fx/`). Evite `fillText`, `setLineDash`, `shadowBlur`, gradientes novos por quadro e `ctx.save/restore` por objeto.
- **Chão e névoa:** o chão é copiado 1:1 (grama e brilho da tocha já pintados nele); a névoa é desenhada numa tela pequena poucas vezes por segundo.
- **DOM:** os sistemas só chamam `updateHUD()`; a escrita sai no máximo 10 vezes por segundo, só do que mudou, e as barras usam `transform`. Sem `backdrop-filter` nem animação de sombra.
- **Resolução interna** limitada em `data_model/world.js` (`maxPixelRatio`, `maxCanvasPixels`). O HUD é DOM e continua nítido.
- **Detalhe adaptativo:** `state.quality` vai de 0 a 2. O celular começa em 1 e `js/game.js` desce sozinho se o aparelho não sustentar ~42 FPS; o nível 2 trava em ~30 FPS.
- **Sem lixo de memória:** partículas, pedaços e números são reaproveitados (`js/systems/effects.js`).
- **Fora da partida o canvas não é redesenhado.**
- **Carregamento:** o PLAY nasce desligado (`LOADING`) e `setupScreens` o acende quando os módulos terminam de chegar; assim ele nunca parece travado em rede lenta. A arte da árvore é baixada logo depois.
- Limite de monstros vivos: `maxAliveEnemies` em `data_model/difficulty.js`.

## Estrutura

A arte dos personagens e dos monstros (desenho e cores) vem da **biblioteca compartilhada** `mini_games/_library/`, que
outros jogos também podem usar. O jogo carrega a cópia dela em `library/`, feita pelo sync: **não edite `library/`**.
Mude em `mini_games/_library/` e rode `ruby mini_games/_library/sync.rb` (como funciona: `mini_games/_library/README.md`).
O que é regra do Last Torch (vida, dano, velocidade, ataques, Juramentos, adaga, Fúria) continua aqui.

```
last_torch.html   tela e elementos da interface
library/                          CÓPIA da biblioteca de personagens e monstros (gerada pelo sync, não editar)
  core/                           ctx compartilhado, ganchos do jogo (host.js), glow, easing, relógio do desenho, aleatório com semente
  characters/hunter/              Demon Hunter, o boneco 2.5D base (hero25d.js), a animação (hero_anim.js), os ganchos do jogo (hero_hooks.js), o top-down antigo e o registro dos outros bonecos
  characters/azael/, brutos/      os bonecos do Azael e do Captain Brutos e as cores deles
  monsters/<id>/                  um por monstro ou boss (bat, skeleton, witch, vampire, moth, bloater, wraith, zombie_wolf, shadow_wolf, headless_knight, bone_colossus, demon_lord): desenho e cores
css/
  game.css                        ponto de entrada: só importa os arquivos abaixo
  base/base.css                   fonte, body e canvas
  components/hud.css              HUD responsivo, tudo no topo: cartão do herói, medalhão pulsante, hora da noite, boss, poderes, pontos e sequência
  components/banner.css           faixas centrais, gritos de sequência, notificações e efeitos de borda da tela
  components/screens.css          base das telas que pausam a partida
  components/camp.css             acampamento
  components/summary.css          tela de fim da noite
  components/sanctuary.css        Santuário: troféus, façanhas e bestiário
  components/heroes.css           escolha do herói
  components/shop.css             tela de status (pausa, abas, build em colunas)
  components/quick-pick.css       escolha rápida ao subir de nível
  components/tree.css             árvores: cada ramo é um bloco; abas em tela pequena, 2 x 2 em tela grande, célula calculada para caber sem rolar
  components/joystick.css         controles de toque: joystick, adaga e dash
  components/start-screen.css     tela inicial
  components/orientation.css      aviso de virar o aparelho de lado (celular em pé)
data_model/                       DADOS do jogo (balanceamento), separados do motor
  character.js                    atributos, progressão, calor da tocha e raio de atração do ouro
  characters/                     UM ARQUIVO POR PERSONAGEM (hunter.js, azael.js, brutos.js): nome, textos, vida, velocidade, dash, bônus, números como boss e rival; index.js monta o que o jogo lê e explica como criar um
  heroes.js                       junta os personagens de characters/ aos heróis guardados (shelved)
  core.js                         vida, colisão e aparência do núcleo
  monsters.js                     monstros, aparição e recompensas
  bosses.js                       bosses: vida, ataques (patterns) e rotação
  elites.js                       modificadores de elite
  difficulty.js                   crescimento por hora: vida, dano, spawn, cota de pontos
  night.js                        a noite: horas, hordas, presságios, Escuridão
  skills.js                       stats, lâmina, Fúria, feitiços, adaga e dash
  powers.js                       poderes (aprendidos na árvore) e evoluções
  passives.js                     skills passivas e Juramentos (type 'skill', na árvore de pontos), relíquias (preço base em ouro) e preços do acampamento
  tree.js                         árvore de skills: nós, ramos, posições e pontos por nível
  relics.js                       árvore de relíquias (acampamento): nós, ramos e pré-requisitos
  streak.js                       sequência de mortes
  pickups.js                      itens no chão e baús
  gold.js                         ouro dropado
  sanctuary.js                    conquistas (troféus e façanhas), janela de mortes simultâneas e bestiário
  world.js                        tamanho padronizado do mundo e zoom (areaScale) por perfil desktop/mobile
  visuals/                        cores, tamanhos e ritmos das animações (arte procedural)
    characters/                   barras em cima da cabeça do herói (hero_hud_visual.js), formas dos Juramentos (oath_visual.js) e Shadow Clone
    monsters/sprites_visual.js    quadros dos sprites dos monstros (as cores de cada monstro estão na biblioteca)
    bosses/palettes_visual.js     paletas dos bosses que reaproveitam arte
    scenery/                      cenário (forest_visual.js, torch_visual.js)
    items/gold_visual.js          ouro
    effects/                      golpes, level up, adaga, rebate, juice_visual.js (impacto), powers_visual.js (poderes e itens), skills_visual.js (skills dos ramos) e phoenix_visual.js (fênix)
    index.js                      reexporta tudo
js/
  game.js                         ponto de entrada: loop do jogo e qualidade adaptativa
  core/state.js                   estado compartilhado da partida (state, player, keys, canvas, audio)
  core/save.js                    progresso salvo entre partidas (localStorage)
  core/resize.js                  redimensionamento do canvas
  core/input.js                   mouse, toque e teclado
  systems/modifiers.js            soma os bônus de herói, relíquias, poderes, presságios e Escuridão (mod('chave'))
  systems/stats.js                fórmulas de atributos (dano, alcance, cooldown...)
  systems/night.js                fases da hora: caçada, últimos monstros, onda de fogo, amanhecer, morte
  systems/spawner.js              aparição de monstros, hordas, elites e bosses
  systems/enemies.js              IA, colisões, mortes/recompensas e projéteis inimigos
  systems/boss_ai.js              ataques dos bosses e avisos no chão
  systems/damage.js               todo dano nos monstros passa por aqui: crítico, clarão, número, recuo
  systems/combat.js               ataque automático, golpes da lâmina e Fúria
  systems/knives.js               adaga de arremesso e Ricochet
  systems/quake.js                Axe Quake do Captain Brutos (golpe em área de curto alcance no lugar da adaga)
  systems/dash.js                 dash e esquiva perfeita
  systems/powers.js               poderes do level up
  systems/skills.js               skills dos ramos: ponto único (atualiza, limpa entre horas, cerimônia do Juramento)
  systems/skills_blade.js         Bloodlust, Crimson Tide, Earthbreaker, Cataclysm, War Cry, Executioner
  systems/skills_shadow.js        Death Mark, caminho do dash, Master Thief, Smoke Bomb, Night Reaper
  systems/skills_flame.js         Hearth Ring, Solar Wall, Vigil, Backdraft, Phoenix Pact
  systems/skills_curse.js         Grave Wisp, Creeping Hex, Void Rift, Event Horizon
  systems/moves.js                golpes especiais do herói (salto, rugido, juramento) e gesto de feitiço
  systems/tree.js                 regras das duas árvores: nível, custo (pontos ou ouro), pré-requisitos, travas, compra
  systems/player.js               movimentação e dano no herói
  systems/torch.js                vida da tocha e calor que cura
  systems/shadow_clone.js         Shadow Clone
  systems/streak.js               sequência de mortes e mortes simultâneas
  systems/sanctuary.js            registro do Santuário: conquistas, recordes, bestiário
  systems/gold.js                 moedas de ouro: pulo, atração e coleta
  systems/pickups.js              itens no chão e baús
  systems/progression.js          XP e level up
  systems/effects.js              tempo (hit stop, câmera lenta), partículas, pedaços, manchas, números, ondas
  render/renderer.js              ordem das camadas de desenho
  render/arena.js                 tocha (núcleo) e raio de alcance do herói
  render/forest.js                cenário: chão pré-pintado, névoa em baixa resolução, luz da tocha e do herói
  render/entities.js              inimigos, projéteis, golpes e moedas
  render/effects.js               manchas, pedaços, ondas de choque, avisos no chão, números, amanhecer
  render/powers.js                desenho dos poderes
  render/skills.js                desenho das skills dos ramos (rachaduras, fendas, anel de fogo, marcas, escudo...)
  render/phoenix.js               fênix do Phoenix Pact: arte procedural guardada em atlas e voo em campo
  render/shackle.js                corrente do Shadow Shackle: elos e estacas em sprites prontos
  render/raven.js                  corvo do Shadow Raven: arte procedural em atlas e voo em campo
  render/pickups.js               itens e baús
  render/monster_sprites.js       gera os sprites dos monstros e dos tiros a partir da arte procedural
  render/player.js                estado de animação do herói do jogador, rastro de sombra e o herói top-down antigo (?hero=topdown)
  render/player25d.js             liga as regras do jogo ao boneco 2.5D da biblioteca (adaga, bola de fogo, cortes do combo, Fúria, Bloodlust, Flaming Sword, Juramentos)
  render/bodies.js                os bonecos que o jogo usa: um import por boneco da biblioteca
  render/hero_gear.js             equipamento e paleta dos Juramentos, peças do mesmo boneco 2.5D
  render/rival.js                 bosses com corpo de herói (Azael, Demon Hunter, Brutos)
  render/shadow_clone.js          Shadow Clone: herói 2.5D com paleta de sombra
  render/fx/                      carimbos (stamp), sprites pequenos, atlas de números, anéis, barra de vida (glow, easing e relógio estão em library/core)
  ui/hud.js                       atualização do HUD
  ui/banner.js                    faixas, gritos e notificações
  ui/tree.js                      desenho das árvores (ramos, nós, ligações e abas de ramo) e painel de detalhe; uma fábrica monta a de skills e a de relíquias
  ui/camp.js                      acampamento: árvore de relíquias, tocha e descanso
  ui/status.js                    tela de status: abas Skill Tree e Build; ui/settings.js: som, efeitos e controles (🎮)
  ui/stat_sheet.js                ficha de stats da aba Build: tudo o que se acumula na noite, já somado
  ui/sanctuary.js                 Santuário: abas de troféus, façanhas e bestiário
  ui/heroes.js                    escolha do herói
  ui/screens.js                   início de partida, fim da noite e tela inicial
  ui/hints.js                     dicas da primeira partida
  ui/quick_pick.js                escolha rápida: três nós da árvore ao ganhar pontos
  ui/orientation.js               celular de lado (paisagem): trava de orientação e pausa com o aparelho em pé
  ui/buttons.js                   eventos dos botões e atalhos de teclado
  audio/sound-engine.js           efeitos sintetizados (Web Audio API), mixagem e volumes
  audio/music.js                  música procedural: clima por momento da noite
previews/                         páginas para analisar os monstros e o herói (como abrir: previews/README.md)
draft/                            versões anteriores mantidas como referência
```

- Para mudar **balanceamento**, edite apenas `data_model/`.
- Para mudar a **arte** de um personagem ou monstro, edite em `mini_games/_library/` e rode o sync. A referência de arte (imagens e fichas) fica lá também, na pasta de cada um (`art_reference/`).
- Relíquia, herói ou melhoria com efeito simples não precisa de código: basta declarar `mods` (chaves em `js/systems/modifiers.js`).
- Todo estado que muda durante a partida fica em `js/core/state.js` (objeto `state`); os sistemas leem e escrevem nele.
- Novo CSS: crie o arquivo na pasta da funcionalidade e adicione um `@import` em `css/game.css`.
- Novo motor JS: crie o módulo em `js/systems/` (ou `render/`, `ui/`) e chame-o a partir de `js/game.js`.

## Como criar um herói novo

O desenho do herói é um boneco 2.5D da biblioteca; cada herói com boneco próprio vive na sua pasta e o motor
(`hero25d.js`) não muda. Passo a passo (use o Azael como exemplo); os passos 1 e 2 são na biblioteca
(`mini_games/_library/characters/<id>/`, com a referência de arte em `art_reference/` ali dentro):

1. **Visual:** `<id>_visual.js`, copiando `azael/azael_visual.js`: `colors` (mesmas chaves de `HERO_VISUALS.colors`), `bladeLength`, `bladeWidth`, `glowScale`, `strideSpeed` e as medidas só dele.
2. **Boneco:** `<id>25d.js`, copiando `azael/azael25d.js`, com as peças (cabeça, tronco, pernas, braços, arma) e, no fim, `registerBody('<id>', { vis, ... })`. Os ganchos (todos opcionais, o que faltar usa o desenho do Demon Hunter) estão listados em `characters/hunter/body_registry.js`; a geometria da cabeça e dos membros está em `characters/hunter/kit25d.js`. Depois rode `ruby mini_games/_library/sync.rb`.
3. **Lista:** um `import '../../library/characters/<id>/<id>25d.js';` em `js/render/bodies.js`.
4. **Personagem:** um arquivo `data_model/characters/<id>.js` (copie o `brutos.js`) com TUDO dele: nome, textos, `colors`, retrato, vida, velocidade, dash, bônus em %, números como boss, rival e a posição na tela de escolha (`order`); depois, ponha-o na lista de `data_model/characters/index.js` e a conquista que o libera (`hero: '<id>'`) em `data_model/sanctuary.js`. Os números são conferidos ao abrir o jogo (um stat com nome errado dá erro).
5. **Sombra:** uma linha em `colorsByModel` (`shadow_clone_visual.js`) com a paleta de sombra dele, usada pelo Shadow Clone e pelo rival sombra. Sem a linha, usa a paleta padrão.
6. **Rival:** se o herói tiver um rival próprio, `RIVAL_OF` e o boss em `data_model/bosses.js` (o rival é só dado: usa o mesmo boneco).

## Captain Brutos (semi-boss e herói)

**Como herói** (`HEROES.brutos`, liberado pela conquista Iron Captain: vencer o Brutos): lento e pesado, com dash curto, mais vida, mais dano de lâmina e menos dano recebido, mas menos velocidade de ataque e **sem adaga** (`noKnives`). No lugar da adaga ele tem o **Axe Quake**: clique esquerdo (ou o botão do canto, no celular) ergue o machado e desce no chão, e uma onda de curto alcance estoura em volta dele (dano alto, empurrão forte e atordoamento), com recarga de 3,5 s. Força, cooldown, alcance, empurrão e atordoamento ficam em `abilities.axeQuake` no `data_model/characters/brutos.js` (`js/systems/quake.js`). Valores do personagem em `data_model/characters/brutos.js`. O rival dele é o Azael (`RIVAL_OF`), com falas próprias de duelo (`DUEL_DIALOGUES.AZAEL.byHero.brutos`), e quem joga com ele **não enfrenta o semi-boss**: a hora 6 fica normal (`chooseBossType` devolve `null`; `isBossTurn(hora, model)`). O Shadow Clone dele usa uma paleta de sombra própria (`colorsByModel`).

**Como semi-boss**: na hora 6 o rival do herói (Azael ou Demon Hunter) chama o capitão (`BOSS_INTROS.*.BRUTOS` em `data_model/dialogues.js`: uma fala do rival, a frase curta do Brutos, uma resposta do herói) e ele entra na luta. É um boss com corpo de herói (`renderAs: 'RIVAL'`) mas sem a conversa de duelo (`noDuel`, `hasDuel` em `data_model/bosses.js`). Um tanque **imparável** (`unstoppable`): avança sem parar para o herói e nada o atrasa, prende (Shadow Shackle) ou empurra. Sem magia, sem tiros e sem adaga: só golpes pesados de machado de perto, o **Axe Quake** em volta dele (`quake`: o machado desce e uma onda de curto alcance estoura ao redor, então o herói precisa estar perto para levar) e um dash curto (`lunge`, 150 px). Tudo é ajustável em `BOSS_MODELS.BRUTOS`. Boneco, visual e referência de arte: `mini_games/_library/characters/brutos/` (`brutos25d.js`, `brutos_visual.js`, `art_reference/`).

Um boss novo com corpo de herói segue o mesmo caminho: boneco registrado (ver "Como criar um herói novo", passos 1 a 3), entrada em `BOSS_MODELS` com `renderAs: 'RIVAL'` e `heroModel`, hora em `BOSS_SPAWNING.schedule` e, se for chamado pelo rival, falas em `BOSS_INTROS` (a fala do boss usa `who: 'boss'`; precisa de `portraitImage` no modelo).

## Controles

- **Desktop:** mova o mouse para direcionar o herói. `WASD`/setas ficam desligadas por padrão; quem quiser liga em Settings (ao apertar uma delas, o mouse passa a servir só para mirar até a próxima partida). Clique com o botão esquerdo no canvas para arremessar uma faca na direção do cursor; segure para repetir (recarga própria) ou, com Charged Dagger Throw, para carregar e soltar. `Espaço`, `Shift` ou o botão direito dão o dash. `Esc` ou `P` pausam. `Enter` recomeça.
- **Celular:** jogado **de lado (paisagem)**, com os dois polegares. Ao começar, o jogo entra em tela cheia e trava em paisagem (Android); onde não dá para travar (iOS), um aviso pede para virar o aparelho de lado e a partida fica pausada enquanto ele estiver em pé. O joystick (canto inferior esquerdo) move o herói. O botão menor, acima da adaga, dá o dash. O botão da adaga (canto inferior direito) mira enquanto está pressionado, com uma linha tracejada saindo do herói: sem arrastar mira no monstro mais perto; arrastando mira na direção do arraste. A adaga só é arremessada ao **soltar** o botão, uma vez, se a recarga (anel em volta do botão) já terminou; com Charged Dagger Throw, quanto mais tempo segurar, mais forte ela sai. Tocar na tela não arremessa. Os ataques corpo a corpo são automáticos. Em Settings, **Move and resize buttons** deixa arrastar os três controles e mudar o tamanho deles, com um Reset que volta ao padrão (js/ui/touch_layout.js).

O jogo usa a mesma lógica e progressão em todas as telas; apenas a disposição da interface e o controle de movimento se adaptam ao dispositivo.

Como o jogo usa módulos ES, abra-o por um servidor HTTP local ou pelo site publicado, não diretamente via `file://`.
