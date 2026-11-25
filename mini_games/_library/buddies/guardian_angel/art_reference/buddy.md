# Buddy: Anjo guardião (Guardian Angel)

- **pasta:** `buddies/guardian_angel/`
- **Papel:** Last Torch, skill Guardian Angel (Light Path). Voa em volta da tocha e, com um cajado, lança bolas de luz nos monstros mais perto dela.
- **Funções:** `angel25d.js` (registra o boneco `'angel'`), `guardian_angel_visual.js` (`GUARDIAN_ANGEL_VISUALS`) e `guardian_orb.js` (`drawGuardianOrb(g, x, y)`, a bola de luz).

## Como é desenhada

Referência: `images/guardian-angel.jpeg`. **É um boneco 2.5D do motor do herói** (`angel25d.js` registra o modelo `'angel'` em `characters/hunter/body_registry.js`), como as sombras do Shadow Clone: o jogo cria um corpo com a própria animação (`createHeroAnim` + `updateHeroAnim`) e o desenha com `renderPlayer25D(corpo, anim, cores, null, 'angel')`. O motor dá a passada das pernas, o giro para onde ele voa, a inclinação do voo e a capa; o plugin dá as peças: armadura branca e dourada (ombreiras, emblema de asas, joelheiras, botas), elmo de prata com crista e protetor de nariz, cabelo claro comprido em massa única, auréola flutuando, saia (tabardo), capa, asas em camadas (penas longas atrás, cobertas no meio, pequenas junto ao corpo, em 3D: de frente abrem para os lados, de costas vêm para a frente, de lado ficam de topo) e o **cajado de energia** (a "lâmina" do motor): fuste azul e branco com duas fitas em espiral e um cristal de quatro pontas que pulsa em dourado e branco.

Voa: sobe do chão (`pose.lift`), bate as asas (relógio próprio, mais rápido ao voar e ao lançar) e as pernas continuam mexendo (balançam devagar parado, pedalam em velocidade). Lançar usa o golpe `staffCast` do motor (o cajado erguido do Gudran): o cajado sobe e aponta, o cristal acende. O jogo pega a ponta do cajado com `heroBladeTip`.

A primeira versão (formas simples em 2D) foi reprovada pelo usuário em 2026-11-25.

## Comportamento (pedido do usuário, 2026-11-25)

**Não gira em volta da tocha** como a Flaming Phoenix: tem mobilidade como as sombras do Shadow Clone. Espera num posto perto da tocha; com monstro na área de guarda voa até ficar entre ele e a chama, a uma distância de tiro, lança as bolas de luz e volta ao posto. Nunca fica em cima da tocha: tem um **raio mínimo** (`guard.minRadius`) além do máximo da área de guarda. **Provoca**: os monstros comuns por perto vão bater nele (como o convertido do Avgustino, `provokingAngel` em `enemies.js`), tiros dos monstros o acertam, e ele **pode morrer**: tem vida (fração da vida máxima do herói, `hpRatio` por nível), barra em cima da cabeça, e depois de cair volta ao posto em `respawnSeconds` (anel dourado no posto mostra quanto falta). Regras em `js/systems/skills_light.js` (`updateGuardianAngel`) e números em `data_model/powers.js` (`guardianAngel`).

## Evolução: Archangel (pedido do usuário, 2026-11-25)

**Na árvore do Light** o anjo vem depois do Consecrated Earth, na linha do chão: Sacred Ground → Consecrated Earth → Guardian Angel → Archangel. O Archangel (nó `angelEvolve`, depois do anjo no nível 5) é a ligação com o **Oath of Faith**, que passa a pedir Archangel e Divine Wrath. De tempos em tempos (`beamEvery`) o anjo vira para a maior fila de monstros (só dispara se pega ao menos 2, ou depois de esperar demais), ergue o cajado num gesto longo e solta **um raio de luz branca na direção em que ele olha**, que cruza a tela toda (2400 px, como o Lord's Decree do Gudran) e fere e atordoa em pulsos tudo no caminho. O desenho é o **mesmo do raio do Gudran** (`renderFuryBeam` em `js/render/arcane.js`: 5 camadas aditivas, pulso de largura a cada tique, faíscas correndo pela linha, clarão na origem), só que branco; o teste de acerto também é o dele (à frente da origem e dentro da largura). Bem mais fraco que o do Gudran: direção travada, 5 pulsos em ~1,5 s e recarga de 15 s. Dados em `data_model/powers.js` (`EVOLUTIONS.guardianAngel`), lógica em `skills_light.js` (`fireAngelBeam`, `updateAngelBeams`), desenho em `render/light.js` (`renderAngelBeams`). A cadência dos golpes normais também foi desacelerada (recarga de 4,4 s a 3,2 s e gesto de 0,95 s).

## O que a paleta e as medidas controlam

`guardian_angel_visual.js`: cores (tiradas da referência), `bodyScale`, `hover` (altura do voo), `flapSpeed`/`flapOpen` (asas), `strideSpeed` (pernas), `staffBelow`/`bladeLength` (cajado), `headRadius`. Ajuste ao vivo no Ateliê: `tools/tuner.html?model=angel` (e o cartão no `buddy_viewer.html`). Mudar aqui muda o buddy em todos os jogos (depois do sync).

## O que é do jogo e não mora aqui

A posição (posto, voo até o monstro, volta), a vida e a queda, o tempo entre lançamentos, o dano e o alvo ficam em `js/systems/skills_light.js` (`updateGuardianAngel`)
e em `data_model/powers.js` (`guardianAngel`). O jogo desenha o corpo em `js/render/light.js` (`renderAngel`), com a barra de vida e o anel de retorno.

## Imagens

`images/guardian-angel.jpeg`: a referência do usuário (anjo de armadura branca e dourada, asas, auréola e cajado de energia).

## Origem

Criada em 2026-11-25 junto com a skill, no Last Torch, e movida no mesmo dia para a biblioteca como buddy. Refeita no mesmo dia a partir da imagem de referência e com o comportamento de guarda móvel.

## Ajuste

Edite o `_visual.js` e rode `ruby mini_games/_library/sync.rb`.
