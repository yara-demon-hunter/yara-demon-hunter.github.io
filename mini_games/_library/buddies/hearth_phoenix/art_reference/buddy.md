# Buddy: Fênix da Tocha

- **pasta:** `buddies/hearth_phoenix/`
- **Papel:** Last Torch: Flaming Phoenix. Fênix de fogo que paira em volta da tocha e atira bolas de fogo nos monstros perto da chama. Não leva o herói a lugar nenhum: fica junto da fogueira.
- **Funções:** `hearth_phoenix.js`: `prepareHearthPhoenix(kind, mobile)`, `drawHearthPhoenixSprite(g, x, y, size, facing, tilt, kind, alpha)`, `hearthPhoenixBeak(x, y, facing)` e `renderHearthPhoenix(g, bird, kind, quality)`. `kind` é `'fire'` ou `'blue'`.

## Como é desenhada

É a **fênix 3D do Laboratório** (`tools/lab/fenix_foto.html`, código em `fenix_foto.js`): asas abertas batendo e a ave inteira em chamas, 100% procedural (Three.js; nenhuma imagem). Segue a metodologia dos 7 itens (`tools/lab/metodologia_fotorrealismo.md`):
penas com PBR e ruído (barbas, falhas e normal geradas por código; brilho emissivo que cresce da raiz à ponta), luz do fogo no entorno e AO, ~330 partículas de chama e fagulha **sem estado** (a posição é função do tempo e sai das pontas das penas, então o ciclo dá a volta sem emenda), bloom e ACES.
`tools/lab/bake_fenix.py` grava os quadros: `fenix_fogo_atlas.webp` e `fenix_azul_atlas.webp`, 5 linhas (lado, frente-lado, frente, costas-lado, costas) de 12 quadros de 144 px (~350 KB cada), com fundo transparente (o preto da renderização vira alfa: alfa = luz do pixel; ~60 KB cada). Em campo custa um `drawImage` mais o brilho grande e as brasas subindo.

## Duas versões

- `fire`: laranja e ouro.
- `blue`: toda azul (penas, chamas, brilho). O jogo a usa quando o jogador tem a Blue Torch.

## O que a paleta e as medidas controlam

`hearth_phoenix_visual.js`: quadros, velocidade, tamanho no mundo (`size`), posição do bico e as cores do brilho. Para mudar a ave em si (asas, penas, chama, cores), edite `fenix_foto.js` no Laboratório e grave de novo com `bake_fenix.py` (instruções no topo do script).

## O que é do jogo e não mora aqui

`state.hearthBird` (posição, direção, `flash` ao atirar, `rise` ao nascer), o voo em volta da tocha e o tiro ficam em js/systems/skills_flame.js; o desenho chama `renderHearthPhoenix` em js/render/phoenix.js.

## Origem

Criada em 2026-11-17. A primeira versão era um desenho 2D da fênix do Phoenix Pact com línguas de chama; foi trocada pela fênix 3D do Laboratório no mesmo dia.

## Direção de arte (pedido do usuário, 2026-11-17)

Referência: `images/referencia_fenix_fogo.png`. A fênix é **mais fogo que ave**: o fogo é o material que forma a ave, não penas com chamas por cima.
Asas grandes erguidas e abertas, feitas de longas línguas de fogo em leque (ouro na ponta, laranja e vermelho-escuro na base); cabeça e crista claras, quase brancas; pescoço longo e curvo; cauda enorme escorrendo em fitas de fogo; garras; fagulhas e brasas por todo o ar e fumaça de fogo atrás. A silhueta de ave aparece onde o fogo é mais denso. A versão atual (3D com penas PBR) está longe disso e precisa ser refeita nesse rumo, nas duas cores (laranja e azul).

## Ângulos (2026-11-17)

O atlas tem 5 linhas, uma por lado de que se vê a ave (`bake_fenix.py` gira a ave: yaws 40, -5, -50, 85, 130). À esquerda o desenho é espelhado. `hearthPhoenixView(dx, dy)` escolhe a linha pela direção do voo; `hearthPhoenixBeak(x, y, facing, view)` dá a boca do fogo em cada linha. O jogo guarda a direção em `state.hearthBird.dirX/dirY/view`.
