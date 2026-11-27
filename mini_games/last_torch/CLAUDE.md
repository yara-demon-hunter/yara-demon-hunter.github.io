# Last Torch: instruções para IAs e agentes de código

Tower defense de ação em JS puro (sem framework, sem build): o herói defende a tocha por 18 ondas em 6 telas, com árvore de skills em
6 ramos. Manual do jogo: [README.md](README.md). Conceito dos ramos e custos: [SKILLS.md](SKILLS.md). Pacote para portais:
[BUILDSTANDALONE.md](BUILDSTANDALONE.md).

## Onde as coisas moram

- `data_model/`: **dados** (monstros, ondas, skills, custos, dificuldade, visuais). Balanceamento e números mudam aqui, não no `js/`.
- `js/`: lógica (`core`, `systems`, `render`, `ui`, `audio`, `platform`). `js/game.js` é a entrada.
- `css/`, `images/`: estilo e imagens do jogo.
- `library/`: **cópia gerada** da biblioteca de arte. Nunca editar (veja `library/CLAUDE.md`): edite em `mini_games/_library/` e rode
  `ruby mini_games/_library/sync.rb`, depois `sync.rb --check`.
- `_sandbox/` (ferramentas de ajuste), `_tests/`, `plans/`, `report/`, `unused/`: não vão para o pacote final.

## Regras do projeto

- **Mini games independentes:** o jogo copia os próprios assets. Nunca referenciar a pasta de outro jogo.
- **Imagens do site** vão para `assets/images`; páginas nunca apontam para pastas dos jogos.
- **Mobile e desktop juntos**, pensando primeiro no celular em pé: lado a lado em vez de rolar. Todo ajuste de HUD vale nos dois.
- **Mouse é o padrão** (setas/WASD desligadas até ligar em Settings). Clicar atira no mais perto; segurar e arrastar mira; o tiro nunca sai sozinho.
- **Desempenho primeiro:** arte nova leve (atlas/sprites), nada cobrindo a ação; medir ms e MB antes de entregar.
- **Nunca fazer `git commit` nem criar branch** sem pedido explícito.
- Texto do jogo em inglês; documentação e conversa em português.
- Ao mudar uma regra do jogo, atualize a seção correspondente do README (ele é a fonte de verdade do que o jogo faz).

## Como testar

Não há Node. Há Chrome headless e Playwright: dá para rodar o jogo real, simular noites e medir.

```bash
python3 mini_games/last_torch/_tests/qa_sweep.py            # dados + telas nos 4 tamanhos (só imprime falhas)
python3 mini_games/last_torch/_tests/qa_sweep.py --play     # + partida rápida de cada herói
```

Detalhes em [_tests/README.md](_tests/README.md). Comandos úteis de console (ex.: ganhar pontos de skill): [USEFUL.md](USEFUL.md).
Mudança de arte: conferir nas duas câmeras e nos tamanhos de tela do qa_sweep.

## Skills de game dev (`.claude/skills/` na raiz do repositório)

Use antes de mexer na área correspondente:

| Tarefa | Skill |
|---|---|
| Ondas, economia, alvos, dificuldade, "morre na onda 1" | `tower-defense` |
| Retenção, segunda chance, Brasas/Altar, evoluções, meta-progressão | `roguelike` |
| Tiro sem impacto, hit-stop, tremor, números de dano, knockback | `game-feel` |
| HUD, menus, telas de celular e ultrawide, acessibilidade | `game-ui-ux` |
| Comportamento dos monstros, perseguição, desvio, chefes | `game-ai` |
| Mixagem, variação de sons, música que reage à onda | `audio-design` |
| Mouse, toque, rebind, tiro automático | `input-systems` |

Elas são genéricas (alguns exemplos são Godot/Unity): aplique o princípio, não copie o código. Os números do jogo ficam em `data_model/`.
