# Buddy 2.5D: Lobo Branco (o aliado do Rowan)

- **id do boneco:** `white_wolf` (em `../white_wolf25d.js`)
- **Papel:** o lobo branco do Rowan (The White Wolf, evolução do Shadow Wolf dele no Last Torch). É um **buddy**, não um monstro: não nasce, não tem entrada em `MONSTER_MODELS` nem no bestiário.
- **Feito a partir de:** o Lobo Sombrio (`../shadow_wolf/`), a pedido do dono do projeto (2026-11-13): "criar um novo lobo branco apenas seguindo o lobo que já temos pronto". A primeira tentativa foi pintar o sprite do Lobo Sombrio de branco por cima; foi rejeitada (ficou chapada) e o lobo era 25% maior (também rejeitado).
- **Montado sobre:** o corpo de lobo (`../wolf25d.js`), com as mesmas medidas do Lobo Sombrio: mesmo tamanho, mesma corrida.
- **Resultado:** ver no tuner (`tools/tuner.html?model=white_wolf`).

## Como foi criado

| Peça (Lobo Sombrio) | Lobo Branco |
|---|---|
| Pelo cinza-azulado escuro | pelo branco-prateado (`fur` `#dde6f0`), sombra azulada (`furDark`) |
| Faixa e mechas claras no lombo | brancas puras (`furLight`) |
| Olhos e boca vermelhos | olhos azul-gelo brilhantes, boca rosada |
| Cauda e traseira de fumaça preta | névoa clara (`smoke` `#e8f1fb`) |
| (o Lobo Sombrio aliado solta chama roxa) | espectro verde-azulado claro (`flameDark` `#0f766e`, `flame` `#2dd4bf`, `flameLight` `#ccfbf1`) que sobe do lombo, dos ombros e da cauda e some, com a mesma peça de chama do Lobo Sombrio aliado (`../spectral_flame.js`) |
| Contorno preto | contorno azul-marinho escuro (`ink`), para o branco aparecer |

## Cores

`white_wolf_visual.js` (só as cores; o 2.5D as lê).

## Decisões

- Não colorir o sprite do Lobo Sombrio: é um desenho novo (mesmo molde, outras cores), assim as cores seguem o tuner.
- Mesmo tamanho do Lobo Sombrio: a versão 25% maior ficou grande demais.
- Fora do jogo como monstro: o Last Torch o carrega como arte de buddy (`BUDDY_MODELS` em `data_model/monsters.js`) e só monta o sprite quando o lobo evolui.

## Uso e ajuste

No jogo: `getMonsterSprite('WHITE_WOLF')` (sprite montado sob demanda, `js/render/nature.js`). Ajuste ao vivo: `tools/tuner.html?model=white_wolf`.
