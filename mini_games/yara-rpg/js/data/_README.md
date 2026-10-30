# Dados do Mini RPG

Os arquivos desta pasta guardam conteúdo e valores de balanceamento. A lógica fica nos sistemas em `../systems/` e na integração/interface em `../game.js`.

- `characters.js`: atributos-base compartilhados e dados de cada personagem. O booleano `unlocked` define quais personagens já podem ser selecionados; personagens bloqueados são liberados após vencer Gudran. Cada personagem separa `basicStats` (bônus iniciais somados aos atributos compartilhados), `progression` (ganhos por nível), `skills` (ações especiais), `passive` (passiva permanente com ícone, nome e descrição) e `limits` (tetos de esquiva, aparo e stun, além do limiar mínimo de fúria). Passivas percentuais de atributos usam `statBonusPercent`; efeitos acionados em combate podem declarar campos próprios, como `furyPerDodgeBonus` ou `lifeStealPercent`.
- `items.js`: poção de cura e catálogo de equipamentos que podem cair dos monstros.
- `regions.js`: IDs, títulos, descrições e eventos com escolhas das regiões físicas em português e inglês. Cada região pode ter vários eventos; eles aparecem sem repetição até o conjunto se esgotar.
- `regions-spirit-world.js`: lista `spiritRegions` com as regiões independentes do Mundo Espiritual. Cada região pode ter `event` para encontros aleatórios e `storySequence` para cenas narrativas apresentadas em ordem fixa. A sequência usa os mesmos campos de título, descrição e escolhas dos eventos, mas é registrada à parte; seu progresso reaproveita o salvamento das cenas vistas.
- `spiritual-contacts.js`: contatos espirituais placeholder em `spiritualContacts.contacts`, seguindo o agrupamento de `mistContacts.contacts`; não participam do sorteio nem executam efeitos.
- `monsters.js`: atributos-base dos monstros, agrupados pelo ID da região, e faixa de variação por encontro.
- `special-monsters.js`: atributos, nível mínimo e recompensas dos chefes e monstros especiais usados em eventos.
- `mist-contacts.js`: contatos da névoa com ícones, ofertas e efeitos especiais (`onAccept`). Missões podem referenciar monstros por `bossId`.
- `passive-skills.js`: catálogo de skills passivas, pactos que enfraquecem monstros e a passiva Olho Espiritual. Cada entrada contém nome, descrição e efeito em PT/EN.
- `special-monsters.js`: atributos, requisitos e recompensas dos chefes e monstros especiais.
- `world-rules.js`: escala de probabilidade, frequência/resultados dos contatos e custos/recuperação do acampamento.
- `equipment-rules.js`: chance de drop, raridades e chances especiais para itens de baús, limite da mochila e aprimoramentos.
- `combat-rules.js`: dano, custos, defesa, fuga e tempos dos turnos.
- `progression-rules.js`: multiplicador de XP e melhorias compradas.
- `exploration-rules.js`: chance de descobrir áreas e eventos, intervalo entre eventos narrativos, pesos dos resultados de exploração, recompensas, chance de obter item ao abrir baú e chance de poupar um monstro derrotado.
- `extra-events.js`: eventos morais (efeito `deal`, campos `soul` e `requires`) e eventos de aposta (efeito `gamble`) acrescentados aos eventos de cada região em `regions.js`; usam as mesmas escolhas e a mesma execução em `resolveStoryEvent`.
- `vendor.js`: vendedor ambulante. Define o evento de apresentação (`event`), o catálogo de mercadorias (`offers`, com nome, descrição, preço, estoque e `effect`), quantas mercadorias são sorteadas por visita, a variação de preço por região e a tabela de venda de itens da mochila por raridade. A frequência com que ele aparece fica em `exploration-rules.js` (campo `vendor`).
- `soul-rules.js`: alma do herói (de -100 a +100). Define os níveis com nome, descrição e efeitos percentuais, quanto poupar ou finalizar um monstro desloca a alma, falas extras, provocações de chefes e finais.
- `pets.js`: comando de combate e faro de exploração de cada companheiro, indexados pelo `id` do item em `items.js`, com recargas e potência por raridade.
- `achievements.js`: conquistas do Santuário. Cada uma tem `id`, `icon`, `name`, `description` (PT/EN) e uma `condition` com `type` e `value`; os tipos aceitos e a avaliação estão em `CONDITIONS` no topo de `../systems/meta.js`.

