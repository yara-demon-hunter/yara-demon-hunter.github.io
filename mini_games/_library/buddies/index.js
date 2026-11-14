// --- OS BUDDIES, EM UM LUGAR SÓ ---
// Buddy = quem anda com o herói e luta ao lado dele: a fênix, o corvo, a caveira voadora, os lobos, a árvore andante. Não é monstro (não nasce,
// não entra no bestiário) e não é o herói. Cada um mora na própria pasta (buddies/<id>/): desenho, cores e a ficha
// (art_reference/buddy.md). O que ele FAZ (vida, mordida, mira, quando aparece) fica no jogo.
//
// Dois tipos de desenho:
//   aves, caveira e carvalho (phoenix, raven, grave_wisp, oak): funções de desenho em 2D, prontas para o jogo carimbar
//   lobos e treant (shadow_wolf, white_wolf, treant): bonecos 2.5D no mesmo molde dos monstros (id da pasta → { visuals, render })
export {
    drawPhoenixArt, drawPhoenixSprite, phoenixBeak, preparePhoenix, renderPhoenixBuddy
} from './phoenix/phoenix.js';
export { PHOENIX_VISUALS } from './phoenix/phoenix_visual.js';
export { drawRavenSprite, prepareRaven, renderRavenBuddy } from './raven/raven.js';
export { RAVEN_VISUALS } from './raven/raven_visual.js';
export { drawOakBuddy, drawRootFeet, getCrown as getOakCrown, getEvilCrown as getOakEvilCrown, getEvilTrunk as getOakEvilTrunk, getTrunk as getOakTrunk } from './oak/oak.js';
export { drawGraveWisp } from './grave_wisp/grave_wisp.js';
export { GRAVE_WISP_VISUALS } from './grave_wisp/grave_wisp_visual.js';

import { SHADOW_WOLF_BUDDY_25D_VISUALS } from './shadow_wolf/shadow_wolf25d_visual.js';
import { renderShadowWolfBuddy25D } from './shadow_wolf/shadow_wolf25d.js';
import { TREANT_25D_VISUALS } from './treant/treant25d_visual.js';
import { renderTreant25D } from './treant/treant25d.js';
import { WHITE_WOLF_25D_VISUALS } from './white_wolf/white_wolf25d_visual.js';
import { renderWhiteWolf25D } from './white_wolf/white_wolf25d.js';

export const BUDDIES_25D = {
    shadow_wolf: { visuals: SHADOW_WOLF_BUDDY_25D_VISUALS, render: renderShadowWolfBuddy25D },
    white_wolf: { visuals: WHITE_WOLF_25D_VISUALS, render: renderWhiteWolf25D },
    treant: { visuals: TREANT_25D_VISUALS, render: renderTreant25D }
};
