// World Rules balance settings.
window.YaraRpgData = window.YaraRpgData || {};
window.YaraRpgData.rules = Object.assign(window.YaraRpgData.rules || {}, {
    probabilityScale: 100,
    mistContacts: {
        baseChance: 3,
        chancePerLevel: 2,
        maxChance: 25,
        cooldownExplorations: 3,
        outcomes: [
            { type: "combat", weight: 45 },
            { type: "sacrifice", weight: 30 },
            { type: "power", weight: 25 }
        ],
        sacrifice: {
            goldMinimum: 25,
            goldRange: 26,
            hpLossMinimum: 10,
            hpLossRange: 11
        },
        bossVariation: {
            minimum: 0.9,
            maximum: 1.1,
            levelScale: 0.08,
            minimumScale: 0.75,
            maximumScale: 1.6
        }
    },
    camp: {
        goldCost: 50,
        hpRecoveryPercent: 20,
        focoRecoveryPercent: 20
    }
});
