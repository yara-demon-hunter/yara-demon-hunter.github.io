# Last Torch: Demon Hunter

## Estrutura

```
last_torch.html   tela e elementos da interface
css/
  game.css                        ponto de entrada: só importa os arquivos abaixo
  base/base.css                   fonte, body e canvas
  components/hud.css              HUD responsivo, tudo no topo: cartão do herói (nível, vida, XP, Fúria, ouro), tocha/turno e botões
  components/shop.css             loja (scrollbar)
data_model/                       DADOS do jogo (balanceamento), separados do motor
  character.js                    atributos e progressão do herói
  core.js                         vida, colisão e aparência do núcleo
  monsters.js                     monstros, chefão, aparição e recompensas
  skills.js                       upgrades, lâmina e Fúria (Frenzy Nova)
  passives.js                     skills passivas (compradas com pontos de skill, 1 por nível)
  gold.js                         ouro dropado pelos monstros (moedas que voam até o herói)
  world.js                        tamanho padronizado do mundo e zoom (areaScale) por perfil desktop/mobile
  visuals.js                      cores, tamanhos e ritmos das animações (arte procedural)
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

- **Desktop:** mova o mouse para direcionar o herói ou use `WASD`/setas para movimentar diretamente.
- **Celular ou tablet:** toque na arena para mover o herói até o ponto escolhido; arraste o dedo para atualizar o destino enquanto se move. Os ataques são automáticos, sem joystick ou botões extras.

O jogo usa a mesma lógica e progressão em todas as telas; apenas a disposição da interface e o controle de movimento se adaptam ao dispositivo.

Como o jogo usa módulos ES, abra-o por um servidor HTTP local ou pelo site publicado, não diretamente via `file://`.
