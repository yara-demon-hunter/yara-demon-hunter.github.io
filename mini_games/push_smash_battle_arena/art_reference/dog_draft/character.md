# Personagem: Cachorro (Dog)

- **id no jogo:** dog (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o parrudo simpático: um pouco mais pesado que a raposa, velocidade média, pulo médio.

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: **`images/dog_type_2.webp`** (a principal). Versões anteriores: `dog_type_1.jpeg` (nariz vermelho) e `dog.webp` (felpudo, de frente).

- **Silhueta / forma geral:** esfera **dourada** de pelo curtinho, quase lisa, vista em **3/4**: o rosto fica virado para o lado em que ele olha.
- **Cabeça e rosto:** focinho creme saltado com **nariz escuro** grande (narinas e brilho), sorriso largo que sobe para a bochecha e **linguinha rosa para fora**. Olhos pretos brilhantes com borda branca. Testa com dois calombinhos claros acima dos olhos.
- **Orelhas:** dobradas para fora nos cantos de cima da cabeça, por cima dela, com a parte de dentro mais escura aparecendo; balançam.
- **Barriga / marcas:** barriga só um pouco mais clara embaixo; focinho e queixo cremes.
- **Cauda:** tufinho curto e curvado para cima, jogado para trás, abanando.
- **Partes que se movem separadamente:** orelhas, cauda (o corpo todo faz squash & stretch).
- **Detalhes que NÃO podem faltar:** focinho creme com nariz escuro, linguinha para fora, rosto em 3/4, orelhas dobradas, cauda abanando.
- **Detalhes que podem ser simplificados:** pelos.
- **NÃO ter:** braços, mãos, pernas ou pés.

## Cores

> Tiradas da imagem.

- **Corpo:** #d39a52 (dourado), luz #ebbb76, sombra #a5703a
- **Focinho e queixo:** #f2d39f, sombra #dcb173
- **Dentro da orelha:** #b37a3e
- **Olhos:** branco na borda, olho #141010 com brilho branco
- **Nariz:** #3a2827, brilho #6e5552, narinas #140c0c
- **Língua:** rosa (#ff6b81), risquinho #d9566e
- **Boca:** #4a2a1c
- **Contorno:** sem contorno preto; só uma borda levemente mais escura que o corpo

## Personalidade e estilo

> Ex.: alegre, leal, empolgado. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira, pisca, cauda abana, orelhas balançam de leve | ~0,8 s |
| correr | andando no chão | esfera quica, orelhas voam para trás, língua de fora | ciclo curto, segue a velocidade |
| pular | no ar | esfera estica na subida e achata na queda, orelhas sobem | 2 poses (subindo / caindo) |
| dash | botão de dash | esfera esticada na horizontal, olhos bravos, orelhas para trás | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos | 1 pose |
| tonto | levou smash | achatado, olhos em X, estrelas girando | ~0,6 s |
| provocar | botão de provocar | pula, língua de fora, cauda abanando forte | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, orelhas baixas | ~0,3 s |

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
inspiration-*.png  referências de estilo (não precisam ser do cachorro)
```
