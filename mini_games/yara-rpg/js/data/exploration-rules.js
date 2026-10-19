window.YaraRpgData = window.YaraRpgData || {};

// Exploration chances and rewards live here for easy balancing.
// Story events are checked separately; outcome weights below total 100.
// Unavailable healing/potion outcomes are removed and their weight is redistributed.
window.YaraRpgData.exploration = Object.freeze({
    storyEvents: {
        chance: 20,
        cooldownExplorations: 3
    },
    outcomes: Object.freeze([
        { type: "monster", weight: 38 },
        { type: "gold", weight: 17 },
        { type: "safeTrail", weight: 12 },
        { type: "potion", weight: 8 },
        { type: "trap", weight: 6 },
        { type: "focus", weight: 6 },
        { type: "supplies", weight: 6 },
        { type: "chest", weight: 2 },
        { type: "map", weight: 5 }
    ]),
    map: {
        treasureChanceBonus: 25
    },
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
        chance: 10,
        goldPercent: 50,
        treasureChanceBonus: 10,
        outcomeWeights: {
            strike: 20,
            treasure: 20,
            recovery: 20,
            missingSlotItem: 20,
            bonusGold: 20
        },
        recoveryPercent: 20,
        bonusGoldPercent: 50,
        strikeMultiplier: 2,
        clues: {
            "dark-forest": [
                { pt: "O monstro sussurra que um baú foi enterrado sob as raízes antigas.", en: "The monster whispers that a chest was buried beneath the old roots." }
            ],
            "ashen-portal": [
                { pt: "O monstro diz que as cinzas revelam um baú quando o portal enfraquece.", en: "The monster says the ash reveals a chest when the portal weakens." }
            ],
            "ruined-village": [
                { pt: "O monstro conta que há um baú escondido sob os escombros da torre de vigia.", en: "The monster says a chest is hidden beneath the watchtower rubble." }
            ],
            "gudran-castle": [
                { pt: "O monstro revela que os antigos guardas esconderam um baú atrás do arsenal.", en: "The monster reveals that the old guards hid a chest behind the armory." }
            ]
        }
    }
});
