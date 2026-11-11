// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/characters/hunter/body_registry.js e rode o sync.
// --- REGISTRO DOS BONECOS 2.5D ---
// Cada herói com boneco próprio (Azael, Brutos, Yara, Zeph, Oskar) se registra aqui no próprio arquivo (characters/<id>/<id>25d.js) e
// hero25d.js o desenha chamando os ganchos dele, sem citar nenhum herói pelo nome. O jogo escolhe quais bonecos usa
// importando esses arquivos (no Last Torch, js/render/bodies.js; no yara-rpg, js/stage/heroes.js).
// rig traz as ferramentas de desenho (project, projectVec, limb, ball, disk, heightScale, sphereY) e de pose (V, mix,
// add3, norm3, holdSword, swordArmPose, sashEnds, drawCapeShape, drawFlask, anim, C, sinF, cosF, bladeLength). Este arquivo não importa nada (evita ciclos).
//
// registerBody(id, body). O id é o `model` do herói no jogo ('hunter' é o padrão e não se registra).
// Tudo é opcional, menos `vis`; o que faltar usa o desenho do Demon Hunter:
//   vis                              dados visuais do boneco (characters/<id>/<id>_visual.js):
//                                    colors, bladeLength, bladeWidth, glowScale, strideSpeed e, se for maior ou menor, bodyScale
//   sheathed                         arma na bainha: não é empunhada no dash nem na derrota
//   idleArms                         parado, os braços respiram e balançam devagar (Yara, Zeph)
//   vigilFreeHand                    [a, b, z]: onde fica a mão livre ajoelhado (sem fincar a espada)
//   runBob(anim, run)                sobe e desce do corpo na corrida (devolve a altura)
//   drawLeg(rig, { hip, knee, ankle, toe, reach, side, lift })
//   drawTorso(rig, pose, bottom, top, wb, wt)
//   drawBack(rig, pose, anchors, hem)  no lugar da capa (o boneco chama rig.sashEnds(pose) se quiser as pontas da faixa e
//                                    rig.drawCapeShape(anchors, hem) para a capa padrão com as cores dele)
//   freeArm(rig, pose, s)            braço livre: recebe s = { hand, throwK, charge, fireHold, cast } (mão que o jogo
//                                    quer: arremesso, feitiço, poção...) e devolve { shoulder, hand, elbow }
//   drawArm(rig, shoulder, elbow, hand, armWidth, handRadius)  desenha o braço livre (inclusive a mão) e, se não houver
//                                    swordArmPart, também o da espada
//   armTweak(rig, side, pose)        ajusta o braço padrão sem montá-lo: { shoulderOffset, elbowOffset, hand(hand) };
//                                    side -1 = livre, 1 = espada (Oskar: as duas mãos no cabo do machado)
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
