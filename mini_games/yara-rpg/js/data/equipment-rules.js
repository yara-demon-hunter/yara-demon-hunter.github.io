// Equipment Rules balance settings.
window.YaraRpgData = window.YaraRpgData || {};
window.YaraRpgData.rules = Object.assign(window.YaraRpgData.rules || {}, {
    loot: {
        equipmentDropChance: 40,
        animalEventGoldMinimum: 25,
        animalEventGoldRange: 26,
        equipmentRarities: [
            { id: "common", statBonus: 0, chance: 38, name: { pt: "Comum", en: "Common" } },
            { id: "uncommon", statBonus: 1, chance: 25, name: { pt: "Incomum", en: "Uncommon" } },
            { id: "rare", statBonus: 2, chance: 11, name: { pt: "Raro", en: "Rare" } },
            { id: "super-rare", statBonus: 3, chance: 9, name: { pt: "Super Raro", en: "Super Rare" } },
            { id: "epic", statBonus: 4, chance: 7, name: { pt: "Épico", en: "Epic" } },
            { id: "legendary", statBonus: 5, chance: 5, name: { pt: "Lendário", en: "Legendary" } },
            { id: "demon", statBonus: 6, chance: 3.5, name: { pt: "Demoníaco", en: "Demonic" } },
            { id: "god", statBonus: 7, chance: 1.5, name: { pt: "Divino", en: "Divine" } }
        ],
        chestRarityChances: {
            epic: 40,
            legendary: 30,
            demon: 20,
            god: 10
        },
        finalRegionOnlyRarities: ["demon", "god"]
    },
    equipmentUpgrade: {
        maxLevel: 9,
        baseCost: 50,
        costMultiplier: 1.4,
        statBonusPerLevel: {
            atk: 0.5,
            def: 0.5,
            evasion: 0.5,
            parry: 0.5,
            stunChance: 0.5,
            maxHp: 5,
            maxFoco: 5
        }
    },
    inventory: {
        equipmentBagCapacity: 9
    }
});
