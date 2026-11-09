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
| Oath of Slaughter | Blade | Reforça a lâmina, a Fúria e a cura ao matar; atrai monstros | O calor da tocha não cura mais, e não lança mais adagas | Chifres, ombreiras com espinhos, espada enorme |
| Oath of Whispers | Shadow | Reforça o dash, a velocidade, os críticos e as adagas; mais mortes trazem sombras | Reduz a vida máxima | Cachecol ao vento, adagas nas costas |
| Oath of the Hearth | Flame | Protege a tocha, fortalece o herói e amplia o calor, que queima monstros | Reduz a velocidade | Ombreiras douradas, peitoral, lanterna |
| Oath of Ruin | Curse | Reforça e acelera os feitiços | Reduz o dano da lâmina | Capuz alto, grimório flutuando, runas no chão |

Regras: abre ao aprender **as duas skills que chegam nele** (as ligações do mapa) e fica na coluna 6, sempre na mesma posição.
Slaughter pede Cataclysm e Executioner; Whispers, Shadow Legion e Smoke Bomb (os fins dos dois caminhos de Shadow; Fan of Knives e o ouro ficam de fora); Hearth, Fireballs e Solar Wall;
Ruin, Wrath of Heaven e Event Horizon. Os dados ficam em `data_model/passives.js`, e a arte
em `data_model/visuals/characters/oath_visual.js` e `js/render/hero_gear.js`.

## O ladrão e as relíquias

O dinheiro do ladrão não mora na árvore de skills, e sim na árvore de relíquias do acampamento (terceira linha do ramo
Fortune), porque ouro se gasta no acampamento. É uma cadeia, uma compra única por relíquia, cada uma abre a próxima:
Light Fingers (alcance de coleta dobrado), Pickpocket (+2 de ouro por morte), Coin Rush (cada moeda adianta a recarga
da adaga e do dash), Thief's Nose (+60% de itens) e Master Thief (o dash rouba ouro ao atravessar monstros). Shadow
fica com as adagas, as sombras e a esquiva.

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
- Em Shadow quase tudo custa 1: o ramo é o mais barato porque exige habilidade. As decisões caras, via `cost` no nó, são
  o Juramento (5), a Smoke Bomb (4) e o Shadow Shackle (3).
- Os valores ficam em `TREE_COSTS` (`data_model/tree.js`).
- `cost` no próprio nó sobrescreve a tabela. Use só para uma exceção justificada.
  Exceções atuais: Oath of Whispers (5), Smoke Bomb (4), Shadow Shackle (3), Hero Health (2 por nível) e, no Flame, Ember Steps (2) e Hellwalker (3), por serem mais simples que os outros poderes do ramo.

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
  - Fúria: Fury (duração, dano e carga da barra), Bloodlust*, Crimson Tide*, Executioner*
  - Aço: Attack Speed, Keen Eye, Slash Width, Whirlwind
  - Força: Attack Range, Knockback, Earthbreaker*, Cataclysm*
  - Corpo: Hero Health (vida, -4% de dano recebido e provocar de mais longe; 2 pontos por nível), Blood Edge, War Cry*
  - Oath of Slaughter*
- **Shadow** (raiz: Move Speed)
  - Adagas: Ricochet, Return Fire (o antigo Mirror Ward, rebate o tiro inimigo), Dagger Mastery (dano, alcance, velocidade e recarga), Fan of Knives
  - Técnica: Death Mark*, Charged Dagger Throw (Soul Lance e Soul Spear unidos)
  - Sombras: Shadow Clone*, Umbral Bond*, Shadow Legion*. Move Speed, Shadow Clone, Umbral Bond (5/5), Shadow Legion (3 pontos), Juramento
  - Esquiva: Phantom Rush, Night Reaper*, Shadow Shackle*, Smoke Bomb*. Move Speed, Phantom Rush, Night Reaper, Shadow Shackle, Smoke Bomb, Juramento
  - Oath of Whispers*
- **Flame** (raiz: Torch Keeper)
  - Calor: Warm Hearth, Undying Flame, Phoenix Pact*, Fireballs*
  - Guarda: Steady Stance*, Vigil*, Backdraft*
  - Muralha: Flame Sentinel, Sun Spire, Hearth Ring*, Solar Wall*
  - Brasa: Ember Steps (fogo nos passos e dano dentro do calor da tocha), Hellwalker
  - Armas: Flaming Sword* (sai do Hellwalker)
  - Oath of the Hearth*
