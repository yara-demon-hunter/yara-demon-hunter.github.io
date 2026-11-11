# Zeph

- **id no jogo:** zeph no yara-rpg (`yara-rpg/js/data/characters.js`; boneco do palco em `yara-rpg/js/data/visuals/stage.js` → `characters.zeph`)
- **Papel:** **personagem jogável** do RPG. Sobrevivente atento, acostumado a resistir aos perigos da floresta. Passiva: Reserva interior (+15% de Foco máximo). Começa com Adaga do Caçador, Armadura de Couro, Corda e Botas Ligeiras. **Luta com uma adaga** (as animações de referência mostram um machado; no boneco a arma é a adaga, ver **Observações**).
- **Desenho:** **2.5D**, no mesmo esquema da Yara (`characters/yara/yara25d.js`): boneco próprio, cabeça com rosto de verdade (geometria de `characters/hunter/kit25d.js`), sem capuz nem máscara. Boneco feito em `characters/zeph/zeph25d.js` (ver **Detalhes implementados**).

## Aparência

- **Silhueta / forma geral:** rapaz jovem e magro, altura comum (um pouco menor e mais franzino que o Demon Hunter). Lê-se como um garoto da floresta de jaqueta verde, bolsa de couro na cintura e uma adaga na mão.
- **Cabeça e rosto:** cabeça de proporção normal (cerca de 1/6 da altura, não é chibi). Rosto jovem e oval, sem barba, pele lisa; sobrancelhas **grossas e quase retas**, levemente franzidas para o meio; olhos médios **verde-acastanhados** com pálpebra de cima marcada; nariz reto e discreto; boca pequena, fechada e séria. Orelhas humanas, pequenas, aparecendo abaixo do cabelo. Expressão: concentrado e desconfiado. No idle ele pisca e fecha os olhos por um instante.
- **Pele:** clara/bronzeada.
- **Cabelo:** castanho-escuro, **uma massa só, volumosa e bagunçada** no alto (formato arredondado com ondulações, sem espetos saindo da cabeça). **Franja em pontas** caindo na testa até um pouco acima das sobrancelhas; nos lados fica curto, por cima das orelhas, com **costeletas** na frente delas; atrás vai até a nuca. Reflexo mais claro no alto da cabeça.
- **Vestuário:**
  - **Jaqueta verde-musgo** de gola alta, mangas compridas, botões na frente e **remendos redondos** nos ombros e nas mangas.
  - **Alça de couro** cruzando o peito na diagonal (do ombro direito para o quadril esquerdo), segurando uma **bolsa de couro marrom** que fica no quadril/costas, do lado esquerdo.
  - **Cinto de couro marrom** com fivela.
  - **Calça verde-escura**, larga, enfiada nas botas.
  - **Botas de couro marrom** de cano curto, dobradas no alto.
  - A corda do retrato (no ombro) é o item Corda; nas animações ela some e só aparece a alça da bolsa.
- **Mãos e pés:** mãos nuas; botas de couro.
- **Arma:** **adaga** (Adaga do Caçador): lâmina curta de aço, reta e pontuda (menor que a espada curta da Yara), guarda pequena de ferro e cabo de couro marrom. Fica na **mão direita**; guardada numa **bainha de couro presa no cinto, no quadril direito**. Em repouso ele segura a adaga baixa, à frente do quadril, ponta para a frente, com a mão esquerda livre e o corpo em guarda (mesma postura firme do idle de referência, trocando o machado pela adaga).
- **Partes que se movem separadamente:** cabelo (franja), braços, adaga, bolsa (balança na passada), pernas.
- **Tamanho relativo:** um pouco menor que o Demon Hunter.
- **Detalhes que NÃO podem faltar:** cabelo castanho bagunçado, jaqueta verde com remendos, alça e bolsa de couro, botas marrons, adaga.
- **Detalhes que podem ser simplificados:** botões, remendos (manchas mais escuras), fivela, dobra das botas.

## Cores

_(estimadas das imagens)_

