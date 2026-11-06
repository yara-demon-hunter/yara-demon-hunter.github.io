# Oskar

- **id no jogo:** oskar (`js/data/characters.js`; boneco do palco em `js/data/visuals/stage.js` → `characters.oskar`)
- **Papel:** **personagem jogável** do RPG. Caçador implacável que prefere encerrar uma luta com um golpe forte. Passiva: Força predadora (+5% de Ataque total). Começa com o **Machado de Duas Lâminas** (`double-headed-axe`), Armadura de Couro e Botas Ligeiras; luta com o machado **nas duas mãos, sem escudo**.
- **Desenho:** **2.5D**, no mesmo esquema do Zeph (`js/stage/zeph25d.js`): boneco próprio, cabeça de pele com rosto de verdade (geometria de `NS.azael.kit`) e cabelo como uma massa só por cima, sem capuz nem máscara. Boneco feito em `js/stage/oskar25d.js` (ver **Detalhes implementados**).

## Aparência

- **Silhueta / forma geral:** homem adulto, **alto** (o mais alto do grupo) e **forte, mais massudo que todos os outros**: ombros bem largos, peito grande e fundo, pescoço grosso, braços e antebraços grossos à mostra, cintura larga. Lê-se como um lenhador/caçador bruto de regata, com um machado enorme seguro nas duas mãos na frente do corpo.
- **Cabeça e rosto:** cabeça de proporção normal (cerca de 1/6 da altura, não é chibi), mandíbula larga e quadrada. Rosto duro e sério, testa franzida, sobrancelhas grossas e baixas, olhos claros e pequenos, nariz reto e largo. **Barba cheia** castanho-escura, curta e aparada, cobrindo queixo, mandíbula e bigode (é o que mais marca o rosto). Orelhas humanas.
- **Pele:** clara/bronzeada, com músculos marcados nos braços e no pescoço.
- **Cabelo:** castanho-escuro, **ralo e curto**: rente à cabeça em toda a volta, fino a ponto de a pele aparecer por baixo, com entradas fundas na testa. Nada de volume nem franja.
- **Vestuário:**
  - **Camisa regata verde-oliva**: sem mangas, cavas fundas que deixam os ombros e os braços inteiros de fora, comprida até o quadril, gasta, com remendos e gola aberta.
  - **Corda/alça fina** de couro cruzando o peito na diagonal, do ombro esquerdo para o quadril direito.
  - **Cinto de couro marrom** com fivela por cima da regata.
  - **Calça marrom-escura** larga.
  - **Botas de couro marrom** com faixas enroladas na canela (dos tornozelos até abaixo do joelho).
  - Braços nus; **munhequeiras** de couro escuro nos pulsos.
- **Mãos e pés:** mãos grandes e fortes, sem luva; botas de couro.
- **Arma:** **machado de duas lâminas** (Machado de Duas Lâminas): cabo de madeira comprido (quase da altura das pernas) e cabeça de ferro dupla, larga, em forma de borboleta, com bordas mais claras (fio) e o meio mais escuro, presa ao cabo por uma amarração. Em repouso ele segura o cabo **com as duas mãos na horizontal, na altura da cintura**, com a cabeça do machado para um dos lados (nas imagens aparece dos dois lados). **Sem escudo.**
- **Partes que se movem separadamente:** braços, machado, peito (respiração), pernas.
- **Tamanho relativo:** o maior do grupo: cerca de 10% mais alto e bem mais largo que o Demon Hunter, o Zeph e a Yara.
- **Detalhes que NÃO podem faltar:** corpo alto e massudo, barba cheia, cabelo ralo e curto, regata verde, braços musculosos à mostra, cinto, botas com faixas, machado de duas lâminas sempre nas duas mãos.
- **Detalhes que podem ser simplificados:** remendos, músculos (manchas de luz), amarração do machado, faixas das botas (listras).

## Cores

_(estimadas das imagens)_

