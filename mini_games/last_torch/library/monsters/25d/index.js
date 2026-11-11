// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/index.js e rode o sync.
import { SKELETON_25D_VISUALS } from './skeleton/skeleton25d_visual.js';
import { renderSkeleton25D } from './skeleton/skeleton25d.js';
import { SKELETON_CRAWLER_25D_VISUALS } from './skeleton_crawler/skeleton_crawler25d_visual.js';
import { renderSkeletonCrawler25D } from './skeleton_crawler/skeleton_crawler25d.js';
import { BLOATER_25D_VISUALS } from './bloater/bloater25d_visual.js';
import { renderBloater25D } from './bloater/bloater25d.js';
import { WITCH_25D_VISUALS } from './witch/witch25d_visual.js';
import { renderWitch25D } from './witch/witch25d.js';
import { BAT_25D_VISUALS } from './bat/bat25d_visual.js';
import { renderBat25D } from './bat/bat25d.js';
import { MOTH_25D_VISUALS } from './moth/moth25d_visual.js';
import { renderMoth25D } from './moth/moth25d.js';
import { WRAITH_25D_VISUALS } from './wraith/wraith25d_visual.js';
import { renderWraith25D } from './wraith/wraith25d.js';
import { SHADOW_WOLF_25D_VISUALS } from './shadow_wolf/shadow_wolf25d_visual.js';
import { renderShadowWolf25D } from './shadow_wolf/shadow_wolf25d.js';
import { ZOMBIE_WOLF_25D_VISUALS } from './zombie_wolf/zombie_wolf25d_visual.js';
import { renderZombieWolf25D } from './zombie_wolf/zombie_wolf25d.js';
import { HEADLESS_KNIGHT_25D_VISUALS } from './headless_knight/headless_knight25d_visual.js';
import { renderHeadlessKnight25D, knightHeadPosition25D } from './headless_knight/headless_knight25d.js';
import { BONE_COLOSSUS_25D_VISUALS } from './bone_colossus/bone_colossus25d_visual.js';
import { renderBoneColossus25D } from './bone_colossus/bone_colossus25d.js';
import { VAMPIRE_25D_VISUALS } from './vampire/vampire25d_visual.js';
import { renderVampire25D } from './vampire/vampire25d.js';
import { DEMON_LORD_25D_VISUALS } from './demon_lord/demon_lord25d_visual.js';
import { renderDemonLord25D } from './demon_lord/demon_lord25d.js';

// --- OS MONSTROS 2.5D, EM UM LUGAR SÓ ---
// id da pasta (monsters/25d/<id>) → { visuals: medidas e cores, render: desenha a partir do monstro do jogo }.
// Um jogo importa só este arquivo. Todos desenham pelo boneco 2.5D (characters/hunter/hero25d.js).
export const MONSTERS_25D = {
    skeleton: { visuals: SKELETON_25D_VISUALS, render: renderSkeleton25D },
    skeleton_crawler: { visuals: SKELETON_CRAWLER_25D_VISUALS, render: renderSkeletonCrawler25D },
    bloater: { visuals: BLOATER_25D_VISUALS, render: renderBloater25D },
    witch: { visuals: WITCH_25D_VISUALS, render: renderWitch25D },
    bat: { visuals: BAT_25D_VISUALS, render: renderBat25D },
    moth: { visuals: MOTH_25D_VISUALS, render: renderMoth25D },
    wraith: { visuals: WRAITH_25D_VISUALS, render: renderWraith25D },
    shadow_wolf: { visuals: SHADOW_WOLF_25D_VISUALS, render: renderShadowWolf25D },
    zombie_wolf: { visuals: ZOMBIE_WOLF_25D_VISUALS, render: renderZombieWolf25D },
    headless_knight: { visuals: HEADLESS_KNIGHT_25D_VISUALS, render: renderHeadlessKnight25D },
    bone_colossus: { visuals: BONE_COLOSSUS_25D_VISUALS, render: renderBoneColossus25D },
    vampire: { visuals: VAMPIRE_25D_VISUALS, render: renderVampire25D },
    demon_lord: { visuals: DEMON_LORD_25D_VISUALS, render: renderDemonLord25D }
};

export { knightHeadPosition25D };
