# Monstro: Vampiro

- **id no jogo:** vampire (`MONSTER_MODELS.VAMPIRE`)
- **Papel:** inimigo lento e resistente que caminha até o herói; ao morrer se desfaz em morcegos (`splitCount`, viram `MONSTER_MODELS.VAMPIRE_BAT`)

## Aparência

- **Silhueta / forma geral:** nobre alto e ereto envolto numa capa longa; vista de cima, lê-se como uma cabeça oval à frente de ombros largos, com a capa preta abrindo em leque atrás e a gola alta formando duas "asas" pontudas ao redor da cabeça.
- **Cabeça e rosto:** pele branca-azulada cadavérica, cabelo preto penteado para trás com bico (widow's peak) na testa, sobrancelhas finas, dois olhos vermelhos brilhantes, presas brancas aparecendo.
- **Vestuário:** capa preta por fora e forro vermelho-sangue por dentro (o forro aparece quando a capa abre ao andar/virar), gola alta rígida, colete escuro com um medalhão vermelho no peito.
- **Mãos:** pálidas, dedos longos com unhas pontudas; andando ficam para trás segurando a capa, ao chegar perto se esticam para agarrar.
- **Partes que se movem separadamente:** capa (ondula e abre ao andar/virar), mãos (agarrar), cabeça (leve inclinação), medalhão (brilha).
- **Tamanho relativo:** maior que o herói e que a bruxa (raio 18).
- **Detalhes que NÃO podem faltar:** olhos vermelhos, gola alta, capa preta com forro vermelho, presas, explosão de morcegos ao morrer.
- **Detalhes que podem ser simplificados:** roupa por baixo da capa, pés (escondidos), botões e bordados.

## Cores

- **Capa:** #0f0a12, sombra #050307, borda #2a1c30
- **Forro:** #7f1d1d, brilho #b91c1c
- **Gola:** #1a1020, forro da gola #991b1b
- **Pele:** #dfe3ea, sombra #a7aebb
- **Cabelo:** #0b0b10, brilho #2b2b38
- **Olhos:** #ef4444 com brilho vermelho; presas #f8fafc
- **Medalhão:** #dc2626, aro #d4a017
- **Aura:** #450a0a

## Personalidade e estilo

Dark fantasy. Aristocrata frio e calmo: desliza em vez de andar, sem pressa, capa ondulando; quanto mais perto do alvo, mais os olhos acendem e as mãos se esticam com as garras abertas.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| deslizar | sempre | corpo flutua levemente; capa ondula e abre mostrando o forro ao virar; mãos para trás | ~1 ciclo por segundo | (adicionar images/vampire_idle.webp) |
| agarrar | perto do alvo | braços esticam para a frente, unhas abrem, olhos brilham mais | contínuo enquanto perto | (adicionar images/vampire_attacking.webp) |
| morrer | ao morrer | o corpo se desfaz em morcegos (lógica em `js/systems/enemies.js`) | instantâneo | — |