A lógica do vendedor fica em `../systems/vendor.js`; conquistas, bestiário, coleção, poderes e recordes do Santuário em `../systems/meta.js` (textos nas chaves `meta...` e `vendor...` dos arquivos `translations-*.js`). A lógica de sorteio dos contatos fica em `../systems/mist-contacts.js`; os encontros durante a exploração são tratados em `../systems/exploration.js`. Para ajustar o ritmo, edite `mistContacts` em `world-rules.js`; adicione contatos em `mist-contacts.js`, passivas e pactos em `passive-skills.js` e chefes em `special-monsters.js`. Contatos que iniciam uma missão podem apontar para o `id` de um chefe por `bossId`. Chefes exigem o nível definido em `minLevel` e usam `suggestedLevel` como referência para escalar atributos. Todos os monstros usam o mesmo banner e a mesma interface de status durante o combate.

A lógica da tela inicial (seleção do personagem, que já traz o equipamento inicial definido em `characters.js`) fica em `../systems/character-setup.js`. Os eventos narrativos são declarados em cada região e executados por `resolveStoryEvent` em `../systems/exploration.js`. Os textos PT/EN ficam em `../systems/translations-pt.js` e `../systems/translations-en.js`. Os scripts de dados e sistemas precisam ser carregados antes de `game.js`, que inicia a aventura com as escolhas feitas.

Equipamentos em `items.js` declaram um `id`, um slot (`mainHand`, `offHand`, `head`, `body`, `cloak`, `legs`, `boots`, `necklace`, `ring`, `accessory` ou `pet`), nomes em português e inglês e os bônus em `stats`. Armas de uma mão usam `handUsage: "one-handed"` e podem ser movidas para a outra mão pelo detalhe do item na mochila. Armas de duas mãos usam `handUsage: "two-handed"`; equipá-las guarda o item da mão secundária na mochila. Assim é possível empunhar duas armas de uma mão ou uma arma de duas mãos. Use `itemType: "shield"` para identificar escudos; todos os itens do catálogo podem cair dos monstros. O equipamento inicial de cada personagem é definido em `startingEquipment` (`characters.js`); o campo `starter` dos itens não é mais usado pelo jogo. A chance de drop, a capacidade da mochila, a distribuição das raridades, as raridades exclusivas da última região e as regras de aprimoramento até +9 ficam em `equipment-rules.js`; a lógica fica em `../systems/equipment-core.js` e a interface em `../systems/equipment-ui.js`.

Os IDs em `regions.js` precisam corresponder às chaves de `monsters.byRegion` em `monsters.js`. Os arquivos de regras são partes de `YaraRpgData.rules` e devem carregar antes dos sistemas. A ordem de todos os scripts está declarada em `game.html`; mantenha `game.js` por último.

## Fluxo ao clicar em Explorar

O botão chama `exploreForest()` em `../systems/exploration.js`. A ordem abaixo importa: o primeiro evento que disparar encerra essa exploração e impede os passos seguintes.

