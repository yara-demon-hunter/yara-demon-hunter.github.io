# Monstro 2.5D: Inchado (Bloater)

- **id do boneco:** `bloater` (`registerBody` em `../bloater25d.js`)
- **Papel:** monstro lento e enorme que estoura ao morrer; o pulso mostra de longe que ele está perto de estourar
- **Feito a partir de:** o Inchado do Last Torch, `monsters/topdown/bloater/` (desenho plano visto de cima). Não havia
  imagem de referência: a forma veio do código do desenho de cima
- **Resultado:** `images/bloater_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco embaixo)

## Como foi criado

Montado no boneco 2.5D dos heróis (`characters/hunter/hero25d.js`), trocando quase tudo: não tem cabeça nem tronco de
gente. É uma esfera sobre perninhas.

| Peça | De onde veio | Como ficou em 2.5D |
|---|---|---|
| Corpo enorme e esverdeado | topdown | esfera (um pouco achatada) com contorno escuro, pele e o alto pegando luz |
| Bolsas de gás que brilham | topdown (`sacCount`) | espalhadas pela esfera (ângulo de ouro); só as viradas para a câmera aparecem |
| Pulso que acelera com a vida baixa | topdown (`pulseHz`, `pulseHzLowHp`) | a esfera incha e desincha; o jogo informa a vida (`renderBloater25D`), o tuner usa `previewHurt` |
| Boca costurada e olhos miúdos na frente | topdown | desenhados na superfície da frente do corpo (sem cabeça separada); somem de costas |
| Bracinhos curtos | topdown | saem dos lados da esfera e balançam com o pulso |
| Pernas | novas (de cima não apareciam) | curtas e grossas, embaixo da barriga; o corpo balança de lado a cada passo |

## Cores

As mesmas do desenho de cima: `bloater25d_visual.js` lê `topdown/bloater/bloater_visual.js`.

## Decisões

- 1ª versão: a barriga cobria as perninhas inteiras. O corpo subiu (`bodyHeight` 12,4) para os pés aparecerem.
- O Last Torch continua usando o desenho de cima (decisão do usuário).

## Ajuste

`tools/tuner.html?model=bloater`. `previewHurt` (0 a 1) simula a vida caindo, para ver o pulso de "quase estourando".