- **Pele:** #d9a476, sombra #a8744c, luz #f0c49a, contorno #1a1410
- **Cabelo:** #4a2e1a, sombra #2e1c10, brilho #6b4528
- **Olhos:** #5f7a55 (verde-acastanhado), branco #ece6d6
- **Jaqueta:** #4b6236, sombra #33452a, luz #637a48; remendos #3a4c2c
- **Calça:** #3b4a2e, sombra #283320
- **Couro (alça, cinto, bolsa, botas):** #7a4f2c, sombra #523319, luz #9a6a40
- **Adaga:** lâmina #c9d0d6 com fio #f1f4f6 e sombra #7d858c; guarda #5d646b; cabo #6b4423, sombra #4a2e17; bainha #7a4f2c
- **Especial (golpe no chão):** azul #3b9cff → #b7e3ff, pedras #4a4a4a

## Personalidade e estilo

Pixel art de RPG, contorno escuro. Sobrevivente da floresta: cauteloso, sério e determinado. Parado, fica firme em guarda com a adaga; anda com passos curtos e decididos; ataca rápido e de perto, com cortes e estocadas usando o corpo todo.

## Desenho em 2.5D

Seguir o esquema da Yara (`characters/yara/yara25d.js`): cabeça como esfera de cabelo com o rosto desenhado na superfície da frente, virando um pouco para a câmera de lado.

- **Cabeça:** cabelo castanho volumoso e bagunçado (franja em pontas por cima da testa), rosto com sobrancelhas grossas.
- **Tronco:** jaqueta verde de gola alta com remendos; alça de couro em diagonal no peito e cinto marrom.
- **Bolsa:** bolsa de couro no quadril esquerdo, balançando na passada.
- **Braços:** mangas verdes compridas até o pulso, mãos nuas.
- **Pernas:** calça verde larga enfiada em botas marrons curtas.
- **Arma:** adaga curta na mão direita, baixa e à frente do quadril; nos golpes, cortes rápidos de lado e uma estocada; bainha no cinto à direita.
- **Contorno:** escuro em tudo.

## Animações

Mesmos estados do palco do RPG (ver `previews/characters_preview.html`):

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle (parado) | sem ação | de pé, pernas afastadas, em guarda com a adaga na mão direita, baixa à frente do quadril, mão esquerda livre; respiração leve, pisca e fecha os olhos um instante | loop ~1,3s | images/zeph_idle.webp (postura; a arma lá é o machado) |
| andar (explorar) | ao explorar | passos curtos de perfil, braços balançando, bolsa batendo no quadril; a adaga fica na mão direita apontada para baixo (ou na bainha) | acompanha a velocidade | images/zeph_walking.webp |
| ataque 1 e 2 (combo) | ao atacar | cortes curtos e rápidos com a adaga, ida e volta, avançando um passo | ~0,15s cada | |
| ataque pesado | golpe pesado | ergue a adaga acima da cabeça e desce com força para a frente e para baixo, inclinando o corpo, e volta à guarda (mesmo arco do golpe de referência) | ~0,5s | images/zeph_axe_attack.webp (movimento; a arma lá é o machado) |
| crítico (Fúria) | ataque com a Fúria cheia | ergue a adaga → desce agachado e crava a adaga no chão → explosão de energia azul, pedras voando e um arco de luz → volta à guarda | ~0,8s | images/zeph_special_axe_attack.webp (movimento; a arma lá é o machado) |
| aparo | ao aparar | adaga atravessada na frente do corpo, base baixa; faísca no impacto | ~1,1s | |
| esquiva | ao esquivar | _(a definir)_ | ~0,3s | |
| poção | ao beber | leva o frasco à boca | ~1,1s | |
| descanso | na fogueira | _(a definir)_ | lento | |
| levar dano | ao ser atingido | pisca branco e é empurrado | ~0,1s | |
| derrota | ao perder | ajoelha e tomba | ~1,4s | |
| retrato | seleção de personagem | — | — | `../../images/characters/zeph.webp` |

## Imagens

