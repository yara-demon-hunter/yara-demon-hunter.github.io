# Monstro 2.5D: Espectro

- **id do boneco:** `wraith` (em `../wraith25d.js`)
- **Papel:** fantasma que mira e dispara em linha reta
- **Feito a partir de:** o desenho de cima do Last Torch, `monsters/topdown/wraith/`. Não havia imagem de referência: a forma veio do código do desenho de cima
- **Montado sobre:** criatura (`../creature25d.js`): flutua, sem pernas, meio transparente
- **Resultado:** `images/wraith_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

Criado em 2026-11-11, quando todos os monstros do desenho de cima ganharam versão 2.5D. Cada peça do desenho antigo
foi refeita em 3D simples, para servir em qualquer câmera:

| Peça (do desenho de cima) | Como ficou em 2.5D |
|---|---|
| Capuz vazio com dois olhos frios | bola clara com a abertura escura e os dois olhos brilhando; somem de costas |
| Manto | ombros largos afinando até a barra (`taper`), inclinado para a frente; mangas vazias pendendo (novas: de cima não apareciam) |
| Rastro de fiapos | fitas que saem da barra e ondulam para trás; esticam no disparo (`lungeStretch`) |
| Brilha ao mirar | clarão em volta do corpo e olhos mais fortes (`previewAim` no tuner) |
| Transparência | tudo desenhado com `alpha` |

## Cores

As mesmas do desenho de cima: `wraith25d_visual.js` lê `topdown/wraith/wraith_visual.js`. Mudar uma cor lá muda os dois.

## Decisões

- De cima ele era só capuz e fiapos; em 2.5D ganhou corpo de manto e mangas para ler de lado.
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Uso e ajuste

No jogo: `renderWraith25D(e) (lê `e.lungeState`: 1 = mirando, 2 = disparando)`. Ajuste ao vivo: `tools/tuner.html?model=wraith`; medidas em `../wraith25d_visual.js`.
