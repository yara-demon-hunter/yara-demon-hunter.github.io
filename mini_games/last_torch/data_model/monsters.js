export const MONSTER_MODELS = {
    SPIRIT: {
        spawnWeight: 0.42,
        hpBase: 40,
        hpPerTurn: 10,
        speedMin: 55,
        speedMax: 85,
        radius: 14,
        color: '#f43f5e',
        damage: 15,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 20,
        goldRewardMin: 1,
        goldRewardMax: 2,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    BAT: {
        spawnWeight: 0.22,
        hpBase: 20,
        hpPerTurn: 5,
        speedMin: 105,
        speedMax: 140,
        radius: 10,
        color: '#38bdf8',
        damage: 10,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 20,
        goldRewardMin: 1,
        goldRewardMax: 2,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    GOBLIN: {
        spawnWeight: 0.18,
        hpBase: 55,
        hpPerTurn: 15,
        speedMin: 45,
        speedMax: 45,
        radius: 18,
        color: '#a855f7',
        damage: 20,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 40,
        goldRewardMin: 1,
        goldRewardMax: 2,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
        splitCount: 2
    },
    WITCH: {
        spawnWeight: 0.18,
        hpBase: 40,
        hpPerTurn: 8,
        speedMin: 40,
        speedMax: 40,
        radius: 13,
        color: '#f50bca',
        damage: 12,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2.5,
        projectileSpeed: 160,
        projectileRadius: 5,
        projectileDamageMultiplier: 0.8,
        scoreReward: 20,
        goldRewardMin: 1,
        goldRewardMax: 2,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    BOSS: {
        hpBase: 350,
        hpPerTurn: 150,
        speedMin: 35,
        speedMax: 35,
        radius: 32,
        color: '#ec4899',
        damage: 30,
        shootCooldownSeconds: 1,
        initialShootCooldownSeconds: 1.5,
        projectileSpeed: 160,
        projectileRadius: 5,
        projectileDamageMultiplier: 0.8,
        scoreReward: 250,
        goldRewardMin: 10,
        goldRewardMax: 10,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    GOBLIN_CHILD: {
        hpBase: 15,
        hpPerTurn: 0,
        speedMin: 95,
        speedMax: 95,
        radius: 8,
        color: '#38bdf8',
        damage: 8,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 20,
        goldRewardMin: 1,
        goldRewardMax: 2,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
        splitVelocity: 100,
        parentSplitOffset: 20
    }
};

export const MONSTER_SPAWNING = {
    bossEveryTurns: 5,
    maximumEnemiesBeforeBoss: 3,
    regularSpawnScreenRatio: 0.6,
    regularSpawnOffset: 50,
    bossSpawnScreenRatio: 0.5,
    initialIntervalSeconds: 1.5,
    intervalReductionPerTurnSeconds: 0.1,
    minimumIntervalSeconds: 0.2,
    targetPlayerDistance: 240,
    movementDamping: 0.88,
    contactKnockback: 220
};

const SPAWNABLE_MONSTER_TYPES = ['BAT', 'GOBLIN', 'WITCH', 'SPIRIT'];

export function createMonster(type, turn, x, y, random = Math.random) {
    const model = MONSTER_MODELS[type];
    if (!model) throw new Error(`Unknown monster type: ${type}`);

    const speed = model.speedMin === model.speedMax
        ? model.speedMin
        : model.speedMin + random() * (model.speedMax - model.speedMin);
    const hp = model.hpBase + turn * model.hpPerTurn;

    return {
        x, y, vx: 0, vy: 0,
        hp, maxHp: hp,
        speed, radius: model.radius, color: model.color, type, damage: model.damage,
        shootTimer: model.initialShootCooldownSeconds,
        angle: 0,                        // direção do movimento (usada só no desenho)
        phase: random() * Math.PI * 2    // defasagem das animações (cada monstro bate asa/pulsa diferente)
    };
}

export function createGoblinChild(x, y, random = Math.random) {
    const model = MONSTER_MODELS.GOBLIN_CHILD;
    const spread = model.parentSplitOffset;
    const velocity = model.splitVelocity;

    return {
        ...createMonster('GOBLIN_CHILD', 0, x + (random() - 0.5) * spread, y + (random() - 0.5) * spread, random),
        type: 'BAT',
        vx: (random() - 0.5) * velocity,
        vy: (random() - 0.5) * velocity
    };
}

export function chooseMonsterType(random = Math.random) {
    let roll = random();
    for (const type of SPAWNABLE_MONSTER_TYPES) {
        const model = MONSTER_MODELS[type];
        if (roll < model.spawnWeight) return type;
        roll -= model.spawnWeight;
    }
    return 'SPIRIT';
}

export function rollMonsterGold(type, random = Math.random) {
    const { goldRewardMin, goldRewardMax } = MONSTER_MODELS[type];
    return goldRewardMin + Math.floor(random() * (goldRewardMax - goldRewardMin + 1));
}
