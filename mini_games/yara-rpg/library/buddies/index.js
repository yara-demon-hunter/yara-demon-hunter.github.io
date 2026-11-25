// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/index.js e rode o sync.
// --- OS BUDDIES, EM UM LUGAR SÓ ---
// Buddy = quem anda com o herói e luta ao lado dele: a fênix, o corvo, a caveira voadora, o anjo guardião, os lobos, a árvore andante. Não é monstro (não nasce,
// não entra no bestiário) e não é o herói. Cada um mora na própria pasta (buddies/<id>/): desenho, cores e a ficha
// (art_reference/buddy.md). O que ele FAZ (vida, mordida, mira, quando aparece) fica no jogo.
//
// Dois tipos de desenho:
//   anjo guardião (guardian_angel): boneco do motor do herói (model 'angel', como as sombras do Shadow Clone)
//   aves, caveira e carvalho (phoenix, raven, grave_wisp, oak): funções de desenho em 2D, prontas para o jogo carimbar
//   lobos e treant (shadow_wolf, white_wolf, treant): bonecos 2.5D no mesmo molde dos monstros (id da pasta → { visuals, render })
export {
    drawPhoenixArt, drawPhoenixSprite, phoenixBeak, preparePhoenix, renderPhoenixBuddy
} from './phoenix/phoenix.js';
export { PHOENIX_VISUALS } from './phoenix/phoenix_visual.js';
export { drawRavenSprite, prepareRaven, renderRavenBuddy } from './raven/raven.js';
export { drawHearthPhoenixSprite, hearthPhoenixBeak, hearthPhoenixView, prepareHearthPhoenix, renderHearthPhoenix } from './hearth_phoenix/hearth_phoenix.js';
export { HEARTH_PHOENIX_VISUALS } from './hearth_phoenix/hearth_phoenix_visual.js';
export { RAVEN_VISUALS } from './raven/raven_visual.js';
export { drawAncientTree, prepareAncientTree, ancientTreeView, ANCIENT3D, drawOakBuddy, drawRootFeet, getCrown as getOakCrown, getEvilCrown as getOakEvilCrown, getEvilTrunk as getOakEvilTrunk, getTrunk as getOakTrunk } from './oak/oak.js';
import './guardian_angel/angel25d.js';          // registra o boneco 'angel' no motor do herói
export { drawGuardianOrb } from './guardian_angel/guardian_orb.js';
export { GUARDIAN_ANGEL_VISUALS } from './guardian_angel/guardian_angel_visual.js';
export { drawGraveWisp } from './grave_wisp/grave_wisp.js';
export { GRAVE_WISP_VISUALS } from './grave_wisp/grave_wisp_visual.js';

import { SHADOW_WOLF_BUDDY_25D_VISUALS } from './shadow_wolf/shadow_wolf25d_visual.js';
import { renderShadowWolfBuddy25D } from './shadow_wolf/shadow_wolf25d.js';
import './treant/treant25d.js';
import { ANCIENT_TREE_25D_VISUALS } from './oak/ancient_tree25d_visual.js';
import { renderAncientTreeBuddy25D } from './oak/ancient_tree25d.js';
import { WHITE_WOLF_25D_VISUALS } from './white_wolf/white_wolf25d_visual.js';
import { renderWhiteWolf25D } from './white_wolf/white_wolf25d.js';

export const BUDDIES_25D = {
    shadow_wolf: { visuals: SHADOW_WOLF_BUDDY_25D_VISUALS, render: renderShadowWolfBuddy25D },
    white_wolf: { visuals: WHITE_WOLF_25D_VISUALS, render: renderWhiteWolf25D },
    treant: { visuals: ANCIENT_TREE_25D_VISUALS, render: renderAncientTreeBuddy25D }
};
