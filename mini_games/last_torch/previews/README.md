# Prévias

Páginas de desenvolvimento para analisar a arte com o código real do jogo. O jogo não as carrega.

| Arquivo | O que mostra |
|---|---|
| `index.html` | Página inicial: um botão para cada prévia abaixo |
| `monsters_preview.html` | Todos os monstros e bosses: quatro direções, levando dano e no tamanho do jogo |
| `weapon_previews.html` | A adaga e a espada em detalhe, com as partes legendadas, e as formas de cada uma (carga, bola de fogo, Fúria, Flaming Sword, Juramentos e heróis) |
| `characters_preview.html` | Escolha o personagem pela foto no topo (Demon Hunter ou Azael; `?hero=hunter` / `?hero=azael`) e a página mostra só ele. Tudo do personagem: corrida, poses, golpes, dash, efeitos, as variações dele (o Demon Hunter tem as versões de cor), o Shadow Clone, as formas dos Juramentos, os golpes especiais quadro a quadro, as skills dos quatro ramos, a fênix do Phoenix Pact (voo, bolas de fogo, morte, renascimento e a batida de asa quadro a quadro), o corvo do Shadow Raven, a corrente do Shadow Shackle e o arremesso da adaga |

## Como abrir

As páginas usam módulos ES, e o navegador os bloqueia em arquivos abertos direto do disco: dando dois cliques, aparece só um aviso. É preciso um servidor local.

1. No terminal, entre na pasta do jogo (**não** na pasta `previews`) e suba o servidor:

   ```bash
   cd mini_games/last_torch
   python3 previews/serve.py
   ```

   (é o `http.server` do Python, mas sem cache: com o comum, depois de mudar o código o navegador mistura arquivos velhos e novos e a página fica preta. Se usar `python3 -m http.server 8000`, recarregue com Ctrl+Shift+R.)

   ```bash
   # alternativa, com cache:
   python3 -m http.server 8000
   ```

2. No navegador, abra a página inicial
   ```bash
   http://localhost:8000/previews/
   ```
3. Para parar o servidor, volte ao terminal e aperte `Ctrl+C`.

Se a porta 8000 estiver ocupada, troque o número nos dois lugares (por exemplo, `python3 -m http.server 8001` e `localhost:8001`).

## Gerar as animações da página do jogo

`characters_preview.html` tem um modo captura que desenha só uma cena, em um quadrado, para gerar os `.webp` de
`assets/images/common/mini-game/last_torch/`:

```
characters_preview.html?capture=<rótulo da cena>&size=400&zoom=3&lift=12&hero=hunter
```

O rótulo é o texto que aparece embaixo da cena na prévia (por exemplo `Earthbreaker: salto` ou `Oath of Ruin: golpe`).
Os clipes atuais têm 200x200, 24 quadros e duração de um ciclo da cena.

## Pelo Jekyll

Com o site rodando pelo Jekyll (`bundle exec jekyll serve`, na raiz do repositório), as páginas ficam em:

- <http://localhost:4000/mini_games/last_torch/previews/monsters_preview.html>
- <http://localhost:4000/mini_games/last_torch/previews/characters_preview.html>
- <http://localhost:4000/mini_games/last_torch/previews/weapon_previews.html>

O `last_torch.html` (o jogo) só funciona pelo Jekyll, porque usa um include do site. As prévias funcionam nos dois.
