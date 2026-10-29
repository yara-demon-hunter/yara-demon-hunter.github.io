# Last Torch: Demon Hunter

## Estrutura

```
last_torch.html   tela e elementos da interface
css/
  game.css                        ponto de entrada: só importa os arquivos abaixo
  base/base.css                   fonte, body e canvas
  components/hud.css              HUD responsivo, tudo no topo: cartão do herói (nível, vida, XP, Fúria, ouro), tocha/turno e botões
  components/shop.css             loja (scrollbar)
  components/joystick.css         controles de toque: joystick e botão da adaga (anel de recarga)
  components/orientation.css      aviso de virar o aparelho de lado (celular em pé)
data_model/                       DADOS do jogo (balanceamento), separados do motor
  character.js                    atributos e progressão do herói
  core.js                         vida, colisão e aparência do núcleo
  monsters.js                     monstros, chefão, aparição e recompensas
  skills.js                       upgrades, lâmina e Fúria (Frenzy Nova)
  passives.js                     skills passivas (compradas com pontos de skill, 1 por nível)
  gold.js                         ouro dropado pelos monstros (moedas que voam até o herói)
  world.js                        tamanho padronizado do mundo e zoom (areaScale) por perfil desktop/mobile
  visuals/                        cores, tamanhos e ritmos das animações (arte procedural)
    characters/hero_visual.js     personagens jogáveis
    monsters/                     monstros (bat_visual.js, witch_visual.js, skeleton_visual.js)
    scenery/                      cenário (forest_visual.js, torch_visual.js)
    items/gold_visual.js          itens dropados
    effects/slash_visual.js       efeitos (golpes)
    index.js                      reexporta tudo
js/
  game.js                         ponto de entrada: importa os motores e roda o game loop
  core/state.js                   estado compartilhado da partida (state, player, keys, canvas, audio)
  core/resize.js                  redimensionamento do canvas
  core/input.js                   mouse, toque e teclado
  systems/stats.js                fórmulas de atributos (dano, alcance, cooldown...)
  systems/player.js               movimentação e rastro do herói
  systems/combat.js               ataque automático, golpes da lâmina e Frenzy Nova
  systems/spawner.js              aparição de inimigos e chefão
  systems/enemies.js              IA, colisões, mortes/recompensas e projéteis inimigos
  systems/gold.js                 moedas de ouro dropadas: pulo, atração e coleta
  systems/progression.js          XP e level up
  systems/effects.js              partículas e screen shake
  render/renderer.js              ordem das camadas de desenho
  render/arena.js                 tocha (núcleo) e raio de alcance do herói
  render/forest.js                cenário: noite fria (chão, grama ao vento, névoa, vaga-lumes, luz da tocha que abre um círculo sem névoa)
  render/entities.js              inimigos, projéteis, golpes, moedas de ouro e partículas
  render/player.js                herói procedural (capa, capuz, máscara, espada) e rastro de sombra
  render/fx/random.js             aleatório com semente (cenário estável)
  render/fx/easing.js             funções de easing e interpolação de ângulos
  ui/hud.js                       atualização do HUD
  ui/shop.js                      loja de upgrades
  ui/passives.js                  skills passivas na loja
  ui/screens.js                   início de partida e game over
  ui/orientation.js               celular de lado (paisagem): trava de orientação e pausa com o aparelho em pé
  ui/buttons.js                   eventos dos botões
  audio/sound-engine.js           efeitos de áudio via Web Audio API
art_reference/                    imagens e fichas de referência dos personagens (não carregadas pelo jogo)
draft/                            versões anteriores mantidas como referência
```

- Para mudar **balanceamento**, edite apenas `data_model/`.
- Todo estado que muda durante a partida fica em `js/core/state.js` (objeto `state`); os sistemas leem e escrevem nele.
- Novo CSS: crie o arquivo na pasta da funcionalidade e adicione um `@import` em `css/game.css`.
- Novo motor JS: crie o módulo em `js/systems/` (ou `render/`, `ui/`) e chame-o a partir de `js/game.js`.

## Controles

- **Desktop:** mova o mouse para direcionar o herói ou use `WASD`/setas para movimentar diretamente. Clique com o botão esquerdo no canvas para arremessar uma faca na direção do cursor; segure para repetir (recarga própria).
- **Celular:** jogado **de lado (paisagem)**, com os dois polegares. Ao começar, o jogo entra em tela cheia e trava em paisagem (Android); onde não dá para travar (iOS), um aviso pede para virar o aparelho de lado e a partida fica pausada enquanto ele estiver em pé. O joystick (canto inferior esquerdo) move o herói. O botão da adaga (canto inferior direito) mira enquanto está pressionado, com uma linha tracejada saindo do herói: sem arrastar mira no monstro mais perto; arrastando mira na direção do arraste. A adaga só é arremessada ao **soltar** o botão, uma vez, se a recarga (anel em volta do botão) já terminou. Tocar na tela não arremessa. Os ataques corpo a corpo são automáticos.

O jogo usa a mesma lógica e progressão em todas as telas; apenas a disposição da interface e o controle de movimento se adaptam ao dispositivo.

Como o jogo usa módulos ES, abra-o por um servidor HTTP local ou pelo site publicado, não diretamente via `file://`.
