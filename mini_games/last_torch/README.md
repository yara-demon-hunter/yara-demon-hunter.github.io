# Last Torch: Demon Hunter

Conceito dos ramos de skill, formatos dos nós e regras de custo: [SKILLS.md](SKILLS.md).

## Gerar standalone version
```bash
ruby mini_games/last_torch/build-standalone.rb

# Testing
python3 -m http.server 8000 --directory mini_games/last_torch/standalone-build
```

## O jogo

Uma partida é **uma noite de 12 horas**. Sobreviva até o amanhecer com o herói vivo e a tocha acesa.

- **30 segundos:** matar monstros dá XP e ouro, e cada nível dá 2 pontos de skill. O medalhão no topo pulsa em vermelho quando há algo para aprender; a árvore de skills (SKILL TREE, na tela de status) tem 4 ramos, um para cada jeito de jogar (Blade agressivo, Shadow técnico, Flame defensivo, Curse estratégico), com stats, poderes, efeitos, evoluções, skills passivas e um Juramento no fim de cada ramo: só um por noite, com bônus e preço, e que transforma o herói. Baús dão pontos extras. Sequências de mortes multiplicam pontos e ouro.
- **Uma hora (~45 s):** fechada a cota de pontos (ou morto o boss), para de nascer monstro e o jogador mata o que sobrou. Com a tela limpa, uma onda de fogo sai da tocha, o ouro do chão voa até o herói, sobra um tempo curto para pegar os itens e o jogo vai ao acampamento, onde o ouro compra relíquias na **árvore de relíquias** (3 ramos: Fortune, Ward, Wrath, cada relíquia abre a próxima) ou alimenta a tocha. As horas 4, 8 e 12 têm boss.
- **Entre partidas:** a árvore recomeça a cada noite e está toda aberta desde a primeira partida. Cada nó pede só o que aparece na árvore: nível mínimo de outras skills e, em alguns, quantos monstros de um tipo você matou na partida inteira, somando todas as horas (por exemplo, 10 Witches). A contagem só zera ao começar uma partida nova. O painel do nó mostra a lista inteira de pedidos de uma vez. O que persiste entre noites fica no **Santuário** (botão na tela inicial): troféus (marcos da jornada), façanhas (matar vários de uma vez, esquivar no último instante, terminar uma hora sem levar dano, sequências de mortes) e o bestiário, que mostra cada monstro e boss depois do primeiro abatido. Algumas conquistas liberam heróis, escolhidos na tela de escolha do herói, também na tela inicial. As moedas do jogo são só o ouro e os pontos de skill, e valem para a noite atual. Vencer abre a noite sem fim e os níveis de Escuridão.

Tudo persiste no `localStorage` do jogador (`js/core/save.js`).

## Desempenho

O jogo roda em celular fraco. Regras que mantêm isso de pé (ao mexer, meça com CPU limitada):

- **Monstros são sprites.** `js/render/monster_sprites.js` roda a arte procedural uma vez por quadro de animação e guarda num atlas; em campo cada monstro custa 2 `drawImage`. Só bosses e herói são desenhados a cada quadro. Monstro novo: entra em `ART` e em `data_model/visuals/monsters/sprites_visual.js`.
- **Nada repetido é desenhado do zero:** moedas, adagas, tiros, brilhos e algarismos vêm de sprites (`js/render/fx/`). Evite `fillText`, `setLineDash`, `shadowBlur`, gradientes novos por quadro e `ctx.save/restore` por objeto.
- **Chão e névoa:** o chão é copiado 1:1 (grama e brilho da tocha já pintados nele); a névoa é desenhada numa tela pequena poucas vezes por segundo.
- **DOM:** os sistemas só chamam `updateHUD()`; a escrita sai no máximo 10 vezes por segundo, só do que mudou, e as barras usam `transform`. Sem `backdrop-filter` nem animação de sombra.
- **Resolução interna** limitada em `data_model/world.js` (`maxPixelRatio`, `maxCanvasPixels`). O HUD é DOM e continua nítido.
- **Detalhe adaptativo:** `state.quality` vai de 0 a 2. O celular começa em 1 e `js/game.js` desce sozinho se o aparelho não sustentar ~42 FPS; o nível 2 trava em ~30 FPS.
- **Sem lixo de memória:** partículas, pedaços e números são reaproveitados (`js/systems/effects.js`).
- **Fora da partida o canvas não é redesenhado.**
- Limite de monstros vivos: `maxAliveEnemies` em `data_model/difficulty.js`.

## Estrutura

