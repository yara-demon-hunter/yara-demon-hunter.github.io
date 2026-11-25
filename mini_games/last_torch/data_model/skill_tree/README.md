# Árvore de skills (`data_model/skill_tree/`)

Tudo o que é da árvore mora aqui. Procurando onde mexer?

| Quero mudar... | Onde |
|---|---|
| **o preço** (pontos) de uma skill | `nodes/<ramo>.js`, campo `cost` **no próprio nó**. Cada nível custa isso. |
| quantos pontos o herói ganha por nível | `points.js` (`TREE_POINTS.perLevel`) |
| onde uma skill aparece, o que a abre | `nodes/<ramo>.js` (`x`, `y`, `requires`) |
| nome, cor ou ícone de um ramo, afinidade dos heróis | `branches.js` |
| dano, recarga, alcance, níveis da skill | `data_model/powers.js` (poderes) ou `passives.js` (passivas) |

## Preço: sempre no nó
Não existe tabela de custo por ramo nem acréscimo automático para skills ativas: **o `cost` do nó é o preço**, e é obrigatório
(`index.js` falha ao abrir o jogo se algum nó estiver sem `cost`, ou com valor que não seja inteiro >= 1). A skill de nível 5
custa `cost x 5` no total (a evolução, `kind: 'evolve'`, é um nó à parte com preço próprio). Relíquias não entram aqui:
pagam-se com ouro, e o preço está em `data_model/passives.js`/`relics.js`.

Referência dos preços de hoje: stats e mods 1 ou 2; poderes 2 a 4; passivas e evoluções 3 a 5. Skills que agem sozinhas em
campo (atiram, explodem, invocam) custam um ponto a mais que as de efeito passivo no mesmo ramo, para ninguém empilhar muitas numa
noite (cerca de 86 pontos numa partida inteira). Isso agora é só uma convenção: ao criar uma skill, escolha o número.

## Adicionar uma skill
1. Os números dela em `data_model/powers.js` (ou `passives.js`).
2. Um nó em `nodes/<ramo>.js` com `id`, `cost`, `branch`, `kind`, `key`, `x`, `y`, `requires`.
3. Lógica em `js/systems/skills_<ramo>.js` e desenho em `js/render/`.

## Campos do nó e regras (herdado do antigo `tree.js`)
--- ÁRVORE DE SKILLS ---
Cada nível do herói dá pontos de skill, gastos aqui (medalhão de status). A árvore recomeça a cada noite
e tudo está disponível desde a primeira partida: o que abre cada nó é só o que aparece na própria árvore.
kind: stat (sobe um atributo), power (sobe um poder), evolve (transforma um poder no nível máximo),
mod (efeito simples por nível, `mods` em js/systems/modifiers.js),
passive (skill passiva única de data_model/passives.js; com `oath: true` é um Juramento: só um por noite, e abre com as duas skills que chegam nele).
Conceito de cada ramo, formatos e regras de custo: SKILLS.md.
x = coluna (0 a 6, da esquerda para a direita), y = linha dentro do ramo (0 a 3; 1.5 = entre duas linhas).
stat com `mods` e `levelText`: além de subir o atributo, cada nível soma esses efeitos (Fury e Hero Health).
`levelText` também pode ser uma função de `mods`, para os números exibidos seguirem os valores do efeito.
requires: o nó anterior na árvore, como req(id, nível mínimo). O pré-requisito vem SEMPRE do nó anterior
(a linha que chega nele): quem já cumpriu a cadeia até ali não esbarra em exigências de nós mais atrás.
Se um nó mais atrás precisa ter mais nível, suba o nível pedido no nó do meio. O painel de detalhe mostra
tudo o que falta de uma vez. Só a ligação com o nó anterior abre um nó: não há exigência de matar monstros.
O custo é o `cost` de cada nó (obrigatório). maxLvl padrão 5.
notFor: ['rowan'] sela a skill para esses heróis, como o hero (a Fireballs, que mexeria nas rosas dele): selada, não se compra.
exclusive: 'grupo' põe a skill num grupo em que só uma pode ser aprendida (a lâmina só aceita um encantamento: Flaming Sword ou Blessed Blade); a outra fica selada, com passe livre.
needs: 'knives' marca a skill que só funciona com adaga. Quem não lança adaga (mod noKnives: o Captain Brutos, ou o
Oath of Slaughter jurado) tem esses nós SELADOS (não é o cadeado: o cadeado é "ainda não", o selo é "não é para
este personagem"): não se compram e valem como cumpridos para os nós que vêm depois (passe livre), então a cadeia
segue aberta (js/systems/tree.js, isRestricted).
