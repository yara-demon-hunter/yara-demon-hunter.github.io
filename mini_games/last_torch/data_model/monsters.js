import { getTurnDifficulty, isMonsterUnlocked } from './difficulty.js';

export const MONSTER_MODELS = {
    SKELETON: {
        spawnWeight: 0.42,
        hpBase: 58,
        hpPerTurn: 11,
        speedMin: 55,
        speedMax: 85,
        radius: 14,
        color: '#d9d2bc',
        damage: 15,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 20,
        goldBase: 4,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    BAT: {
        spawnWeight: 0.22,
        hpBase: 24,
        hpPerTurn: 6,
        speedMin: 105,
        speedMax: 140,
        radius: 10,
        color: '#38bdf8',
        damage: 10,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 20,
        goldBase: 2,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    VAMPIRE: {
        spawnWeight: 0.18,
        hpBase: 88,
        hpPerTurn: 17,
        speedMin: 45,
        speedMax: 45,
        radius: 18,
        color: '#b91c1c',
        damage: 20,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 40,
        goldBase: 9,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
        splitCount: 2
    },
    WITCH: {
        spawnWeight: 0.1,
        hpBase: 65,
        hpPerTurn: 8,
        speedMin: 40,
        speedMax: 40,
        radius: 13,
        color: '#f50bca',
        damage: 12,
        initialShootCooldownSeconds: 4,
        shootCooldownSeconds: 6.5,       // segundos entre um tiro e outro
        projectileSpeed: 160,
        projectileRadius: 5,
        projectileDamageMultiplier: 0.8,
        projectileTorchDamage: 2,
        keepDistance: 165,               // para de andar a esta distância do alvo e atira
        scoreReward: 30,
        goldBase: 9,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    VAMPIRE_BAT: {
        hpBase: 15,
        hpPerTurn: 0,
        speedMin: 95,
        speedMax: 95,
        radius: 8,
        color: '#38bdf8',
        damage: 8,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 10,
        goldBase: 1,
        goldVariance: 0.5,
        xpRewardBase: 8,
        xpRewardPerTurn: 1,
        splitVelocity: 100,
        parentSplitOffset: 20
    },
    // Mariposa de cinzas: ignora o herói e voa direto para a chama. A adaga é a resposta.
    MOTH: {
        spawnWeight: 0.1,
        hpBase: 16,
        hpPerTurn: 4,
        speedMin: 88,
        speedMax: 112,
        radius: 10,
        color: '#d6b98a',
        damage: 8,
        torchDamage: 9,
        ignoresPlayer: true,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 25,
        goldBase: 4,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3
    },
    // Inchado: lento e cheio de gás. Explode ao morrer, ferindo herói e monstros em volta.
    BLOATER: {
        spawnWeight: 0.1,
        hpBase: 100,
        hpPerTurn: 16,
        speedMin: 30,
        speedMax: 36,
        radius: 19,
        color: '#a3e635',
        damage: 14,
        torchDamage: 20,
        explosion: { radius: 86, damage: 26, monsterDamageRatio: 0.9 },
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 50,
        goldBase: 11,
        goldVariance: 0.5,
        xpRewardBase: 24,
        xpRewardPerTurn: 3
    },
    // Espectro: mira e dispara em linha reta. O dash é a resposta.
    WRAITH: {
        spawnWeight: 0.1,
        hpBase: 44,
        hpPerTurn: 10,
        speedMin: 58,
        speedMax: 66,
        radius: 12,
        color: '#a5f3fc',
        damage: 16,
        lunge: { cooldownSeconds: 3.6, aimSeconds: 0.75, seconds: 0.42, speed: 560, triggerDistance: 330 },
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 35,
        goldBase: 7,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3
    },
    // Necromante: fica longe e levanta esqueletos até alguém ir buscá-lo.
    NECROMANCER: {
        spawnWeight: 0.06,
        hpBase: 80,
        hpPerTurn: 12,
        speedMin: 34,
        speedMax: 34,
        radius: 13,
        color: '#86efac',
        damage: 12,
        keepDistance: 290,
        summon: { type: 'SKELETON', count: 2, spread: 46 },
        initialShootCooldownSeconds: 3,
        shootCooldownSeconds: 6.5,
        scoreReward: 60,
        goldBase: 16,
        goldVariance: 0.5,
        xpRewardBase: 26,
        xpRewardPerTurn: 3
    }
};

// Os bosses ficam em ./bosses.js (BOSS_MODELS / BOSS_SPAWNING)
export const MONSTER_SPAWNING = {
    edgeMargin: 34,                  // nascem logo fora da tela (unidades do mundo)
    targetPlayerDistance: 240,
    movementDamping: 0.88,
    contactKnockback: 220,
    // Monstros se empurram de leve: uma horda ocupa espaço em vez de virar um ponto só
    separationStrength: 60
};

const SPAWNABLE_MONSTER_TYPES = ['BAT', 'VAMPIRE', 'WITCH', 'SKELETON', 'MOTH', 'BLOATER', 'WRAITH', 'NECROMANCER'];

export function createMonster(type, turn, x, y, random = Math.random) {
    const model = MONSTER_MODELS[type];
    if (!model) throw new Error(`Unknown monster type: ${type}`);
    return createEnemy(model, type, turn, x, y, random);
}

// Monta o inimigo a partir de um modelo (usado também pelos bosses)
export function createEnemy(model, type, turn, x, y, random = Math.random) {
    // Vida, velocidade e dano crescem com o turno (data_model/difficulty.js)
    const difficulty = getTurnDifficulty(turn);
    const baseSpeed = model.speedMin === model.speedMax
        ? model.speedMin
        : model.speedMin + random() * (model.speedMax - model.speedMin);
    const speed = baseSpeed * difficulty.speedMultiplier;
    const hp = Math.round((model.hpBase + turn * model.hpPerTurn) * difficulty.hpMultiplier);

    return {
        x, y, vx: 0, vy: 0,
        hp, maxHp: hp,
        speed, radius: model.radius, color: model.color, type, damage: model.damage * difficulty.damageMultiplier,
        shootTimer: model.initialShootCooldownSeconds,
        angle: 0,                        // direção do movimento (usada só no desenho)
        phase: random() * Math.PI * 2    // defasagem das animações (cada monstro bate asa/pulsa diferente)
    };
}

export function createVampireBat(x, y, turn = 1, random = Math.random) {
    const model = MONSTER_MODELS.VAMPIRE_BAT;
    const spread = model.parentSplitOffset;
    const velocity = model.splitVelocity;

    return {
        ...createMonster('VAMPIRE_BAT', turn, x + (random() - 0.5) * spread, y + (random() - 0.5) * spread, random),
        type: 'BAT',
        vx: (random() - 0.5) * velocity,
        vy: (random() - 0.5) * velocity
    };
}

// Sorteia entre os monstros já liberados no turno (os pesos são reescalados entre eles)
export function chooseMonsterType(turn, random = Math.random) {
    const available = SPAWNABLE_MONSTER_TYPES.filter(type => isMonsterUnlocked(type, turn));
    const total = available.reduce((sum, type) => sum + MONSTER_MODELS[type].spawnWeight, 0);
    let roll = random() * total;
    for (const type of available) {
        const weight = MONSTER_MODELS[type].spawnWeight;
        if (roll < weight) return type;
        roll -= weight;
    }
    return 'SKELETON';
}

// Ouro de um monstro: o valor base sobe ou desce até goldVariance (0.5 = de metade ao dobro).
// Arredonda e nunca dá menos que 1 moeda.
export function rollMonsterGold(model, random = Math.random) {
    const { goldBase, goldVariance } = model;
    const factor = 1 + (random() * 2 - 1) * goldVariance;
    return Math.max(1, Math.round(goldBase * factor));
}
