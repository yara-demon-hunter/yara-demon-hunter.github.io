import { BOSS_MODELS, RIVAL_OF, chooseBossType, isBossTurn } from './bosses.js';
import { TURN_DIFFICULTY } from './difficulty.js';
import { NIGHT } from './night.js';

// --- SANTUÁRIO ---
// O que o jogador conquistou e descobriu, guardado entre as noites (save.stats, save.achievements, save.bestiary).
// group: 'trophy' (marcos da jornada) ou 'feat' (façanhas de habilidade, dentro de uma noite).
// stat: chave em save.stats (js/core/save.js); target: valor a alcançar; hero: herói que libera (opcional).
export const ACHIEVEMENTS = [
    // --- TROFÉUS ---
    { id: 'firstNight', group: 'trophy', icon: '🩸', name: 'First Blood', desc: 'Finish your first hunt.', stat: 'runs', target: 1 },
    // Rowan: libera ao terminar a onda 1 (bestHour passa a 2 quando o primeiro acampamento abre)
    { id: 'hour2', group: 'trophy', icon: '🌘', name: 'First Light', desc: 'Survive Wave 1.', stat: 'bestHour', target: 2, hero: 'rowan' },
    { id: 'hour3', group: 'trophy', icon: '🌒', name: 'Into the Hush', desc: 'Reach Wave 3.', stat: 'bestHour', target: 3 },
    { id: 'hour4', group: 'trophy', icon: '🌕', name: 'Blood Moon', desc: 'Reach Wave 4.', stat: 'bestHour', target: 4 },
    { id: 'kills300', group: 'trophy', icon: '⚰️', name: 'Reaper', desc: 'Slay 200 monsters.', stat: 'kills', target: 200 },
    { id: 'kills1000', group: 'trophy', icon: '🔱', name: 'Thousand Souls', desc: 'Slay 1,000 monsters across all your nights.', stat: 'kills', target: 1000 },
    { id: 'demon', group: 'trophy', icon: '😈', name: 'Demon Slayer', desc: 'Slay the Demon Lord.', stat: 'boss_DEMON_LORD', target: 1, hero: 'reaver' },
    { id: 'evolve', group: 'trophy', icon: '✨', name: 'Transcendence', desc: 'Evolve a power.', stat: 'evolutions', target: 1 },
    { id: 'chests10', group: 'trophy', icon: '🗝️', name: 'Treasure Hunter', desc: 'Open 10 chests.', stat: 'chests', target: 10 },
    { id: 'hour6', group: 'trophy', icon: '🕯️', name: 'Deep Dark', desc: 'Reach Wave 6.', stat: 'bestHour', target: 6 },
    { id: 'elites10', group: 'trophy', icon: '🎯', name: 'Trophy Hunter', desc: 'Slay 10 elites.', stat: 'elites', target: 10 },
    { id: 'stars5x3', group: 'trophy', icon: '🌟', name: 'Starlit', desc: 'Earn 3 stars on 3 different waves.', stat: 'threeStarWaves', target: 3 },
    { id: 'stars3all', group: 'trophy', icon: '⭐', name: 'Rising Star', desc: 'Earn 2 stars or more on all 18 waves.', stat: 'twoStarWaves', target: 18 },
    { id: 'stars5all', group: 'trophy', icon: '🌠', name: 'Constellation', desc: 'Earn 3 stars on all 18 waves.', stat: 'threeStarWaves', target: 18 },
    { id: 'kills2000', group: 'trophy', icon: '🪦', name: 'Harvester', desc: 'Slay 1,200 monsters.', stat: 'kills', target: 1200 },
    { id: 'countess', group: 'trophy', icon: '🌞', name: 'Sunlight', desc: 'Slay the Blood Countess.', stat: 'boss_BLOOD_COUNTESS', target: 1, hero: 'warden' },
    { id: 'dawn', group: 'trophy', icon: '🌅', name: 'Dawn', desc: 'Survive until dawn.', stat: 'victories', target: 1, hero: 'azael' },
    { id: 'brutos', group: 'trophy', icon: '🪓', name: 'Iron Captain', desc: 'Defeat Captain Brutos.', stat: 'boss_BRUTOS', target: 1, hero: 'brutos' },
    { id: 'darkness3', group: 'trophy', icon: '🌑', name: 'Deeper Still', desc: 'Win a night on Darkness 3.', stat: 'bestDarknessWon', target: 3 },
    // Um troféu por Juramento: stat = maior hora alcançada sob ele (js/systems/sanctuary.js)
    { id: 'sworn1', group: 'trophy', icon: '🗡️', name: 'Blood Answers Blood', desc: 'Reach Wave 8 under the Oath of Slaughter.', stat: 'oath_oathSlaughter', target: 8 },
    { id: 'sworn2', group: 'trophy', icon: '🤫', name: 'Never Where They Strike', desc: 'Reach Wave 8 under the Oath of Whispers.', stat: 'oath_oathWhispers', target: 8 },
    { id: 'sworn3', group: 'trophy', icon: '🏮', name: 'The Flame Will Not Die', desc: 'Reach Wave 8 under the Oath of the Hearth.', stat: 'oath_oathHearth', target: 8 },
    { id: 'sworn4', group: 'trophy', icon: '📕', name: 'The Dark Pays in Kind', desc: 'Reach Wave 8 under the Oath of Ruin.', stat: 'oath_oathRuin', target: 8 },
    { id: 'sworn5', group: 'trophy', icon: '🦌', name: 'The Forest Remembers', desc: 'Reach Wave 8 under the Oath of the Wild.', stat: 'oath_oathWild', target: 8 },
    { id: 'darkness8', group: 'trophy', icon: '👑', name: 'Lightbringer', desc: 'Win a night on Darkness 8.', stat: 'bestDarknessWon', target: 8 },

    // --- FAÇANHAS ---
    { id: 'multi3', group: 'feat', icon: '🔪', name: 'Triple Cut', desc: 'Slay 3 monsters at once.', stat: 'bestMultiKill', target: 3 },
    { id: 'dodge5', group: 'feat', icon: '💨', name: 'Close Call', desc: 'Dodge 5 attacks at the last moment.', stat: 'perfectDodges', target: 5 },
    { id: 'multi4', group: 'feat', icon: '⚔️', name: 'Quad Slash', desc: 'Slay 4 monsters at once.', stat: 'bestMultiKill', target: 4 },
    { id: 'flawless1', group: 'feat', icon: '🫧', name: 'Untouched', desc: 'Finish a wave without taking a hit.', stat: 'flawlessHours', target: 1 },
    { id: 'streak30', group: 'feat', icon: '🔥', name: 'Carnage', desc: 'Reach a 20 kill streak.', stat: 'bestStreak', target: 20 },
    { id: 'multi6', group: 'feat', icon: '🌪️', name: 'Whirlwind', desc: 'Slay 6 monsters at once.', stat: 'bestMultiKill', target: 6 },
    { id: 'streak40', group: 'feat', icon: '🌋', name: 'Rampage', desc: 'Reach a 40 kill streak.', stat: 'bestStreak', target: 40 },
    { id: 'dodge25', group: 'feat', icon: '🧵', name: 'Needle and Thread', desc: 'Dodge 25 attacks at the last moment.', stat: 'perfectDodges', target: 25 },
    { id: 'flawless5', group: 'feat', icon: '🌫️', name: 'Ghost', desc: 'Finish 5 waves without taking a hit.', stat: 'flawlessHours', target: 5 },
    { id: 'streak100', group: 'feat', icon: '💫', name: 'Unstoppable', desc: 'Reach a 70 kill streak.', stat: 'bestStreak', target: 70, hero: 'shade' },
    { id: 'multi10', group: 'feat', icon: '☄️', name: 'Annihilation', desc: 'Slay 10 monsters at once.', stat: 'bestMultiKill', target: 10 },

    // --- MONSTROS (bestiário: quantos de cada tipo você já abateu; save.bestiary[tipo].kills) ---
    { id: 'beast_SKELETON', group: 'monster', icon: '💀', name: 'Bone Collector', desc: 'Slay 500 skeletons.', beast: 'SKELETON', target: 500 },
    { id: 'beast_SKELETON_CRAWLER', group: 'monster', icon: '🦴', name: 'Crawl Space', desc: 'Slay 300 crawling skeletons.', beast: 'SKELETON_CRAWLER', target: 300 },
    { id: 'beast_BAT', group: 'monster', icon: '🦇', name: 'Bat Hunter', desc: 'Slay 1000 bats.', beast: 'BAT', target: 1000 },
    { id: 'beast_SHADOW_WOLF', group: 'monster', icon: '🐺', name: 'Wolf Slayer', desc: 'Slay 200 shadow wolves.', beast: 'SHADOW_WOLF', target: 200 },
    { id: 'beast_VAMPIRE', group: 'monster', icon: '🧛', name: 'Stake Through the Heart', desc: 'Slay 150 vampires.', beast: 'VAMPIRE', target: 150 },
    { id: 'beast_WITCH', group: 'monster', icon: '🧙', name: 'Witch Hunter', desc: 'Slay 100 witches.', beast: 'WITCH', target: 100 },
    { id: 'beast_MOTH', group: 'monster', icon: '🦋', name: 'Moth to the Flame', desc: 'Slay 300 moths.', beast: 'MOTH', target: 300 },
    { id: 'beast_BLOATER', group: 'monster', icon: '🎈', name: 'Popped', desc: 'Slay 150 bloaters.', beast: 'BLOATER', target: 150 },
    { id: 'beast_ZOMBIE_WOLF', group: 'monster', icon: '🐺', name: 'Putrid Pack', desc: 'Slay 100 zombie wolves.', beast: 'ZOMBIE_WOLF', target: 100 },
    { id: 'beast_WRAITH', group: 'monster', icon: '👻', name: 'Exorcist', desc: 'Slay 100 wraiths.', beast: 'WRAITH', target: 100 },
    { id: 'beast_HEADLESS_KNIGHT', group: 'monster', icon: '🛡️', name: 'Headhunter', desc: 'Slay 50 headless knights.', beast: 'HEADLESS_KNIGHT', target: 50 },
    { id: 'beast_BONE_COLOSSUS', group: 'monster', icon: '🦴', name: 'Giant Killer', desc: 'Slay 25 bone colossi.', beast: 'BONE_COLOSSUS', target: 25 },
    { id: 'beast_GOLEM', group: 'monster', icon: '🪨', name: 'Rock Breaker', desc: 'Slay 50 ember golems.', beast: 'GOLEM', target: 50 },
    { id: 'beast_TREANT', group: 'monster', icon: '🌳', name: 'Lumberjack', desc: 'Slay 50 treants.', beast: 'TREANT', target: 50 },
    { id: 'beast_NECROMANCER', group: 'monster', icon: '☠️', name: 'Undertaker', desc: 'Slay 30 necromancers.', beast: 'NECROMANCER', target: 30 }
];