- **Curse** (raiz: Arcane Study)
  - Gelo e força: Cold Moon, Soul Nova, Absolute Zero, Starfall
  - Distância: Grave Wisp*, Occult Focus*, Storm Sigil, Wrath of Heaven
  - Vazio: Creeping Hex*, Dark Knowledge*, Void Rift*, Event Horizon*
  - Morte: Corpse Burst, Red Harvest, Spectral Blades, Blade Tempest
  - Oath of Ruin*

## O que cada skill nova faz

| Skill | Tipo | Efeito | Golpe ou arte |
|---|---|---|---|
| Bloodlust | Poder | Cada morte empilha dano e velocidade da lâmina; quando as mortes param, as cargas desaparecem | Arco e aura vermelhos, lâmina em brasa |
| Crimson Tide | Evolução | Com a fome alta, cada golpe joga uma meia-lua de sangue que atravessa a horda | Meia-lua |
| Earthbreaker | Poder | Com monstros perto, salta e crava a espada: fere e atordoa em volta; no ar, nada encosta | Salto com espada erguida, rachaduras |
| Cataclysm | Evolução | Abalos saem do impacto e lava brota das rachaduras | Rachaduras em lava |
| Provoke (dentro do Hero Health) | Efeito | A cada nível de Hero Health, aumenta a distância em que os monstros largam a tocha e vêm atrás do herói: é assim que o guerreiro a protege | - |
| War Cry | Passiva | Cercado, ruge: joga os monstros para longe, atordoa e fortalece temporariamente a lâmina | Braços abertos, cabeça para trás |
| Executioner | Passiva | A lâmina termina monstros enfraquecidos em um golpe (bosses são imunes) | X vermelho |
| Death Mark | Poder | A adaga marca. A lâmina detona; o dash detona mais forte e devolve a carga. Toda detonação recarrega a adaga | Mira girando, X violeta |
| Charged Dagger Throw | Poder | Segure o botão da adaga para carregar: quanto mais tempo, mais dano e mais monstros atravessados. No nível máximo carrega num piscar e atravessa tudo (o antigo Soul Spear) | Anel que se fecha, adaga brilhando |
| Shadow Clone | Passiva | Uma sombra guarda uma área em volta da tocha e não sai dela. Espera no posto; quando um monstro chega perto, anda em linha reta até ele, golpeia com o combo do herói e volta. Os monstros não correm atrás dela, mas quem esbarra ou acerta um tiro a machuca; ela tem vida e volta depois de um tempo | Sombra violeta, barra de vida e área tracejada no chão |
| Shadow Legion | Evolução | Abre com Umbral Bond no nível máximo. Mais sombras guardam a tocha, cada uma cuidando de um monstro | Sombras no anel |
| Shadow Raven | Passiva | Abre com Death Mark. Um corvo pequeno voa no ombro do herói, mergulha no monstro mais perto, bica com dano da lâmina e volta. O monstro bicado fica marcado e leva mais dano em todo golpe (lâmina, adaga, feitiço, sombras) enquanto a marca durar | Corvo violeta-escuro; mira vermelha tracejada com cruz |
| Explosão da sombra | Efeito do Shadow Clone | A sombra que cai explode em adagas para todos os lados. Valem o dano, alcance e velocidade do Dagger Mastery e o Ricochet | Adagas violeta em círculo |
| Umbral Bond | Poder | Fortalece as sombras, ampliando a vida, o dano e a área de guarda a cada nível. Vale para o Shadow Clone, a Legion e as sombras do Oath of Whispers | Área de guarda maior |
| Shadow Shackle | Passiva | Automática: uma corrente voa até o monstro mais forte ao alcance da adaga e o prende naquele ponto, boss inclusive. Só tira o andar: ele continua atacando, e o boss que se teleporta fica preso no ponto novo | Corrente voando; estacas no chão com correntes até o monstro |
| Smoke Bomb | Passiva | O dash deixa um rasto longo de fumaça: freia monstros e aumenta a chance de crítico de todo golpe que eles levam ali, de lâmina ou adaga | Rasto de nuvens |
| Night Reaper | Evolução | Uma sombra refaz o caminho do dash, cortando de novo | Silhueta violeta |
| Coin Rush | Relíquia | Cada moeda adianta o dash e a adaga | 🧤 Fortune |
| Master Thief | Relíquia | Atravessar monstros com o dash rouba ouro; Perfect Dodge rouba um punhado | Moedas saltando |
| Steady Stance | Efeito | Parado, ataca mais rápido | - |
| Vigil | Passiva | Parado, ergue um escudo que para um golpe e estoura em fogo | Ajoelhado, espada fincada, redoma |
| Backdraft | Passiva | Monstro que alcança a tocha causa uma explosão em volta dela | Explosão |
| Flaming Sword | Passiva | A espada pega fogo: todo corte, inclusive das sombras, deixa o monstro queimando. Monstro em chamas que morre passa o fogo a quem está por perto; o Oath of the Hearth fortalece a chama | Línguas de fogo na lâmina, corte laranja |
| Fireballs | Passiva | As adagas viram bolas de fogo: o herói para com a bola crescendo na mão, como o Lorde Demônio, sem andar, golpear nem dar dash; ao acertar, ela explode, fere os vizinhos, deixa todos em chamas e o chão queimando. Por baixo continuam adagas, então Dagger Mastery, Fan of Knives, Ricochet, Death Mark, Charged Dagger Throw e a explosão das sombras valem igual. O Oath of Slaughter também as bloqueia | Bola de fogo com cauda |
| Phoenix Pact | Passiva | Uma fênix voa no ombro do herói e atira bolas de fogo que queimam o alvo e os vizinhos. Quando ele cai, ela morre para levantá-lo e renasce depois | Fênix; ao morrer, mergulha no herói e vira asas de fogo |
| Hearth Ring | Poder | Um anel de fogo achado no fundo da escuridão cria um círculo de fogo em volta da tocha para proteger quem o usa; quem cruza queima e anda mais devagar | Anel de chamas |
| Solar Wall | Evolução | O anel vira muralha branca que sobe de tempos em tempos, jogando monstros longe | Labareda |
| Grave Wisp | Poder | Caveira em chamas no ombro que atira de longe | Caveira, tiros violeta |
| Creeping Hex | Poder | Maldição que corrói e pula para os vizinhos quando o monstro morre | Chama violeta, raio entre monstros |
| Void Rift | Poder | Fenda na parte mais densa da horda: puxa todos e colapsa | Espiral escura |
| Event Horizon | Evolução | Fenda maior, que abre de novo onde caiu | Espiral azul |
| Occult Focus, Dark Knowledge | Efeitos | Menos recarga e mais dano nos feitiços | - |

