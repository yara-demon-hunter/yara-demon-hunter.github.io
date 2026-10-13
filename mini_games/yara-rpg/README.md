# Yara RPG

## Executar

Com o site local iniciado na raiz do repositório:

```sh
bundle exec jekyll serve
```

Abra `/mini_games/yara-rpg/game.html`. A página também pode ser aberta diretamente, mas Tailwind CSS e as fontes Cinzel/Inter são carregadas de CDNs e precisam de conexão com a internet.

Os menus do site abrem o jogo no idioma da página (`?lang=pt` ou `?lang=en`). O seletor PT/EN no jogo também permite trocar o idioma; a troca reinicia a partida.

A página do jogo usa o layout base do site, que centraliza a verificação do Bing, o Google Analytics 4 e o Google AdSense para todas as páginas.

## Estrutura

- `game.html`: página completa e ponto de entrada do RPG.
- `css/game.css`: estilos próprios da página.
- `css/embedded-rpg.css`: estilos do fragmento HTML legado.
- `js/game.js`: estado do personagem, exploração, combate e atualização da interface.
- `js/systems/mist-contacts.js`: regras reutilizáveis para sortear contatos, resultados, chefes e poderes da névoa.
- `js/data/mist-contacts.js`: conteúdo editável dos espíritos, chefes especiais e poderes permanentes.
- `js/data/game-rules.js`: balanceamento, incluindo chance crescente por nível, intervalo entre contatos e pesos dos resultados.
- `js/data/items.js`: poção de cura e catálogo de equipamentos e bônus de atributos.
- `js/tailwind.config.js`: cores customizadas usadas pelas classes Tailwind.
- `components/yara-rpg.html`: fragmento antigo para incorporação; não é usado pela página completa nem publicado como página.

## Contatos na névoa

Durante a exploração, um contato pode abordar Zeph. Cada contato tem um ícone próprio, e a chance de encontro começa baixa, aumenta com o nível e respeita um intervalo mínimo. O jogador pode aceitar a oferta ou recusá-la sem penalidade. Em geral, aceitar sorteia entre enfrentar um chefe, receber ouro em troca de HP ou despertar um poder permanente; a bruxa caçadora sempre inicia sua missão contra um morto-vivo forte, enquanto a bruxa velha troca uma bebida que reduz o HP para no máximo 20% do máximo por 150 de ouro.

Para expandir o sistema, cadastre novos contatos, chefes ou poderes em `js/data/mist-contacts.js`. Ajuste frequência, intervalo, recompensas e pesos em `js/data/game-rules.js`. Os textos de interface ficam em português e inglês em `js/game.js`.

## Acampamento e equipamentos

Descansar custa 50 de ouro e recupera 20% do HP e do foco máximos atuais, sem ultrapassar os limites. Monstros têm 20% de chance de deixar um equipamento. Os sete slots do personagem exibem apenas o ícone do item; clique ou toque nele para ver nome, bônus e ações numa janela de detalhes. A mochila ocupa o próprio slot inferior do painel de equipamento; seus dez espaços também mostram apenas ícones e abrem os detalhes do item ao selecionar um. Ao encontrar um item para um slot ocupado, o jogador pode equipar o novo (guardando o anterior na mochila) ou manter o atual (guardando a descoberta). Equipamentos podem ser equipados ou descartados fora de combate. Se a mochila estiver cheia, a ação que guardaria outro equipamento é bloqueada, e o item encontrado permanece aguardando até que um espaço seja liberado. Os painéis de equipamento e atributos são independentes e podem ser recolhidos em desktop e mobile; ambos começam fechados para deixar mais espaço para a aventura.

Os itens e atributos que concedem ficam em `js/data/items.js`; chance de drop e recuperação do acampamento ficam em `js/data/game-rules.js`.

## Estado do componente

O fragmento em `components/` ainda não é autônomo: não contém todos os campos de status nem a lógica de jogo correspondente. Foi mantido separado para referência, não como uma segunda versão funcional. O arquivo JavaScript vazio que o acompanhava foi removido.

## Avaliacao tecnica

A página completa já oferece um ciclo jogável de exploração, combate, descanso, itens e progressão. A separação em arquivos facilita a manutenção, mas o JavaScript ainda reúne toda a lógica e a interface num único arquivo e depende de handlers `onclick` no HTML. O Tailwind via CDN é adequado para prototipagem, mas deve ser compilado localmente antes de uma publicação de produção.
