window.YaraRpgData = window.YaraRpgData || {};
window.YaraRpgData.rules = Object.assign(window.YaraRpgData.rules || {}, {
    progression: {
        xpRequirementMultiplier: 1.5,
        startingSkillPoints: 6,
        skillPointsPerLevel: 1
    },
    upgrades: {
        // Legado: goldCost mantido apenas para referência; upgrades agora custam skillPoints.
        goldCost: 100,
        costPerPoint: 1,
        attributes: Object.freeze({
            atk: { stat: "atk", amount: 0.5, nameKey: "attack" },
            def: { stat: "def", amount: 0.5, nameKey: "defense" },
            parry: { stat: "parry", amount: 0.5, nameKey: "parry", isPercentage: true },
            evasion: { stat: "evasion", amount: 0.5, nameKey: "evasion", isPercentage: true },
            criticalChance: { stat: "criticalChance", amount: 0.5, nameKey: "criticalChance", isPercentage: true },
            hp: { stat: "maxHp", amount: 10, currentStat: "hp", currentMaxStat: "maxHp", currentAmount: 10, nameKey: "hpUpgradeName", benefitKey: "upgradeHpBenefit" },
            foco: { stat: "maxFoco", amount: 10, currentStat: "foco", currentMaxStat: "maxFoco", currentAmount: 10, nameKey: "staminaUpgradeName", benefitKey: "upgradeStaminaBenefit" },
            stun: { stat: "stunChance", amount: 0.5, nameKey: "stun", isPercentage: true },
            fury: { stat: "maxFury", amount: -5, nameKey: "furyThresholdUpgradeName", isPercentage: true }
        })
    }
});
// NÃO congelar window.YaraRpgData.rules aqui — world-rules.js, equipment-rules.js e
// combat-rules.js ainda precisam estender o objeto via Object.assign. O freeze do
// objeto raiz (se desejado) deve acontecer depois que todos os *-rules.js carregarem.
// Congelamos apenas os sub-objetos deste arquivo para manter imutabilidade local.
Object.freeze(window.YaraRpgData.rules.progression);
Object.freeze(window.YaraRpgData.rules.upgrades);
