window.YaraRpgData = window.YaraRpgData || {};

// Exploration chances and rewards live here for easy balancing.
// Story events are checked separately; outcome weights below total 100.
// Unavailable healing/potion outcomes are removed and their weight is redistributed.
window.YaraRpgData.exploration = Object.freeze({
    discovery: {
        baseChance: 1,
        chancePerLevel: 1,
        chancePerRegion: 1,
        maximumChance: 10
    },
    storyEvents: {
        chance: 20,
        cooldownExplorations: 3
    },
    outcomes: Object.freeze([
        { type: "monster", weight: 40 },
        { type: "gold", weight: 19 },
        { type: "safeTrail", weight: 13 },
        { type: "potion", weight: 8 },
        { type: "trap", weight: 6 },
        { type: "focus", weight: 6 },
        { type: "supplies", weight: 5 },
        { type: "chest", weight: 3 }
    ]),
    chest: {
        itemChance: 70,
        rarityIds: ["epic", "legendary", "demon", "god"]
    },
    gold: { minimum: 5, range: 10 },
    safeTrail: { hp: 30, focus: 15 },
    trap: { damageMinimum: 8, damageRange: 8 },
    focusFind: { minimum: 12, range: 13 },
    supplies: { goldMinimum: 10, goldRange: 11, hpRecovery: 12 },
    sparedMonster: {
        chance: 8,
        goldPercent: 50,
        clues: {
            "dark-forest": [
                { pt: "O monstro sussurra que as feras evitam a margem norte do rio.", en: "The monster whispers that beasts avoid the river's northern bank." }
            ],
            "ashen-portal": [
                { pt: "O monstro revela que o portal enfraquece depois de uma explosão de cinzas.", en: "The monster reveals that the portal weakens after a burst of ash." }
            ],
            "ruined-village": [
                { pt: "O monstro conta que os invasores escondem suprimentos perto da torre de vigia.", en: "The monster says the invaders hide supplies near the watchtower." }
            ],
            "gudran-castle": [
                { pt: "O monstro revela que as armadilhas do castelo protegem um arsenal antigo.", en: "The monster reveals that the castle traps guard an old armory." }
            ]
        }
    }
});
