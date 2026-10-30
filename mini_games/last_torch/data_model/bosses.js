import { createEnemy } from './monsters.js';

// --- BOSSES ---
// Separados dos monstros comuns: não entram no sorteio normal, aparecem a cada `everyTurns`
// turnos, têm nome próprio (mostrado na barra de vida do HUD) e seguram a virada do turno até morrer.
export const BOSS_MODELS = {
    DEMON_LORD: {
        name: 'Demon Lord',
        hpBase: 500,
        hpPerTurn: 150,
        speedMin: 35,
        speedMax: 35,
        radius: 32,
        color: '#dc2626',
        damage: 30,
        shootCooldownSeconds: 1,
        initialShootCooldownSeconds: 1.5,
        projectileSpeed: 160,
        projectileRadius: 7,          // bola de fogo (raio de acerto)
        projectileDamageMultiplier: 0.8,
        scoreReward: 250,
        goldRewardMin: 10,
        goldRewardMax: 10,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    }
};

export const BOSS_SPAWNING = {
    everyTurns: 3,
    maximumEnemiesBeforeBoss: 3,
    spawnScreenRatio: 0.5,
    // Ordem em que os bosses aparecem (repete do início quando acaba)
    rotation: ['DEMON_LORD']
};

// Escolhe o boss da vez pela ordem de BOSS_SPAWNING.rotation
export function chooseBossType(turn) {
    const { rotation, everyTurns } = BOSS_SPAWNING;
    const appearance = Math.max(0, Math.floor(turn / everyTurns) - 1);
    return rotation[appearance % rotation.length];
}

export function createBoss(type, turn, x, y, random = Math.random) {
    const model = BOSS_MODELS[type];
    if (!model) throw new Error(`Unknown boss type: ${type}`);
    return {
        ...createEnemy(model, type, turn, x, y, random),
        isBoss: true,
        name: model.name
    };
}
