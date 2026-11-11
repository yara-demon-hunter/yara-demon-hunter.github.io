# Monstro 2.5D: Vampiro

- **id do boneco:** `vampire` (em `../vampire25d.js`)
- **Papel:** nobre que desliza e agarra de perto; ao morrer vira morcegos (lógica do jogo)
- **Feito a partir de:** o desenho de cima do Last Torch, `monsters/topdown/vampire/`, e as referências originais `images/vampire_idle.webp`
- **Montado sobre:** boneco de gente (`characters/hunter/hero25d.js`) com peças próprias
- **Resultado:** `images/vampire_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

Criado em 2026-11-11, quando todos os monstros do desenho de cima ganharam versão 2.5D. Cada peça do desenho antigo
foi refeita em 3D simples, para servir em qualquer câmera:

| Peça (do desenho de cima) | Como ficou em 2.5D |
|---|---|
| Rosto pálido, cabelo preto para trás | cabeça pálida, cabelo escuro atrás e em cima com o bico na testa e riscos de brilho; orelhas pontudas |
| Olhos vermelhos e presas | olhos com brilho (mais forte ao agarrar), sobrancelhas, duas presas |
| Gola alta | duas pontas rígidas atrás e dos lados da cabeça, com forro vermelho |
| Capa preta com forro vermelho | a capa padrão do boneco, mais larga e comprida, com o forro vermelho na borda; de costas cobre o tronco |
| Casaca e medalhão | tronco escuro com frisos prateados em V e o medalhão vermelho pulsando (roupa tirada da imagem de referência) |
| Braços | mãos juntas na frente do corpo; esticam com as unhas abertas ao agarrar (`previewGrab` no tuner) |
| Desliza | sobe e desce devagar (`floatAmount`), passos curtos |

## Cores

As mesmas do desenho de cima: `vampire25d_visual.js` lê `topdown/vampire/vampire_visual.js`. Mudar uma cor lá muda os dois.

## Decisões

- 1ª versão: o cabelo cobria metade do rosto (parecia capuz) e o medalhão estava enorme. O cabelo foi para trás e o medalhão diminuiu.
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Uso e ajuste

No jogo: `renderVampire25D(e) (estica os braços perto do alvo de `core/host.js`)`. Ajuste ao vivo: `tools/tuner.html?model=vampire`; medidas em `../vampire25d_visual.js`.
