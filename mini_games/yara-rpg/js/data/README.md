# Dados do Mini RPG

Os arquivos desta pasta guardam conteúdo e valores de balanceamento. A lógica fica nos sistemas em `../systems/` e na integração/interface em `../game.js`.

- `characters.js`: atributos-base compartilhados, elenco selecionável, descrições, bônus de especialidade e ganhos por nível (ajuste `levelUp` individualmente em cada personagem).
- `items.js`: poção de cura e catálogo de equipamentos que podem cair dos monstros.
- `regions.js`: IDs, títulos, descrições e eventos com escolhas por região em português e inglês. Cada região pode ter vários eventos; eles aparecem sem repetição até o conjunto se esgotar.
- `monsters.js`: atributos-base dos monstros, agrupados pelo ID da região, e faixa de variação por encontro.
- `special-monsters.js`: atributos, nível mínimo e recompensas dos chefes e monstros especiais usados em eventos.
- `mist-contacts.js`: contatos com ícones e ofertas próprias, além dos poderes permanentes dos encontros na névoa. Missões podem referenciar monstros por `bossId`.
- `game-rules.js`: custos de ações, limites, fúria, contatos da névoa, capacidade da mochila, raridades e aprimoramento de equipamentos, além das melhorias compradas.
- `exploration-rules.js`: chance de descobrir áreas e eventos, intervalo entre eventos narrativos, pesos dos resultados de exploração, recompensas e chance de poupar um monstro derrotado.
- `setup-config.js`: quantidade de equipamentos iniciais escolhidos antes da aventura; ajuste `starterEquipmentCount` para mudar o limite.

A lógica de sorteio dos contatos fica em `../systems/mist-contacts.js`; os encontros durante a exploração são tratados em `../systems/exploration.js`. Para ajustar o ritmo, edite `mistContacts` em `game-rules.js`; adicione contatos e poderes em `mist-contacts.js` e chefes em `special-monsters.js`. Contatos que iniciam uma missão podem apontar para o `id` de um chefe por `bossId`. Chefes exigem o nível definido em `minLevel` e usam `suggestedLevel` como referência para escalar atributos.

A lógica da tela inicial e a seleção dos equipamentos ficam em `../systems/character-setup.js`. O limite de escolhas vem de `setup-config.js`. Os eventos narrativos são declarados em cada região e executados por `resolveStoryEvent` em `../systems/exploration.js`. Os textos PT/EN ficam em `../systems/i18n.js`. Os scripts de dados e sistemas precisam ser carregados antes de `game.js`, que inicia a aventura com as escolhas feitas.

Equipamentos em `items.js` declaram um `id`, um slot (`rightHand`, `leftHand`, `head`, `body`, `legs`, `boots`, `necklace`, `ring`, `accessory` ou `pet`), nomes em português e inglês e os bônus em `stats`. Use `stunChance` para bônus percentuais de chance de atordoamento e `starter: true` para oferecer um item na seleção inicial; todos os itens do catálogo podem cair dos monstros. A chance de drop, a capacidade da mochila, a distribuição das raridades, as raridades exclusivas da última região e as regras de aprimoramento até +9 ficam em `game-rules.js`; a interface e o inventário ficam em `../game.js`.

Os IDs em `regions.js` precisam corresponder às chaves de `monsters.byRegion` em `monsters.js`. Os scripts são carregados nessa ordem em `game.html`; mantenha `game.js` por último, pois ele consome os dados anteriores.