```text
Explorar
├─ Herói morto, em combate, ou com uma escolha/evento pendente?
│  └─ Sim: não inicia outra exploração
└─ Não
   ├─ 1. Evento narrativo da região
   │  ├─ Só considera eventos ainda não vistos
   │  ├─ Precisa ter passado o intervalo de 3 explorações desde o último evento
   │  ├─ Chance configurada: 20%
   │  └─ Disparou: escolhe aleatoriamente um evento ainda não visto e mostra suas opções
   ├─ 2. Vendedor ambulante (só se não disparou evento narrativo)
   │  ├─ Precisa ter passado o intervalo de 10 explorações desde o último vendedor
   │  ├─ Chance configurada: 10% (exploration-rules.js › vendor)
   │  └─ Disparou: mostra o evento "O vendedor ambulante"; "Ver as mercadorias" abre a loja
   │     (compra 4 mercadorias sorteadas e vende itens da mochila); "Seguir viagem" encerra o evento
   ├─ 3. Contato da névoa (só se não disparou nenhum dos anteriores)
   │  ├─ Precisa ter passado o intervalo de 3 explorações desde o último contato
   │  ├─ Chance = mínimo entre 25% e (3% + 1% por nível acima do nível 1)
   │  ├─ Disparou: escolhe aleatoriamente um contato elegível para o nível
   │  └─ Aceitar pode iniciar uma luta, oferecer bebida, skill passiva, pacto ou ponto de habilidade
   └─ 4. Resultado aleatório da exploração (só se nenhum evento anterior disparou)
      ├─ Monstro: 38%
      ├─ Ouro: 17%
      ├─ Trilha segura: 12% (HP/foco; removida se ambos estiverem cheios)
      ├─ Poção: 8% (removida se já estiver no limite)
      ├─ Armadilha: 6%
      ├─ Foco: 6% (removido se estiver no limite)
      ├─ Suprimentos: 6% (ouro e recuperação de HP)
      ├─ Mapa: 5% → +25 pontos percentuais na chance de baú até encontrar um
      └─ Baú: 2% → ao abrir, 70% de chance de equipamento; caso contrário, vazio
```

Os pesos do resultado aleatório totalizam 100% quando todas as opções estão disponíveis. Poção, foco e trilha segura são removidos quando não podem ajudar; os pesos restantes são então normalizados. Portanto, as porcentagens efetivas podem mudar conforme HP, foco e poções atuais. Encontrar um mapa ativa +25 pontos percentuais à chance calculada de baú; a pista recebida ao poupar um monstro ativa +10. O bônus persiste até encontrar um baú; se ele não aparecer, o resultado é sorteado entre os demais resultados.

### Eventos narrativos por região

Quando a rolagem narrativa dispara, um evento ainda não visto é escolhido sem pesos (todos têm chance igual entre os disponíveis). Cada escolha abaixo é feita pelo jogador; as opções não têm porcentagens próprias.

- **Floresta da Névoa:** Pegadas sob a chuva (saquear ou lutar); Travessia do rio (arriscar e ganhar ouro ou recuperar HP/foco); Cabana abandonada (poção ou luta); ruído no mato (ouro ou equipamento de pet); desafio da fenda (lutar contra o Arauto do Abismo ou recuar).
- **Travessia do Rio:** Correnteza traiçoeira (recuperar HP ou buscar ouro); Ponte de troncos (ouro ou HP); Sinais na outra margem (luta ou ouro); ruído entre as pedras (ouro ou equipamento de pet); desafio da fenda (Arauto ou recuo).
- **Aldeia das Tochas Azuladas:** Abrigo dos sobreviventes (recuperação ou ouro); Carroça tombada (ouro ou luta); Torre do vigia (ouro ou foco); ruído sob os escombros (ouro ou equipamento de pet); desafio da fenda (Arauto ou recuo).
- **Castelo de Gudran:** Guardião de pedra (recuperar HP/foco ou luta); Arsenal esquecido (45 de ouro e uma poção se houver espaço, ou luta); Juramento dos guardas (+4 ataque ou 55 de ouro com perda de até 12 HP); campeão do castelo (Brutos ou recuo); ruído na torre (ouro ou equipamento de pet); último desafio (Arauto ou recuo).
- **Câmara do Trono:** não possui eventos narrativos aleatórios; é a etapa do confronto final.

