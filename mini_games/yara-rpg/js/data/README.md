# Dados do Mini RPG

Os arquivos desta pasta guardam conteúdo e valores de balanceamento. A lógica que os usa fica em `../game.js`.

- `hero.js`: atributos iniciais do Zeph e ganhos por level.
- `items.js`: poção de cura e recuperação do acampamento.
- `regions.js`: IDs, títulos e descrições das telas em português e inglês.
- `monsters.js`: atributos-base dos monstros, agrupados pelo ID da região, e faixa de variação por encontro.
- `game-rules.js`: custos de ações, limites, fúria, chance de descoberta e melhorias compradas.

Os IDs em `regions.js` precisam corresponder às chaves de `monsters.byRegion` em `monsters.js`. Os scripts são carregados nessa ordem em `game.html`; mantenha `game.js` por último, pois ele consome os dados anteriores.