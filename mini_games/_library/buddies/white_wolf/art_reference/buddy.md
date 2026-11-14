# Buddy 2.5D: Lobo Branco (o aliado do Rowan)

- **id do boneco:** `white_wolf` (em `../white_wolf25d.js`)
- **Papel:** o lobo branco do Rowan (The White Wolf, evolução do Shadow Wolf dele no Last Torch). É um **buddy**, não um monstro: não nasce, não tem entrada em `MONSTER_MODELS` nem no bestiário.
- **Referência atual (2026-11-14):** `images/white_wolf.webp`: lobo branco-gelo agachado, contorno petróleo, olhos azuis acesos, boca aberta rosnando, envolto num espectro verde-água (chamas por todo o corpo, juba de labaredas, patas em fogo e a cauda inteira como uma labareda grande curvada para cima). O lobo foi redesenhado para segui-la (ver **Versão 2** abaixo).
- **Feito a partir de:** o Lobo Sombrio (`../shadow_wolf/`), a pedido do dono do projeto (2026-11-13): "criar um novo lobo branco apenas seguindo o lobo que já temos pronto". A primeira tentativa foi pintar o sprite do Lobo Sombrio de branco por cima; foi rejeitada (ficou chapada) e o lobo era 25% maior (também rejeitado).
- **Montado sobre:** o corpo de lobo (`../wolf25d.js`), com as mesmas medidas do Lobo Sombrio: mesmo tamanho, mesma corrida.
- **Resultado:** ver no tuner (`tools/tuner.html?model=white_wolf`). `images/white_wolf_25d_resultado.png` é a versão 1 (antes da referência nova).

## Como foi criado (versão 1)

| Peça (Lobo Sombrio) | Lobo Branco |
|---|---|
| Pelo cinza-azulado escuro | pelo branco-prateado (`fur` `#dde6f0`), sombra azulada (`furDark`) |
| Faixa e mechas claras no lombo | brancas puras (`furLight`) |
| Olhos e boca vermelhos | olhos azul-gelo brilhantes, boca rosada |
| Cauda e traseira de fumaça preta | névoa clara (`smoke` `#e8f1fb`) (versão 1; na versão 2 a cauda é de fogo) |
| (o Lobo Sombrio aliado solta chama roxa) | espectro verde-azulado claro (`flameDark` `#0f766e`, `flame` `#2dd4bf`, `flameLight` `#ccfbf1`) que sobe do lombo, dos ombros e da cauda e some, com a mesma peça de chama do Lobo Sombrio aliado (`../spectral_flame.js`) |
| Contorno preto | contorno azul-marinho escuro (`ink`), para o branco aparecer |

## Versão 2: seguindo `images/white_wolf.webp` (2026-11-14)

| Na referência | No boneco 2.5D |
|---|---|
| Pelo branco com sombras verde-azuladas | `fur` `#e8f7f8`, `furDark` `#93c4c8`, `furMid` `#c4e6e8`, `furLight` branco |
| Contorno escuro esverdeado | `ink` `#0c3a40` (petróleo) |
| Olhos azuis acesos | `eye` `#38bdf8`, brilho maior (`eyeGlow` 2.4) |
| Boca aberta rosnando, presas brancas | `mouthOpen` 2, boca escura (`mouth` `#1b2b33`), rugas no focinho |
| Chamas verde-água por todo o corpo | 11 línguas no lombo (`flames`), 5 na juba (`maneFlames`), 1 em cada pata (`pawFlames`), 4 soltando da cauda; cores `flameDark` `#0d9488`, `flame` `#2dd4bf`, `flameLight` `#ccfbf1` |
| Juba de mechas pontudas para trás | 9 mechas (`maneTufts`), mais longas e mais levantadas |
| Cauda grande feita de fogo, curvada para cima | `flameTail`: labareda de três camadas (escura, verde-água, clara) que sai da garupa, vai para trás e sobe (`tailLength` 11, `tailRise` 0.75), ondulando; substitui a cauda de névoa da versão 1 |
| Brilho verde-água em volta | aura mais forte (`auraAlpha` 0.32, `auraRadius` 2.4) |

Mesmo corpo, mesmo tamanho e mesma corrida da versão 1 (o molde do Lobo Sombrio).

## Cores

`white_wolf_visual.js` (só as cores; o 2.5D as lê).

## Decisões

- Não colorir o sprite do Lobo Sombrio: é um desenho novo (mesmo molde, outras cores), assim as cores seguem o tuner.
- Mesmo tamanho do Lobo Sombrio: a versão 25% maior ficou grande demais.
- Fora do jogo como monstro: o Last Torch o carrega como arte de buddy (`BUDDY_MODELS` em `data_model/monsters.js`) e só monta o sprite quando o lobo evolui.

## Uso e ajuste

No jogo: `getMonsterSprite('WHITE_WOLF')` (sprite montado sob demanda, `js/render/nature.js`). Ajuste ao vivo: `tools/tuner.html?model=white_wolf`.
