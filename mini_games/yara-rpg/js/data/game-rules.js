window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.rules = Object.freeze({
    probabilityScale: 100,
    exploration: {
        discoveryBaseChance: 3,
        discoveryChancePerLevel: 3,
        discoveryChancePerRegion: 4,
        maxDiscoveryChance: 45,
        encounters: {
            monsterThreshold: 50,
            goldThreshold: 75,
            safeTrailThreshold: 90,
            foundGoldMinimum: 5,
            foundGoldRange: 10,
            safeTrailRecoveryHp: 30,
            safeTrailRecoveryFoco: 15

        }
    },
    camp: {
        goldCost: 50,
        hpRecovery: 50,
        focoRecovery: 25
    },
    combat: {
        maxEvasion: 65,
        maxParry: 65,
        parryCost: 10,
        parryBonus: 5,
        dodgeCost: 15,
        dodgeBonus: 15,
        quickAttack: {
            attackMultiplier: 0.8,
            minimumDamage: 4,
            randomBonusRange: 4
        },
        heavyAttack: {
            focoCost: 15,
            attackMultiplier: 1.5,
            minimumDamage: 8,
            randomBonusRange: 6
        },
        criticalAttack: {
            minimumDamage: 8,
            randomBonusRange: 6
        },
        monsterAttack: {
            minimumDamage: 2,
            randomBonusRange: 4
        },
        monsterParryDamageMultiplier: 0.5,
        minimumDamageAfterParry: 1,
        escapeSuccessChance: 0.7,
        actionDelayMs: 400,
        responseDelayMs: 500,
        furyPerDamageTaken: 1,
        furyPerDodge: 2,
        furyPerBasicAttackDamage: 0.5,
        criticalDamageMultiplier: 2,
        criticalStunBonus: 30
    },
    progression: {
        xpRequirementMultiplier: 1.5
    },
    upgrades: {
        goldCost: 50,
        attributes: Object.freeze({
            atk: { stat: "atk", amount: 2, nameKey: "attack" },
            def: { stat: "def", amount: 2, nameKey: "defense" },
            parry: { stat: "parry", amount: 3, max: 65, nameKey: "parry", isPercentage: true },
            evasion: { stat: "evasion", amount: 3, max: 65, nameKey: "evasion", isPercentage: true },
            hp: { stat: "maxHp", amount: 50, currentStat: "hp", currentMaxStat: "maxHp", currentAmount: 25, nameKey: "hpUpgradeName", benefitKey: "upgradeHpBenefit" },
            foco: { stat: "maxFoco", amount: 25, currentStat: "foco", currentMaxStat: "maxFoco", currentAmount: 10, nameKey: "staminaUpgradeName", benefitKey: "upgradeStaminaBenefit" },
            stun: { stat: "stunChance", amount: 1, max: 100, nameKey: "stun", isPercentage: true }
        })
    }
});