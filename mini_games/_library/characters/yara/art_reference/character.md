# Yara

- **id no jogo:** yara no yara-rpg (`yara-rpg/js/data/characters.js`; boneco do palco em `yara-rpg/js/data/visuals/stage.js` → `characters.yara`)
- **Papel:** **personagem jogável** do RPG. Caçadora de demônios mestiça, dividida entre a natureza humana e o poder demoníaco. Passiva: Fúria evasiva (+5 de Fúria a cada esquiva). Ágil, luta de perto e se esquiva muito.
- **Desenho:** **2.5D**, no mesmo esquema do boneco do palco (`characters/hunter/hero25d.js`). Hoje ela usa o corpo do Demon Hunter com outras cores (provisório); precisa de **boneco próprio**, como o Azael (`characters/azael/azael25d.js`): sem capuz nem máscara, rosto à mostra, maria-chiquinhas bicolores e roupa de aventureira.

## Aparência

- **Silhueta / forma geral:** moça jovem, magra e atlética, altura de uma pessoa comum (um pouco menor que o Demon Hunter). Vista de cima/inclinada, lê-se pelas **duas maria-chiquinhas grandes, uma preta e uma branca**, o **cachecol vermelho** com a ponta voando para trás, a **ombreira de metal com pelo branco** num ombro só e a calça larga escura com botas.
- **Cabeça e rosto:** rosto jovem e expressivo, sorriso confiante (às vezes risada aberta, com **caninos pontudos**). **Orelhas levemente pontudas** (pequenas, élficas), com brinquinho. **Olhos de cores diferentes (heterocromia): direito vermelho (do lado do cabelo preto), esquerdo azul (do lado do cabelo branco)**. **Pintura de guerra preta:** um traço grosso descendo de cada olho até o queixo, com uma pontinha na lateral do olho (parecido com o Azael, mais fino). Bochechas levemente rosadas.
- **Pele:** morena clara/bronzeada.
- **Cabelo:** **dividido ao meio por cor**: o lado direito dela é **preto**, o esquerdo é **branco**. Preso em **duas maria-chiquinhas altas** e volumosas (elástico vermelho no lado preto, azul-escuro no lado branco), com franja e mechas soltas caindo dos lados do rosto, até o meio das costas. Vista de costas, a divisão preta/branca fica bem nítida no meio da cabeça.
- **Faixa na testa:** bandana **vermelha** larga na testa, por baixo da franja.
- **Vestuário:**
  - **Cachecol vermelho** enrolado no pescoço, com uma **ponta longa e esfarrapada** que cai pelo ombro esquerdo e voa para trás.
  - **Top cropped** sem mangas, cinza-escuro esverdeado, decote em V com um **pingente triangular prateado** no peito, colar de corrente fina e uma **faixa de couro com fivela** logo abaixo do peito. **Barriga à mostra.**
  - **Ombreira de metal** cinza só no **ombro esquerdo**, com gola de **pelo branco** por cima e tiras de couro com fivelas no braço.
  - **Bandagem branca** no braço direito (bíceps).
  - **Luvas sem dedos** de couro marrom com braçadeiras grossas até o antebraço.
  - **Cinto duplo** de couro marrom com fivelas e **bolsinhas**, preso de lado; à frente, uma **aba de pano branco com borda vermelha e um símbolo vermelho** (runa em forma de V/coroa). Atrás, as tiras do cinto se cruzam em X e há outra aba de pano.
  - **Calça larga** marrom-escura quase preta, com bolsos laterais e tiras nas coxas.
  - **Botas** de couro marrom altas, até abaixo do joelho, com cadarço e fivelas.
- **Mãos e pés:** mãos humanas com luvas sem dedos; botas comuns (sem garras).
- **Arma:** **espada curta** (não aparece nas imagens; definida para o boneco). Lâmina reta e larga, do tamanho de um antebraço e meio (bem menor que a espada do Demon Hunter), aço claro com fio brilhante, guarda simples de metal escuro, cabo enrolado em couro marrom e pomo pequeno. Brilho fraco **vermelho** no gume (o lado demoníaco dela), mais forte na Fúria. Guardada numa **bainha de couro marrom presa no cinto, no quadril direito**; em combate fica na mão direita, ponta para a frente e para baixo. Ágil: cortes curtos e rápidos e estocadas. No jogo ela começa com a **Espada de Ferro** (`iron-sword` em `startingEquipment`, `js/data/characters.js`).
- **Partes que se movem separadamente:** espada curta, as duas maria-chiquinhas (balançam e voam para trás), ponta do cachecol, mechas da franja, braços, pernas, aba de pano da cintura.
- **Tamanho relativo:** um pouco menor e mais leve que o Demon Hunter.
- **Detalhes que NÃO podem faltar:** cabelo metade preto / metade branco em duas maria-chiquinhas, bandana e cachecol vermelhos, olhos vermelho e azul, pintura de guerra, barriga à mostra, ombreira com pelo branco num ombro só, espada curta com brilho vermelho.
- **Detalhes que podem ser simplificados:** colar e pingente, fivelas, bolsinhas e tiras (viram listras/bolinhas), símbolo da aba (uma mancha vermelha), cadarços das botas.

