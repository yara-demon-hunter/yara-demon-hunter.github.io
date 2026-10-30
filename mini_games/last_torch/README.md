# Last Torch: Demon Hunter

## O jogo

Uma partida é **uma noite de 12 horas**. Sobreviva até o amanhecer com o herói vivo e a tocha acesa.

- **30 segundos:** matar monstros dá XP e ouro. Cada nível pausa o jogo e oferece cartas: o jogador escolhe 1 entre stats e poderes. Sequências de mortes multiplicam pontos e ouro.
- **Uma hora (~45 s):** fechada a cota de pontos, uma onda de fogo sai da tocha, o ouro do chão voa até o herói e o jogo vai ao acampamento, onde o ouro compra relíquias ou alimenta a tocha. As horas 4, 8 e 12 têm boss.
- **Entre partidas:** cada noite rende brasas, gastas no Hearth em melhorias permanentes. Os Trials liberam poderes e heróis. Vencer abre a noite sem fim e os níveis de Escuridão.

Tudo persiste no `localStorage` do jogador (`js/core/save.js`).

## Estrutura

```
last_torch.html   tela e elementos da interface
css/
  game.css                        ponto de entrada: só importa os arquivos abaixo
  base/base.css                   fonte, body e canvas
  components/hud.css              HUD responsivo, tudo no topo: cartão do herói, hora da noite, boss, poderes, pontos e sequência
  components/banner.css           faixas centrais, gritos de sequência, notificações e efeitos de borda da tela
  components/screens.css          base das telas que pausam a partida
  components/cards.css            cartas de level up e baú
  components/camp.css             acampamento
  components/summary.css          tela de fim da noite
  components/hearth.css           Hearth: melhorias, heróis e Trials
  components/shop.css             tela de status (pausa)
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
  skills.js                       stats, lâmina, Fúria, adaga e dash
  powers.js                       poderes (cartas de level up) e evoluções
  passives.js                     relíquias (compradas com ouro) e preços do acampamento
  cards.js                        raridades e pesos das cartas
  streak.js                       sequência de mortes
  pickups.js                      itens no chão e baús
  gold.js                         ouro dropado
  meta.js                         melhorias do Hearth, brasas e Trials
  world.js                        tamanho padronizado do mundo e zoom (areaScale) por perfil desktop/mobile
  visuals/                        cores, tamanhos e ritmos das animações (arte procedural)
    characters/                   herói e Shadow Clone
    monsters/                     um arquivo por monstro (bat, skeleton, witch, vampire, moth, bloater, wraith)
    bosses/                       Demon Lord e paletas de quem reaproveita arte (palettes_visual.js)
    scenery/                      cenário (forest_visual.js, torch_visual.js)
    items/gold_visual.js          ouro
    effects/                      golpes, level up, adaga, rebate, juice_visual.js (impacto) e powers_visual.js (poderes e itens)
    index.js                      reexporta tudo
js/
  game.js                         ponto de entrada: loop do jogo e qualidade adaptativa
  core/state.js                   estado compartilhado da partida (state, player, keys, canvas, audio)
  core/save.js                    progresso salvo entre partidas (localStorage)
  core/resize.js                  redimensionamento do canvas
  core/input.js                   mouse, toque e teclado
  systems/modifiers.js            soma os bônus de herói, Hearth, relíquias, poderes, presságios e Escuridão (mod('chave'))
  systems/stats.js                fórmulas de atributos (dano, alcance, cooldown...)
  systems/night.js                fases da hora: caçada, onda de fogo, amanhecer, morte
  systems/spawner.js              aparição de monstros, hordas, elites e bosses
  systems/enemies.js              IA, colisões, mortes/recompensas e projéteis inimigos
  systems/boss_ai.js              ataques dos bosses e avisos no chão
  systems/damage.js               todo dano nos monstros passa por aqui: crítico, clarão, número, recuo
  systems/combat.js               ataque automático, golpes da lâmina e Fúria
  systems/knives.js               adaga de arremesso e Ricochet
  systems/dash.js                 dash e esquiva perfeita
  systems/powers.js               poderes do level up
  systems/cards.js                monta as ofertas de cartas e aplica a escolhida
  systems/player.js               movimentação e dano no herói
  systems/torch.js                vida da tocha e calor que cura
  systems/shadow_clone.js         Shadow Clone
  systems/streak.js               sequência de mortes
  systems/gold.js                 moedas de ouro: pulo, atração e coleta
  systems/pickups.js              itens no chão e baús
  systems/progression.js          XP e level up
  systems/effects.js              tempo (hit stop, câmera lenta), partículas, pedaços, manchas, números, ondas
  render/renderer.js              ordem das camadas de desenho
  render/arena.js                 tocha (núcleo) e raio de alcance do herói
  render/forest.js                cenário: noite fria, névoa, luz da tocha e do herói
  render/entities.js              inimigos, olhos na névoa, projéteis, golpes e moedas
  render/effects.js               manchas, pedaços, ondas de choque, avisos no chão, números, amanhecer
  render/powers.js                desenho dos poderes
  render/pickups.js               itens e baús
  render/moth.js, bloater.js, wraith.js ...   um arquivo por monstro
  render/player.js                herói procedural (capa, capuz, máscara, espada) e rastro de sombra
  render/player25d.js             herói 2.5D (padrão)
  render/shadow_clone.js          Shadow Clone: herói 2.5D com paleta de sombra
  render/fx/                      aleatório com semente, easing, glow em cache, barra de vida
  ui/hud.js                       atualização do HUD
  ui/banner.js                    faixas, gritos e notificações
  ui/cards.js                     tela de cartas
  ui/camp.js                      acampamento
  ui/status.js                    tela de status (pausa) e opções
  ui/hearth.js                    Hearth
  ui/screens.js                   início de partida, fim da noite, brasas e Trials
  ui/hints.js                     dicas da primeira partida
  ui/orientation.js               celular de lado (paisagem): trava de orientação e pausa com o aparelho em pé
  ui/buttons.js                   eventos dos botões e atalhos de teclado
  audio/sound-engine.js           efeitos sintetizados (Web Audio API), mixagem e volumes
  audio/music.js                  música procedural: clima por momento da noite
art_reference/                    imagens e fichas de referência dos personagens (não carregadas pelo jogo)
draft/                            versões anteriores mantidas como referência
```