Os desafios da fenda e Brutos são eventos encadeados: escolher enfrentar inicia uma batalha especial; recuar encerra o evento sem a batalha e permite que ele volte a aparecer em outra exploração. O evento de animal também tem resultado adicional: escolher ajudar gera um equipamento de pet com raridade sorteada normalmente (se não houver modelo elegível, não há pet).

### Ramificações depois de encontrar um monstro

```text
Encontrou monstro (resultado de 38%, ou escolha de evento/contato)
├─ Fugir: 70% de sucesso; chefes finais não podem ser evitados
└─ Vencer
   ├─ Chefe: vitória e recompensa; equipamento de raridade da lista do chefe é garantido
   └─ Monstro comum
      ├─ 90%: vitória normal, XP/ouro e 40% de chance de equipamento
      └─ 10%: surge a decisão entre golpe final ou poupar
         ├─ Golpe final: recebe recompensas normais, incluindo XP e sorteio de equipamento
         └─ Poupar: recebe metade do ouro-base e nenhum XP; sorteia 1 resultado:
            ├─ 20%: ataca e foge, causando dano
            ├─ 20%: dá pista de baú; +10 pontos percentuais até encontrar um
            ├─ 20%: agradece e foge; recupera até 20% do HP e foco máximos
            ├─ 20%: dá equipamento de raridade normal para um slot vazio
            └─ 20%: dá ouro bônus
```

O teste de 10% é feito depois de derrotar um monstro comum; chefes não oferecem a decisão de poupar. Se o inventário de equipamento já tiver algo em todos os slots, o resultado de item do monstro poupado vira ouro bônus. A raridade do drop normal usa as chances comuns da tabela de equipamentos; raridades Demoníaca e Divina ficam indisponíveis antes do Castelo de Gudran. Os cinco resultados de poupar têm pesos iguais de 20%.

### Monstros que podem aparecer

O encontro comum escolhe aleatoriamente um dos três monstros cadastrados para a região. Os atributos do modelo variam entre 70% e 160% por encontro. O nível não muda a chance de encontrar monstro (38% antes das redistribuições descritas acima).

| Região | Monstros comuns |
| --- | --- |
| Floresta da Névoa | Lobo Sombriço, Demônio do Rio, Bruxa |
| Travessia do Rio | Demônio do Rio, Golem do Rio, Criatura das Sombras |
| Aldeia das Tochas Azuladas | Saqueador da Névoa, Cavaleiro Possuído, Cavaleiro sem Cabeça |
| Castelo de Gudran | Soldado de Gudran, Criatura Corrompida, Golem |

Monstros especiais têm gatilhos próprios, não fazem parte do sorteio comum de 38%:

- **Morte:** pode ser escolhido como chefe de contato a partir do nível 2.
- **Morto-Vivo:** pode ser escolhido por contato a partir do nível 3; a Bruxa Caçadora também o convoca ao aceitar sua oferta.
- **Dragão da Névoa:** pode ser escolhido como chefe de contato a partir do nível 5.
- **Demônio do Abismo:** pode ser escolhido como chefe de contato a partir do nível 5 ou enfrentado pelos eventos do desafio da fenda.
- **Brutos:** pode ser escolhido como chefe de contato a partir do nível 7 ou enfrentado pelo evento “O campeão do castelo”.
- **Gudran:** chefe final, acessado pelo portão da Câmara do Trono depois de aceitar o confronto; não aparece no botão Explorar e não permite fuga.

Ao vencer chefes especiais, um equipamento é garantido. A raridade usa a lista definida para aquele chefe/desafio e também respeita a regra de raridades exclusivas da região; se a lista ficar sem raridades válidas, o sorteio retorna ao item Comum. No desafio da fenda, a recompensa é Épica/Lendária antes do Castelo de Gudran e Demoníaca/Divina a partir dele.

### Baús, ouro e equipamentos

