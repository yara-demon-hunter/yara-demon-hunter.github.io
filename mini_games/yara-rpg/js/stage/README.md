# Palco 2.5D

Faixa acima do log que mostra o herói fazendo o que os botões mandam. Só descreve: não muda nenhuma regra do jogo.

## Peças

| Arquivo | O que faz |
| --- | --- |
| `../data/visuals/hero25d.js` | Cores e medidas dos bonecos (cópia do Last Torch; mudar aqui não muda o Last Torch) |
| `../data/visuals/stage.js` | Câmera, posições, tempos de cada ação, boneco de cada personagem e cenário de cada região |
| `fx.js` | Brilho em cache, easing, aleatório com semente |
| `hero25d.js` | Boneco 2.5D (Demon Hunter) e as posturas: golpe, salto pesado, aparo, poção, ajoelhar, derrota |
| `azael25d.js` | Peças do Azael (Mysterious Creature) no mesmo boneco |
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

`characters` em `../data/visuals/stage.js`: Demon Hunter usa o boneco `hunter`; Mysterious Creature usa `azael`.
Zeph, Oskar e Yara usam o corpo do Demon Hunter com as cores do retrato, até ganharem boneco próprio.

## Regiões (aos poucos)

Só a primeira fase (`dark-forest`, Floresta da Névoa) tem cenário. As outras usam `fallbackScene` até ganharem o seu.
Para fazer a próxima:

1. Copie o bloco `dark-forest` em `scenes` (`../data/visuals/stage.js`) com o id da região (`js/data/regions.js`).
2. Troque as cores e as fileiras (`rows`): cada fileira diz onde fica na tela (`y`) ou a profundidade (`dr`/`z`),
   o tamanho da célula, a chance e os tipos de adereço.
3. Adereço novo (tocha azul, pilar, casa...): um desenho em `PROPS` (`scenery.js`), com `bounds`, `variants` e `paint`.
