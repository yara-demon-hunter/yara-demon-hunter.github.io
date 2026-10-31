import { BOSS_MODELS, chooseBossType, isBossTurn } from './bosses.js';
import { TURN_DIFFICULTY } from './difficulty.js';
import { NIGHT } from './night.js';

// --- SANTUÁRIO ---
// O que o jogador conquistou e descobriu, guardado entre as noites (save.stats, save.achievements, save.bestiary).
// group: 'trophy' (marcos da jornada) ou 'feat' (façanhas de habilidade, dentro de uma noite).
// stat: chave em save.stats (js/core/save.js); target: valor a alcançar; hero: herói que libera (opcional).
export const ACHIEVEMENTS = [
    // --- TROFÉUS ---
    { id: 'firstNight', group: 'trophy', icon: '🩸', name: 'First Blood', desc: 'Finish your first hunt.', stat: 'runs', target: 1 },
    { id: 'hour3', group: 'trophy', icon: '🌒', name: 'Into the Hush', desc: 'Reach Hour 3.', stat: 'bestHour', target: 3 },
    { id: 'hour4', group: 'trophy', icon: '🌕', name: 'Blood Hour', desc: 'Reach Hour 4.', stat: 'bestHour', target: 4 },
    { id: 'kills300', group: 'trophy', icon: '⚰️', name: 'Reaper', desc: 'Slay 200 monsters.', stat: 'kills', target: 200 },
    { id: 'demon', group: 'trophy', icon: '😈', name: 'Demon Slayer', desc: 'Slay the Demon Lord.', stat: 'boss_DEMON_LORD', target: 1, hero: 'reaver' },
    { id: 'evolve', group: 'trophy', icon: '✨', name: 'Transcendence', desc: 'Evolve a power.', stat: 'evolutions', target: 1 },
    { id: 'chests10', group: 'trophy', icon: '🗝️', name: 'Treasure Hunter', desc: 'Open 10 chests.', stat: 'chests', target: 10 },
    { id: 'hour6', group: 'trophy', icon: '🕯️', name: 'Deep Dark', desc: 'Reach Hour 6.', stat: 'bestHour', target: 6 },
    { id: 'elites10', group: 'trophy', icon: '💀', name: 'Trophy Hunter', desc: 'Slay 10 elites.', stat: 'elites', target: 10 },
    { id: 'kills2000', group: 'trophy', icon: '🪦', name: 'Harvester', desc: 'Slay 1,200 monsters.', stat: 'kills', target: 1200 },
    { id: 'countess', group: 'trophy', icon: '🧛', name: 'Sunlight', desc: 'Slay the Blood Countess.', stat: 'boss_BLOOD_COUNTESS', target: 1, hero: 'warden' },
    { id: 'dawn', group: 'trophy', icon: '🌅', name: 'Dawn', desc: 'Survive until dawn.', stat: 'victories', target: 1 },
    { id: 'darkness3', group: 'trophy', icon: '🌑', name: 'Deeper Still', desc: 'Win a night on Darkness 3.', stat: 'bestDarknessWon', target: 3 },
    { id: 'hour20', group: 'trophy', icon: '♾️', name: 'Endless Dark', desc: 'Reach Hour 20 in the endless night.', stat: 'bestHour', target: 20 },
    { id: 'darkness8', group: 'trophy', icon: '👑', name: 'Lightbringer', desc: 'Win a night on Darkness 8.', stat: 'bestDarknessWon', target: 8 },

    // --- FAÇANHAS ---
    { id: 'multi3', group: 'feat', icon: '🔪', name: 'Triple Cut', desc: 'Slay 3 monsters at once.', stat: 'bestMultiKill', target: 3 },
    { id: 'dodge5', group: 'feat', icon: '💨', name: 'Close Call', desc: 'Dodge 5 attacks at the last moment.', stat: 'perfectDodges', target: 5 },
    { id: 'multi4', group: 'feat', icon: '⚔️', name: 'Quad Slash', desc: 'Slay 4 monsters at once.', stat: 'bestMultiKill', target: 4 },
    { id: 'flawless1', group: 'feat', icon: '🛡️', name: 'Untouched', desc: 'Finish an hour without taking a hit.', stat: 'flawlessHours', target: 1 },
    { id: 'streak30', group: 'feat', icon: '🔥', name: 'Carnage', desc: 'Reach a 20 kill streak.', stat: 'bestStreak', target: 20 },
    { id: 'multi6', group: 'feat', icon: '🌪️', name: 'Whirlwind', desc: 'Slay 6 monsters at once.', stat: 'bestMultiKill', target: 6 },
    { id: 'streak40', group: 'feat', icon: '🩸', name: 'Rampage', desc: 'Reach a 40 kill streak.', stat: 'bestStreak', target: 40 },
    { id: 'dodge25', group: 'feat', icon: '🧵', name: 'Needle and Thread', desc: 'Dodge 25 attacks at the last moment.', stat: 'perfectDodges', target: 25 },
    { id: 'flawless5', group: 'feat', icon: '👻', name: 'Ghost', desc: 'Finish 5 hours without taking a hit.', stat: 'flawlessHours', target: 5 },
    { id: 'streak100', group: 'feat', icon: '💫', name: 'Unstoppable', desc: 'Reach a 70 kill streak.', stat: 'bestStreak', target: 70, hero: 'shade' },
    { id: 'multi10', group: 'feat', icon: '☄️', name: 'Annihilation', desc: 'Slay 10 monsters at once.', stat: 'bestMultiKill', target: 10 }
];

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
    { key: 'BAT', name: 'Bat', icon: '🦇' },
    { key: 'VAMPIRE', name: 'Vampire', icon: '🧛' },
    { key: 'WITCH', name: 'Witch', icon: '🧙' },
    { key: 'MOTH', name: 'Moth', icon: '🦋' },
    { key: 'BLOATER', name: 'Bloater', icon: '🎈' },
    { key: 'ZOMBIE_WOLF', name: 'Zombie Wolf', icon: '🐺' },
    { key: 'WRAITH', name: 'Wraith', icon: '👻' },
    { key: 'HEADLESS_KNIGHT', name: 'Headless Knight', icon: '🛡️' },
    { key: 'NECROMANCER', name: 'Necromancer', icon: '☠️' }
];
const BOSS_ICONS = { DEMON_LORD: '😈', BLOOD_COUNTESS: '🩸', LONG_NIGHT: '🌑' };

// Primeira hora (de 1 até o fim da noite) em que o boss aparece
function firstBossHour(key) {
    for (let hour = 1; hour <= NIGHT.hours; hour++) {
        if (isBossTurn(hour) && chooseBossType(hour) === key) return hour;
    }
    return NIGHT.hours;
}

export function getBestiary() {
    const monsters = MONSTER_ENTRIES.map(m => ({ ...m, kind: 'monster', hour: TURN_DIFFICULTY.monsterUnlockTurn[m.key] ?? 1 }));
    const bosses = Object.entries(BOSS_MODELS).map(([key, model]) => ({
        key, kind: 'boss', name: model.name, subtitle: model.title, icon: BOSS_ICONS[key] ?? '☠️', hour: firstBossHour(key)
    }));
    return [...monsters, ...bosses].sort((a, b) => a.hour - b.hour);
}
