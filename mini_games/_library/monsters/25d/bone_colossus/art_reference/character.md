# Monstro 2.5D: Colosso de Ossos

- **id do boneco:** `bone_colossus` (em `../bone_colossus25d.js`)
- **Papel:** esqueleto gigante que golpeia a tocha com o montante
- **Feito a partir de:** o desenho de cima do Last Torch, `monsters/topdown/bone_colossus/`. Não havia imagem de referência: a forma veio do código do desenho de cima
- **Montado sobre:** o Esqueleto 2.5D (`../skeleton/skeleton25d.js`, `skeletonBody`) com outras cores e a espada
- **Resultado:** `images/bone_colossus_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

Criado em 2026-11-11, quando todos os monstros do desenho de cima ganharam versão 2.5D. Cada peça do desenho antigo
foi refeita em 3D simples, para servir em qualquer câmera:

| Peça (do desenho de cima) | Como ficou em 2.5D |
|---|---|
| Esqueleto gigante | as mesmas peças do Esqueleto; o tamanho vem do raio do monstro no jogo (54), não do desenho |
| Ossos mais escuros e grossos | cores do topdown e `boneWidth`/`jointRadius` maiores |
| Alma em brasa | a chama do peito e os olhos ficam laranja |
| Montante na mão direita | espada larga com guarda dourada; o braço direito segue o cabo |
| Golpe na tocha | recua erguendo a espada, desce rápido à frente e volta devagar, com os mesmos tempos do jogo (`slam` no topdown); no tuner, `previewSlam` |

## Cores

As mesmas do desenho de cima: `bone_colossus25d_visual.js` lê `topdown/bone_colossus/bone_colossus_visual.js`. Mudar uma cor lá muda os dois.

## Decisões

- Como no desenho de cima, não é um desenho novo: é o Esqueleto reaproveitado.
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Uso e ajuste

No jogo: `renderBoneColossus25D(e) (lê `e.slamState`, `e.slamTimer`, `e.slamRecover`)`. Ajuste ao vivo: `tools/tuner.html?model=bone_colossus`; medidas em `../bone_colossus25d_visual.js`.
