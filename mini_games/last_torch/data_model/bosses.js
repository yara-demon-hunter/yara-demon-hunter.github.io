import { createEnemy } from './monsters.js';

// --- BOSSES ---
// Separados dos monstros comuns: não entram no sorteio normal, aparecem a cada `everyTurns`
// turnos, têm nome próprio (mostrado na barra de vida do HUD) e seguram a virada do turno até morrer.
export const BOSS_MODELS = {
    DEMON_LORD: {
        name: 'Demon Lord',
        hpBase: 500,
        hpPerTurn: 150,
        speedMin: 28,
        speedMax: 28,
        radius: 32,
        color: '#dc2626',
        damage: 30,
        // Ataque em rajada: burstCount bolas de fogo seguidas (burstIntervalSeconds entre elas) e depois
        // uma pausa de shootCooldownSeconds sem atirar
        burstCount: 3,
        burstIntervalSeconds: 0.55,
        shootCooldownSeconds: 3.5,
        initialShootCooldownSeconds: 1.5,
        projectileSpeed: 160,
        projectileRadius: 7,          // bola de fogo (raio de acerto)
        projectileDamageMultiplier: 0.8,
        // Tremor de tela enquanto anda: um a cada walkShakeIntervalSeconds, não o tempo todo
        walkShakeIntensity: 5,
        walkShakeIntervalSeconds: 2.2,
        scoreReward: 250,
        goldBase: 45,
        goldVariance: 0,
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
