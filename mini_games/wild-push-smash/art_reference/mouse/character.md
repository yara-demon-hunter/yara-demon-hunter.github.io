# Personagem: Rato (Mouse)

- **id no jogo:** mouse (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o mais leve e o mais rápido do elenco. Pequenininho: voa longe quando apanha, mas escapa de tudo.

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: `images/mouse.jpeg`. **A imagem mostra o rato bravo, mas no jogo ele é fofinho:** olhos grandes e redondos, sorriso em "w" com dentinhos. A cara brava só aparece no dash e no smash.

- **Silhueta / forma geral:** esfera cinza **lisa, sem pelo** (nada de textura de pelo), vista de frente (levemente virada para o lado em que olha). É o menor bicho em campo.
- **Cabeça e rosto:** olhos brancos com íris marrom-escura grande e reflexos, **nariz vermelho**, sorriso em "w" com dois dentinhos, bigodes brancos longos e retos, bochechas rosadas.
- **Orelhas:** grandes e redondas, no alto da esfera, com o **interior rosa**; balançam.
- **Barriga / marcas:** **barriga rosa** na frente; bochechas rosadas.
- **Cauda:** **rosa, pelada (sem pelo)**, com aneizinhos, longa e fina, afinando até a ponta; jogada para trás, curvando e balançando.
- **Partes que se movem separadamente:** orelhas, cauda (o corpo todo faz squash & stretch).
- **Detalhes que NÃO podem faltar:** orelhas grandes e redondas, barriga rosa redonda, cauda rosa pelada, nariz vermelho, bigodes brancos.
- **Detalhes que podem ser simplificados:** pelos, bigodes.
- **NÃO ter:** braços, mãos, pernas ou pés.

## Cores

> Tiradas da imagem.

- **Corpo:** #8f8f94 (cinza liso, neutro), luz #b9b9be, sombra #66666c
- **Barriga e bochechas:** #f2a3ab; **interior da orelha:** #ec949d
- **Cauda:** #f0a4ad, aneizinhos #c97680
- **Olhos:** branco, íris #2a1a14, reflexos brancos
- **Nariz:** #d02a33 (vermelho)
- **Bigodes:** #ffffff
- **Contorno:** sem contorno preto; só uma borda levemente mais escura que o corpo

## Personalidade e estilo

> Ex.: elétrico, curioso, medroso mas atrevido. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira rápido, pisca, nariz e bigodes mexem, cauda balança | ~0,6 s |
| correr | andando no chão | esfera quica rápido, orelhas para trás, cauda estica | ciclo bem curto, segue a velocidade |
| pular | no ar | esfera estica na subida e achata na queda, orelhas sobem | 2 poses (subindo / caindo) |
| dash | botão de dash | esfera esticada na horizontal, olhos bravos, cauda reta | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos | 1 pose |
| tonto | levou smash | achatado, olhos em X, estrelas girando | ~0,6 s |
| provocar | botão de provocar | pula, língua de fora, cauda balançando forte | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, orelhas baixas, treme | ~0,3 s |

## Imagens (em `images/`)

Nomes sugeridos:

```
front.png          visão principal (de frente)
palette.png        (opcional) paleta de cores
pose-idle.png      poses-chave de cada animação
pose-run.png
pose-jump.png
pose-dash.png
pose-smash.png
pose-stun.png
pose-taunt.png
pose-scared.png
inspiration-*.png  referências de estilo (não precisam ser do rato)
```
