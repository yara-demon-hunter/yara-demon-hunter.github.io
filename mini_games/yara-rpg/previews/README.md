# Prévias

Páginas de desenvolvimento para analisar a arte do palco 2.5D com o código real do jogo. O jogo não as carrega.

| Arquivo | O que mostra |
|---|---|
| `index.html` | Página inicial: um botão para cada prévia abaixo |
| `characters_preview.html` | Escolha o personagem pela foto no topo (`?char=<id de js/data/characters.js>`, ex.: `?char=mysterious-creature`) e a página mostra só ele, com a câmera do palco: rosto de perto, parado, andando, Fúria pronta, no tamanho do jogo, os golpes do combo, giro, golpe pesado, grito da Fúria, dash, aparo, poção, descanso, dano, derrota, fuga, as oito direções (vista de cima, câmera do Last Torch) e girando |
| `stage_preview.html` | O palco do jogo (`js/stage/stage.js`) com um estado de mentira: personagem, região, monstro, pet, nível, Fúria, baú, presença e derrota, mais o resultado do turno (acerta, crítico, atordoa, erra, mata; o monstro revida, é aparado ou erra). Cada botão chama `stage.play(ação, relatório)`, como `js/stage/hooks.js` faz no jogo |

O boneco do Azael (Mysterious Creature) é a mesma arte do Last Torch: ao mudar o desenho em
`js/stage/azael25d.js`, copie para `mini_games/last_torch/js/render/azael25d.js` (e vice-versa).

## Como abrir

1. No terminal, entre na pasta do jogo (**não** na pasta `previews`) e suba o servidor:

   ```bash
   cd mini_games/yara-rpg
   python3 -m http.server 8000
   ```

2. No navegador, abra a página inicial:

   ```
   http://localhost:8000/previews/
   ```

3. Para parar o servidor, volte ao terminal e aperte `Ctrl+C`.

Se a porta 8000 estiver ocupada, troque o número nos dois lugares (por exemplo, `python3 -m http.server 8001` e `localhost:8001`).

As prévias usam scripts clássicos (sem módulos), então também abrem direto do disco com dois cliques. O servidor
continua sendo o caminho mais seguro: alguns navegadores bloqueiam imagens em `file://`.

## Pelo Jekyll

Com o site rodando pelo Jekyll (`bundle exec jekyll serve`, na raiz do repositório):

- <http://localhost:4000/mini_games/yara-rpg/previews/>