Animações em `.webp` animado (pixel art, de lado/3/4). **Nelas ele usa um machado; no jogo a arma é a adaga**: usar as imagens para a postura e o movimento, não para a arma.

- `images/zeph_idle.webp` — parado em guarda com o machado (13 quadros)
- `images/zeph_walking.webp` — caminhada de perfil, sem arma na mão (8 quadros)
- `images/zeph_axe_attack.webp` — golpe de machado de cima para baixo (6 quadros)
- `images/zeph_special_axe_attack.webp` — golpe especial cravando o machado no chão com explosão azul (8 quadros)

## Observações

- Lados sempre do ponto de vista dele (no boneco 2.5D, direita = lado +b).
- **Arma: adaga** (decidido). Bate com o equipamento inicial em `js/data/characters.js` (`hunter-dagger`). As animações de referência mostram um machado; delas vale só a postura e o movimento.
- O retrato (`images/characters/zeph.webp`) mostra uma corda no ombro; nas animações é uma alça de bolsa. No boneco, usar a alça com a bolsa.

## Detalhes implementados no jogo

Código em `characters/zeph/zeph25d.js` (ligado em `characters/hunter/hero25d.js` pelo modelo `'zeph'`); cores e medidas em
`characters/zeph/zeph_visual.js`. Veja em `yara-rpg/previews/characters_preview.html?char=zeph`.

- Cabeça (refeita): mesma geometria da Yara e do Azael (`characters/hunter/kit25d.js`), rosto na superfície da frente, levantando e
  virando para a câmera. A cabeça é de pele com contorno; o cabelo é **uma massa só** desenhada em pedaços da
  superfície (só os virados para a câmera), da linha do cabelo até o alto, com volume irregular (`hairPuff`,
  `hairBumps`). A linha do cabelo (`hairLatAt`) faz a franja em pontas (`bangSpikes`, `bangDepth`), as costeletas
  (`sideburn`) e desce até a nuca; contorno preto na linha do cabelo e na borda, fios mais escuros e um reflexo no alto.
  Sem fitas ou tufos soltos (pareciam papel recortado).
  Orelhas humanas ovais, um pouco salientes, no lado da cabeça (não atrás), da sobrancelha até a base do nariz;
  a do lado virado para a câmera é desenhada por cima do cabelo para não sumir.
- Proporções do rosto: oval com queixo curto e mandíbula estreita; olhos na metade da cabeça, um pouco maiores;
  nariz e boca mais baixos (boca a cerca de 1/3 entre o nariz e o queixo).
- Rosto: oval e limpo; sobrancelhas grossas quase retas, olhos verde-acastanhados com pálpebra, nariz reto discreto
  (sombra de um lado e a ponta), boca fechada; contorno só no queixo do lado virado para a câmera; pisca de tempos em
  tempos.
- Tronco: jaqueta verde de gola alta com fecho, botões e remendos; alça de couro do ombro direito ao quadril esquerdo
  (na frente ou nas costas, conforme o lado visível); cinto com fivela; bolsa de couro no quadril esquerdo e bainha da
  adaga no quadril direito (cada uma só aparece quando o seu lado está virado para a câmera). Sem remendo no peito.
- Braços: mangas verdes até o pulso com remendo no ombro, mãos nuas.
- Pernas: calça verde enfiada em botas marrons curtas com o cano dobrado; pé chato no chão.
- Adaga na mão direita: em repouso, baixa à frente do quadril com a ponta para a frente; golpes, aparo e dash do palco.
- Parado: mesma idle viva da Yara (braços soltos, ombro direito rolando, adaga balançando de leve).
- Sem capa.
- Proporções mais realistas: cabeça menor (`headRadius` 2,55, ~1/6 da altura), pescoço à mostra acima da gola,
  braços que afinam do ombro ao pulso com cotovelo marcado, mãos com palma, dedos e polegar, pernas que afinam da coxa à
  canela (sem bolas nas juntas), sombra suave no lado de lá da jaqueta para dar volume.