// Brasas que cada troféu paga, uma vez só (js/systems/sanctuary.js, checkAchievements). Pouco de propósito (o total é ~800, uns 15% do
// Altar): é um motivo a mais para conseguir o troféu, não um atalho. Quem libera um herói paga 0 (o prêmio já é o herói); troféu
// que libera um herói guardado (shelved) paga normal.
export const ACHIEVEMENT_EMBERS = {
    firstNight: 10, hour3: 10, hour4: 10, kills300: 15, kills1000: 25, demon: 25, evolve: 15, chests10: 15, hour6: 20, elites10: 15,
    stars3all: 40, stars5x3: 30, stars5all: 80, kills2000: 40, countess: 30, darkness3: 30,
    sworn1: 20, sworn2: 20, sworn3: 20, sworn4: 20, sworn5: 20, darkness8: 80,
    beast_SKELETON: 15, beast_SKELETON_CRAWLER: 10, beast_BAT: 20, beast_SHADOW_WOLF: 15, beast_VAMPIRE: 15, beast_WITCH: 10, beast_MOTH: 10, beast_BLOATER: 10, beast_ZOMBIE_WOLF: 10, beast_WRAITH: 15, beast_HEADLESS_KNIGHT: 20, beast_BONE_COLOSSUS: 25, beast_GOLEM: 20, beast_TREANT: 20, beast_NECROMANCER: 20,
    multi3: 5, dodge5: 5, multi4: 10, flawless1: 10, streak30: 15, multi6: 15, streak40: 20, dodge25: 20, flawless5: 25, streak100: 30, multi10: 30
};

