# Treant (monstro 2.5D)

- **Papel:** inimigo lento e resistente do Last Torch, disponível desde a fase 1.
- **Arte de origem:** buddy `buddies/treant/`, criado como a forma andante do carvalho Ancient Grove.
- **Reutilização:** compartilha desenho, paleta e animação com o buddy para manter a identidade visual. Os dados de combate são definidos pelo jogo.
- **Rosto (17/11/2026):** a cara do tronco foi refeita e desceu no tronco (`faceDrop` e `faceScale` em `treant25d_visual.js`): vista de cima pela câmera do jogo, a copa cobria o alto e ninguém via os olhos. Agora tem oco escuro, sobrancelhas franzidas, olhos âmbar com pupila em fenda, nariz de nó, boca com dentes e barba de musgo. É o mesmo desenho do buddy, então o buddy também mudou.
- **Morte:** tomba e explode em toras, cascas e folhas (`monsters/25d/death.js`).
- **Ajuste:** `tools/tuner.html?model=treant`.

## Versão em sprites do laboratório (2026-11-17)

Como o Golem, o Treant em campo (e o buddy) agora usa `buddies/treant/treant_atlas.webp` (~235 KB), gravado do Treant 3D do laboratório
(`tools/lab/treant_foto.js?bake=1`, floresta de noite): 8 direções x 6 quadros de passada + 4 de soco, 176 px por quadro. A versão antiga em
bolas e galhos (`treant25d.js`) virou reserva, para quando a imagem não carregou. Rosto de propósito **simpático** (olhos redondos âmbar, sobrancelhas
suaves, sorriso em arco, sem dentes), a pedido do dono. A morte (toras, casca e folhas voando, tombo) continua a de `death.js`, e o corpo que tomba usa o mesmo sprite.
Regravar: `python3 tools/lab/bake_treant.py 176` com o servidor em 18900 (ver `bake_golem.py`).

**Versão antiga guardada:** o desenho em bolas e galhos continua no código e abre no Ateliê em `tools/tuner.html?model=treant_classico` ("Treant ANTIGO"), ao lado do `buddy_treant`, que mostra o sprite novo. Serve para comparar no futuro; os sliders valem para ela.

**Atualização (remodelado esguio):** o sprite atual vem de um Treant remodelado como árvore de verdade (tronco fino que afina, braços e pernas finos e contínuos, copa larga em cima, rosto pequeno no nó do tronco), não do modelo antigo espremido. Fonte: `tools/lab/treant_foto.js`, função `monstro`.

**Voltou o Treant robusto (17/11/2026, a pedido do dono):** o sprite no jogo é de novo o Treant mais encorpado de casca de madeira (`tools/lab/treant_foto.js`). A versão **esguia** (tronco fino, copa larga) ficou guardada em `tools/lab/treant_esguio.*`, com o sprite pronto em `tools/lab/exemplos/treant_esguio_atlas.webp` e as medidas para usar no `README.md` do laboratório.
