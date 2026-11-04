# Personagem: Cachorro (Dog)

- **id no jogo:** dog (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o parrudo simpático: um pouco mais pesado que a raposa, velocidade média, pulo médio.

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: **`images/dog_new.jpeg`** (a principal; `dog.webp` é a versão antiga).

- **Silhueta / forma geral:** esfera caramelo de **pelo curtinho, quase lisa**, vista em **3/4**: o rosto fica virado para o lado em que ele olha.
- **Cabeça e rosto:** **focinho creme saltado** para a frente com **nariz vermelho grande** (narinas e brilho), sorriso largo que sobe para a bochecha, queixinho creme. Olhos menores, brancos com íris castanha, pupila e brilho. Testa com dois calombinhos claros acima dos olhos.
- **Orelhas:** dobradas para fora nos cantos de cima da cabeça, por cima dela, com a parte de dentro mais escura aparecendo; balançam.
- **Barriga / marcas:** barriga só um pouco mais clara embaixo; focinho e queixo cremes.
- **Cauda:** tufinho curto e curvado para cima, jogado para trás, abanando.
- **Partes que se movem separadamente:** orelhas, cauda (o corpo todo faz squash & stretch).
- **Detalhes que NÃO podem faltar:** nariz vermelho grande, focinho creme saltado, rosto em 3/4, orelhas dobradas, cauda abanando.
- **Detalhes que podem ser simplificados:** pelos.
- **NÃO ter:** braços, mãos, pernas ou pés.

## Cores

> Tiradas da imagem.

- **Corpo:** #c48a5c, luz #dcab80, sombra #94643f
- **Focinho e queixo:** #f0d2ac, sombra #d9ae84
- **Dentro da orelha:** #a87048
- **Olhos:** branco, íris #5a3018, pupila escura, brilho branco
- **Nariz:** #b3121f, brilho #e0404a, narinas #5e0a11
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
