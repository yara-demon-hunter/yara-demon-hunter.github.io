# Rowan, o druida

**Origem:** criado em 2026-11-13 a pedido do dono do projeto ("um personagem druida com plantas, de um nome qualquer"). A primeira passada do boneco saiu só do pedido, sem imagem. No mesmo dia o dono colocou as imagens de referência abaixo, e elas passam a valer.

## Imagens de referência

| Arquivo | O que mostra |
|---|---|
| `images/rowan_druid_body.webp` | corpo inteiro, em pé, de frente: mão esquerda aberta soltando folhas, cajado na direita |
| `images/rowan_perfil.webp` | busto em três quartos: rosto, cabelo, barba trançada e ombreiras |

Estilo das duas: pixel art com contorno escuro, fundo branco, folhas verdes e faíscas amarelas girando em volta.

## Como ele é (pela referência)

| Parte | Descrição |
|---|---|
| Corpo | homem adulto, robusto, ombros largos, pernas firmes; proporção realista |
| Rosto | pele clara bronzeada, sobrancelhas grossas e franzidas, olhos verdes, nariz largo; expressão séria |
| Cabelo | castanho, comprido e desgrenhado, em mechas grossas (quase dreads) caindo pelos ombros; folhas verdes presas como uma coroa na testa e no topo |
| Barba | castanha, cheia e longa até o peito, com tranças presas por anéis verdes e folhas no meio |
| Ombros | ombreiras de couro marrom em camadas |
| Tronco | túnica verde-oliva até os joelhos, com barra dourada; alças de couro cruzadas no peito; cinto marrom largo com fivela redonda de folha |
| Cinto | bolsa de couro à esquerda, bolsinha menor à direita e um amuleto de folha laranja pendurado |
| Braços | mangas verdes, braçadeiras de couro marrom com trama |
| Pernas | calça marrom-escura, botas de couro altas com dobra |
| Capa | manto verde-escuro comprido, quase até o chão, com desenhos de folhas/runas na barra |
| Arma | cajado de madeira retorcida, alto como ele, com a ponta em espiral segurando uma esfera laranja brilhante |
| Magia | folhas soltas, gavinhas de cipó e faíscas amarelo-esverdeadas em volta das mãos e do corpo |

**Cores:** verdes de musgo e oliva (túnica, capa, folhas), marrons de couro e madeira, castanho do cabelo e da barba, laranja-âmbar da esfera e do amuleto, amarelo-esverdeado das faíscas.

## O boneco 2.5D

**Molde:** o boneco do Zeph (`zeph/zeph25d.js`), com a cabeça de pele, o cabelo em massa única, o tronco, o braço e a perna. A barba segue a do Oskar (`oskar/oskar25d.js`). Medidas e cores ficam em `rowan_visual.js`, o desenho em `rowan25d.js`.

**Histórico:** a primeira passada (13/11, de manhã) foi feita sem imagem: cabelo curto avermelhado, duas galhadas, capa curta e uma semente verde no cajado. No mesmo dia, depois das imagens de referência, o boneco foi refeito para segui-las:

| Peça | Como ficou |
|---|---|
| Cabelo | castanho, mais volumoso (`hairPuff` 1.24); franja curta (`bangDepth` 0.14); 7 mechas soltas (`hairLocks`, `maneLength`) caem das orelhas e da nuca até os ombros |
| Coroa | só folhas presas no cabelo (`crownLeaves` 7); as galhadas saíram |
| Rosto | sobrancelhas mais grossas e franzidas (`browThickness`, `browTilt`); olhos verdes |
| Barba | cheia, com bigode (`beardWidth`, `beardTop`, `beardChin`, `mustacheY`); fios mais escuros, uma folha presa e duas tranças com anel verde (`braidLength`) descendo até o peito |
| Ombros e braços | ombreira de couro em duas camadas; braçadeira de couro no antebraço; corpo mais robusto (`shoulderScale`, `waistScale`, `armScale`, `legWidth`) |
| Tronco | túnica verde-oliva mais longa, com abertura e barra douradas (`trim`), alças de couro cruzadas no peito, cinto largo com fivela redonda de folha, bolsa de couro à esquerda e amuleto de folha laranja à direita |
| Pernas | botas altas (o couro começa logo abaixo do joelho) |
| Capa | a capa padrão, verde-escura; o comprimento é o mesmo de todos os heróis (vem de `hunter/hero25d_visual.js`) e não fica tão longo quanto na referência |
| Cajado | madeira retorcida com a ponta em espiral em volta de uma esfera laranja (`seed*`, `seedRadius` 1.4); o brilho da arma também ficou laranja (`blade*`); o da Fúria continua verde |

**Retrato do jogo:** `last_torch/images/characters/rowan-small.webp` (512×512, fundo transparente) é um recorte do rosto de `images/rowan_perfil.webp`, copiado para o jogo (o jogo nunca aponta para esta pasta).

**Pendente:** a capa mais longa precisa de uma opção por herói no corpo comum. Ajustes finos em `tools/tuner.html?model=rowan`.