- Exploração pode encontrar baú com peso-base de 2% ou mapa com peso-base de 5% (sujeitos à redistribuição de pesos). Encontrar mapa ativa +25 pontos percentuais à chance de baú até encontrá-lo. Abrir o baú dá equipamento em 70% dos casos; nos outros 30%, está vazio.
- A raridade de item de baú é sorteada entre Épico 40%, Lendário 30%, Demoníaco 20% e Divino 10%. O sorteio de baú permite Demoníaco/Divino em qualquer região.
- Um monstro comum derrotado tem 40% de chance de equipamento. A distribuição padrão é: Comum 38%, Incomum 25%, Raro 11%, Super Raro 9%, Épico 7%, Lendário 5%, Demoníaco 3,5%, Divino 1,5%; antes do Castelo, Demoníaco/Divino são removidos e as demais chances são normalizadas.
- Ouro encontrado diretamente na exploração: 5–14. Suprimentos: 10–20 de ouro e até 12 HP. Armadilha: 8–15 de dano, sem reduzir HP abaixo de 1. Trilha segura recupera até 30 HP e 15 foco; poção dá +1; foco encontrado dá 12–24.
- Quantias acima são valores configurados antes de quaisquer regras de progressão ou limites do personagem.

### Ramificações de contato da névoa

P.S. Cada contato pode ser aceito ou recusado; recusar não dá recompensa

A chance de aparecer é calculada após o intervalo de 3 explorações: nível 1 = 3%, nível 2 = 4%, aumentando 1 ponto percentual por nível até o limite de 25%. O contato é escolhido aleatoriamente entre os que permitem o nível atual. O jogador pode aceitar ou recusar; recusar não sorteia recompensa. Ao aceitar:

- **Espírito do Rio:** disponível desde o nível 1; usa os resultados genéricos.
- **Batedor Perdido:** disponível desde o nível 2; usa os resultados genéricos.
- **Espectro:** disponível desde o nível 3; usa os resultados genéricos.
- **Bruxa Caçadora:** inicia a luta contra o morto-vivo indicado.
- **Bruxa Velha:** oferece 150 de ouro; ao aceitar, HP atual cai para no máximo 20% do HP máximo.
- **Cirurgião Espiritual:** ao aceitar, concede 1 Ponto de Habilidade. Pode aparecer novamente em outro contato.
- **Negociante de Pactos:** antes da decisão, informa que aceitar causa um sacrifício aleatório disponível: ficar com 1 HP, zerar o Foco, perder todos os itens da mochila ou perder um equipamento vestido. Em troca, concede um pacto passivo ainda não obtido. Quando não há pactos novos, esse contato deixa de ser elegível.
- **Demais contatos:** sorteiam entre resultados disponíveis: combate 45%, sacrifício 30% ou skill passiva 25%. Se não houver chefe elegível, combate é removido; se não houver skill passiva elegível, essa opção é removida; os pesos disponíveis são normalizados.

No resultado genérico **combate** (45%), escolhe-se aleatoriamente um chefe especial elegível ao nível (entre Morte, Morto-Vivo, Dragão da Névoa, Demônio do Abismo e Brutos). As chances de chefe são iguais entre os elegíveis; Gudran não entra nessa seleção. No resultado **sacrifício** (30%), recebe-se 25–50 de ouro e perde-se 10–20% do HP máximo (sem cair abaixo de 1 HP). No resultado **skill passiva** (25%), uma skill ainda não obtida é escolhida aleatoriamente entre as disponíveis. Ela é permanente, aparece na seção **Skills passivas** do bloco de atributos e seu ícone abre a descrição:

- **Lâmina da Névoa:** +3 de Ataque.
- **Reservatório Vital:** +100 de HP máximo e recupera até 100 HP.
- **Reserva Profunda:** +100 de Foco máximo e recupera até 100 Foco.
- **Choque Elétrico:** +5 pontos percentuais de chance de atordoar o monstro.
- **Mira Certeira:** +5 pontos percentuais de chance de acerto crítico.
- **Pele de Pedra:** +2 de Defesa.
- **Passo Veloz:** +3% de Esquiva.
- **Aparo Espectral:** +3% de Aparo.