- **Pele:** #c98a5e, sombra #9a5f3c, luz #e0a679, contorno #1a1410
- **Cabelo e barba:** #4a3020, sombra #2e1d12, brilho #6a4630
- **Olhos:** #d8d2c0 (claros)
- **Regata:** #4f5a32, sombra #353d20, luz #66713f; remendos #3d4527
- **Alça e cinto:** #6b4a2a, sombra #452e18; fivela #9aa3ad
- **Calça:** #3d2f22, sombra #281e15
- **Botas e faixas:** #5a3d24, sombra #3b2716, faixas #7a5a3a
- **Munhequeiras:** #3a2a1c
- **Machado:** cabeça #7d848b com fio #c9ced3 e meio #4a4f55; cabo #6b4423, sombra #4a2e17; amarração #8a6a44

## Personalidade e estilo

Pixel art de RPG, contorno escuro. Caçador bruto, calmo e direto: firme, de pé, pernas afastadas, poucos movimentos; quando ataca, é um golpe só, enorme, com o corpo todo.

## Desenho em 2.5D

Seguir o esquema do Zeph (`js/stage/zeph25d.js`): cabeça de pele com o rosto na superfície da frente e o cabelo como uma massa só por cima (aqui bem curto, quase colado na cabeça), virando um pouco para a câmera de lado.

- **Cabeça:** cabelo ralo e curto, quase colado na cabeça (pouco volume, linha do cabelo alta com entradas, cor do cabelo misturada com a da pele para parecer fino), **barba cheia** desenhada como uma massa na parte de baixo do rosto (queixo, mandíbula e bigode), sobrancelhas grossas.
- **Tronco:** o mais largo do grupo, peito grande; regata verde-oliva com cavas fundas (ombros à mostra) até o quadril, alça cruzando o peito, cinto com fivela.
- **Braços:** grossos e nus, com músculos marcados (luz no ombro e no bíceps) e munhequeiras escuras.
- **Pernas:** calça marrom-escura larga, botas com faixas na canela, pé chato no chão.
- **Arma:** machado de duas lâminas **sempre nas duas mãos** (parado, andando e golpeando): cabo na horizontal na frente da cintura em repouso; nos golpes, ergue acima da cabeça e desce.
- **Corpo:** mais alto (escala ~1,1 do boneco) e mais massudo: ombros e peito mais largos (`shoulderScale` > 1), braços e pernas mais grossos que os de todos os outros.
- **Contorno:** escuro em tudo.

## Animações

Mesmos estados do palco do RPG (ver `previews/characters_preview.html`):

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle (parado) | sem ação | de pé, pernas afastadas, machado na horizontal na frente da cintura com as duas mãos; respiração lenta e pesada (peito e ombros), machado sobe e desce de leve | loop ~1,4s | images/oskar-idle.webp, images/oskar-idle-2.webp |
| andar (explorar) | ao explorar | passos pesados e largos; machado nas duas mãos, atravessado na frente do corpo | acompanha a velocidade | |
| ataque (combo / pesado) | ao atacar | ergue o machado acima da cabeça com as duas mãos, corpo esticado → desce num golpe forte para a frente e para baixo → volta à guarda | ~0,5s | images/oskar-attack.webp (o alto do golpe) |
| crítico (Fúria) | ataque com a Fúria cheia | o mesmo golpe por cima, mais forte, com impacto no chão | ~0,6s | images/oskar-attack.webp |
| aparo | ao aparar | cabo do machado atravessado na frente do corpo, segurado com as duas mãos | ~1,1s | |
| esquiva | ao esquivar | passo pesado para trás | ~0,3s | |
| poção | ao beber | solta uma mão do machado só para levar o frasco à boca | ~1,1s | |
| descanso | na fogueira | _(a definir)_ | lento | |
| levar dano | ao ser atingido | pisca branco e é empurrado (pouco: é pesado) | ~0,1s | |
| derrota | ao perder | ajoelha apoiado no machado e tomba | ~1,4s | |
| retrato | seleção de personagem | — | — | `../../images/characters/oskar.webp` |

## Imagens

