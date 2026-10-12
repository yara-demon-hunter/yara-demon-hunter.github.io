# Dados do Mini RPG

Os arquivos desta pasta guardam conteúdo e valores de balanceamento. A lógica que os usa fica em `../game.js`.

- `hero.js`: atributos iniciais do Zeph e ganhos por level.
- `items.js`: poção de cura e recuperação do acampamento.
- `regions.js`: IDs, títulos e descrições das telas em português e inglês.
- `monsters.js`: atributos-base dos monstros, agrupados pelo ID da região, e faixa de variação por encontro.
- `mist-contacts.js`: contatos com ícones e ofertas próprias, chefes especiais e poderes permanentes dos encontros na névoa.
- `game-rules.js`: custos de ações, limites, fúria, chances de exploração, pesos dos resultados e melhorias compradas.

A lógica de sorteio dos contatos fica em `../systems/mist-contacts.js`. Para ajustar o ritmo, edite `mistContacts` em `game-rules.js`; para adicionar conteúdo, inclua contatos, chefes ou poderes em `mist-contacts.js`. Chefes exigem o nível definido em `minLevel` e usam `suggestedLevel` como referência para escalar atributos.

Os IDs em `regions.js` precisam corresponder às chaves de `monsters.byRegion` em `monsters.js`. Os scripts são carregados nessa ordem em `game.html`; mantenha `game.js` por último, pois ele consome os dados anteriores.