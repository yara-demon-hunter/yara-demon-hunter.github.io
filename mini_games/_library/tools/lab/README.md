# Laboratório (testes de arte, fora dos jogos)

Experimentos que **não fazem parte** do projeto: ficam em `_library/tools/` (o Jekyll não publica e o `sync.rb` não copia para os jogos), então nada aqui
afeta o Last Torch nem o yara-rpg.

| Arquivo | O que é |
|---|---|
| `demon_hunter3_foto.html` e `.js` | O **Demon Hunter 3**, 2,5D para a câmera do jogo (de cima, ~56°): mesma técnica do Golem (PBR por ruído, capa que ondula, luz de noite, bloom), com proporções de silhueta (capuz e ombros grandes, pernas curtas). A prévia no canto mostra o tamanho real no jogo (64, 96, 128 px). Parado, correndo e golpe. Grava o atlas |
| `bake_demon_hunter3.py` | Grava o atlas do Demon Hunter 3 em `exemplos/demon_hunter3_atlas.webp` (8 direções x parado + andar + golpe); servidor na porta 18900 |
| `demon_hunter2_foto.html` e `.js` | O **Demon Hunter 2**: 3D de corpo inteiro, 100% procedural na técnica do Golem (texturas PBR por ruído, relevo, capa que ondula, luz de noite, AO, bloom). Parado, correndo e golpe de espada. Primeira versão, ainda em ajuste. Referência: `characters/hunter/art_reference/` |
| `bake_demon_hunter2.py` | Grava o atlas do Demon Hunter 2 em `exemplos/demon_hunter2_atlas.webp` (8 direções x parado + andar + golpe); servidor na porta 18900 |
| `demon_hunter_pintado.html` e `.js` | O retrato pintado recortado em camadas e animado em 2D (capa em faixas, capuz, respiração, luz). Só da cintura para cima e de um ângulo; não é 3D |
| `bake_demon_hunter_partes.py` | Recorta o retrato em `demon_hunter/base.webp`, `head.webp` e `parts.json` (precisa de Pillow) |
| `demon_hunter_glb.html` e `.js` | Visualizador de modelo 3D `.glb` gerado fora (ex.: IA de imagem para 3D): luz de noite, animação e gravação de atlas com `bake_demon_hunter_glb.py`. Arraste o .glb para a página |
| [metodologia_fotorrealismo.md](metodologia_fotorrealismo.md) | A metodologia das 7 técnicas, o mapa de como o teste aplica cada uma e o que ficou de fora |
| `monstro_foto.html` e `monstro_foto.js` | O teste: o **Golem de Brasa e Musgo**, um monstro novo, 100% procedural, em WebGL |
| `fenix_foto.html` e `fenix_foto.js` | A **Fênix de fogo** (Flaming Phoenix) em 3D: asas abertas batendo, a ave inteira em chamas, laranja ou azul (Blue Torch). Penas PBR, chamas sem estado, bloom. Já está no jogo |
| `bake_fenix.py` | Grava os atlas da fênix (`fenix_fogo_atlas.webp`, `fenix_azul_atlas.webp`) em `buddies/hearth_phoenix/`; abre a página com `?bake=1` (servidor na porta 18900) |
| `arvore_foto.html` e `arvore_foto.js` | A **Árvore Ancestral** (Ancient Grove, skill do druida) em 3D: tronco com rosto-runa, copa de folhas instanciadas, duas raízes-pernas que andam, galhos-braços que balançam e chicoteiam; modos Andando, Atacando e Parada. Ainda não está no jogo |
| `bake_arvore.py` | Grava o atlas (`exemplos/arvore_ancestral_atlas.webp`): 5 ângulos (frente, frente-lado, lado, costas-lado, costas) x 12 quadros de andar + 10 de ataque; abre a página com `?bake=1` (servidor na porta 18900) |
| `index.html` | A tela de escolha: um cartão por monstro do laboratório |
| `treant_foto.html` e `treant_foto.js` | O **Treant** (árvore andante), 100% procedural, numa floresta escura de **noite** (luar, vagalumes, névoa). Rosto simpático de propósito |
| `treant_esguio.html` e `treant_esguio.js` | **Treant esguio**: a versão alternativa, remodelada como árvore fina e alta. Guardada; o sprite pronto está em `exemplos/treant_esguio_atlas.webp` (para usar, copie por cima de `buddies/treant/treant_atlas.webp` e ponha `spriteScale` 7,1, `spriteFeet` 0,27, `shadowRadius` 0,1, `spriteUnits` 36 em `treant25d_visual.js`) |
| `bake_golem.py` e `bake_treant.py` (rascunho) | Gravam os sprites (`golem_atlas.webp`, `treant_atlas.webp`) para o jogo; abrem a página com `?bake=1` |
| `vendor/three/` | Three.js 0.160.0 e os módulos usados (MIT), para funcionar sem internet |

## Como abrir

Na pasta `mini_games`:

```bash
python3 -m http.server 8010
```

e abra `http://localhost:8010/_library/tools/lab/` (a tela de escolha; ou direto `monstro_foto.html` / `treant_foto.html`) (ou pelo cartão "Laboratório" da página inicial do Ateliê:
`http://localhost:8010/_library/tools/`). Abrir o arquivo direto do disco não funciona (o navegador bloqueia módulos).

Precisa de um navegador com WebGL2. Arraste para girar, role para aproximar. O painel liga e desliga cada técnica; o seletor **Qualidade** muda a
resolução de renderização (use em celular fraco).

## Regras do laboratório

- Nada aqui importa de fora de `tools/lab/` e nada fora daqui importa daqui.
- Se uma técnica for adotada, ela vira trabalho de verdade na biblioteca (com `art_reference/` e sync); o laboratório continua só como teste.
