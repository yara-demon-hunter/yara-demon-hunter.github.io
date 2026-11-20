# Gerar o jogo para portais (standalone + SDK)

O mesmo código do site vira um pacote limpo para portais. O **SDK de cada portal** (anúncios, pausa, métricas) fica fora do código do jogo: entra só quando o build pede uma plataforma.

## Comandos

```bash
# Pacote limpo (sem SDK), em standalone-build/
ruby mini_games/last_torch/build-standalone.rb

# Pacote de uma plataforma: platform-builds/NOME/ e platform-builds/NOME.zip (index.html na raiz do zip)
ruby mini_games/last_torch/build-standalone.rb --platform=gamemonetize

# Todas as plataformas de uma vez
ruby mini_games/last_torch/build-standalone.rb --platform=all

# Lista as plataformas
ruby mini_games/last_torch/build-standalone.rb --list

# Gerar e jogar (abre em http://localhost:8000; não abra o index.html direto do disco, ele trava no loading)
ruby mini_games/last_torch/build-standalone.rb --serve
ruby mini_games/last_torch/build-standalone.rb --platform=gamemonetize --serve
```

Precisa do comando `zip` para criar o `.zip`. As pastas `standalone-build/` e `platform-builds/` são geradas e ficam fora do git.

## Como o build monta o pacote

O build junta os ~290 módulos JS em `game.min.js` e o CSS em `css/game.css` com o **esbuild** (371 pedidos de rede viram 9; no 4G lento o carregamento caiu de 6,9 s para 4,0 s). Não precisa instalar nada: na primeira vez o script baixa o esbuild (versão fixa) para `~/.cache/last_torch/` e reaproveita depois. Se a rede falhar, ele avisa e gera o pacote com módulos soltos (mais lento); confira que `game.min.js` existe antes de enviar. `ESBUILD=/caminho` usa outro binário e `NO_BUNDLE=1` força os módulos soltos (bom para depurar). Em desenvolvimento o site continua usando os módulos soltos.

O pacote leva só as imagens `-small` (as versões de 1024px ficam para páginas e prévias) e lista todos os módulos em `modulepreload`. O build **recusa qualquer link `https://`** que sobrar no pacote (portais não aceitam); a única exceção são os endereços do SDK da plataforma escolhida (`hosts` em `platforms.yml`).

## Como o SDK entra (camada de plataforma)

```
platforms.yml                  a lista de plataformas: id do jogo, SDK, tamanho, endereços permitidos
js/platform/platform.js        a única coisa que o jogo conhece: platform.init, loadingDone, gameplayStart/Stop,
                               onPause/onResume, showInterstitial
js/platform/adapters/NOME.js   um adaptador por portal, traduz a interface para o SDK dele (none = não faz nada)
```

1. O build grava `window.PLATFORM_NAME = "gamemonetize"` e o `<script>` do SDK (do campo `head` de `platforms.yml`) no fim do `<head>` do `index.html`.
2. `platform.js` lê `PLATFORM_NAME` e usa o adaptador certo. Sem ele (o site, o pacote limpo) vale `none`: nada acontece.
3. O jogo nunca cita um portal: só chama `platform.*`.

### Onde o jogo chama a plataforma

| Momento | Chamada | Arquivo |
|---|---|---|
| Jogo pronto (carregamento acabou) | `init()`, `loadingDone()` | `js/ui/screens.js` |
| Noite começa (PLAY, CONTINUE, primeira visita) | `gameplayStart()` | `startGame` em `js/ui/screens.js` |
| Noite acaba, volta ao menu | `gameplayStop()` | `triggerGameOver`, `returnToMenu` |
| Continua na noite sem fim | `gameplayStart()` | `keepHunting` |
| O portal pede pausa (anúncio abrindo) | `onPause` / `onResume` | `js/ui/buttons.js`: pausa a caçada e cala o som |
| **HUNT AGAIN** depois de uma derrota | `showInterstitial()` | `startAfterNight` em `js/ui/buttons.js` |
| **MENU** depois de uma derrota ou do amanhecer | `showInterstitial()` | `btnMenu` em `js/ui/buttons.js`, `onMenu` em `js/ui/screens.js` |

**Regras dos anúncios:** só entre uma noite e outra, por ação do jogador (HUNT AGAIN ou MENU no fim da noite), nunca durante a caçada nem por temporizador. Há um intervalo mínimo de 2 minutos entre anúncios, e o primeiro só depois de 2 minutos de jogo (`AD_GAP_MS` em `platform.js`). Se o anúncio falhar ou não existir, o jogo segue normalmente.

## Plataformas

### GameMonetize (`--platform=gamemonetize`)
- Game ID e tamanho (800x600) em `platforms.yml`. O SDK é `https://api.gamemonetize.com/sdk.js` e o `SDK_OPTIONS.onEvent` do build repete cada evento como o evento de janela `platform:event`.
- `SDK_GAME_PAUSE` pausa e cala o jogo; `SDK_GAME_START` religa o som (o jogador retoma sozinho). `SDK_READY` não precisa de ação.
- O anúncio é `sdk.showBanner()`: o adaptador espera o `PAUSE` (anúncio abriu) e o `START` (anúncio acabou). Sem `PAUSE` em 4 s, considera que não havia anúncio.
- Envie `platform-builds/gamemonetize.zip` no painel deles. Para ativar o jogo é preciso **ver um anúncio completo dentro do iframe da página de upload** (botão "Verify Game"): é um passo manual.
- Regras do portal: sem botão flutuante de "More Games", sem iframe de outro site, sem anúncio por temporizador; a descrição precisa listar modos, personagens e ondas.

### CrazyGames (`--platform=crazygames`)
- Adaptador pronto mas **ainda não testado no portal** (SDK v3: `init`, `gameplayStart/Stop`, `requestAd('midgame')`). Confira com a documentação deles antes de enviar.

## Adicionar uma plataforma nova

1. Crie `js/platform/adapters/NOME.js` com `init({ pause, resume })`, `loadingDone`, `gameplayStart`, `gameplayStop` e `showInterstitial` (devolve uma Promise com `true` se um anúncio rodou). Use `none.js` como modelo.
2. Registre o adaptador no objeto `ADAPTERS` de `js/platform/platform.js`.
3. Acrescente a plataforma em `platforms.yml` (`head` com o SDK, `hosts`, `game_id`, `size`).
4. `ruby mini_games/last_torch/build-standalone.rb --platform=NOME`.

## Para testar um anúncio sem o portal

Abra o jogo com um SDK falso: defina `window.PLATFORM_NAME` e `window.sdk.showBanner` (que dispara `platform:event` com `SDK_GAME_PAUSE` e, depois, `SDK_GAME_START`). Lembre que o primeiro anúncio só sai depois de `AD_GAP_MS`.

**Anúncio com recompensa:** a documentação do GameMonetize (README do SDK no GitHub, lida em nov/2026) só traz `sdk.showBanner()` e três eventos (`SDK_GAME_PAUSE`, `SDK_GAME_START`, `SDK_READY`): não há anúncio com recompensa nem aviso de "assistiu até o fim". Por isso o jogo não oferece "assista para ganhar Brasas" nessa plataforma. Para saber se existe, pergunte em info@gamemonetize.com.
