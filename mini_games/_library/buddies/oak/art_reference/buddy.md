# Carvalho assombrado / Treant (árvore andante)

**Origem:** a árvore do Wicked Oak já existia no Last Torch (desenho em canvas, dentro do jogo). Em 2026-11-13 o dono do projeto pediu uma terceira forma, "árvore ambulante, como um monstro árvore", e depois: "uns bracinhos e um rostinho, igual àquelas árvores de filme de terror", e "pezinhos de raiz andando". O desenho foi para a biblioteca nesse dia, como buddy, para ser visto e ajustado em `tools/buddy_viewer.html`.

**No jogo:** a árvore fica parada. Depois da Ancient Grove ela não murcha com o tempo, só cai se os monstros a destruírem. **Andar foi testado e removido (14/11):** as árvores se sobrepunham ao andar; os pezinhos continuam em `drawRootFeet`, sem uso no jogo.

| Peça | Descrição |
|---|---|
| Tronco | casca marrom com veios; rosto de olhos fundos com brilho âmbar, sobrancelhas franzidas, boca torta |
| Bracinhos | dois galhos finos caídos nos lados, com dedos |
| Pezinhos | dois pés de raiz com três dedinhos; alternam o passo ao andar (só no treant) |
| Copa | massas de folha escuras embaixo e claras em cima, mais alta que o rosto para não cobri-lo |
| Acordada | tudo mais escuro e roxo; olhos vermelhos, dentes e garras |
| Ancient Grove | forma final maior, com menos folhas e galhos expostos; raízes sobem pelas laterais do tronco e se espalham pela base, alternando um passo lento mesmo quando a árvore para; névoa verde e rosto-runa luminoso entalhado no tronco |

Arquivo: `oak.js` (`getTrunk/Crown/EvilTrunk/EvilCrown`, `getAncientTrunk/Crown`, `drawAncientRoots`, `drawRootFeet`, `drawOakBuddy`). A imagem `images/ancient-grove-skill.webp` é a referência visual. Existe também um boneco 2.5D do treant (`treant/`), que não é o que o jogo usa; fica para o Ateliê (`tuner.html?model=buddy_treant`) e para o RPG.

## Árvore Ancestral 3D (18/11/2026)
A forma Ancient Grove no jogo agora é um atlas gravado do modelo 3D do Laboratório (`tools/lab/arvore_foto.js`, `bake_arvore.py` → `ancient_tree_atlas.webp`): 5 ângulos (frente, frente-lado, lado, costas-lado, costas; espelha à esquerda) × 12 quadros de andar + 8 de ataque, quadros de 144 px. Pedido do dono: mais quadros, movimento melhor e a árvore virando, "muito 2D". Rosto-runa verde, copa larga, raízes-pernas que andam, galhos que chicoteiam. `drawAncientTree` / `ancientTreeView` em `oak.js`; o jogo (`nature.js`) cai no desenho 2D antigo enquanto o atlas carrega. **O desenho 2D antigo (`getAncientTrunk/Crown`, `drawAncientRoots`) foi mantido de propósito** e aparece no `buddy_viewer.html` ao lado da versão nova, para comparar.