## Cores

_(estimadas a partir das imagens)_

- **Pele:** #c98f62, sombra #9a6440, luz #e3b48a, contorno #1f1612
- **Cabelo preto:** #1b1a22, brilho #3a3946; **cabelo branco:** #eeeef2, sombra #b5b8c4
- **Olhos:** direito vermelho #dc2626, esquerdo azul #3b82f6 (brilho #93c5fd)
- **Pintura de guerra:** #141414
- **Bandana e cachecol:** vermelho #9b1c1c, sombra #6b1212, luz #c2412d
- **Top:** #2f3530, sombra #1e2320; pingente e colar #c9ced6
- **Ombreira:** metal #6b737c, luz #a3abb4, sombra #3b4249; pelo #f1f1ee com sombra #c9c9c4
- **Bandagem do braço:** #e9e6dc
- **Espada curta:** lâmina #d9dee5 com fio #ffffff, brilho #ef4444 (Fúria #ff2a2a), guarda #3b4249, cabo #5a3a22
- **Couro (luvas, cinto, bolsas, botas):** #5a3a22, sombra #3a2414, fivelas #9aa3ad
- **Calça:** #2b211b, sombra #1a1410
- **Aba de pano:** #e9e2d0 com borda e símbolo #9b1c1c
- **Elásticos do cabelo:** vermelho #b91c1c (lado preto), azul-escuro #1e3a5f (lado branco)

## Personalidade e estilo

Anime/dark fantasy, traço limpo com contorno escuro. Alegre, provocadora e confiante, com um lado demoníaco selvagem (caninos, olho vermelho, pintura de guerra). Em combate fica numa base baixa e larga, punhos à frente, pronta para pular; entre as lutas lê mapas sentada ou medita flutuando.

## Desenho em 2.5D

Seguir o mesmo esquema do Azael (`characters/azael/azael25d.js`): cabeça como esfera de cabelo com o rosto desenhado na superfície da frente (não uma máscara colada), virando um pouco para a câmera de lado.

- **Cabeça:** esfera de cabelo dividida ao meio: metade direita (dela) preta, metade esquerda branca (a divisão é a risca do meio). Rosto moreno com olhos vermelho e azul brilhando, pintura de guerra e sorriso; orelhas pequenas e pontudas.
- **Maria-chiquinhas:** duas mechas grossas presas no alto, dos lados da cabeça, com a mesma física de corrente do cabelo do Azael (balançam paradas, voam para trás correndo). Uma preta, uma branca.
- **Bandana:** faixa vermelha na testa.
- **Tronco:** top escuro curto, barriga à mostra (pele), cachecol vermelho volumoso no pescoço com a ponta voando como as pontas da bandana do Azael.
- **Braços:** ombro esquerdo com ombreira de metal e pelo branco; braço direito nu com bandagem branca; luvas marrons.
- **Cintura e pernas:** cinto marrom com a aba branca e vermelha na frente, calça larga escura, botas marrons altas.
- **Contorno:** escuro em tudo, para o cabelo branco e a pele não se misturarem com o cenário.

## Animações

Mesmos estados do palco do RPG (ver `previews/characters_preview.html`):

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle (parado) | sem ação | respiração; maria-chiquinhas e ponta do cachecol balançando leve | loop ~1,2s | images/yara-poses.jpeg (de frente) |
| andar (explorar) | ao explorar | passada leve; maria-chiquinhas e cachecol voam para trás | acompanha a velocidade | images/yara-poses.jpeg (de lado) |
| guarda / combate | em combate | base baixa e larga, punhos à frente, cara de provocação | loop | images/yara-poses.jpeg (canto superior, agachada) |
| ataque 1 e 2 (combo) | ao atacar | cortes curtos e rápidos com a espada curta, ida e volta; maria-chiquinhas chicoteiam | ~0,15s cada | |
| ataque 3 / pesado | 3º golpe ou golpe pesado | salta e desce com uma estocada forte para a frente, rastro vermelho | ~0,25s | images/yara-poses.jpeg (agachada, para o impulso) |
| crítico (Fúria) | ataque com a Fúria cheia | giro rápido com a espada, rastro vermelho intenso, olho vermelho brilha | ~0,3s | |
| esquiva | ao esquivar | salto rápido para trás/lado; cabelo e cachecol chicoteiam | ~0,3s | |
| aparo | ao aparar | espada curta atravessada na frente do corpo, base baixa; faísca no impacto | ~1,1s | |
| poção | ao beber | leva o frasco à boca | ~1,1s | |
| descanso | na fogueira | sentada de pernas cruzadas lendo um mapa | lento | images/yara-poses.jpeg (canto superior direito) |
| meditar / Fúria | Fúria pronta | flutua de pernas cruzadas, olhos fechados, névoa azul em volta | lento | images/yara-body.png |
| levar dano | ao ser atingida | pisca branco e é empurrada | ~0,1s | |
| derrota | ao perder | ajoelha e tomba | ~1,4s | |
| retrato | seleção de personagem | — | — | images/yara-perfil.png |

