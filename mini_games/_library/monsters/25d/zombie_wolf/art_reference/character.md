# Monstro 2.5D: Lobo Zumbi

- **id do boneco:** `zombie_wolf` (em `../zombie_wolf25d.js`)
- **Papel:** lobo amaldiçoado em galope
- **Feito a partir de:** o desenho de cima do Last Torch, `monsters/topdown/zombie_wolf/`, e as referências originais `images/zombie_wolf_idle.png`
- **Montado sobre:** lobo (`../wolf25d.js`): quadrúpede em galope
- **Resultado:** `images/zombie_wolf_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

Criado em 2026-11-11, quando todos os monstros do desenho de cima ganharam versão 2.5D. Cada peça do desenho antigo
foi refeita em 3D simples, para servir em qualquer câmera:

| Peça (do desenho de cima) | Como ficou em 2.5D |
|---|---|
| Lobo magro | tronco e patas mais finos que os do Lobo Sombrio |
| Costelas à mostra | carne escura no flanco com os ossos por cima, dos dois lados |
| Chama roxa na espinha e na ponta da cauda | línguas de chama em três camadas ao longo do lombo (inclinam para trás ao correr) e na ponta da cauda |
| Crânio exposto de um lado | mancha de osso com a órbita escura no lado direito do rosto |
| Olhos que brilham, presas | olho claro com brilho violeta; boca aberta com presas |
| Coleira de ferro partida | anel de ferro enferrujado no pescoço e a corrente chacoalhando |

## Cores

As mesmas do desenho de cima: `zombie_wolf25d_visual.js` lê `topdown/zombie_wolf/zombie_wolf_visual.js`. Mudar uma cor lá muda os dois.

## Decisões

- 1ª versão: o crânio exposto era uma bola grande e parecia um olho gigante; ficou menor e achatado.
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Uso e ajuste

No jogo: `renderZombieWolf25D(e)`. Ajuste ao vivo: `tools/tuner.html?model=zombie_wolf`; medidas em `../zombie_wolf25d_visual.js`.
