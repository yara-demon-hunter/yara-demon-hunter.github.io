# Personagem: Cachorro Beagle (Dog)

- **id no jogo:** dog (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Raça:** **Beagle**. A versão anterior (caramelo genérico) está em `../dog_draft/`.
- **Papel:** o parrudo simpático: um pouco mais pesado que a raposa, velocidade média, pulo médio.

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: `images/dog_beagle.webp`.

- **Silhueta / forma geral:** esfera **marrom** de pelo curtinho, vista em **3/4** (rosto virado para o lado em que olha).
- **Padrão de cores do Beagle:** corpo **marrom**; **faixa branca** descendo da testa **entre os olhos** (nunca por trás deles) até o focinho; **focinho, queixo e barriga brancos**; **mancha preta grande nas costas** (do lado de trás, na parte de baixo).
- **Cabeça e rosto:** olhos pretos brilhantes com borda branca, sobrancelhas marrons mais claras, **nariz escuro**, sorriso largo e **linguinha para fora**. O focinho branco avança um pouco para o lado em que ele olha.
- **Orelhas:** **longas, caídas e soltas, como uma capa**: presas só no alto da cabeça (com uma dobrinha onde nascem) e penduradas pelos lados, largas e arredondadas na ponta. Marrom mais escuro que o corpo, com degradê e fios de pelo. Não ficam grudadas na esfera: **giram em volta do ponto onde nascem e reagem ao movimento**:
  - parado: balançam de leve, junto com a cauda;
  - correndo e no dash: voam para trás;
  - pulando, no smash, provocando e com medo: abrem para cima e para fora, como asas;
  - podem passar um pouco do contorno da esfera (é o que dá o ar de "capa"), mas sem cobrir o olho da frente.
- **Cauda:** rabinho curto, escuro, com **ponta branca**, jogado para trás e abanando.
- **Partes que se movem separadamente:** orelhas, cauda (o corpo todo faz squash & stretch).
- **Detalhes que NÃO podem faltar:** orelhas longas e caídas, tricolor (marrom, branco e preto), ponta branca da cauda, focinho branco com nariz preto.
- **Detalhes que podem ser simplificados:** pelos, mancha exata das costas.
- **NÃO ter:** braços, mãos, pernas ou pés.

## Cores

> Tiradas da imagem.

- **Corpo (marrom):** #c9843f, luz #e3a560, sombra #8f5a26
- **Mancha das costas:** #1d1816
- **Branco (faixa, focinho, barriga, ponta da cauda):** #fbf7f0, sombra #e6ddd0
- **Orelhas:** **longas, caídas e soltas, como uma capa**: presas só no alto da cabeça (com uma dobrinha onde nascem) e penduradas pelos lados, largas e arredondadas na ponta. Marrom mais escuro que o corpo, com degradê e fios de pelo. Não ficam grudadas na esfera: **giram em volta do ponto onde nascem e reagem ao movimento**:
  - parado: balançam de leve, junto com a cauda;
  - correndo e no dash: voam para trás;
  - pulando, no smash, provocando e com medo: abrem para cima e para fora, como asas;
  - podem passar um pouco do contorno da esfera (é o que dá o ar de "capa"), mas sem cobrir o olho da frente.
- **Olhos:** #141010 com borda branca e brilho
- **Nariz:** #3a2a2b, narinas #140c0c
- **Língua:** #ff6b81
- **Contorno:** sem contorno preto; só uma borda levemente mais escura que o corpo

## Personalidade e estilo

> Ex.: farejador, curioso, alegre e teimoso. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira, pisca, orelhas-capa balançam de leve, cauda abana | ~0,8 s |
| correr | andando no chão | esfera quica, orelhas-capa voam para trás, língua de fora | ciclo curto, segue a velocidade |
| pular | no ar | esfera estica na subida e achata na queda, orelhas abrem para cima como asas | 2 poses (subindo / caindo) |
| dash | botão de dash | esfera esticada na horizontal, olhos bravos, orelhas coladas para trás | 1 pose |
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
inspiration-*.png  referências de estilo (não precisam ser do beagle)
```
