// Combat Rules balance settings.
window.YaraRpgData = window.YaraRpgData || {};
window.YaraRpgData.rules = Object.assign(window.YaraRpgData.rules || {}, {
    combat: {
        enemyTelegraphDamageMultiplier: 1.65,
        telegraphEveryTurns: 3,
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
        criticalDefenseIgnoreFraction: 0.5,
        actionDelayMs: 400,
        responseDelayMs: 500,
        furyPerDamageTaken: 1,
        furyPerDodge: 5,
        furyPerBasicAttackDamage: 0.5,
        criticalStunBonus: 30
    }
});
