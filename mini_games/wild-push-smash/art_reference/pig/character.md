# Personagem: Porco (Pig)

- **id no jogo:** pig (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o pesadão: bem pesado (só perde para o elefante), velocidade média e pulo baixo.

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: `images/pig.webp`.

- **Silhueta / forma geral:** esfera **rosa-clara lisa**, redonda e gordinha, vista de frente (levemente virada para o lado em que olha).
- **Cabeça e rosto:** olhinhos pequenos (branco com pupila escura e brilho), bochechas rosadas. **Sem boca aparecendo** na pose normal; ela só surge nas expressões (pulo, provocar, medo).
- **Focinho:** **grande, oval e saltado**, rosa-framboesa (mais escuro que o corpo), com **duas narinas** ovais e brilho; fica um pouco para o lado em que ele olha.
- **Orelhas:** triangulares, nos cantos de cima, abertas para os lados, com o interior rosa mais escuro; balançam.
- **Barriga / marcas:** nenhuma; só as bochechas rosadas.
- **Cauda:** **rabinho enrolado** em mola, fininho, jogado para trás e balançando.
- **Partes que se movem separadamente:** orelhas, rabinho (o corpo todo faz squash & stretch, pesado).
- **Detalhes que NÃO podem faltar:** focinho com narinas, rabinho enrolado, cor rosa.
- **Detalhes que podem ser simplificados:** pelinhos, manchas.
- **NÃO ter:** braços, mãos, pernas, pés ou cascos.

## Cores

> Tiradas da imagem.

- **Corpo:** #f6b6bd (rosa-claro liso), luz #ffd6da, sombra #d68991
- **Interior da orelha:** #ea8c97
- **Bochechas:** #f2848f
- **Focinho:** #c94a5c, luz #e2717f, narinas e borda #8f2a3a
- **Olhos:** branco com pupila #1c1012
- **Contorno:** sem contorno preto; só uma borda levemente mais escura que o corpo

## Personalidade e estilo

> Ex.: guloso, feliz, bonachão. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira, pisca, focinho mexe, rabinho balança | ~0,9 s |
| correr | andando no chão | esfera quica pesada, orelhas batem, rabinho balança | ciclo médio, segue a velocidade |
| pular | no ar | esfera estica pouco na subida e achata bastante na queda | 2 poses (subindo / caindo) |
| dash | botão de dash | esfera esticada na horizontal, olhos bravos | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos | 1 pose |
| tonto | levou smash | achatado, olhos em X, estrelas girando | ~0,6 s |
| provocar | botão de provocar | pula, língua de fora, rabinho balançando forte | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, treme | ~0,3 s |

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
inspiration-*.png  referências de estilo (não precisam ser do porco)
```
