# Plano: Melhoria da Arte Visual (código puro)

Orientações para o agente de IA que for executar este plano. Leia o arquivo inteiro antes de começar.

## Objetivo

Melhorar o visual do jogo **sem usar imagens, sprites ou arquivos externos**. Tudo deve ser desenhado proceduralmente com Canvas 2D (`ctx`), matemática e CSS.

## Regras obrigatórias

1. **Proibido:** imagens (`.png`, `.svg` externos, `new Image()`), spritesheets, bibliotecas de terceiros (Pixi, Three, etc.).
2. **Não alterar a lógica do jogo** (dano, colisão, spawn, progressão). O trabalho é só visual, em `js/render/` e nos novos arquivos citados abaixo. Exceção: hit stop (etapa 2) precisa de um ajuste mínimo no `dt` em `js/game.js`.
3. **Dados visuais ficam em `data_model/visuals/` (um arquivo `<nome>_visual.js` por personagem/efeito)** (cores, tamanhos de glow, formas, durações de efeitos). Os renderizadores não devem ter cores ou números mágicos hardcoded: importe do arquivo `*_visual.js` correspondente. Mesmo princípio dos outros arquivos de `data_model/`: separar dados do motor.
4. **Estado de efeitos** (ondas de choque, números de dano, hit flash) vai em `js/core/state.js` dentro do objeto `state`, e precisa ser resetado em `startGame()` (`js/ui/screens.js`).
5. **Desempenho:** o jogo roda em celular. Evite `shadowBlur` dentro de loops (é caro); prefira glow em cache (etapa 1). Limite de partículas ativas.
6. **Siga o estilo do código existente:** módulos ES, comentários curtos em português no formato `// --- TÍTULO ---`, funções `export function renderX()`.
7. Não mexa na pasta `draft/`.
8. Ao terminar cada etapa, atualize o `README.md` (seção Estrutura) com os arquivos novos.

## Estrutura de arquivos a criar

```
data_model/visuals/          paleta, glows, formas e durações (DADOS)
js/render/fx/
  glow.js                    cache de sprites de brilho em canvas offscreen
  easing.js                  funções de easing (easeOutQuad, easeOutBack, ...)
  shapes.js                  desenho de polígonos, estrelas, losangos, Path2D
  shockwaves.js              ondas de choque (criar, atualizar, desenhar)
  damage-numbers.js          números de dano flutuantes
```

Os renderizadores existentes (`render/arena.js`, `render/entities.js`, `render/player.js`) passam a usar esses utilitários. A ordem das camadas continua definida em `render/renderer.js`.

## Etapas (executar em ordem, uma por vez)

### Etapa 1: Iluminação neon e desempenho
- Criar `data_model/visuals/*_visual.js` com a paleta atual extraída dos renderizadores (cores do herói, núcleo, inimigos, golpes, projéteis, power-ups).
- Criar `fx/glow.js`: gera uma vez, num canvas offscreen, um gradiente radial por cor/tamanho e reaproveita com `ctx.drawImage` (cache por chave `cor+raio`).
- Trocar os `shadowBlur` dos renderizadores pelo glow em cache.
- Usar `ctx.globalCompositeOperation = 'lighter'` nas camadas de brilho (golpes, partículas, glows). Sempre restaurar para `'source-over'` (usar `save/restore`).
- **Critério de pronto:** visual igual ou mais brilhante, sem `shadowBlur` em loops.

### Etapa 2: Sensação de impacto (game feel)
- **Hit flash:** inimigo fica branco por 1–2 quadros ao levar dano (campo visual `e.flashTimer`, decrementado no render ou num `updateVisualFx(dt)`).
- **Hit stop:** congelar o `update` por ~40 ms em golpes do combo 3, morte de chefão e ativação do Frenzy. Implementar com `state.hitStopTimer` consumido em `js/game.js` antes de chamar `update`.
- **Ondas de choque** (`fx/shockwaves.js`): anel que expande e some; disparar em mortes, explosões de bomba, level up e Frenzy.
- **Números de dano** (`fx/damage-numbers.js`): sobem e somem com easing.
- **Partículas como faíscas:** desenhar como linhas esticadas na direção da velocidade.
- **Critério de pronto:** cada acerto tem resposta visual clara; FPS estável.

### Etapa 3: Formas procedurais
Usar `fx/shapes.js` e definir as formas em `data_model/visuals/`:
- **Herói:** corpo em losango/chevron apontando para `player.angle`; *squash & stretch* conforme a velocidade.
- **SKELETON:** esqueleto procedural (ver art_reference/skeleton); substituiu o SPIRIT.
- **WITCH:** triângulo com "canhão" apontando para o alvo.
- **GOBLIN:** célula pulsante (raio variando com `Math.sin`).
- **BOSS:** polígono grande girando com anéis concêntricos.
- **Núcleo:** cristal hexagonal com camadas girando em sentidos opostos.
- Usar easing (`easeOutBack`) para o surgimento dos inimigos.
- **Critério de pronto:** cada tipo de inimigo é reconhecível só pela forma. O raio de colisão **não muda** (só o desenho).

### Etapa 4: Ambiente
- Grade do fundo com leve ondulação perto de explosões (deslocar linhas com base nas ondas de choque ativas).
- Fundo em camadas (parallax) com poeira/estrelas neon geradas uma vez.
- Vinheta e scanlines leves: overlay via CSS em um novo arquivo `css/components/effects.css` (importado em `css/game.css`), com `pointer-events: none`.
- **Critério de pronto:** fundo vivo sem atrapalhar a leitura dos inimigos.

## Como validar cada etapa

- Abrir o jogo por servidor HTTP local (módulos ES não funcionam via `file://`):
  `python3 -m http.server` na raiz do repositório e acessar `/mini_games/last_torch/last_torch.html`.
- Conferir o console sem erros, jogar até a loja (fim do turno 1) e, se possível, até um chefão.
- Testar em largura de celular (~400px) e em paisagem.
- Relatar ao usuário o que foi testado e o que não foi.

## Referências de arte do usuário

Antes de desenhar um personagem, verifique se existe `art_reference/<id>/`. Se existir:
- Leia o `character.md` e veja as imagens em `images/` (silhueta, cores, poses-chave).
- Recrie em código: formas simples (`fx/shapes.js`), cores em `data_model/visuals/`, animações por interpolação/easing entre as poses descritas.
- **Nunca** carregue essas imagens no jogo; elas são só referência.
- Se algo estiver ambíguo (ex.: como uma parte se move), pergunte ao usuário antes de inventar.

## Fora do escopo

- Mudanças de balanceamento ou de regras.
- Novos inimigos, skills ou sons.
- Reescrever o HUD em HTML/Tailwind (só se o usuário pedir).
