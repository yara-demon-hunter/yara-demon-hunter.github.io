# Kuro, o ninja

**Origem:** criado em 2026-11-24 a pedido do dono do projeto ("um ninja com uma espada de ninja que joga shurikens"). A primeira versão saiu só do pedido; no mesmo dia o dono colocou as imagens de referência abaixo e a versão atual do boneco e do retrato segue elas.

## Imagens de referência

| Arquivo | O que mostra |
|---|---|
| `images/curo-ninja-corpo.png` | corpo inteiro, em pé, com a katana curva na mão esquerda: a referência principal do traje |
| `images/kuro-ninja-posicao.png` | agachado sobre uma rocha, à noite, com a lua e um castelo ao fundo: pose e clima (realista, mais sombrio) |
| `images/kuro-ninja.png` | busto com a testeira rasgada ao vento, ombreira e faixa cruzada (traz uma barra de vida desenhada, que não faz parte do personagem) |
| `images/kuro-ninja.webp` | o mesmo busto, sem fundo: é a fonte do retrato do jogo (`last_torch/images/characters/ninja-small.webp`) |

## Como ele é (pela referência)

| Parte | Descrição |
|---|---|
| Corpo | homem atlético e ágil, postura baixa de combate; proporção realista |
| Roupa | toda preta com um leve tom arroxeado, tecido gasto com costuras aparentes; barra da túnica rasgada |
| Cabeça | capuz preto de costuras marcadas; máscara preta que cobre do nariz ao queixo, só os olhos aparecem: castanhos, sobrancelhas franzidas, olhar duro |
| Pescoço | cachecol preto grosso, em dobras, cobrindo o queixo |
| Testeira | faixa vermelha larga no capuz com duas pontas compridas, rasgadas nas bordas, esvoaçando |
| Peito | faixa vermelha larga cruzando do ombro ao quadril; tiras de couro com fivelas de metal por baixo |
| Ombros | ombreiras de couro escuro em camadas, com rebites de bronze |
| Braços | mangas pretas e justas; braçadeiras de couro escuro com tiras e rebites; luvas pretas |
| Cintura | faixa vermelha larga em volta da cintura; duas tiras vermelhas compridas e rasgadas pendem na frente e voam ao lado |
| Pernas | calça larga e preta, presa na canela; botas altas de couro preto com três tiras; tabi (dedão separado) |
| Arma | katana de lâmina longa e levemente curva, aço claro com brilho azulado; guarda redonda de bronze, cabo trançado preto |
| Arremesso | shurikens (`_library/weapons/shuriken`), no lugar da adaga |
| Cores | preto, vermelho vivo (`#c01414`), couro escuro e bronze; o vermelho é a única cor forte |

## Como foi feito

O boneco 2.5D (`ninja25d.js`) parte do boneco do Azael (mesma câmera, animação, braço da espada e bainha) com as peças trocadas. A versão detalhada (2026-11-24, depois das referências) ganhou: paleta preta arroxeada com couro e bronze (`armor`, `armorLight`, `armorEdge`), ombreiras e braçadeiras de couro com rebites, botas altas com três tiras, faixa larga na cintura com pano vermelho pendurado na frente, pontas rasgadas compridas da faixa do quadril que voam na corrida, testeira mais longa, katana mais longa e curva (`bladeLength` 15.8, `bladeCurve` 0.045) com guarda de bronze. O retrato é a arte de referência recortada.

## O que foi tirado do Azael

Orelhas pontudas, cabelo comprido, franja, mechas, pintura de guerra, capa e garras. A máscara (`mask`, `maskShade`) é uma cor nova na paleta.
