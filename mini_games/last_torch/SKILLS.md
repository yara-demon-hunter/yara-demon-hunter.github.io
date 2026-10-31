# Skills: conceito da árvore

Guia para decidir onde cada skill mora, quanto custa e como aparece. Toda skill nova deve seguir estas regras.
Os dados ficam em `data_model/tree.js`, `data_model/powers.js` e `data_model/passives.js`.

## Os 4 ramos

Cada ramo é um **jeito de jogar**, não só uma lista de bônus. A pergunta de cada um é: o que o jogador faz de diferente?

| Ramo | Fantasia | Como se joga | O ciclo que vicia | Custo |
|---|---|---|---|---|
| **Blade** | Guerreiro | Agressivo. Entra no meio e mata todo mundo. Ser cercado é bom. | Matar acelera (Bloodlust), acelerar mata mais, a Fúria explode, quem sobra é executado. | Médio |
| **Shadow** | Ladrão | Técnico. Marca de longe, detona de perto, atravessa a horda e rouba. | Adaga marca, dash detona e devolve o dash, moedas adiantam a recarga: um combo que nunca para. | O mais barato |
| **Flame** | Guardião | Defensivo e calmo. Fica firme perto da tocha e deixa o fogo trabalhar. | Parado, ergue o escudo. A horda queima ao cruzar o anel. Nada passa. | O mais caro |
| **Curse** | Feiticeiro | Estratégico. Fica longe, em área e à distância, e assiste à horda morrer em cadeia. | A maldição pula de monstro em monstro, a fenda junta todos, a explosão acaba com eles. | O mais caro |

**Pergunta para encaixar uma skill:** o que ela pede do jogador? Agressividade vai em Blade; precisão ou
oportunismo, em Shadow; paciência, em Flame; poder à distância ou em área, em Curse.

## Juramentos

No fim de cada ramo há um **Juramento**: a decisão que define a noite. Só um por noite, e todo Juramento tem um preço.
Ele transforma o herói (paleta, equipamento, cor dos golpes) com uma cerimônia ao voltar para a partida, e rende um
troféu no Santuário ao alcançar a hora 8 sob ele.

| Juramento | Ramo | Bônus | Preço | Forma do herói |
|---|---|---|---|---|
| Oath of Slaughter | Blade | +35% dano da lâmina, +10% ataque, +40% Fúria, matar cura 1, provoca de mais longe | O calor da tocha não cura mais, e não lança mais adagas | Chifres, ombreiras com espinhos, espada enorme |
| Oath of Whispers | Shadow | +1 dash, -20% recarga do dash, +15% velocidade, +10% crítico, +50% adaga | -25% vida | Cachecol ao vento, adagas nas costas |
| Oath of the Hearth | Flame | Tocha leva -35% de dano, +30% vida, calor dobrado que queima | -15% velocidade | Ombreiras douradas, peitoral, lanterna |
| Oath of Ruin | Curse | +20% dano e -12% recarga dos feitiços | -40% dano da lâmina | Capuz alto, grimório flutuando, runas no chão |

Regras: abre ao aprender **as duas skills que chegam nele** (as ligações do mapa) e fica na coluna 6, sempre na mesma posição.
Slaughter pede Cataclysm e Executioner; Whispers, Fan of Knives e Shadow Legion (a evolução do Shadow Clone; o caminho do ouro, até Master Thief, fica de fora); Hearth, Phoenix Pact e Solar Wall;
Ruin, Wrath of Heaven e Event Horizon. Os dados ficam em `data_model/passives.js`, e a arte
em `data_model/visuals/characters/oath_visual.js` e `js/render/hero_gear.js`.

## Custos

O custo vem do ramo e do tipo do nó, nunca só do fato de ser evolução. A regra é
**Shadow < Blade < Flame = Curse**: quanto mais habilidade o ramo exige, mais barato ele é.

| Pontos por nível | Shadow | Blade | Flame | Curse |
|---|---|---|---|---|
| Básico (stats e efeitos simples) | 1 | 1 | 1 | 1 |
| Poder | 1 | 2 | 3 | 3 |
| Especial (passiva, evolução, Juramento) | 1 (Juramento: 5) | 3 | 4 | 4 |