## Skills seladas (sem adaga)

Algumas skills só funcionam com adaga: Ricochet, Death Mark, Charged Dagger Throw, Dagger Mastery, Fan of Knives e Fireballs (as adagas viram bolas de fogo). Elas levam `needs: 'knives'` em `data_model/tree.js`. Quando o jogador não lança adaga (mod `noKnives`: o **Captain Brutos**, ou quem jurou o **Oath of Slaughter**), esses nós ficam **selados**:

- **Não é o cadeado.** O cadeado diz "ainda não" (falta o nó anterior). O selo diz "não é para este personagem": borda sólida cor de ferrugem, ícone apagado e um risco diagonal laranja, sem corrente. O painel de detalhe mostra a etiqueta `NO DAGGERS`, o motivo e o passe livre.
- **Passe livre.** Um nó selado conta como cumprido para os nós que o pedem, e a ligação que sai dele fica acesa. Assim a cadeia não trava: com o Brutos, Return Fire (que pede Ricochet) e Shadow Raven (que pede Death Mark) abrem normalmente, e o Oath of the Hearth não fica preso por Fireballs.
- **Não se compra** (nem pela escolha rápida, nem pelo medalhão que pulsa). Níveis comprados antes do Oath ficam, só não sobem mais.
- Regra única em `isRestricted(node)` (`js/systems/tree.js`): `needs === 'knives'` e `mod('noKnives') > 0`. Skill nova que depende de adaga: basta pôr `needs: 'knives'` no nó.

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
6. Mostre a skill em `previews/characters_preview.html` e atualize o mapa acima.
