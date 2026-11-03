# Push & Smash - Battle Arena

Battle arena local de 2 jogadores (ou 1 contra o bot): empurre, quique nas paredes e amasse o rival caindo na cabeça dele. Melhor de 5 rounds de 60 segundos: ganha o round quem der K.O. no rival ou tiver mais moedas no fim do tempo, e quem vencer 3 leva a partida. Entre os rounds não há loja nem menu: o próximo começa direto. No fim da partida o jogo volta à tela inicial.

## Onde mexer

Tudo o que é número, texto ou som do jogo fica em `data_model/`. Para testar ou balancear, edite lá e recarregue a página; o código em `js/` só lê esses arquivos.

| Arquivo | O que controla |
| --- | --- |
| `physics.js` | Gravidade, atrito (chão e ar), velocidades máximas, corrida, pulo, dash, smash (pound), massa |
| `bounce.js` | Elasticidade: restituição e impulso extra no chão, paredes, rival e cabeça; cadeia de quiques (x2, x3, x4) |
| `combat.js` | Força das batidas, hit stop, tremor de câmera, smash (atordoamento e perda de massa), K.O. e replay |
| `match.js` | Rounds e tempos, arena (paredes e plataforma), moedas e itens que caem, bomba quente |
| `bot.js` | Comportamento do bot (chances de pular e dar dash, distâncias) |
| `controls.js` | Teclas, joystick, valores padrão das configurações |
| `players.js` | Nome e cor dos lutadores |
| `audio.js` | Efeitos sonoros e a música (notas e andamento) |
| `texts.js` | Todos os textos (para traduzir) |

Unidades: pixels e frames (60 passos por segundo).

## Regras da física

- **Cada eixo é independente.** Bater no chão só muda a velocidade vertical; bater na parede só a horizontal. Um ganho num eixo nunca vira ganho no outro.
- **Quique:** a velocidade que volta é `entrada × restituição`. Segurando o direcional no sentido do quique, soma um impulso extra, que cresce a cada batida seguida no mesmo eixo (cadeia X para paredes, cadeia Y para chão e cabeça).
- **Entre as bolas:** o choque é elástico ao longo da linha entre os centros, e quem ataca (dash, item KNOCKBACK, massa) dá um chute extra nessa mesma linha.
- **No ar** o atrito é menor que no chão (o embalo dura mais) e o controle é reduzido.

## Estrutura

```
push_smash_battle_arena.html   página (HTML)
css/game.css                   estilos
data_model/                    números, textos e sons (veja acima)
js/
  game.js                      ponto de entrada e game loop (passo fixo de 60 fps)
  core/                        estado compartilhado, canvas, arena, entrada de teclado, configurações
  entities/player.js           o lutador (movimento, quiques, dash, smash) e o bot
  systems/                     batidas, massa no chão, bomba, itens, fim de round, replay, efeitos
  render/                      desenho da arena, dos lutadores e dos efeitos
  ui/                          HUD, menu, painel de configurações, joysticks de toque
  audio/                       sons e música sintetizados
```

O estado mutável da partida fica em `js/core/state.js` (um `import` não reatribui variável, então tudo passa por `state`).

## Testar

O jogo usa módulos ES, então precisa de um servidor (não abre direto pelo arquivo):

```bash
python3 -m http.server 8000 --directory mini_games/push_smash_battle_arena
```

Depois abra `http://localhost:8000/push_smash_battle_arena.html`.