- A linha Básico é igual em todos os ramos porque 1 é o menor custo possível, e assim o primeiro ponto
  pode ser gasto em qualquer ramo.
- Cada nível do herói dá **2 pontos** (`TREE_POINTS`). Uma noite completa rende cerca de 70 pontos, contando os baús.
  Com 1 ponto por nível, o primeiro feitiço de Flame ou Curse só viria na hora 2 ou 3.
- O preço mais alto de Flame e Curse paga uma força maior: feitiços batem 10% acima da lâmina (`SPELL_SKILL`).
- Em Shadow tudo custa 1, exceto o Juramento (5, via `cost` no nó): o ramo é o mais barato porque exige habilidade, e o
  Juramento é a única decisão cara.
- Os valores ficam em `TREE_COSTS` (`data_model/tree.js`).
- `cost` no próprio nó sobrescreve a tabela. Use só para uma exceção justificada.

## Formatos

O formato diz o tipo do nó, em qualquer árvore:

| Formato | Tipo | Significado |
|---|---|---|
| Quadrado | stat, poder, efeito | Sobe de nível, mostra `2/5` |
| Círculo | passiva, relíquia | Compra única |
| Losango | evolução | Transforma um poder no nível máximo |
| Hexágono | Juramento | Um por noite, muda o jeito de jogar |

## Mapa atual

Cada ramo tem 4 linhas temáticas e termina no Juramento (coluna 6). Uma skill nova deve continuar a linha do seu tema.
`*` marca o que entrou com o conceito dos 4 estilos.

- **Blade** (raiz: Blade Damage)
  - Fúria: Fury, Battle Rage, Bloodlust*, Crimson Tide*
  - Aço: Attack Speed, Keen Eye, Slash Width, Whirlwind, Executioner*
  - Força: Attack Range, Provoke*, Knockback, Earthbreaker*, Cataclysm*
  - Corpo: Hero Health, Iron Skin, Blood Edge, War Cry*
  - Oath of Slaughter*
- **Shadow** (raiz: Move Speed)
  - Adagas: Ricochet, Quick Hands, Dagger Mastery, Long Throw, Fan of Knives
  - Técnica: Death Mark*, Soul Lance, Soul Spear
  - Esquiva: Phantom Rush, Night Reaper*, Shadow Clone*, Shadow Legion*, Smoke Bomb*, Fleet Foot. A cadeia é
    Move Speed, Phantom Rush, Shadow Clone, Smoke Bomb; Night Reaper sai de Phantom Rush e Fleet Foot fecha a linha
  - Ladrão: Light Fingers, Pickpocket, Coin Rush*, Thief's Nose, Master Thief
  - Oath of Whispers*
- **Flame** (raiz: Torch Keeper)
  - Calor: Warm Hearth, Sacred Ground, Undying Flame, Phoenix Pact*
  - Guarda: Steady Stance*, Vigil*, Backdraft*
  - Muralha: Flame Sentinel, Sun Spire, Hearth Ring*, Solar Wall*
  - Brasa: Ember Steps, Hellwalker
  - Oath of the Hearth*
- **Curse** (raiz: Arcane Study)
  - Gelo e força: Cold Moon, Soul Nova, Absolute Zero, Starfall, Mirror Ward
  - Distância: Grave Wisp*, Occult Focus*, Storm Sigil, Wrath of Heaven
  - Vazio: Creeping Hex*, Dark Knowledge*, Void Rift*, Event Horizon*
  - Morte: Corpse Burst, Red Harvest, Spectral Blades, Blade Tempest
  - Oath of Ruin*

## O que cada skill nova faz