## Imagens

- `images/yara-perfil.png` — close do rosto e do busto: heterocromia (vermelho/azul), pintura de guerra, caninos, bandana, cachecol, ombreira com pelo, colar e pingente, bandagem no braço.
- `images/yara-poses.jpeg` — folha de personagem: de frente, de lado, de costas, de costas em combate, agachada em guarda, sentada lendo mapa, close sorrindo e detalhes do cinto e da ombreira.
- `images/yara-body.png` — corpo inteiro meditando, flutuando de pernas cruzadas sobre a névoa azul (olhos fechados); boa referência de cores do cinto, da aba e das botas.

## Observações

- A Yara **não usa capuz nem máscara**: a versão atual (corpo do Demon Hunter recolorido em roxo e vermelho) é provisória.
- Lados (sempre do ponto de vista dela): **cabelo preto, olho vermelho e bandagem à direita; cabelo branco, olho azul, ombreira e ponta do cachecol à esquerda**. Na imagem de frente isso aparece invertido para quem olha; de costas, como está. No boneco 2.5D, direita = lado +b.
- A espada curta não aparece nas imagens: seguir a descrição em **Arma** (lâmina curta, brilho vermelho, bainha no quadril direito).

## Detalhes implementados no jogo

Código em `characters/yara/yara25d.js` (ligado em `characters/hunter/hero25d.js` pelo modelo `'yara'`); cores e medidas em
`characters/yara/yara_visual.js`. Veja em `yara-rpg/previews/characters_preview.html?char=yara`.

- Cabeça: mesma geometria do Azael (`characters/hunter/kit25d.js`): esfera de cabelo com o rosto desenhado na superfície da frente,
  levantando um pouco o rosto para a câmera e virando de lado. Cabelo pintado em duas metades exatas pela risca:
  preto à direita dela, branco à esquerda.
- Rosto: pele morena, olhos grandes amendoados (direito vermelho, esquerdo azul) com íris, pupila, brilho e cílios,
  sobrancelhas finas e arqueadas, bochechas rosadas, nariz pequeno, sorriso com dentinhos e caninos pequenos e um traço
  fino de pintura de guerra descendo de cada olho.
- Maria-chiquinhas: uma preta e uma branca, presas dos lados com elásticos (vermelho e azul-escuro), caem ao lado da
  cabeça e voam para o lado e para trás na corrida (sem subir como chifres). Franja e mechas dos lados em duas cores.
- Bandana vermelha em volta da cabeça; ponta do cachecol vermelho saindo do ombro esquerdo no lugar da capa.
- Corpo feminino: ombros estreitos, cintura fina e quadril um pouco mais largo; braços finos. Top curto escuro com
  pingente e faixa de couro embaixo do peito, barriga à mostra com umbigo, cinto com fivela, aba branca com o símbolo
  vermelho e bolsinha no quadril direito.
- Braços: bandagem branca no direito; ombreira de metal com pelo branco no esquerdo; luvas de couro sem dedos.
- Pernas: calça larga escura e botas de couro altas, com o pé chato no chão (calcanhar e sola apoiados).
- Parada: braços soltos e dobrados, um pouco abertos; respiram e balançam devagar, cada um no seu ritmo, e a espada
  balança junto (`idleArms` em `characters/hunter/hero25d.js`). O ombro direito rola para a frente e para trás e sobe e
  desce com a respiração; o esquerdo mexe bem menos. Some ao correr e nos golpes.
- Espada em repouso: segurada em pé, ponta para cima e um pouco para a frente (guarda), na altura da cintura;
  no golpe volta para a varredura normal.
- Espada curta reta (`bladeLength` 8,5) com cabo de couro, guarda e pomo escuros, fio claro e brilho vermelho; usa os
  golpes, o aparo, o dash e o descanso do boneco do palco.
