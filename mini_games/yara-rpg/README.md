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
- `js/tailwind.config.js`: cores customizadas usadas pelas classes Tailwind.
- `components/yara-rpg.html`: fragmento antigo para incorporação; não é usado pela página completa nem publicado como página.

## Estado do componente

O fragmento em `components/` ainda não é autônomo: não contém todos os campos de status nem a lógica de jogo correspondente. Foi mantido separado para referência, não como uma segunda versão funcional. O arquivo JavaScript vazio que o acompanhava foi removido.

## Avaliacao tecnica

A página completa já oferece um ciclo jogável de exploração, combate, descanso, itens e progressão. A separação em arquivos facilita a manutenção, mas o JavaScript ainda reúne toda a lógica e a interface num único arquivo e depende de handlers `onclick` no HTML. O Tailwind via CDN é adequado para prototipagem, mas deve ser compilado localmente antes de uma publicação de produção.
