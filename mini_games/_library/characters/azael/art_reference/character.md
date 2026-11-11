# Azael

- **id no jogo:** azael (novo herói em `HEROES`, `data_model/heroes.js`)
- **Papel:** **herói jogável** (personagem selecionável, como o Demon Hunter). Demônio espadachim ágil, estilo ronin/ninja: luta corpo a corpo com uma katana, avança rápido e corta.
- **Desenho:** **2.5D**, no mesmo padrão do herói atual (`characters/hunter/hero25d.js` + `characters/hunter/hero25d_visual.js`). Não é recolor do Caçador: precisa de **boneco próprio** (sem capuz nem máscara; cabelo, bandana, pele à mostra, katana e pés de 3 dedos).

## Aparência

- **Silhueta / forma geral:** demônio humanoide do tamanho de um homem comum, magro e musculoso. Na câmera 2.5D (quase de cima, levemente inclinada), lê-se como ombros envoltos num cachecol/capa marrom volumoso, cabelo branco comprido voando atrás, capa esfarrapada tremulando para trás e a katana saindo do lado.
- **Cabeça e rosto:** rosto sério e frio, testa franzida. **Orelhas pontudas** (élficas), sem chifres. **Olhos vermelhos brilhantes** com pupila em fenda (nas imagens estão verdes, mas no jogo são **vermelhos**). **Pintura de guerra preta:** uma faixa vertical descendo de cada olho até o queixo (como lágrimas pretas)
- **Faixa na testa:** bandana de pano marrom amarrada na testa, com duas pontas rasgadas compridas que voam ao vento atrás da cabeça.
- **Cabelo:** longo, liso, **branco** (sombras levemente cinza-azuladas), até o meio das costas, com mechas soltas caindo na frente do rosto. **Esvoaçante:** está sempre voando ao vento, mesmo parado, e chicoteia atrás dele quando corre ou ataca.
- **Corpo / pele:** pele **branco-prateada** (metálica e fria, com sombras cinza-azuladas), peito nu, abdômen e braços bem definidos.
- **Vestuário:**
  - **Capa (sempre presente):** grande pano marrom-escuro enrolado no pescoço como cachecol volumoso, que desce sobre um ombro e vira uma **capa longa e esfarrapada**, com a barra toda rasgada em tiras. Uma faixa do pano cruza o peito na diagonal.
  - **Calça:** larga estilo hakama/ninja, marrom-escura quase preta, presa na cintura por uma faixa (obi) de pano marrom.
  - **Bandagens:** faixas de pano marrom enroladas nos antebraços (do pulso ao cotovelo), no bíceps e nas canelas (do tornozelo ao joelho).
  - **Bolsinha** de couro pendurada na cintura.
- **Mãos e pés:** dedos longos terminando em **garras pretas curvas**. **Pés descalços e demoníacos, com 3 dedos: dois para a frente e um para trás** (como pé de ave), cada dedo terminando numa garra preta grande e curva.
- **Arma:** **katana** com bainha preta, guarda (tsuba) redonda dourada/bronze e cabo trançado. Fica **guardada na bainha, presa na cintura** (lado direito, do lado da mão que saca); ele saca para atacar e a lâmina prateada brilha ao cortar.
- **Partes que se movem separadamente:** capa (tremula/arrasta atrás), pontas da bandana (voam), cabelo (balança/voa), braços (seguram/sacam a espada), katana, pernas (agachado, base larga).
- **Tamanho relativo:** igual ao herói atual (mesmo raio de colisão e mesma escala do 2.5D); tamanho de um homem comum.
- **Detalhes que NÃO podem faltar:** pele branco-prateada, cabelo longo branco esvoaçante, olhos vermelhos brilhantes, capa marrom esfarrapada, bandana marrom com pontas voando, katana na bainha na cintura.
- **Detalhes que podem ser simplificados:** músculos (viram manchas de luz), pintura de guerra (dois traços pretos), bandagens (listras), bolsinha, dobras do cachecol. Os pés podem ser simples, mas mantendo a ideia de 2 dedos à frente + 1 atrás.

## Cores