```
last_torch.html   tela e elementos da interface
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
  components/tree.css             árvores: cada ramo é um bloco; abas em tela pequena, 2 x 2 em tela grande, célula calculada para caber sem rolar
  components/joystick.css         controles de toque: joystick, adaga e dash
  components/start-screen.css     tela inicial
  components/orientation.css      aviso de virar o aparelho de lado (celular em pé)
data_model/                       DADOS do jogo (balanceamento), separados do motor
  character.js                    atributos, progressão, calor da tocha e raio de atração do ouro
  heroes.js                       heróis jogáveis: bônus, paleta e retrato
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
    characters/                   herói, formas dos Juramentos (oath_visual.js) e Shadow Clone
    monsters/                     um arquivo por monstro (bat, skeleton, witch, vampire, moth, bloater, wraith, zombie_wolf, headless_knight) e sprites_visual.js (quadros dos sprites)
    bosses/                       Demon Lord e paletas de quem reaproveita arte (palettes_visual.js)
    scenery/                      cenário (forest_visual.js, torch_visual.js)
    items/gold_visual.js          ouro
    effects/                      golpes, level up, adaga, rebate, juice_visual.js (impacto), powers_visual.js (poderes e itens) e skills_visual.js (skills dos ramos)
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
  render/pickups.js               itens e baús
  render/monster_sprites.js       gera os sprites dos monstros e dos tiros a partir da arte procedural
  render/moth.js, bloater.js, wraith.js, zombie_wolf.js, headless_knight.js ...   arte de cada monstro (usada para gerar os sprites)
  render/player.js                herói procedural (capa, capuz, máscara, espada) e rastro de sombra
  render/player25d.js             herói 2.5D (padrão) e posturas dos golpes especiais
  render/hero_gear.js             equipamento e paleta dos Juramentos, peças do mesmo boneco 2.5D
  render/shadow_clone.js          Shadow Clone: herói 2.5D com paleta de sombra
  render/fx/                      glow, carimbos (stamp), sprites pequenos, atlas de números, anéis, relógio do desenho, easing, barra de vida
  ui/hud.js                       atualização do HUD
  ui/banner.js                    faixas, gritos e notificações
  ui/tree.js                      desenho das árvores (ramos, nós, ligações e abas de ramo) e painel de detalhe; uma fábrica monta a de skills e a de relíquias
  ui/camp.js                      acampamento: árvore de relíquias, tocha e descanso
  ui/status.js                    tela de status: abas Skill Tree e Build; ui/settings.js: som, efeitos e controles (🎮)
  ui/sanctuary.js                 Santuário: abas de troféus, façanhas e bestiário
  ui/heroes.js                    escolha do herói
  ui/screens.js                   início de partida, fim da noite e tela inicial
  ui/hints.js                     dicas da primeira partida
  ui/orientation.js               celular de lado (paisagem): trava de orientação e pausa com o aparelho em pé
  ui/buttons.js                   eventos dos botões e atalhos de teclado
  audio/sound-engine.js           efeitos sintetizados (Web Audio API), mixagem e volumes
  audio/music.js                  música procedural: clima por momento da noite
art_reference/                    imagens e fichas de referência dos personagens (não carregadas pelo jogo)
previews/                         páginas para analisar os monstros e o herói (como abrir: previews/README.md)
draft/                            versões anteriores mantidas como referência
```

- Para mudar **balanceamento**, edite apenas `data_model/`.
- Relíquia, herói ou melhoria com efeito simples não precisa de código: basta declarar `mods` (chaves em `js/systems/modifiers.js`).
- Todo estado que muda durante a partida fica em `js/core/state.js` (objeto `state`); os sistemas leem e escrevem nele.
- Novo CSS: crie o arquivo na pasta da funcionalidade e adicione um `@import` em `css/game.css`.
- Novo motor JS: crie o módulo em `js/systems/` (ou `render/`, `ui/`) e chame-o a partir de `js/game.js`.

## Controles

- **Desktop:** mova o mouse para direcionar o herói ou use `WASD`/setas para movimentar diretamente (ao usar o teclado, o mouse passa a servir só para mirar). Clique com o botão esquerdo no canvas para arremessar uma faca na direção do cursor; segure para repetir (recarga própria) ou, com Soul Lance, para carregar e soltar. `Espaço`, `Shift` ou o botão direito dão o dash. `Esc` ou `P` pausam. `Enter` recomeça.
- **Celular:** jogado **de lado (paisagem)**, com os dois polegares. Ao começar, o jogo entra em tela cheia e trava em paisagem (Android); onde não dá para travar (iOS), um aviso pede para virar o aparelho de lado e a partida fica pausada enquanto ele estiver em pé. O joystick (canto inferior esquerdo) move o herói. O botão menor, acima da adaga, dá o dash. O botão da adaga (canto inferior direito) mira enquanto está pressionado, com uma linha tracejada saindo do herói: sem arrastar mira no monstro mais perto; arrastando mira na direção do arraste. A adaga só é arremessada ao **soltar** o botão, uma vez, se a recarga (anel em volta do botão) já terminou; com Soul Lance, quanto mais tempo segurar, mais forte ela sai. Tocar na tela não arremessa. Os ataques corpo a corpo são automáticos.

O jogo usa a mesma lógica e progressão em todas as telas; apenas a disposição da interface e o controle de movimento se adaptam ao dispositivo.

Como o jogo usa módulos ES, abra-o por um servidor HTTP local ou pelo site publicado, não diretamente via `file://`.
