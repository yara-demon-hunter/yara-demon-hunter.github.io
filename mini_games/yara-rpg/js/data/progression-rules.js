// Progression Rules balance settings.
window.YaraRpgData = window.YaraRpgData || {};
window.YaraRpgData.rules = Object.assign(window.YaraRpgData.rules || {}, {
    progression: {
        xpRequirementMultiplier: 1.5
    },
    upgrades: {
        goldCost: 100,
        attributes: Object.freeze({
            atk: { stat: "atk", amount: 2, nameKey: "attack" },
            def: { stat: "def", amount: 2, nameKey: "defense" },
            parry: { stat: "parry", amount: 3, nameKey: "parry", isPercentage: true },
            evasion: { stat: "evasion", amount: 3, nameKey: "evasion", isPercentage: true },
            hp: { stat: "maxHp", amount: 50, currentStat: "hp", currentMaxStat: "maxHp", currentAmount: 25, nameKey: "hpUpgradeName", benefitKey: "upgradeHpBenefit" },
            foco: { stat: "maxFoco", amount: 25, currentStat: "foco", currentMaxStat: "maxFoco", currentAmount: 10, nameKey: "staminaUpgradeName", benefitKey: "upgradeStaminaBenefit" },
            stun: { stat: "stunChance", amount: 1, max: 100, nameKey: "stun", isPercentage: true }
        })
    }
});
Object.freeze(window.YaraRpgData.rules);
