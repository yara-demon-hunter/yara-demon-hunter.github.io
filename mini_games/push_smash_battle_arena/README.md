# Push & Smash - Battle Arena

Battle arena local de 2 jogadores (ou 1 contra o bot): empurre, quique nas paredes e amasse o rival caindo na cabeça dele. Na tela inicial cada jogador escolhe o bicho num carrossel (setas, ou A/D e ←/→) e, embaixo, a arena. Melhor de 5 rounds de 60 segundos: ganha o round quem der K.O. no rival ou tiver mais moedas no fim do tempo, e quem vencer 3 leva a partida. Entre os rounds não há loja nem menu: o próximo começa direto. No fim da partida o jogo volta à tela inicial.

## Onde mexer

Tudo o que é número, texto ou som do jogo fica em `data_model/`. Para testar ou balancear, edite lá e recarregue a página; o código em `js/` só lê esses arquivos.

| Arquivo | O que controla |
| --- | --- |
| `physics.js` | Gravidade, atrito (chão e ar), velocidades máximas, corrida, pulo, dash, smash (pound), massa |
| `bounce.js` | Elasticidade: restituição e impulso extra no chão, paredes, rival e cabeça; cadeia de quiques (x2, x3, x4) |
| `combat.js` | Força das batidas, hit stop, tremor de câmera, smash (atordoamento e perda de massa), K.O. e replay |
| `match.js` | Rounds e tempos, arena (paredes e plataforma), moedas e itens que caem, bomba quente |
| `characters.js` | Elenco: massa, velocidade e pulo de cada bicho (raposa, gato, cachorro, rato, elefante, coelho, porco, pinguim, sapo) |
| `stages.js` | Arenas (Night Forest, Desert, Snow Peak) e o atrito do chão de cada uma (a neve escorrega) |
| `bot.js` | Comportamento do bot (chances de pular e dar dash, distâncias) |
| `controls.js` | Teclas, joystick, valores padrão das configurações |
| `players.js` | Nome e cor dos lutadores |
| `audio.js` | Efeitos sonoros e a música (notas e andamento) |
| `texts.js` | Todos os textos (para traduzir) |
| `visuals/characters.js` | Arte de cada bicho: cores, orelhas, cauda, focinho, braços, olhos |
| `visuals/sprites.js` | Atlas dos lutadores, moedas, itens, massa e efeitos (tamanhos e tempos) |
| `visuals/arena.js` | Visual de cada arena: céu, sol/lua, morros, cactos/pinheiros, plataforma, paredes, partículas do ar |

Unidades: pixels e frames (60 passos por segundo).

## Regras da física

- **Cada eixo é independente.** Bater no chão só muda a velocidade vertical; bater na parede só a horizontal. Um ganho num eixo nunca vira ganho no outro.
- **Quique:** a velocidade que volta é `entrada × restituição`. Segurando o direcional no sentido do quique, soma um impulso extra, que cresce a cada batida seguida no mesmo eixo (cadeia X para paredes, cadeia Y para chão e cabeça).
- **Entre as bolas:** o choque é elástico ao longo da linha entre os centros, e quem ataca (dash, item KNOCKBACK, massa) dá um chute extra nessa mesma linha.
- **No ar** o atrito é menor que no chão (o embalo dura mais) e o controle é reduzido.

## Como a arte é desenhada

Mesma ideia do last_torch: a arte é procedural, mas **desenhada uma vez** e depois só carimbada.

- Os lutadores (`render/character_art.js`) rodam uma vez por quadro de animação, no tamanho de cada bicho, (idle, corrida, pulo, dash, smash, tontura, provocação, medo) e vão para um atlas. Em campo, cada um custa 1 `drawImage`, esticado e achatado por escala. Só as pupilas são desenhadas ao vivo, para seguir o movimento. Só os dois bichos da partida ficam na memória; no menu o carrossel desenha ao vivo.
- Novo bicho: uma linha em `data_model/characters.js` e a arte em `data_model/visuals/characters.js` (combinando orelhas, cauda e focinho que já existem, ou criando um tipo novo em `character_art.js`).
- Cenário (fundo, plataforma em 3 partes que acompanha o encolhimento, paredes), moedas girando, itens, massa, brilhos, estrelas de impacto e poeira também são sprites. Sem `shadowBlur` nem gradientes novos por quadro.
- Os efeitos de impacto (estrela, onda de choque, poeira) ficam em `systems/effects.js`.

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
  render/                      desenho: arte procedural dos lutadores (character_art), atlas (character_sprites),
                               cenário (scenery), sprites pequenos (fx/sprites) e o desenho de cada quadro
  ui/                          HUD, menu, escolha de personagem e arena (character_select), painel de configurações, joysticks de toque
  audio/                       sons e música sintetizados
```

O estado mutável da partida fica em `js/core/state.js` (um `import` não reatribui variável, então tudo passa por `state`).

## Testar

O jogo usa módulos ES, então precisa de um servidor (não abre direto pelo arquivo):

```bash
python3 -m http.server 8000 --directory mini_games/push_smash_battle_arena
```

Depois abra `http://localhost:8000/push_smash_battle_arena.html`.