// Quanto o jogador já tem para esta conquista: um número do save.stats, o abate de um tipo de monstro (beast, do bestiário) ou o
// número de ondas com 2 ou 3 estrelas (calculado dos recordes por onda, então vale também para quem já tinha jogado)
export function achievementValue(a, save) {
    if (a.beast) return save.bestiary?.[a.beast]?.kills ?? 0;
    if (a.stat === 'twoStarWaves' || a.stat === 'threeStarWaves') {
        const min = a.stat === 'twoStarWaves' ? 2 : 3;
        return Object.values(save.waveBests ?? {}).filter(b => (b.stars ?? 0) >= min).length;
    }
    return save.stats[a.stat] ?? 0;
}

// Brasas que o troféu paga (0 se ele já libera um herói jogável)
export function achievementEmbers(a, heroes) {
    if (a.hero && heroes[a.hero] && !heroes[a.hero].shelved) return 0;
    return ACHIEVEMENT_EMBERS[a.id] ?? 0;
}

// Mortes quase ao mesmo tempo (um golpe, uma explosão, as lâminas girando): cada morte dentro da janela soma
export const MULTI_KILL = {
    windowSeconds: 0.3,
    // Marcos: texto no meio da tela
    tiers: [
        { at: 4, label: 'QUAD KILL', color: '#fde047' },
        { at: 6, label: 'SIX AT ONCE', color: '#fb923c' },
        { at: 10, label: 'ANNIHILATION', color: '#f472b6' }
    ]
};

