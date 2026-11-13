# Buddy: Lobo Sombrio (aliado do Rowan)

- **pasta:** `buddies/shadow_wolf/`
- **Papel:** Last Torch: Shadow Wolf, o poder do ramo Nature do Rowan. Um lobo solto que caça, morde e cai quando apanha.
- **Funções:** `shadow_wolf25d.js`: `renderShadowWolfBuddy25D(e)`; entra em `index.js` como `BUDDIES_25D.shadow_wolf`.

## Como é desenhada

Boneco 2.5D no corpo de lobo (`../../monsters/25d/wolf25d.js`), desenhado a partir de `images/shadow-wolf-BODY.webp`: negro e muito peludo (juba de espetos no pescoço e no lombo, mechas nos flancos, nas bochechas e nos pés), um pouco maior que o lobo inimigo, agachado para o ataque (ombros altos, garupa baixa, cabeça baixa e para a frente, boca arreganhada), olhos vermelhos brilhando sob sobrancelhas franzidas, garras claras e uma chama roxa escura que sai dos ombros, do lombo e da cauda, sobe afinando e some. Não é mais uma cópia do lobo inimigo: tem id próprio (`buddy_shadow_wolf`) e desenho próprio.

## O que a paleta e as medidas controlam

`shadow_wolf_visual.js` (cores) e `shadow_wolf25d_visual.js` (medidas do boneco). Valores padrão; mudar aqui muda o buddy em todos os jogos (depois do sync).

## O que é do jogo e não mora aqui

O jogo guarda a vida, a mordida e a caça (js/systems/skills_nature.js) e monta o sprite sob demanda (`BUDDY_MODELS`, js/render/monster_sprites.js). Não é monstro: não nasce, não entra no bestiário.

## Origem

Criada em 2026-11-13 como cópia do Lobo Sombrio inimigo e redesenhada no mesmo dia a partir da imagem de referência; antes o aliado reaproveitava o sprite do monstro. O gancho `paw` de `monsters/25d/wolf25d.js` (garras e pelos nos pés) foi criado para ele; os outros lobos não o usam.

## Imagens

`images/` guarda a referência (foto, ilustração, rabisco) e o resultado (captura do tuner ou do jogo). Ainda vazia: coloque aqui a arte de referência.

## Ajuste

Lobos: `tools/tuner.html?model=buddy_shadow_wolf` (ajuste ao vivo; grave com **Copiar alterados**). Aves e caveira: edite o `_visual.js` e rode `ruby mini_games/_library/sync.rb`.
