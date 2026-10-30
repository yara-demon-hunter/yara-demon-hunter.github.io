// --- PROGRESSO ENTRE PARTIDAS ---
// Brasas (embers) são ganhas ao fim de cada noite e gastas no Hearth em melhorias permanentes.
// mods: somados por nível (js/systems/modifiers.js). Custo do nível n: baseCost x costGrowth^n.
export const META_UPGRADES = {
    hearthstone: { name: 'Hearthstone', icon: '🧱', desc: '+12 Torch health', maxLvl: 10, baseCost: 10, costGrowth: 1.42, mods: { torchHp: 12 } },
    oldScars: { name: 'Old Scars', icon: '🩹', desc: '+7 Hero health', maxLvl: 10, baseCost: 10, costGrowth: 1.42, mods: { maxHpFlat: 7 } },
    whetstone: { name: 'Whetstone', icon: '⚒️', desc: '+4% damage', maxLvl: 10, baseCost: 14, costGrowth: 1.45, mods: { damage: 0.04 } },
    wornBoots: { name: 'Worn Boots', icon: '👢', desc: '+2% move speed', maxLvl: 6, baseCost: 12, costGrowth: 1.5, mods: { moveSpeed: 0.02 } },
    coinPurse: { name: 'Coin Purse', icon: '🪙', desc: '+7% gold', maxLvl: 8, baseCost: 12, costGrowth: 1.45, mods: { gold: 0.07 } },
    hunterLore: { name: 'Hunter Lore', icon: '📖', desc: '+4% XP', maxLvl: 8, baseCost: 14, costGrowth: 1.45, mods: { xp: 0.04 } },
    smolderingRage: { name: 'Smoldering Rage', icon: '🧨', desc: '+8% Fury charge', maxLvl: 5, baseCost: 18, costGrowth: 1.5, mods: { furyCharge: 0.08 } },
    huntersNotes: { name: "Hunter's Notes", icon: '📜', desc: '+1 starting skill point', maxLvl: 5, baseCost: 25, costGrowth: 1.7, mods: { startPoints: 1 } },
    treasureSense: { name: 'Treasure Sense', icon: '🗝️', desc: '+1 skill point from chests', maxLvl: 3, baseCost: 30, costGrowth: 1.9, mods: { chestPoints: 1 } },
    lastPrayer: { name: 'Last Prayer', icon: '🙏', desc: 'Rise once per night', maxLvl: 2, baseCost: 120, costGrowth: 2.6, mods: { revives: 1 } },
    emberKeeper: { name: 'Ember Keeper', icon: '✨', desc: '+7% embers earned', maxLvl: 6, baseCost: 22, costGrowth: 1.55, mods: { embers: 0.07 } }
};

export function getMetaUpgradeCost(model, level) {
    return Math.round(model.baseCost * Math.pow(model.costGrowth, level));
}

// Brasas ganhas por noite
export const EMBER_REWARDS = {
    perHour: 5,
    perKills: 1 / 8,            // 1 brasa a cada 8 mortes
    perStreak: 1 / 5,           // melhor sequência da noite
    perBoss: 25,
    victory: 180
};

// --- TRIALS ---
// Objetivos permanentes. stat: chave em save.stats (js/core/save.js); target: valor a alcançar.
// reward.embers: brasas; reward.hero: libera um herói.
export const ACHIEVEMENTS = [
    { id: 'firstNight', name: 'First Blood', desc: 'Finish your first hunt.', stat: 'runs', target: 1, reward: { embers: 15 } },
    { id: 'hour3', name: 'Into the Hush', desc: 'Reach Hour 3.', stat: 'bestHour', target: 3, reward: { embers: 30 } },
    { id: 'hour4', name: 'Blood Hour', desc: 'Reach Hour 4.', stat: 'bestHour', target: 4, reward: { embers: 35 } },
    { id: 'kills300', name: 'Reaper', desc: 'Slay 200 monsters.', stat: 'kills', target: 200, reward: { embers: 35 } },
    { id: 'streak30', name: 'Carnage', desc: 'Reach a 20 kill streak.', stat: 'bestStreak', target: 20, reward: { embers: 40 } },
    { id: 'demon', name: 'Demon Slayer', desc: 'Slay the Demon Lord.', stat: 'boss_DEMON_LORD', target: 1, reward: { embers: 40, hero: 'reaver' } },
    { id: 'evolve', name: 'Transcendence', desc: 'Evolve a power.', stat: 'evolutions', target: 1, reward: { embers: 50 } },
    { id: 'hour6', name: 'Deep Dark', desc: 'Reach Hour 6.', stat: 'bestHour', target: 6, reward: { embers: 50 } },
    { id: 'elites10', name: 'Trophy Hunter', desc: 'Slay 10 elites.', stat: 'elites', target: 10, reward: { embers: 30 } },
    { id: 'kills2000', name: 'Harvester', desc: 'Slay 1,200 monsters.', stat: 'kills', target: 1200, reward: { embers: 60 } },
    { id: 'streak100', name: 'Unstoppable', desc: 'Reach a 70 kill streak.', stat: 'bestStreak', target: 70, reward: { embers: 50, hero: 'shade' } },
    { id: 'countess', name: 'Sunlight', desc: 'Slay the Blood Countess.', stat: 'boss_BLOOD_COUNTESS', target: 1, reward: { embers: 80, hero: 'warden' } },
    { id: 'dawn', name: 'Dawn', desc: 'Survive until dawn.', stat: 'victories', target: 1, reward: { embers: 150 } },
    { id: 'darkness3', name: 'Deeper Still', desc: 'Win a night on Darkness 3.', stat: 'bestDarknessWon', target: 3, reward: { embers: 200 } },
    { id: 'hour20', name: 'Endless Dark', desc: 'Reach Hour 20 in the endless night.', stat: 'bestHour', target: 20, reward: { embers: 250 } },
    { id: 'darkness8', name: 'Lightbringer', desc: 'Win a night on Darkness 8.', stat: 'bestDarknessWon', target: 8, reward: { embers: 1000 } }
];