Imagens paradas (`.webp`, pixel art, 300x300, de frente/3/4):

- `images/oskar-idle.webp` — parado em guarda, machado na horizontal com a cabeça para a direita de quem olha
- `images/oskar-idle-2.webp` — a mesma pose espelhada (cabeça do machado para a esquerda de quem olha)
- `images/oskar-attack.webp` — machado erguido acima da cabeça com as duas mãos (o alto do golpe)

## Observações

- Lados sempre do ponto de vista dele (no boneco 2.5D, direita = lado +b).
- **Arma: Machado de Duas Lâminas nas duas mãos** (decidido). Bate com o equipamento inicial em `js/data/characters.js` (`double-headed-axe`, sem escudo).
- O retrato (`images/characters/oskar.webp`) é de perfil e mostra a camisa com gola amarrada por cordão; nas imagens novas é uma regata com uma alça cruzando o peito. No boneco, seguir as imagens novas.

## Detalhes implementados no jogo

Código em `js/stage/oskar25d.js` (ligado em `js/stage/hero25d.js` pelo modelo `'oskar'`); cores, medidas e posições em
`js/data/visuals/hero25d.js` → `oskar`. Veja em `previews/characters_preview.html?char=oskar` e ajuste ao vivo em
`previews/tuner.html?model=oskar`.

- Tamanho: o boneco inteiro é 10% maior que os outros (`bodyScale`), com braços e pernas mais grossos (`armScale`,
  `legWidth`). Ombros proporcionais (`shoulderScale` 1): um ombro muito largo virava "ombreira" e fazia cantos do
  tronco vazarem atrás deles.
- Cabeça: mesmo esquema do Zeph (cabeça de pele, rosto na frente virando para a câmera). Cabelo ralo e curto: malha
  colada na cabeça e um pouco transparente (`hairOpacity`), linha do cabelo alta com entradas (`hairline`, `recede`) e
  costeletas que ligam na barba. Orelhas humanas no lado da cabeça.
- Rosto: barba cheia como uma massa só (das costeletas pela mandíbula até abaixo do queixo, subindo pelas bochechas
  até o bigode; `beardTop`, `beardChin`, `beardWidth`, `mustacheY`) com um lado mais escuro; sobrancelhas grossas e
  baixas, olhos claros e pequenos com pálpebra pesada, nariz largo, boca escura no meio da barba, rugas leves na testa.
  Pisca de vez em quando.
- Tronco: contorno arredondado (cintura → peito largo → ombros redondos → trapézio até o pescoço), sem cantos;
  regata verde-oliva com cavas fundas, alças e decote em U, lado de lá mais escuro, peitoral marcado e remendo; cinto com
  fivela; alça de couro do ombro esquerdo ao quadril direito; pescoço grosso.
- Braços: deltoide proporcional, braço grosso afinando até o pulso, cotovelo marcado, mãos fechadas no cabo.
- Correndo, o machado balança com a passada (sobe e desce a cada passo e gira um pouco).
- Braços nus e musculosos (luz no ombro e no bíceps), munhequeiras escuras, mãos grandes.
- Pernas: calça marrom-escura larga; botas com faixas enroladas; pé chato no chão.
- Machado de duas lâminas: cabo comprido, cabeça dupla em forma de borboleta com o meio escuro e o fio claro,
  amarração no encaixe (`bladeLength`, `axeHeadSize`). Sempre nas duas mãos: a mão livre fica no cabo, acima da outra
  (`gripSpread`), menos quando bebe a poção. Ombros e braços ajustáveis: `rightShoulderOffset`, `rightElbowOffset`, `rightHandOffset` e os
  três da esquerda (eixos a = frente, b = lado, z = altura). A mão direita leva o machado junto; a esquerda fica no cabo e
  `gripSpread` define a distância entre as duas mãos (menor = braço esquerdo mais recuado). Em repouso, cabo deitado na frente da cintura com a cabeça para a frente
  e a esquerda, subindo e descendo com a respiração; nos golpes usa a varredura do palco.
- Sem capa.