- Para mudar **balanceamento**, edite apenas `data_model/`.
- Relíquia, herói ou melhoria com efeito simples não precisa de código: basta declarar `mods` (chaves em `js/systems/modifiers.js`).
- Todo estado que muda durante a partida fica em `js/core/state.js` (objeto `state`); os sistemas leem e escrevem nele.
- Novo CSS: crie o arquivo na pasta da funcionalidade e adicione um `@import` em `css/game.css`.
- Novo motor JS: crie o módulo em `js/systems/` (ou `render/`, `ui/`) e chame-o a partir de `js/game.js`.

## Controles

- **Desktop:** mova o mouse para direcionar o herói ou use `WASD`/setas para movimentar diretamente (ao usar o teclado, o mouse passa a servir só para mirar). Clique com o botão esquerdo no canvas para arremessar uma faca na direção do cursor; segure para repetir (recarga própria). `Espaço`, `Shift` ou o botão direito dão o dash. `Esc` ou `P` pausam. Nas cartas, `1`-`4` escolhem e `R` sorteia de novo. `Enter` recomeça.
- **Celular:** jogado **de lado (paisagem)**, com os dois polegares. Ao começar, o jogo entra em tela cheia e trava em paisagem (Android); onde não dá para travar (iOS), um aviso pede para virar o aparelho de lado e a partida fica pausada enquanto ele estiver em pé. O joystick (canto inferior esquerdo) move o herói. O botão menor, acima da adaga, dá o dash. O botão da adaga (canto inferior direito) mira enquanto está pressionado, com uma linha tracejada saindo do herói: sem arrastar mira no monstro mais perto; arrastando mira na direção do arraste. A adaga só é arremessada ao **soltar** o botão, uma vez, se a recarga (anel em volta do botão) já terminou. Tocar na tela não arremessa. Os ataques corpo a corpo são automáticos.

O jogo usa a mesma lógica e progressão em todas as telas; apenas a disposição da interface e o controle de movimento se adaptam ao dispositivo.

Como o jogo usa módulos ES, abra-o por um servidor HTTP local ou pelo site publicado, não diretamente via `file://`.