_(estimadas a partir das imagens)_

- **Pele:** #e4e8ec (branco-prateado), sombra #9aa4b0, luz #ffffff, brilho metálico #c9d1da, contorno #1a1d22
- **Cabelo:** #f2f2ee (branco), sombra #b9bec6, brilho #ffffff
- **Olhos:** #ef4444 com brilho vermelho #ff2a2a (vermelhos, não verdes como nas imagens)
- **Pintura de guerra:** #15171a
- **Capa / cachecol / bandana:** #4e4032, sombra #2f261d, luz #6b5a47, borda rasgada #3a3026
- **Calça:** #2e2822, sombra #1c1814
- **Bandagens:** #4a3d30, linhas #2a221a
- **Garras:** #1f2328, brilho #4b5560
- **Katana:** lâmina #d6dde4 com fio #ffffff, bainha #141414, guarda #a88b4a, cabo #2a2420
- **Brilho do corte:** #e8f4ff → #9fd8ff (rastro branco-azulado)

## Personalidade e estilo

Dark fantasy, traço de mangá/HQ com contorno preto. Frio, silencioso e disciplinado — um demônio samurai/ronin. Fica agachado e em guarda com a mão na katana, se move com base larga e baixa, e ataca com cortes rápidos e explosivos. Entre os combates, medita.

## Desenho em 2.5D

Seguir o mesmo esquema do herói 2.5D: corpo montado com medidas em 3D (frente, lado e altura), projetado com a câmera do jogo (`heightScale`, `groundSquash`), com sombra no chão e ordem de desenho por profundidade. O que muda em relação ao Caçador:

