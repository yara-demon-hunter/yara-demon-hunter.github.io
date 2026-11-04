# Wild Push & Smash

Battle arena local de 2 jogadores (ou 1 contra o bot): empurre, quique nas paredes e amasse o rival caindo na cabeça dele. Na tela inicial cada jogador escolhe o bicho num carrossel (setas, ou A/D e ←/→) e, embaixo, a arena. Cada lutador tem 3 corações por round: cada SMASH sofrido tira um, e quem perde os 3 (ou cai da arena) toma K.O. Melhor de 5 rounds de 60 segundos: ganha o round quem der K.O. no rival ou tiver mais corações no fim do tempo, e quem vencer 3 leva a partida. Não caem itens nem moedas, e ninguém perde massa: o tamanho de cada bicho é fixo.

**SKY DROP:** pisar na cabeça do rival lança você como um foguete (chamas, fumaça e ronco) para fora da tela, por cima. Lá em cima só aparece uma mira no chão, que acompanha você quando anda pros lados (acende quando o rival está embaixo, fica vermelha onde não há chão), enquanto toca um assobio de bomba caindo. Depois de 5 s você cai sozinho; ▼ solta na hora. A queda é em linha reta: acertou o rival é SMASH (tira um coração), errou fica preso no chão um instante. Quem leva um smash fica atordoado ~2,5 s: nesse tempo não toma dano, mas dá para pular na cabeça dele e lançar outro SKY DROP (soltar antes de ele se recuperar não machuca; o jogo é esperar e soltar antes que ele fuja). O quique automático logo depois do smash não conta como pisão: tem que pousar e pular de novo. Entre os rounds não há loja nem menu: o próximo começa direto. No fim da partida o jogo volta à tela inicial.

## Onde mexer

Tudo o que é número, texto ou som do jogo fica em `data_model/`. Para testar ou balancear, edite lá e recarregue a página; o código em `js/` só lê esses arquivos.

| Arquivo | O que controla |
| --- | --- |
| `physics.js` | Gravidade, atrito (chão e ar), velocidades máximas, corrida, pulo, dash, smash (pound) |
| `bounce.js` | Elasticidade: restituição e impulso extra no chão, paredes, rival e cabeça; cadeia de quiques (x2, x3, x4) |
| `combat.js` | Força das batidas, hit stop, tremor de câmera, smash (atordoamento), SKY DROP (altura, tempo no ar, velocidade da mira), K.O. e replay |
| `match.js` | Rounds e tempos, corações por round, arena (paredes e plataforma) |
| `characters.js` | Elenco: massa, velocidade, pulo e habilidade exclusiva de dash de cada bicho; passivos extras (o corvo plana segurando ▲ no ar: `glide`) |
| `stages.js` | Arenas (Night Forest, Desert, Snow Peak) e o atrito do chão de cada uma (a neve escorrega) |
| `bot.js` | Comportamento do bot (chances de pular e dar dash, distâncias) |
| `controls.js` | Teclas, layout das teclas desenhadas no rodapé, joystick, valores padrão das configurações |
| `players.js` | Nome e cor dos lutadores |
| `audio.js` | Efeitos sonoros (inclui o foguete e o assobio do SKY DROP) e a música (notas e andamento) |
| `texts.js` | Todos os textos (para traduzir) |
| `visuals/characters.js` | Arte de cada bicho: cores, orelhas, cauda, focinho, braços, olhos |
| `visuals/sprites.js` | Atlas dos lutadores, efeitos (tamanhos e tempos) e a mira do SKY DROP |
| `visuals/arena.js` | Visual de cada arena: céu, sol/lua, morros, cactos/pinheiros, plataforma, paredes, partículas do ar |

Unidades: pixels e frames (60 passos por segundo).

## Regras da física

- **Cada eixo é independente.** Bater no chão só muda a velocidade vertical; bater na parede só a horizontal. Um ganho num eixo nunca vira ganho no outro.
- **Quique:** a velocidade que volta é `entrada × restituição`. Segurando o direcional no sentido do quique, soma um impulso extra, que cresce a cada batida seguida no mesmo eixo (cadeia X para paredes e rival, cadeia Y para o chão).
- **Entre as bolas:** o choque é resolvido ao longo da linha entre os centros. O impulso é aplicado igual e em sentidos opostos; por isso, com a mesma colisão, o personagem mais pesado muda menos de velocidade.
- **Momento e aceleração:** a força de corrida é dividida pela massa, e a velocidade acumulada vira momento (`massa × velocidade`). Um dash transfere parte do momento que o atacante já tem, sem criar empurrões independentes para cada lutador.
- **No ar** o atrito é menor que no chão (o embalo dura mais) e o controle é reduzido.
- **Planar (corvo):** segurando ▲ no ar depois que começa a cair, a queda é freada até `glide.fallSpeed` e o controle lateral aumenta (`glide.airControl`). Encostado na parede ou no dash não plana.
- **Dash:** cada personagem tem uma habilidade própria, com velocidade efetiva (`dash.speed`), duração e recarga individuais, independentes da massa e da velocidade de corrida. A massa continua contando no momento do dash e nas colisões; alguns também saltam, causam mais impacto, resistem a empurrões ou deslizam melhor. O seletor mostra o efeito de cada dash.

## Como a arte é desenhada

Mesma ideia do last_torch: a arte é procedural, mas **desenhada uma vez** e depois só carimbada.

- Os lutadores (`render/character_art.js`) rodam uma vez por quadro de animação, no tamanho de cada bicho, (idle, corrida, pulo, dash, smash, tontura, provocação, medo) e vão para um atlas. Em campo, cada um custa 1 `drawImage`, esticado e achatado por escala. Só as pupilas são desenhadas ao vivo, para seguir o movimento. Só os dois bichos da partida ficam na memória; no menu o carrossel desenha ao vivo.
- Novo bicho: uma linha em `data_model/characters.js` e a arte em `data_model/visuals/characters.js` (combinando orelhas, cauda e focinho que já existem, ou criando um tipo novo em `character_art.js`).
- Cenário (fundo, plataforma em 3 partes que acompanha o encolhimento, paredes), brilhos, estrelas de impacto e poeira também são sprites. Sem `shadowBlur` nem gradientes novos por quadro.
- Os efeitos de impacto (estrela, onda de choque, poeira) ficam em `systems/effects.js`.

## Estrutura

```
wild-push-smash.html           página (HTML)
css/game.css                   estilos
data_model/                    números, textos e sons (veja acima)
js/
  game.js                      ponto de entrada e game loop (passo fixo de 60 fps)
  core/                        estado compartilhado, canvas, arena, entrada de teclado, configurações
  entities/player.js           o lutador (movimento, quiques, dash, smash) e o bot
  systems/                     batidas, smash (corações) e SKY DROP, fim de round, replay, efeitos
  render/                      desenho: arte procedural dos lutadores (character_art), atlas (character_sprites),
                               cenário (scenery), sprites pequenos (fx/sprites) e o desenho de cada quadro
  ui/                          HUD (corações e rounds), menu, escolha de personagem e arena (character_select), painel de configurações, joysticks de toque,
                               teclas desenhadas no rodapé do computador (controls_hint)
  audio/                       sons e música sintetizados
```

O estado mutável da partida fica em `js/core/state.js` (um `import` não reatribui variável, então tudo passa por `state`).

## Testar

O jogo usa módulos ES, então precisa de um servidor (não abre direto pelo arquivo):

```bash
python3 -m http.server 8000 --directory mini_games/wild-push-smash
```

Depois abra `http://localhost:8000/wild-push-smash.html`.
