# Monstro 2.5D: Lobo Sombrio

- **id do boneco:** `shadow_wolf` (em `../shadow_wolf25d.js`)
- **Papel:** lobo veloz em galope
- **Feito a partir de:** o desenho de cima do Last Torch, `monsters/topdown/shadow_wolf/`. Não havia imagem de referência: a forma veio do código do desenho de cima
- **Montado sobre:** lobo (`../wolf25d.js`): quadrúpede em galope
- **Resultado:** `images/shadow_wolf_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

Criado em 2026-11-11, quando todos os monstros do desenho de cima ganharam versão 2.5D. Cada peça do desenho antigo
foi refeita em 3D simples, para servir em qualquer câmera:

| Peça (do desenho de cima) | Como ficou em 2.5D |
|---|---|
| Pelo cinza-azulado escuro com mechas claras | tronco escuro com a faixa clara no lombo e mechas claras para trás |
| Juba desgrenhada | mechas em volta do pescoço, balançando para trás (`maneTufts`) |
| Olhos e boca vermelhos, presas | olhos vermelhos brilhando, sobrancelhas franzidas, boca aberta vermelha com presas, faixa clara no focinho |
| Traseira se desfazendo em fumaça preta | a cauda é fumaça (fitas escuras) e nuvens soltam da garupa (`smokeTails`, `smokePuffs`) |
| Galope | o par de patas da frente em oposição ao de trás; o corpo sobe e desce (`bounce`) |

## Cores

As mesmas do desenho de cima: `shadow_wolf25d_visual.js` lê `topdown/shadow_wolf/shadow_wolf_visual.js`. Mudar uma cor lá muda os dois.

## Decisões

- 1ª versão: a faixa clara do focinho parecia um palito atravessado no rosto; ficou fina e curta.
- Não havia imagem de referência na pasta: a forma veio do código do desenho de cima (que cita `yara-rpg/images/monsters/shadow-wolf.webp`).
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Uso e ajuste

No jogo: `renderShadowWolf25D(e)`. Ajuste ao vivo: `tools/tuner.html?model=shadow_wolf`; medidas em `../shadow_wolf25d_visual.js`.