| Skill | Tipo | Efeito | Golpe ou arte |
|---|---|---|---|
| Bloodlust | Poder | Cada morte empilha dano e velocidade da lâmina; parou de matar, some | Arco e aura vermelhos, lâmina em brasa |
| Crimson Tide | Evolução | Com a fome alta, cada golpe joga uma meia-lua de sangue que atravessa a horda | Meia-lua |
| Earthbreaker | Poder | Com monstros perto, salta e crava a espada: fere e atordoa em volta; no ar, nada encosta | Salto com espada erguida, rachaduras |
| Cataclysm | Evolução | Abalos saem do impacto e lava brota das rachaduras | Rachaduras em lava |
| Provoke | Efeito | Monstros largam a tocha e vêm atrás do herói de mais longe: é assim que o guerreiro a protege | - |
| War Cry | Passiva | Cercado por 5, ruge: joga longe, atordoa e dá +30% na lâmina por 4s | Braços abertos, cabeça para trás |
| Executioner | Passiva | A lâmina termina monstros abaixo de 20% da vida (elites 10%, bosses não) | X vermelho |
| Death Mark | Poder | A adaga marca. A lâmina detona; o dash detona mais forte e devolve a carga. Toda detonação recarrega a adaga | Mira girando, X violeta |
| Shadow Clone | Passiva | Uma sombra guarda uma área em volta da tocha (raio 200) e não sai dela. Espera no posto; quando um monstro chega perto, anda em linha reta até ele, golpeia com o combo do herói e volta. Os monstros não correm atrás dela, mas quem esbarra ou acerta um tiro a machuca; ela tem vida e volta depois de 10s | Sombra violeta, barra de vida e área tracejada no chão |
| Shadow Legion | Evolução | Três sombras em vez de uma, cada uma cuidando de um monstro | Três sombras no anel |
| Smoke Bomb | Passiva | O dash deixa um rasto longo de fumaça por 7s: freia monstros e todo golpe que eles levam ali, de lâmina ou adaga, é crítico | Rasto de nuvens |
| Night Reaper | Evolução | Uma sombra refaz o caminho do dash, cortando de novo | Silhueta violeta |
| Coin Rush | Efeito | Cada moeda adianta o dash e a adaga | - |
| Master Thief | Passiva | Atravessar monstros com o dash rouba ouro; Perfect Dodge rouba um punhado | Moedas saltando |
| Steady Stance | Efeito | Parado, ataca mais rápido | - |
| Vigil | Passiva | Parado, ergue um escudo que para um golpe e estoura em fogo | Ajoelhado, espada fincada, redoma |
| Backdraft | Passiva | Monstro que alcança a tocha causa uma explosão em volta dela | Explosão |
| Phoenix Pact | Passiva | Uma vez por hora, ao cair, a tocha paga 30 de vida para levantar o herói | Asas de fogo |
| Hearth Ring | Poder | Anel de fogo em volta da tocha que queima e freia quem cruza | Anel de chamas |
| Solar Wall | Evolução | O anel vira muralha branca que sobe de tempos em tempos, jogando monstros longe | Labareda |
| Grave Wisp | Poder | Caveira em chamas no ombro que atira de longe | Caveira, tiros violeta |
| Creeping Hex | Poder | Maldição que corrói e pula para os vizinhos quando o monstro morre | Chama violeta, raio entre monstros |
| Void Rift | Poder | Fenda na parte mais densa da horda: puxa todos e colapsa | Espiral escura |
| Event Horizon | Evolução | Fenda maior, que abre de novo onde caiu | Espiral azul |
| Occult Focus, Dark Knowledge | Efeitos | Menos recarga e mais dano nos feitiços | - |

## Como adicionar uma skill

1. Escolha o ramo pela pergunta acima e a linha pelo tema.
2. Crie os dados: `powers.js` (poder ou evolução), `passives.js` (passiva) ou direto no nó (efeito simples).
   Uma passiva também pode evoluir: o nó `evolve` aponta para a passiva (`key`), os dados ficam em `EVOLUTIONS` e o
   flag `evolved` mora na própria passiva (como no Shadow Clone).
3. Mecânica própria: em `js/systems/skills_blade.js`, `skills_shadow.js`, `skills_flame.js` ou `skills_curse.js`.
   Golpe do herói com impacto: `startMove` em `js/systems/moves.js`, com a pose em `js/render/player25d.js`.
   Efeito na tela: `js/render/skills.js`, com as medidas em `data_model/visuals/effects/skills_visual.js`.
4. Adicione o nó em `TREE_NODES`. O pré-requisito vem sempre do nó anterior na linha. Evolução fica logo depois do
   poder; o que continua a linha depois dela sai do poder em diagonal, para a ligação não passar por cima do losango.
5. Não defina `cost`: deixe a tabela decidir.
6. Mostre a skill em `previews/demon_hunter_preview.html` e atualize o mapa acima.