Pactos são skills passivas que afetam cada monstro criado depois de selados, inclusive chefes. Cada pacto só pode ser obtido uma vez:

- **Pacto da Carne Frágil:** monstros começam com 10% menos HP atual; o máximo continua original, por exemplo `90/100`.
- **Pacto da Guarda Partida:** −5 de Defesa dos monstros.
- **Pacto das Garras Cegas:** −5 de Ataque dos monstros.
- **Pacto dos Reflexos Presos:** −10 pontos percentuais de Esquiva dos monstros.
- **Pacto do Ritmo Quebrado:** −10 pontos percentuais de Aparo dos monstros.

Quando o sacrifício é perder itens da mochila ou equipamento vestido, os itens são removidos permanentemente. O equipamento roubado é escolhido aleatoriamente entre os slots ocupados. Se o jogador não tiver itens em uma dessas categorias, aquela penalidade não entra no sorteio. Pactos adquiridos aparecem junto das demais skills na seção **Skills passivas** e seus efeitos já são aplicados às lutas seguintes.

O HP/Foco recuperado não ultrapassa o novo máximo efetivo. Stun e crítico continuam respeitando os limites configurados para cada personagem. Skills que já foram obtidas não entram novamente no sorteio. Saves existentes com a lista antiga `hero.mistPowers` são migrados para `hero.passiveSkills` ao carregar; pactos ficam em `hero.monsterPacts`.

Os valores e conteúdo ficam em `world-rules.js` e `mist-contacts.js`; as probabilidades e efeitos de exploração ficam em `exploration-rules.js`.

### Depois de completar os objetivos

As quatro regiões de exploração têm cinco tarefas cada, incluindo metas cumulativas de explorações sem interrupção e monstros derrotados. Ao cumprir todas, a próxima região é descoberta. A Câmara do Trono não tem rolagem narrativa nem aparece no sorteio de monstros comuns: ao chegar nela, o jogador escolhe se enfrenta Gudran. Aceitar inicia o chefe final; Gudran não pode ser poupado nem evitado por fuga. Derrotá-lo encerra a campanha.

### Outros desfechos da exploração e da luta

- Se o jogador estiver com HP 0 ou houver uma decisão pendente (evento, contato ou baú), o botão Explorar não inicia outra rolagem.
- A exploração pode causar dano por armadilha, mas esse dano não reduz o HP abaixo de 1.
- Uma luta termina em vitória, fuga ou derrota do herói. Fugir tem 70% de sucesso; se falhar, o monstro ataca. Gudran impede a fuga.
- A vitória concede XP e ouro configurados no monstro. A variação de atributos também varia os valores de XP/ouro rolados no início do encontro.
- Após ganhar XP, pode ocorrer subida de nível: os atributos e pontos de habilidade seguem a progressão do personagem.
- Se o herói chegar a 0 HP, a jornada termina em derrota e o save da campanha é apagado.
- Camp, navegação de regiões e subida de nível são sistemas paralelos: descanso e mudança de região têm ações próprias, não são resultados aleatórios do botão Explorar.

### O que as porcentagens significam

- **38% monstro** e os demais pesos são a rolagem final de exploração, somente se evento narrativo e contato da névoa não aparecerem naquele clique.
- **20% evento narrativo** é testado antes do contato da névoa, depois do intervalo; portanto, se disparar, o contato e a rolagem de exploração não são testados naquele clique.
- A chance de contato da névoa também é uma rolagem separada, testada depois do evento narrativo e antes do resultado de exploração.
- **10% de vendedor** é testado depois do evento narrativo e antes do contato da névoa, respeitando o intervalo de 10 explorações.
- **10% spare** é testado apenas depois da vitória contra monstro comum; se aparecer, o jogador decide entre golpe final e poupar. As cinco consequências de poupar são então sorteadas com 20% cada.
- As chances de recompensa (baú, drop de monstro, raridade) são novas rolagens dentro do resultado que as habilita; não são pontos percentuais da chance principal de explorar.