// --- BESTIÁRIO ---
// A ordem é a da primeira aparição. A arte dos monstros vem dos sprites da própria partida
// (js/render/monster_sprites.js); sem sprite pronto (bosses têm retrato próprio, getBossPortrait), vale o ícone.
const MONSTER_ENTRIES = [
    { key: 'SKELETON', name: 'Skeleton', icon: '💀' },
    { key: 'SKELETON_CRAWLER', name: 'Crawling Skeleton', icon: '🦴' },
    { key: 'BAT', name: 'Bat', icon: '🦇' },
    { key: 'SHADOW_WOLF', name: 'Shadow Wolf', icon: '🐺' },
    { key: 'VAMPIRE', name: 'Vampire', icon: '🧛' },
    { key: 'WITCH', name: 'Witch', icon: '🧙' },
    { key: 'MOTH', name: 'Moth', icon: '🦋' },
    { key: 'BLOATER', name: 'Bloater', icon: '🎈' },
    { key: 'ZOMBIE_WOLF', name: 'Zombie Wolf', icon: '🧟' },
    { key: 'WRAITH', name: 'Wraith', icon: '👻' },
    { key: 'HEADLESS_KNIGHT', name: 'Headless Knight', icon: '🛡️' },
    { key: 'BONE_COLOSSUS', name: 'Bone Colossus', icon: '🗿' },
    { key: 'GOLEM', name: 'Ember Golem', icon: '🪨' },
    { key: 'NECROMANCER', name: 'Necromancer', icon: '☠️' }
];
const BOSS_ICONS = { DEMON_LORD: '😈', BLOOD_COUNTESS: '🩸', LONG_NIGHT: '🌑', AZAEL: '⚔️', DEMON_HUNTER: '🗡️', BRUTOS: '🪓', RIVER_SPIRIT: '🌊', SLIZORK: '🟢', GRAVE_KING: '💀' };

// Primeira hora (de 1 até o fim da noite) em que o boss aparece, com qualquer um dos heróis (o rival muda com ele)
function firstBossHour(key) {
    for (let hour = 1; hour <= NIGHT.hours; hour++) {
        if (isBossTurn(hour) && Object.keys(RIVAL_OF).some(model => chooseBossType(hour, model) === key)) return hour;
    }
    return NIGHT.hours;
}

export function getBestiary() {
    const monsters = MONSTER_ENTRIES.map(m => ({ ...m, kind: 'monster', hour: TURN_DIFFICULTY.monsterUnlockTurn[m.key] ?? 1 }));
    const bosses = Object.entries(BOSS_MODELS).filter(([, model]) => !model.hidden).map(([key, model]) => ({
        key, kind: 'boss', name: model.name, subtitle: model.title, icon: BOSS_ICONS[key] ?? '☠️', hour: firstBossHour(key)
    }));
    return [...monsters, ...bosses].sort((a, b) => a.hour - b.hour);
}
