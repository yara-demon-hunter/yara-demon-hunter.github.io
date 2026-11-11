# Monstro 2.5D: Esqueleto Rastejante

- **id do boneco:** `skeleton_crawler` (`registerBody` em `../skeleton_crawler25d.js`)
- **Papel:** um segundo tipo de esqueleto: baixo, quase deitado, que se arrasta puxando o corpo com as mãos
- **Feito a partir de:** o Esqueleto "clássico" do Last Torch, `monsters/topdown/skeleton/` (de cima ele lê como um
  corpo baixo, com os braços à frente) e as peças do Esqueleto 2.5D (`../skeleton/`)
- **Resultado:** `images/skeleton_crawler_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco embaixo)

## Como foi criado

Pedido do usuário: manter o Esqueleto 2.5D de pé **e** o clássico "deitado/agachado" como outro monstro. As peças de
osso são as mesmas do Esqueleto (`skeletonBody` em `../skeleton/skeleton25d.js`); só a postura muda, pelo gancho
`poseTweak` do motor:

| Postura | Como |
|---|---|
| Bacia e ombros baixos | `crawlHipZ`, `crawlShoulderZ` |
| Tronco quase deitado | ombros bem à frente da bacia (`crawlLean`); costelas e alma seguem a coluna deitada |
| Cabeça baixa e à frente | `crawlHeadForward`, `crawlHeadZ` |
| Mãos no chão, uma de cada vez | `crawlHandReach`, `crawlHandSpread`, `crawlHandLift` (a mão sobe ao dar o passo) |
| Sobe e desce a cada puxada | `crawlBob` |

Para isso funcionar, as costelas passaram a seguir o eixo da coluna (antes eram sempre horizontais) e o tuner aprendeu
a mirar o rosto na cabeça de cada boneco (a dele fica baixa e à frente).

## Cores

As do Esqueleto (`topdown/skeleton/skeleton_visual.js`).

## Ajuste

`tools/tuner.html?model=skeleton_crawler`, seção "Postura (rastejante)". Medidas em `../skeleton_crawler25d_visual.js`
(herda tudo do Esqueleto e muda só o que é dele).
