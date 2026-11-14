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

Arquivo: `oak.js` (`getOakTrunk/Crown/EvilTrunk/EvilCrown`, `drawRootFeet`, `drawOakBuddy`). Existe também um boneco 2.5D do treant (`treant/`), que não é o que o jogo usa; fica para o Ateliê (`tuner.html?model=buddy_treant`) e para o RPG.
