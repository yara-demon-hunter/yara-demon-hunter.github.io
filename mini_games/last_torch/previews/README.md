# Prévias

Páginas de desenvolvimento para analisar a arte com o código real do jogo. O jogo não as carrega.

| Arquivo | O que mostra |
|---|---|
| `monsters_preview.html` | Todos os monstros e bosses: quatro direções, levando dano e no tamanho do jogo |
| `demon_hunter_preview.html` | Tudo do herói: corrida, poses, golpes, dash, efeitos, os heróis alternativos, o Shadow Clone, as formas dos Juramentos, os golpes especiais quadro a quadro, as skills dos quatro ramos e a adaga |

## Como abrir

As páginas usam módulos ES, e o navegador os bloqueia em arquivos abertos direto do disco: dando dois cliques, aparece só um aviso. É preciso um servidor local.

1. No terminal, entre na pasta do jogo (**não** na pasta `previews`) e suba o servidor:

   ```bash
   cd mini_games/last_torch
   python3 -m http.server 8000
   ```

2. No navegador, abra:

   - <http://localhost:8000/previews/monsters_preview.html>
   - <http://localhost:8000/previews/demon_hunter_preview.html>

3. Para parar o servidor, volte ao terminal e aperte `Ctrl+C`.

Se a porta 8000 estiver ocupada, troque o número nos dois lugares (por exemplo, `python3 -m http.server 8001` e `localhost:8001`).

## Pelo Jekyll

Com o site rodando pelo Jekyll (`bundle exec jekyll serve`, na raiz do repositório), as páginas ficam em:

- <http://localhost:4000/mini_games/last_torch/previews/monsters_preview.html>
- <http://localhost:4000/mini_games/last_torch/previews/demon_hunter_preview.html>

O `last_torch.html` (o jogo) só funciona pelo Jekyll, porque usa um include do site. As prévias funcionam nos dois.
