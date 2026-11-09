// --- REGISTRO DOS BONECOS 2.5D ---
// Cada herói com boneco próprio (Azael, ...) se registra aqui no próprio arquivo (js/render/<id>25d.js) e
// js/render/player25d.js o desenha chamando os ganchos dele, sem citar nenhum herói pelo nome.
// Ver "Como criar um herói novo" no README do Last Torch. Este arquivo não importa nada (evita ciclos).
//
// registerBody(id, body). O id é o `model` do herói em data_model/heroes.js ('hunter' é o padrão e não se registra).
// Tudo é opcional, menos `vis`; o que faltar usa o desenho do Demon Hunter:
//   vis                              dados visuais do boneco (data_model/visuals/characters/<id>_visual.js):
//                                    colors, bladeLength, bladeWidth, glowScale, strideSpeed e, se for maior ou menor, bodyScale
//   sheathed                         arma na bainha: não é empunhada no dash
//   runBob(anim, run)                sobe e desce do corpo na corrida (devolve a altura)
//   drawLeg(rig, { hip, knee, ankle, toe, reach, side, lift })
//   drawTorso(rig, pose, bottom, top, wb, wt)
//   drawBack(rig, pose, anchors, hem)  no lugar da capa (o boneco chama rig.sashEnds(pose) se quiser as pontas da faixa e
//                                    rig.drawCapeShape(anchors, hem) para a capa padrão com as cores dele)
//   freeArm(rig, pose, s)            braço livre: recebe s = { hand, throwK, charge, fireHold, cast } (mão que o jogo
//                                    quer: arremesso, feitiço, poção...) e devolve { shoulder, hand, elbow }
//   drawArm(rig, shoulder, elbow, hand, armWidth, handRadius)  desenha o braço livre (inclusive a mão)
//   swordArmPart(rig, pose)          braço da espada: peça { depth, draw }
//   swordRest(rig, pose, { hand, dir, swingAngle, blend })  mão e direção da arma em repouso, a partir da pose normal
//                                    (hand, dir): devolve { hand, dir, armHand? }
//   drawBlade(rig, hand, dir, alpha) a arma
//   drawn(pose)                      0 a 1: quanto a arma está fora da bainha
//   headParts(pose, rig)             lista de peças { depth, draw } da cabeça
export const BODIES = {};

export function registerBody(id, body) {
    BODIES[id] = body;
}
