# Dados do Mini RPG

Os arquivos desta pasta guardam conteúdo e valores de balanceamento. A lógica fica nos sistemas em `../systems/` e na integração/interface em `../game.js`.

- `characters.js`: atributos-base compartilhados e dados de cada personagem. Cada personagem separa `basicStats` (bônus iniciais somados aos atributos compartilhados), `progression` (ganhos por nível), `skills` (ações especiais) e `limits` (tetos de esquiva, aparo e stun, além do limiar mínimo de fúria).
- `items.js`: poção de cura e catálogo de equipamentos que podem cair dos monstros.
- `regions.js`: IDs, títulos, descrições e eventos com escolhas por região em português e inglês. Cada região pode ter vários eventos; eles aparecem sem repetição até o conjunto se esgotar.
- `monsters.js`: atributos-base dos monstros, agrupados pelo ID da região, e faixa de variação por encontro.
- `special-monsters.js`: atributos, nível mínimo e recompensas dos chefes e monstros especiais usados em eventos.
- `mist-contacts.js`: contatos com ícones e ofertas próprias, além dos poderes permanentes dos encontros na névoa. Missões podem referenciar monstros por `bossId`.
- `special-monsters.js`: atributos, requisitos e recompensas dos chefes e monstros especiais.
- `world-rules.js`: escala de probabilidade, frequência/resultados dos contatos e custos/recuperação do acampamento.
- `equipment-rules.js`: chance de drop, raridades, chances especiais de raridade para itens de baús, limite da mochila e aprimoramentos.
- `combat-rules.js`: dano, custos, defesa, fuga e tempos dos turnos.
- `progression-rules.js`: multiplicador de XP e melhorias compradas.
- `exploration-rules.js`: chance de descobrir áreas e eventos, intervalo entre eventos narrativos, pesos dos resultados de exploração, recompensas, chance de obter item ao abrir baú e chance de poupar um monstro derrotado.
- `setup-config.js`: quantidade de equipamentos iniciais escolhidos antes da aventura; ajuste `starterEquipmentCount` para mudar o limite.

A lógica de sorteio dos contatos fica em `../systems/mist-contacts.js`; os encontros durante a exploração são tratados em `../systems/exploration.js`. Para ajustar o ritmo, edite `mistContacts` em `world-rules.js`; adicione contatos e poderes em `mist-contacts.js` e chefes em `special-monsters.js`. Contatos que iniciam uma missão podem apontar para o `id` de um chefe por `bossId`. Chefes exigem o nível definido em `minLevel` e usam `suggestedLevel` como referência para escalar atributos.

A lógica da tela inicial e a seleção dos equipamentos ficam em `../systems/character-setup.js`. O limite de escolhas vem de `setup-config.js`. Os eventos narrativos são declarados em cada região e executados por `resolveStoryEvent` em `../systems/exploration.js`. Os textos PT/EN ficam em `../systems/translations-pt.js` e `../systems/translations-en.js`. Os scripts de dados e sistemas precisam ser carregados antes de `game.js`, que inicia a aventura com as escolhas feitas.

Equipamentos em `items.js` declaram um `id`, um slot (`mainHand`, `offHand`, `head`, `body`, `legs`, `boots`, `necklace`, `ring`, `accessory` ou `pet`), nomes em português e inglês e os bônus em `stats`. Armas de uma mão usam `handUsage: "one-handed"` e podem ser movidas para a outra mão pelo detalhe do item na mochila. Armas de duas mãos usam `handUsage: "two-handed"`; equipá-las guarda o item da mão secundária na mochila. Assim é possível empunhar duas armas de uma mão ou uma arma de duas mãos. Use `itemType: "shield"` para identificar escudos e `starter: true` para oferecer um item na seleção inicial; todos os itens do catálogo podem cair dos monstros. A chance de drop, a capacidade da mochila, a distribuição das raridades, as raridades exclusivas da última região e as regras de aprimoramento até +9 ficam em `equipment-rules.js`; a lógica fica em `../systems/equipment-core.js` e a interface em `../systems/equipment-ui.js`.

Os IDs em `regions.js` precisam corresponder às chaves de `monsters.byRegion` em `monsters.js`. Os arquivos de regras são partes de `YaraRpgData.rules` e devem carregar antes dos sistemas. A ordem de todos os scripts está declarada em `game.html`; mantenha `game.js` por último.
