# Yara RPG

For focused code changes, start with [CODEMAP.md](CODEMAP.md) to find the specific system and data file. Most changes do not require reading all RPG scripts.

## Executar

Com o site local iniciado na raiz do repositório:

```sh
bundle exec jekyll serve
```

Abra `/mini_games/yara-rpg/game.html`. A página também pode ser aberta diretamente, mas Tailwind CSS e as fontes Cinzel/Inter são carregadas de CDNs e precisam de conexão com a internet.

Os menus do site abrem o jogo no idioma da página (`?lang=pt` ou `?lang=en`). O seletor PT/EN no jogo também permite trocar o idioma; a troca reinicia a partida.

Ao abrir o mini game, escolha um personagem e os equipamentos iniciais, cada um de um espaço diferente. Zeph começa com mais HP máximo; Oskar começa com mais ataque. A quantidade de equipamentos iniciais fica em `js/data/setup-config.js`, na variável `starterEquipmentCount`; contador e botão de início acompanham esse valor automaticamente.

A página do jogo usa o layout base do site, que centraliza a verificação do Bing, o Google Analytics 4 e o Google AdSense para todas as páginas.

## Build para CrazyGames

O código de jogo continua mantido uma única vez nesta pasta. A página normal do site e a página de distribuição para CrazyGames reutilizam os mesmos fragmentos HTML, scripts, dados, estilos, imagens e áudio. Não edite os arquivos gerados em `crazygames-build/`.

Na raiz do repositório, gere primeiro o site e depois o pacote:

```sh
bundle exec jekyll build
ruby mini_games/yara-rpg/build-crazygames.rb
```

O resultado fica em `mini_games/yara-rpg/crazygames-build/`. Envie o conteúdo dessa pasta pelo portal; `index.html` é a entrada do jogo. A página usa o layout `crazygames` e não carrega o layout do site, AdSense, Analytics nem o link “Voltar ao site”.

Para jogar o pacote localmente sem iniciar o Jekyll, rode na raiz do repositório:

```sh
python3 -m http.server 8000 --directory mini_games/yara-rpg/crazygames-build
```

Mantenha esse comando rodando e abra `http://localhost:8000/` no navegador. O servidor precisa continuar ativo enquanto você joga. Se a porta 8000 já estiver ocupada, troque `8000` por `8001` no comando e abra `http://localhost:8001/`.

Esta primeira versão ainda carrega Tailwind e as fontes Cinzel/Inter de CDNs, assim como a página atual. Antes de uma submissão final, compile Tailwind para CSS local e decida se quer empacotar as fontes ou usar alternativas locais. A integração da SDK, seleção de idioma pela configuração da plataforma e o fluxo de início rápido também são etapas separadas ainda necessárias para preparar o lançamento.

## Estrutura

- `game.html`: front matter e composição dos fragmentos HTML do RPG.
- `partials/`: fragmentos HTML internos, compostos com `include_relative` para manter o RPG independente de `_includes` do site.
- `css/main.css`: ponto de entrada dos estilos do jogo, importando os módulos CSS.
- `css/base.css`: tema global, eventos narrativos e temas regionais.
- `css/start-screen.css`: seleção inicial de personagem e equipamentos.
- `css/equipment.css`: personagem, slots, mochila, itens e melhorias.
- `css/interface.css`: controles gerais e idioma.
- `css/responsive.css`: layout para tablets e celulares.
- `css/game.css`: atalho de compatibilidade que importa `main.css`.
- `css/embedded-rpg.css`: estilos do fragmento HTML legado.
- `js/game.js`: estado global, início/retomada de jornada e evolução de nível.
- `js/systems/translations-pt.js` e `js/systems/translations-en.js`: textos localizados por idioma.
- `js/systems/language.js`: idioma selecionado, função de tradução `t` e atualização dos rótulos HTML.
- `js/systems/audio.js`: música e efeitos sonoros.
- `js/systems/persistence.js`: salvamento, restauração e migração de jornadas salvas.
- `js/systems/equipment-core.js`: instâncias, atributos, raridades, drops e regras de equipar itens.
- `js/systems/equipment-ui.js`: mochila, painéis e diálogos de equipamento.
- `js/systems/upgrades.js`: compra de melhorias e controles do menu de melhorias.
- `js/systems/hud.js`: atualização dos painéis do jogo e registro de mensagens.
- `js/systems/exploration.js`: exploração, descoberta de regiões, eventos narrativos, surgimento de monstros e contatos da névoa.
- `js/systems/combat.js`: ataques do jogador e turnos dos inimigos.
- `js/systems/combat-outcomes.js`: poções, acampamento, fuga, recompensas e finais do combate.
- `js/systems/mist-contacts.js`: regras reutilizáveis para sortear contatos, resultados, chefes e poderes da névoa.
- `js/systems/character-setup.js`: controla a seleção inicial do personagem e do equipamento.
- `js/data/setup-config.js`: configura a quantidade de equipamentos iniciais que o jogador pode escolher.
- `js/data/mist-contacts.js`: conteúdo editável dos espíritos, chefes especiais e poderes permanentes.
- `js/data/characters.js`: personagens iniciais, descrições, especialidades e evolução individual por nível.
- `js/data/world-rules.js`: escala de probabilidade, contatos da névoa e acampamento.
- `js/data/equipment-rules.js`: drops, raridades, mochila e aprimoramento de equipamentos.
- `js/data/combat-rules.js`: golpes, turnos, defesa, fuga e atrasos do combate.
- `js/data/progression-rules.js`: XP, evolução e melhorias compradas.
- `js/data/exploration-rules.js`: descoberta de áreas e resultados da exploração.
- `js/data/items.js`: poção de cura e catálogo de equipamentos e bônus de atributos.
- `js/tailwind.config.js`: cores customizadas usadas pelas classes Tailwind.
- `components/yara-rpg.html`: fragmento antigo para incorporação; não é usado pela página completa nem publicado como página.

