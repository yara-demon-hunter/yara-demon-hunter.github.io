# Palco 2.5D

Faixa acima do log que mostra o herói fazendo o que os botões mandam. Só descreve: não muda nenhuma regra do jogo.

## Peças

| Arquivo | O que faz |
| --- | --- |
| `../data/visuals/stage.js` | Câmera, posições, tempos de cada ação, boneco de cada personagem, cenário de cada região e (`hero`) o que os heróis ajustam a esta câmera |
| `fx.js` | Brilho em cache, easing, aleatório com semente |
| `heroes.js` | Módulo que liga os heróis da biblioteca de personagens ao palco (ver "Personagens") |
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

Os bonecos dos heróis (Demon Hunter, Azael, Yara, Zeph, Oskar) **não moram aqui**: vêm da biblioteca de personagens
`mini_games/_library/characters/`, a mesma do Last Torch. O jogo carrega a cópia em `library/` (na pasta do jogo),
gerada por `ruby mini_games/_library/sync.rb`. **Nunca edite `library/`**: edite na biblioteca e rode o sync.

`heroes.js` (módulo) importa a cópia e expõe para os scripts clássicos o que `stage.js` usa:
`window.YaraStage25D.hero` (`createAnim`, `updateAnim`, `startSwing`, `render`, `bladeTip`, `headTop`, `moves`) e
`window.YaraRpgData.visuals.hero25d` (paleta e medidas de cada boneco). O que é só desta câmera (peso da altura na
ordem de desenho, abertura do golpe, empurrão ao levar dano, sombra, capa na corrida, salto mais baixo) fica em
`../data/visuals/stage.js` → `hero`. Medidas, rosto e cores: ajuste ao vivo em `mini_games/_library/tools/tuner.html`,
que mostra o boneco nas câmeras dos dois jogos.

`characters` em `../data/visuals/stage.js` diz qual boneco cada personagem usa (`model`): Demon Hunter `hunter` (o
padrão), Mysterious Creature `azael`, Yara `yara`, Zeph `zeph`, Oskar `oskar`.

### Como criar um boneco novo

Na biblioteca: siga "Criar um personagem ou monstro" em `mini_games/_library/README.md` (pasta
`characters/<id>/` com `<id>_visual.js` e `<id>25d.js`; os ganchos do registro estão em
`characters/hunter/body_registry.js`). Depois, aqui:

1. Rode o sync.
2. Em `heroes.js`, importe `../../library/characters/<id>/<id>25d.js` e ponha o `<ID>_VISUALS` em `visuals.hero25d`.
3. `model: '<id>'` para o personagem em `../data/visuals/stage.js`.

## Regiões (aos poucos)

Só a primeira fase (`dark-forest`, Floresta da Névoa) tem cenário. As outras usam `fallbackScene` até ganharem o seu.
Para fazer a próxima:

1. Copie o bloco `dark-forest` em `scenes` (`../data/visuals/stage.js`) com o id da região (`js/data/regions.js`).
2. Troque as cores e as fileiras (`rows`): cada fileira diz onde fica na tela (`y`) ou a profundidade (`dr`/`z`),
   o tamanho da célula, a chance e os tipos de adereço.
3. Adereço novo (tocha azul, pilar, casa...): um desenho em `PROPS` (`scenery.js`), com `bounds`, `variants` e `paint`.
