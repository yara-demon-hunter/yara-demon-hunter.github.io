// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/index.js e rode o sync.
import { SKELETON_25D_VISUALS } from './skeleton/skeleton25d_visual.js';
import { renderSkeleton25D } from './skeleton/skeleton25d.js';
import { ZOMBIE_CRAWLER_25D_VISUALS } from './zombie_crawler/zombie_crawler25d_visual.js';
import { renderZombieCrawler25D } from './zombie_crawler/zombie_crawler25d.js';
import { RIVER_SPIRIT_25D_VISUALS } from './river_spirit/river_spirit25d_visual.js';
import { renderRiverSpirit25D } from './river_spirit/river_spirit25d.js';
import { SLIZORK_25D_VISUALS } from './slizork/slizork25d_visual.js';
import { renderSlizork25D } from './slizork/slizork25d.js';
import { GRAVE_KING_25D_VISUALS } from './grave_king/grave_king25d_visual.js';
import { renderGraveKing25D } from './grave_king/grave_king25d.js';
import { BLOOD_COUNTESS_25D_VISUALS } from './blood_countess/blood_countess25d_visual.js';
import { renderBloodCountess25D } from './blood_countess/blood_countess25d.js';
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
import { CHEST_GOBLIN_25D_VISUALS } from './chest_goblin/chest_goblin25d_visual.js';
import { renderChestGoblin25D } from './chest_goblin/chest_goblin25d.js';
import { MILITIA_25D_VISUALS } from './militia/militia25d_visual.js';
import { renderMilitia25D } from './militia/militia25d.js';
import { PLATE_KNIGHT_25D_VISUALS } from './plate_knight/plate_knight25d_visual.js';
import { renderPlateKnight25D } from './plate_knight/plate_knight25d.js';
import { LANCER_25D_VISUALS } from './lancer/lancer25d_visual.js';
import { renderLancer25D } from './lancer/lancer25d.js';
import { DROWNED_25D_VISUALS } from './drowned/drowned25d_visual.js';
import { renderDrowned25D } from './drowned/drowned25d.js';
import { DEMON_25D_VISUALS } from './demon/demon25d_visual.js';
import { renderDemon25D } from './demon/demon25d.js';
import { SKELETON_WARRIOR_25D_VISUALS } from './skeleton_warrior/skeleton_warrior25d_visual.js';
import { renderSkeletonWarrior25D } from './skeleton_warrior/skeleton_warrior25d.js';
import { SKELETON_ARCHER_25D_VISUALS } from './skeleton_archer/skeleton_archer25d_visual.js';
import { renderSkeletonArcher25D } from './skeleton_archer/skeleton_archer25d.js';
import { RIVER_EEL_25D_VISUALS } from './river_eel/river_eel25d_visual.js';
import { renderRiverEel25D } from './river_eel/river_eel25d.js';
import { BOG_TOAD_25D_VISUALS } from './bog_toad/bog_toad25d_visual.js';
import { renderBogToad25D } from './bog_toad/bog_toad25d.js';
import { BOG_SLIME_25D_VISUALS } from './bog_slime/bog_slime25d_visual.js';
import { renderBogSlime25D } from './bog_slime/bog_slime25d.js';
import { ZOMBIE_25D_VISUALS } from './zombie/zombie25d_visual.js';
import { renderZombie25D } from './zombie/zombie25d.js';
import { ARMORED_ZOMBIE_25D_VISUALS } from './armored_zombie/armored_zombie25d_visual.js';
import { renderArmoredZombie25D } from './armored_zombie/armored_zombie25d.js';
import { TREANT_MONSTER_25D_VISUALS } from './treant/treant25d_visual.js';
import { renderTreantMonster25D, treantStill } from './treant/treant25d.js';
import { GOLEM_25D_VISUALS } from './golem/golem25d_visual.js';
import { renderGolem25D, golemStill } from './golem/golem25d.js';

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
    demon_lord: { visuals: DEMON_LORD_25D_VISUALS, render: renderDemonLord25D },
    treant: { visuals: TREANT_MONSTER_25D_VISUALS, render: renderTreantMonster25D, still: treantStill },
    golem: { visuals: GOLEM_25D_VISUALS, render: renderGolem25D, still: golemStill },
    armored_zombie: { visuals: ARMORED_ZOMBIE_25D_VISUALS, render: renderArmoredZombie25D },
    zombie: { visuals: ZOMBIE_25D_VISUALS, render: renderZombie25D },
    blood_countess: { visuals: BLOOD_COUNTESS_25D_VISUALS, render: renderBloodCountess25D },
    river_spirit: { visuals: RIVER_SPIRIT_25D_VISUALS, render: renderRiverSpirit25D },
    slizork: { visuals: SLIZORK_25D_VISUALS, render: renderSlizork25D },
    grave_king: { visuals: GRAVE_KING_25D_VISUALS, render: renderGraveKing25D },
    zombie_crawler: { visuals: ZOMBIE_CRAWLER_25D_VISUALS, render: renderZombieCrawler25D },
    bog_slime: { visuals: BOG_SLIME_25D_VISUALS, render: renderBogSlime25D },
    bog_toad: { visuals: BOG_TOAD_25D_VISUALS, render: renderBogToad25D },
    river_eel: { visuals: RIVER_EEL_25D_VISUALS, render: renderRiverEel25D },
    skeleton_archer: { visuals: SKELETON_ARCHER_25D_VISUALS, render: renderSkeletonArcher25D },
    skeleton_warrior: { visuals: SKELETON_WARRIOR_25D_VISUALS, render: renderSkeletonWarrior25D },
    demon: { visuals: DEMON_25D_VISUALS, render: renderDemon25D },
    drowned: { visuals: DROWNED_25D_VISUALS, render: renderDrowned25D },
    lancer: { visuals: LANCER_25D_VISUALS, render: renderLancer25D },
    plate_knight: { visuals: PLATE_KNIGHT_25D_VISUALS, render: renderPlateKnight25D },
    militia: { visuals: MILITIA_25D_VISUALS, render: renderMilitia25D },
    chest_goblin: { visuals: CHEST_GOBLIN_25D_VISUALS, render: renderChestGoblin25D }
};

export { knightHeadPosition25D };