- **Cabeça:** sem capuz e sem máscara. Rosto branco-prateado com olhos vermelhos brilhantes (dois pontos que brilham bem, é o que mais lê de longe), orelhas pontudas para os lados e bandana marrom na testa.
- **Cabelo:** volume branco grande atrás da cabeça, caindo até o meio das costas, com mechas que seguem física (como a capa): ficam para trás ao correr, chicoteiam no golpe e ondulam devagar parado.
- **Pontas da bandana:** duas tiras curtas soltas atrás da cabeça, com a mesma física do cabelo.
- **Tronco:** peito nu branco-prateado, com cachecol marrom volumoso no pescoço e uma faixa cruzando o peito.
- **Capa:** marrom e esfarrapada, saindo de um ombro, com a mesma física da capa do Caçador (para trás ao correr, abre ao virar).
- **Pernas:** calça larga escura, bandagens nas canelas, postura mais baixa e base mais larga que a do Caçador.
- **Pés:** descalços, com **3 dedos (2 para a frente e 1 para trás)** e garras pretas. Na passada, os dedos da frente apontam para a direção do movimento.
- **Katana:** a bainha preta fica sempre presa no lado direito da cintura, do lado da mão da katana (de lado dá para ver as duas mãos e a bainha). Ele saca e ataca com a **mão esquerda**: parado e correndo, a esquerda fica no cabo, com o braço cruzando na frente da barriga (postura de saque), e a **direita fica na bainha, parada, sem acompanhar o golpe**; no golpe só o braço esquerdo se mexe. No golpe, a lâmina prateada sai da bainha e deixa um rastro branco-azulado; depois volta à bainha.
- **Contorno:** contorno escuro (#1a1d22) em tudo, para a pele e o cabelo claros não se misturarem com o chão.

## Animações

Mesmos estados do herói jogável (ver `characters/hunter/art_reference/character.md`), com o estilo do Azael:

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle (parado) | sem movimento | postura baixa e em guarda, mão no cabo da katana na cintura; respiração; cabelo, bandana e capa ondulando ao vento | loop ~1,2s | images/azael-em-cima-pedra.png |
| andar / correr | ao se mover | tronco inclina para a frente; mão segura a bainha; pés de 3 dedos alternam a passada; cabelo, bandana e capa voam para trás | acompanha a velocidade | images/azael-em-cima-pedra.png |
| ataque 1 (combo) | 1º golpe | saque rápido (iaijutsu): a katana sai da bainha num corte horizontal | ~0,12s | images/azael_different_poses.png (canto superior direito) |
| ataque 2 (combo) | 2º golpe seguido | corte de volta, mais largo | ~0,12s | images/azael_different_poses.png (canto superior direito) |
| ataque 3 (finalizador) | 3º golpe seguido | ergue a katana com as duas mãos acima da cabeça e desce num corte forte para a frente, com avanço (dash); rastro branco-azulado | ~0,2s | images/azael_different_poses.png (canto inferior direito) |
| dash | ao dar dash | corpo baixo e agachado, quase rente ao chão, garras à mostra; cabelo e capa esticam para trás | duração do dash | images/azael_different_poses.png (canto superior esquerdo) |
| levar dano | ao ser atingido | pisca branco, achata | ~0,1s | |
| morte | ao morrer | _(a definir)_ | ~0,4s | |
| Fúria / especial | Fúria ativa | olhos e rastro da lâmina ficam mais intensos (vermelho) | duração da Fúria | |
| meditar | _(opcional: tela de seleção de herói ou Santuário)_ | sentado de pernas cruzadas, mãos juntas, katana no suporte ao lado; só respiração e capa/cabelo balançando leve | lento | images/azael_different_poses.png (canto inferior esquerdo) |
| retrato | tela de seleção de herói | — | — | images/azael-profile.png |

## Imagens

- `images/azael-em-cima-pedra.png` — corpo inteiro em pé numa pedra, mão na katana (pose principal / idle)
- `images/azael-profile.png` — close do rosto: olhos, pintura de guerra, bandana, orelhas
- `images/azael_different_poses.png` — 4 poses: agachado, sacando a espada, meditando, golpe com as duas mãos

## Detalhes implementados no jogo

Código em `characters/azael/azael25d.js`; cores e medidas em `characters/azael/azael_visual.js`.

- Pano e cabelo em "correntes" de pontos: parados caem e balançam devagar; correndo vão para trás, atrasam com a
  física da capa (inclusive ao virar) e ondulam com uma onda que corre da raiz até a ponta.
- Cabeça: uma esfera de cabelo branco; o rosto é uma região pintada na superfície da frente (da bandana até o queixo),
  sem contorno dos lados, para não parecer máscara. Como a câmera vê quase de cima, a cabeça levanta um pouco o rosto
  (`faceTilt`) e, de lado, vira um pouco para a câmera (`faceTurn`). Só o que está virado para a câmera é desenhado.
- Rosto: pele cinza-azulada, olhos vermelhos amendoados e inclinados com brilho, sobrancelhas franzidas, sombra do nariz
  e das maçãs, boca séria, queixo com contorno e uma faixa de pintura de guerra descendo de cada olho.
- Cabelo: risca no meio, franja caindo por cima da bandana, mechas finas dos lados do rosto e a massa longa nas costas.
- Bandana: faixa em volta da cabeça (só a parte visível), nó atrás e duas pontas rasgadas que esvoaçam.
- Corpo: contorno escuro em braços, pernas e pés; ombro da espada nu com faixa no bíceps, o outro coberto pelo pano;
  peitoral e abdômen marcados, faixa cruzando o peito e cachecol volumoso com dobras. Sem cinto (obi) e sem bolsinha:
  no boneco pequeno ficavam ruins.
- O mesmo boneco é usado no Last Torch e no palco do yara-rpg (os dois recebem a biblioteca pelo sync): confira nas
  duas câmeras em `mini_games/_library/tools/tuner.html?model=azael`.
- Capa de pano: cada tira ondula e o meio cede com o peso na corrida; o cachecol cobre os ombros.
- Corrida: corpo sobe e desce a cada passo, postura um pouco agachada; pés de 3 dedos com garras.
- Guarda (tsuba): disco perpendicular à espada (não é mais uma bolinha), com posição ao longo da espada em
  `guardOffset` (+ para a lâmina, - para o cabo), tamanho em `guardSize` e cor em `colors.tsuba`. Acompanha a katana
  guardada e sacada.
- Katana: guardada na bainha com a mão no cabo; no golpe a lâmina desliza para fora e volta para a bainha aos poucos.
