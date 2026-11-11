# Monstro 2.5D: Mariposa de cinzas

- **id do boneco:** `moth` (em `../moth25d.js`)
- **Papel:** voadora que deixa um rastro de cinzas em brasa
- **Feito a partir de:** o desenho de cima do Last Torch, `monsters/topdown/moth/`. Não havia imagem de referência: a forma veio do código do desenho de cima
- **Montado sobre:** criatura (`../creature25d.js`): voa, sem pernas
- **Resultado:** `images/moth_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

Criado em 2026-11-11, quando todos os monstros do desenho de cima ganharam versão 2.5D. Cada peça do desenho antigo
foi refeita em 3D simples, para servir em qualquer câmera:

| Peça (do desenho de cima) | Como ficou em 2.5D |
|---|---|
| Quatro asas empoeiradas | a da frente larga e clara, a de trás menor e escura; batem para cima e para baixo |
| Olho desenhado na asa | anel claro com o centro escuro na asa da frente |
| Corpo peludo e antenas | corpo escuro, tórax claro e duas antenas curvas |
| Rastro de cinza em brasa | brasas que ficam para trás, caindo e apagando (`embers`, `emberTrail`) |

## Cores

As mesmas do desenho de cima: `moth25d_visual.js` lê `topdown/moth/moth_visual.js`. Mudar uma cor lá muda os dois.

## Decisões

- As asas viraram polígonos 3D, então de lado elas aparecem em V, e de cima abertas como no desenho antigo.
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Uso e ajuste

No jogo: `renderMoth25D(e)`. Ajuste ao vivo: `tools/tuner.html?model=moth`; medidas em `../moth25d_visual.js`.
