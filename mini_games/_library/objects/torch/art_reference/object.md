# Objeto: Tocha 2,5D

- **id:** `torch25d` (`createTorch25D` em `../torch25d.js`; números em `../torch25d_visual.js`)
- **Papel:** o objeto que o jogador defende no Last Torch (a Center Tower / "Torch"). Fica no centro do mundo; os monstros vão atrás dela.
- **Feito a partir de:** a imagem do usuário `images/torch_referencia.png` (pixel art) misturada com a fogueira antiga do jogo (o fogo).
- **Resultado:** `images/torch25d_resultado.png` (o Last Torch em execução)

## Lendo a referência

O que a imagem tem (e o que a 1ª versão não tinha visto):

- **A "cesta" é uma GAIOLA, não uma tigela:** barras laterais que sobem de um colar e se **abrem para fora no alto**, como pontas de
  coroa; no meio, um **poste central** que sobe até dentro do fogo, com um nó na ponta, e uma **barra horizontal** formando uma cruz;
  o fogo aparece **pelos vãos** (amarelo no miolo, laranja e vermelho nas bordas).
- **Colar** decorado prendendo a gaiola ao poste, só um pouco mais largo que o poste.
- **Poste** fino, levemente torto, com **contorno escuro** e uma **faixa de luz descendo pelo meio**.
- Tudo com contorno escuro (pixel art). Paleta medida na imagem: marrons `#3c2424`, `#603c3c`, luz `#a86c5c`; fogo `#fcf084`, `#e47848`.

## Como foi feita

Na câmera do jogo (um pouco de cima, como os bonecos 2.5D: o que é alto aparece encurtado e o que é redondo vira elipse) e **do
tamanho do herói**. Três peças montadas **uma vez** ao criar a tocha:

| Peça | O que é | Como ficou | Custo em cena |
|---|---|---|---|
| Atrás do fogo | sombra, poste (contorno, corpo, faixa de luz), o fogo visto pelos vãos, as 2 barras de trás, a metade de trás do anel, o colar | sprite parado | 1 `drawImage` |
| Fogo | a mistura (cada língua cresce, encolhe e balança no seu ritmo, 1, 2 ou 3 vezes por ciclo, e a base respira: o formato muda de verdade): línguas deitadas que giram e pulsam rente à boca da gaiola, miolo claro e brasas que saem para os lados (da **fogueira antiga**) + chama em 4 camadas que sobe, do vermelho ao quase branco (da **referência**) | **atlas** de 20/12/8 quadros, ciclo de 1,6 s; o ciclo emenda | 1 `drawImage` |
| Na frente do fogo | o poste central com o nó (a cruz), a metade da frente do anel e as 2 barras da frente | sprite parado | 1 `drawImage` |
| Brilho | halo quente em volta do fogo, somado à cena (como o da fogueira antiga) | sprite de brilho em cache (`core/glow.js`) | 1 `drawImage` |

Em cena a tocha custa **4 `drawImage`**. A cruz fica na frente do fogo e as barras de trás atrás dele, como na referência.

## Como o jogo a usa

`createTorch25D({ res, frames })` e `torch.render(ctx, x, y, { flame, time })`: `(x, y)` é a base do poste no chão e `flame` o tamanho do
fogo (1 = o fogo cheio do desenho). A regra de que o fogo encolhe com a vida da tocha fica no jogo: a tabela `flameBySize` em
`torch_visual.js` liga vida → tamanho em linha reta (`[[0, 0.3], [0.12, 0.38], [0.5, 0.77], [1, 1]]`: vida cheia = fogo cheio; metade = o
fogo cheio da versão anterior; quase apagada = a metade da versão anterior, a pedido do usuário). A barra de vida fica em cima da tocha, logo acima do fogo cheio.
A colisão e o ponto de luz da névoa continuam na base.

**Profundidade (2.5D):** quem está atrás da base da tocha (mais acima na tela) é desenhado antes dela, e a tocha o cobre; quem está na
frente passa por cima dela. Os monstros são desenhados em duas passadas (`renderEnemies('behind' | 'front', coreY)`) e o herói vai antes
ou depois da tocha conforme o lado (`js/render/renderer.js`).

## Custo medido (Last Torch real, Chrome, 400 renderizações)

| | fogueira antiga | tocha 2,5D |
|---|---|---|
| Computador, ms por quadro | 0,22 | 0,18 |
| Celular deitado, ms por quadro | 0,15 | 0,15 |
| Canvas a mais | | +0,08 MB / +0,02 MB |

## Decisões (o que foi tentado e rejeitado)

- **1ª versão, rejeitada:** vista de lado, poste comprido (~140 unidades, quase 3 vezes o herói), copa em "V" com ripas e cruz grossa.
  O usuário: "não ficou boa... quero 2,5D mais pro topo, a cesta ficou estranha, ficou muito comprida, ela é do tamanho do boneco".
- **2ª versão, rejeitada:** câmera de cima, mas a cesta virou uma tigela redonda com brasas (parecia um cogumelo). O usuário: "olhe
  melhor o desenho de referência" — a referência é uma gaiola de barras, não uma tigela.
- **Ficou:** a gaiola da referência na câmera do jogo, do tamanho do herói, com o fogo que mistura a fogueira antiga e a chama nova.
- **15% menor e barra de vida em cima** (pedidos do usuário): `size: 0.85` escala a tocha inteira já no desenho (nítida); a barra
  de vida fica logo acima do fogo cheio.
- **Pino do meio baixo:** o poste central passava muito da boca da gaiola ("muito alto"); agora passa só 1,5 unidade.
- **Fogo que muda de formato:** a 1ª versão da gaiola tremia sempre igual; ganhou mais quadros (20) e ritmos diferentes por língua.
- **Fogo maior:** a pedido, o fogo cheio ficou 30% maior e a escala da vida foi refeita (veja "Como o jogo a usa").
- **Colar pequeno:** um disco largo embaixo da gaiola pesava; ficou uma faixa só um pouco mais larga que o poste.
- **Profundidade:** a 1ª versão desenhava a tocha antes de todos, e o herói passando atrás dela aparecia por cima (pedido do usuário: "ela
  deve sobrepor o personagem"). Agora segue a ordem 2.5D por profundidade.

## Ajuste

`tools/object_tuner.html?object=torch`: a tocha com o fogo cheio, pela metade e quase apagado, ao lado da referência, e um controle para
cada número (poste, gaiola, cores, fogo, brasas, brilho, quadros). Grave com **Copiar alterados**, cole em `torch25d_visual.js` e rode
`ruby mini_games/_library/sync.rb`.
