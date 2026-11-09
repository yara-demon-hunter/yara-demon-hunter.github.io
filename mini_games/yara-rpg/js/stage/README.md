# Palco 2.5D

Faixa acima do log que mostra o herói fazendo o que os botões mandam. Só descreve: não muda nenhuma regra do jogo.

## Peças

| Arquivo | O que faz |
| --- | --- |
| `../data/visuals/hero25d.js` | Cores e medidas dos bonecos (cópia do Last Torch; mudar aqui não muda o Last Torch) |
| `../data/visuals/stage.js` | Câmera, posições, tempos de cada ação, boneco de cada personagem e cenário de cada região |
| `fx.js` | Brilho em cache, easing, aleatório com semente |
| `hero25d.js` | Motor do boneco 2.5D: pose, posturas (golpe, salto pesado, aparo, poção, ajoelhar, derrota), câmera e ordem de desenho. Desenha o Demon Hunter e chama o boneco registrado dos outros personagens; não cita nenhum personagem pelo nome |
| `azael25d.js` | Peças do Azael (Mysterious Creature) no mesmo boneco; também exporta `kit`, a geometria de cabeça com rosto usada por outros bonecos |
| `oskar25d.js` | Peças do Oskar no mesmo boneco, maior (`bodyScale`): barba, cabelo ralo, regata, braços fortes, machado de duas lâminas nas duas mãos |
| `zeph25d.js` | Peças do Zeph no mesmo boneco (cabeça com rosto, cabelo bagunçado, jaqueta, alça e bolsa, adaga) |
| `yara25d.js` | Peças da Yara no mesmo boneco (cabeça com rosto, cabelo de duas cores, cachecol, corpo feminino, espada curta) |
| `monsters25d.js` | Monstros desenhados (Esqueleto, Bruxa, Lobo Sombriço, Espectro Corrompido), adaptados do Last Torch (o Lobo Sombriço é desenho próprio); os outros monstros usam a imagem recortada |
| `scenery.js` | Câmera de diorama e cenário: fundo, fileiras de adereços, trilha, névoa, luz |
| `stage.js` | Atores, efeitos e o diretor: cada ação vira uma sequência com tempo |
| `hooks.js` | Liga o palco ao RPG: lê o estado do jogo e embrulha as ações dos botões |

## Como funciona

1. `hooks.js` embrulha `exploreForest`, `combatQuickAttack` etc. Antes e depois de cada ação tira uma foto do
   estado e monta o relatório do turno: acertou? quanto? o monstro revidou? aparado? esquivado?
2. `stage.play(acao, relatorio)` escolhe a sequência em `SCRIPTS` (`stage.js`): avança, corta, o monstro recua,
   avança e acerta... Ações seguidas entram na fila e o diretor acelera para alcançar o jogo.
3. Com o diretor parado, o palco confere o estado (`watch`): monstro que apareceu ou sumiu, baú, subida de nível.

O palco não lê o jogo direto, só pela fonte (`source` em `hooks.js`). Dá para rodá-lo com um estado falso:
`previews/stage_preview.html` faz isso, e `previews/characters_preview.html` mostra cada boneco em todas as poses.

## Personagens

`characters` em `../data/visuals/stage.js` diz qual boneco cada personagem usa (`model`). Demon Hunter usa o padrão (`hunter`, desenhado em `hero25d.js`); os outros têm o boneco registrado no próprio arquivo: Mysterious Creature `azael`, Yara `yara`, Zeph `zeph`, Oskar `oskar`.

### Como criar um boneco novo

1. Medidas e cores em `../data/visuals/hero25d.js`: uma entrada nova (ex.: `maria`) com `colors`, `bladeLength`, `bladeWidth`, `glowScale` e, se for maior ou menor, `bodyScale`.
2. Arquivo `js/stage/maria25d.js` (copie o `zeph25d.js`, o mais enxuto) com as peças e, no fim, o registro:
   `NS.bodies.maria = { vis: 'maria', bind(context) { ctx = context; }, ... }`.
3. `model: 'maria'` para o personagem em `../data/visuals/stage.js`.
4. Um `<script>` do arquivo em `partials/scripts.html` (antes de `hero25d.js`) e o mesmo nas três páginas de `previews/`.

`hero25d.js` não muda. Tudo o que o registro traz é opcional (o que faltar usa o desenho do Demon Hunter):

| Campo | Para quê |
| --- | --- |
| `vis` (obrigatório) | Chave do boneco em `visuals/hero25d.js` (cores, lâmina, `glowScale`, `bodyScale`) |
| `bind(ctx)` | Recebe o canvas antes de cada desenho |
| `drawLeg(rig, { hip, knee, ankle, toe, reach, side, lift })`, `drawTorso(rig, pose, bottom, top, wb, wt)` | Pernas e tronco |
| `drawBack(rig, pose, anchors, hem)` | No lugar da capa (cachecol, bolsa; função vazia = sem nada nas costas). `rig.sashEnds(pose)` desenha as pontas da faixa |
| `drawArm(rig, shoulder, elbow, hand, armWidth, handRadius)` | Os dois braços, com a mesma forma |
| `armTweak(rig, side, pose)` | Ajusta o braço padrão: `{ shoulderOffset, elbowOffset, hand(hand) }`; `side` é -1 (livre) ou 1 (espada) |
| `armParts(rig, pose)` | Troca os dois braços de uma vez: `{ free, sword }` (peças `{ depth, draw }`) |
| `drawBlade(rig, hand, dir, alpha)` | A arma |
| `swordRest(rig, pose, { hand, dir, swingAngle, blend })` | Como a arma fica em repouso: devolve `{ hand, dir, armHand? }`; no golpe (`blend` = 1) volta à varredura normal |
| `headParts(pose, rig)` | Lista de peças `{ depth, draw }` da cabeça (cabelo, rosto, acessórios) |
| `idleArms` | Braços respirando parado |
| `sheathed`, `vigilFreeHand`, `drawn(pose)`, `runBob(anim, run)` | Arma guardada na bainha (não é empunhada no dash nem na derrota), mão livre ao ajoelhar, quanto a arma está fora da bainha, sobe e desce na corrida |

`rig` traz as ferramentas de desenho (`project`, `limb`, `ball`, `disk`, câmera) e de pose (`add3`, `mix`, `norm3`, `swordArmPose`, `drawFlask`, `V`).

## Regiões (aos poucos)

Só a primeira fase (`dark-forest`, Floresta da Névoa) tem cenário. As outras usam `fallbackScene` até ganharem o seu.
Para fazer a próxima:

1. Copie o bloco `dark-forest` em `scenes` (`../data/visuals/stage.js`) com o id da região (`js/data/regions.js`).
2. Troque as cores e as fileiras (`rows`): cada fileira diz onde fica na tela (`y`) ou a profundidade (`dr`/`z`),
   o tamanho da célula, a chance e os tipos de adereço.
3. Adereço novo (tocha azul, pilar, casa...): um desenho em `PROPS` (`scenery.js`), com `bounds`, `variants` e `paint`.
