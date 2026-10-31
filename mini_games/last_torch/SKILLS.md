# Skills: conceito da árvore

Guia para decidir onde cada skill mora, quanto custa e como aparece. Toda skill nova deve seguir estas regras.
Os dados ficam em `data_model/tree.js`, `data_model/powers.js` e `data_model/passives.js`.

## Os 4 ramos

| Ramo | Fantasia | Como se joga | Custo |
|---|---|---|---|
| **Blade** | Guerreiro | Força bruta, menos técnica: entrar no meio e matar todo mundo. Dano, vida, Fúria. | Médio |
| **Shadow** | Ladrão | Técnico: exige habilidade (mirar, carregar, esquivar no tempo certo). Velocidade, adagas, dash, ouro. | O mais barato |
| **Flame** | Guardião | Defensivo, calmo e cauteloso: ficar perto da tocha e protegê-la. Tocha, calor, fogo. | O mais caro |
| **Curse** | Feiticeiro | Magias em geral: ataques em área e à distância. Gelo, raio, morte, XP. | O mais caro |

**Pergunta para encaixar uma skill:** o que ela pede do jogador? Agressividade vai em Blade; precisão ou
oportunismo, em Shadow; paciência, em Flame; poder à distância ou em área, em Curse.

## Custos

O custo vem do ramo e do tipo do nó, nunca só do fato de ser evolução. A regra é
**Shadow < Blade < Flame = Curse**: quanto mais habilidade o ramo exige, mais barato ele é.

| Pontos por nível | Shadow | Blade | Flame | Curse |
|---|---|---|---|---|
| Básico (stats e efeitos simples) | 1 | 1 | 1 | 1 |
| Poder | 1 | 2 | 3 | 3 |
| Especial (passiva ou evolução) | 2 | 3 | 4 | 4 |

- A linha Básico é igual em todos os ramos porque 1 é o menor custo possível, e assim o primeiro ponto
  pode ser gasto em qualquer ramo.
- Os valores ficam em `TREE_COSTS` (`data_model/tree.js`).
- `cost` no próprio nó sobrescreve a tabela. Use só para uma exceção justificada.

## Formatos

O formato diz o tipo do nó, em qualquer árvore:

| Formato | Tipo | Significado |
|---|---|---|
| Quadrado | stat, poder, efeito | Sobe de nível, mostra `2/5` |
| Círculo | passiva, relíquia | Compra única |
| Losango | evolução | Transforma um poder no nível máximo |

## Mapa atual

Cada ramo tem até 3 linhas temáticas; uma skill nova deve continuar a linha do seu tema.

- **Blade** (raiz: Blade Damage)
  - Fúria: Fury, Battle Rage, Keen Eye, Slash Width, Whirlwind
  - Aço: Attack Speed, Attack Range, Spectral Blades, Blade Tempest
  - Corpo: Hero Health, Knockback, Iron Skin, Blood Edge
- **Shadow** (raiz: Move Speed)
  - Adagas: Ricochet, Quick Hands, Dagger Mastery, Long Throw, Fan of Knives, Soul Lance, Soul Spear
  - Esquiva: Phantom Rush, Fleet Foot, Shadow Clone
  - Ladrão: Light Fingers, Pickpocket, Thief's Nose, Master Thief
- **Flame** (raiz: Torch Keeper)
  - Calor: Warm Hearth, Sacred Ground, Undying Flame
  - Sentinela: Flame Sentinel, Sun Spire
  - Brasa: Ember Steps, Hellwalker
- **Curse** (raiz: Arcane Study)
  - Gelo e força: Cold Moon, Soul Nova, Absolute Zero, Mirror Ward
  - Tempestade: Storm Sigil, Wrath of Heaven, Starfall
  - Morte: Corpse Burst, Red Harvest

## Como adicionar uma skill

1. Escolha o ramo pela pergunta acima e a linha pelo tema.
2. Crie os dados: `powers.js` (poder ou evolução), `passives.js` (passiva) ou direto no nó (efeito simples).
3. Adicione o nó em `TREE_NODES`. O pré-requisito vem sempre do nó anterior na linha.
4. Não defina `cost`: deixe a tabela decidir.
5. Atualize o mapa acima.