## Contatos na névoa

Durante a exploração, um contato pode abordar Zeph. Cada contato tem um ícone próprio, e a chance de encontro começa baixa, aumenta com o nível e respeita um intervalo mínimo. O jogador pode aceitar a oferta ou recusá-la sem penalidade. Em geral, aceitar sorteia entre enfrentar um chefe, receber ouro em troca de HP ou despertar um poder permanente; a bruxa caçadora sempre inicia sua missão contra um morto-vivo forte, enquanto a bruxa velha troca uma bebida que reduz o HP para no máximo 20% do máximo por 150 de ouro.

Para expandir o sistema, cadastre novos contatos, chefes ou poderes em `js/data/mist-contacts.js`. Ajuste frequência e resultados dos contatos em `js/data/world-rules.js`. Os textos de interface ficam em `js/systems/translations-pt.js` e `js/systems/translations-en.js`.

## Acampamento e equipamentos

Descansar custa 50 de ouro e recupera 20% do HP e do foco máximos atuais, sem ultrapassar os limites. Monstros têm 20% de chance de deixar um equipamento. Os dez slots do personagem incluem espaços separados para colar, anel, acessório e companheiro; clique ou toque no ícone do item para ver nome, bônus e ações numa janela de detalhes. A mochila fica à direita do capacete; seus dez espaços também mostram apenas ícones e abrem os detalhes do item ao selecionar um. O botão de poção fica ao lado das botas no painel e também aparece nos comandos de combate. Ao encontrar um item para um slot ocupado, o jogador pode equipar o novo (guardando o anterior na mochila) ou manter o atual (guardando a descoberta). Equipamentos podem ser equipados ou descartados fora de combate. Se a mochila estiver cheia, a ação que guardaria outro equipamento é bloqueada, e o item encontrado permanece aguardando até que um espaço seja liberado. Os painéis de equipamento e atributos são independentes e podem ser recolhidos em desktop e mobile; ambos começam fechados para deixar mais espaço para a aventura.

Os itens e atributos que concedem ficam em `js/data/items.js`; chance de drop, mochila e aprimoramento ficam em `js/data/equipment-rules.js`. Custos e recuperação do acampamento ficam em `js/data/world-rules.js`.

Para alterar personagens ou criar outro, edite `js/data/characters.js`. Cada personagem possui seu próprio bloco `levelUp`, com valores editáveis para os ganhos de cada nível. A tela de seleção e o limite de itens ficam em `js/systems/character-setup.js`; textos localizados ficam nos arquivos `translations-*.js`.

## Mapa rápido do código

- Texto em PT/EN: `js/systems/translations-pt.js` ou `js/systems/translations-en.js`.
- Idioma, URL ou tradução de rótulos: `js/systems/language.js`.
- Exploração, eventos e encontros: `js/systems/exploration.js`; valores em `js/data/exploration-rules.js` e `world-rules.js`.
- Golpes e turnos: `js/systems/combat.js`; balanceamento em `js/data/combat-rules.js`.
- Poções, descanso, fuga e recompensas: `js/systems/combat-outcomes.js`; valores em `world-rules.js` e `combat-rules.js`.
- Melhorias: `js/systems/upgrades.js`; valores em `js/data/progression-rules.js`.
- Regras de equipamento: `js/systems/equipment-core.js`; catálogo em `js/data/items.js`; valores em `js/data/equipment-rules.js`.
- Mochila e diálogos de itens: `js/systems/equipment-ui.js`.
- Salvamento: `js/systems/persistence.js`.
- Música/efeitos: `js/systems/audio.js`.
- Painéis e mensagens: `js/systems/hud.js`.
- Estado inicial, nova jornada e evolução de nível: `js/game.js`.
- Escolhas iniciais de personagem/equipamento: `js/systems/character-setup.js`.

Para mudanças pontuais, use este mapa e abra apenas o sistema indicado e, quando necessário, seu arquivo de dados. O estado compartilhado usa scripts clássicos: `game.html` define a ordem de carregamento e `game.js` deve permanecer por último.

## Estado do componente

O fragmento em `components/` ainda não é autônomo: não contém todos os campos de status nem a lógica de jogo correspondente. Foi mantido separado para referência, não como uma segunda versão funcional. O arquivo JavaScript vazio que o acompanhava foi removido.

## Avaliacao tecnica

A página completa já oferece um ciclo jogável de exploração, combate, descanso, itens e progressão. A lógica e o balanceamento ficam divididos por responsabilidade em scripts menores; os controles ainda usam handlers `onclick` no HTML. O Tailwind via CDN é adequado para prototipagem, mas deve ser compilado localmente antes de uma publicação de produção.
