# Monstro 2.5D: Demon Lord (boss)

- **id do boneco:** `demon_lord` (em `../demon_lord25d.js`)
- **Papel:** boss lento e resistente que lança bolas de fogo
- **Feito a partir de:** o desenho de cima do Last Torch, `monsters/topdown/demon_lord/`, e as referências originais `images/demon-lord-body.jpeg`, `images/demon-lord.webp`
- **Montado sobre:** boneco de gente (`characters/hunter/hero25d.js`) com peças próprias
- **Resultado:** `images/demon_lord_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

Criado em 2026-11-11, quando todos os monstros do desenho de cima ganharam versão 2.5D. Cada peça do desenho antigo
foi refeita em 3D simples, para servir em qualquer câmera:

| Peça (do desenho de cima) | Como ficou em 2.5D |
|---|---|
| Demônio vermelho musculoso | tronco de peito largo com peitorais e abdômen marcados; braços e pernas grossos; mãos e pés com garras |
| Chifres de carneiro | saem do alto da cabeça para o lado, descem por trás da orelha e a ponta volta para a frente; com anéis |
| Rosto | orelhas pontudas, testa franzida, olhos laranja em brasa e os dentes à mostra |
| Asas de morcego enormes | os mesmos ossos do desenho de cima (`wingBones`) abrindo em leque e subindo (`wingRise`); membrana recortada, painéis escuros, garra na ponta; batem devagar |
| Cauda com ponta de lança | corrente que ondula e afina, terminando na ponta de lança |
| Bola de fogo | o braço direito estica e a bola cresce na mão, em camadas vermelho → laranja → amarelo → núcleo claro (`previewCharge` no tuner) |

## Cores

As mesmas do desenho de cima: `demon_lord25d_visual.js` lê `topdown/demon_lord/demon_lord_visual.js`. Mudar uma cor lá muda os dois.

## Decisões

- 1ª versão: os chifres ficavam em pé como galhadas e o brilho dos olhos cobria o rosto. Os chifres passaram a descer pelos lados e o brilho diminuiu.
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Uso e ajuste

No jogo: `renderDemonLord25D(e) (o fogo carrega pelo `e.shootTimer`)`. Ajuste ao vivo: `tools/tuner.html?model=demon_lord`; medidas em `../demon_lord25d_visual.js`.
