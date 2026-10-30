import { createEnemy } from './monsters.js';

// --- BOSSES ---
// Separados dos monstros comuns: não entram no sorteio normal, aparecem a cada `everyTurns`
// turnos, têm nome próprio (mostrado na barra de vida do HUD) e seguram a virada do turno até morrer.
// renderAs: arte reaproveitada (js/render/entities.js); palette: troca a paleta dessa arte.
// patterns: sequência de ataques, repetida em ciclo (js/systems/boss_ai.js). Abaixo de enrageRatio de
// vida o boss enfurece: pausas menores e mais velocidade.
export const BOSS_MODELS = {
    DEMON_LORD: {
        name: 'Demon Lord',
        title: 'Lord of the First Fire',
        renderAs: 'DEMON_LORD',
        hpBase: 900,
        hpPerTurn: 230,
        speedMin: 28,
        speedMax: 28,
        radius: 32,
        color: '#dc2626',
        damage: 30,
        // Ataque em rajada: burstCount bolas de fogo seguidas (burstIntervalSeconds entre elas) e depois
        // uma pausa de patternGapSeconds
        burstCount: 3,
        burstIntervalSeconds: 0.55,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 2.6,
        patterns: ['volley', 'ring', 'volley', 'slam', 'summon'],
        ringCount: 14,
        slamCount: 3,
        slamRadius: 74,
        slamDelaySeconds: 1,
        slamDamageMultiplier: 0.9,
        summonType: 'BAT',
        summonCount: 6,
        projectileSpeed: 160,
        projectileRadius: 7,          // bola de fogo (raio de acerto)
        projectileDamageMultiplier: 0.8,
        projectileTorchDamage: 3,
        enrageRatio: 0.5,
        enrageGapMultiplier: 0.7,
        enrageSpeedMultiplier: 1.35,
        // Tremor de tela enquanto anda: um a cada walkShakeIntervalSeconds, não o tempo todo
        walkShakeIntensity: 8,
        walkShakeIntervalSeconds: 4.5,
        scoreReward: 250,
        goldBase: 90,
        goldVariance: 0,
        xpRewardBase: 180,
        xpRewardPerTurn: 20,
    },
    BLOOD_COUNTESS: {
        name: 'Blood Countess',
        title: 'She Who Drinks the Light',
        renderAs: 'VAMPIRE',
        palette: 'countess',
        hpBase: 2000,
        hpPerTurn: 900,
        speedMin: 46,
        speedMax: 46,
        radius: 30,
        color: '#e11d48',
        damage: 26,
        burstCount: 5,
        burstIntervalSeconds: 0.28,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 2.2,
        patterns: ['blink', 'volley', 'spiral', 'blink', 'ring', 'summon'],
        ringCount: 18,
        spiralShots: 26,
        spiralIntervalSeconds: 0.09,
        summonType: 'BAT',
        summonCount: 10,
        projectileSpeed: 185,
        projectileRadius: 6,
        projectileDamageMultiplier: 0.7,
        projectileTorchDamage: 3,
        enrageRatio: 0.5,
        enrageGapMultiplier: 0.65,
        enrageSpeedMultiplier: 1.3,
        walkShakeIntensity: 0,
        walkShakeIntervalSeconds: 99,
        scoreReward: 500,
        goldBase: 160,
        goldVariance: 0,
        xpRewardBase: 320,
        xpRewardPerTurn: 30,
    },
    LONG_NIGHT: {
        name: 'The Long Night',
        title: 'The Dark Itself',
        renderAs: 'DEMON_LORD',
        palette: 'longNight',
        hpBase: 3000,
        hpPerTurn: 1400,
        speedMin: 32,
        speedMax: 32,
        radius: 42,
        color: '#7c3aed',
        damage: 34,
        burstCount: 7,
        burstIntervalSeconds: 0.24,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 1.9,
        patterns: ['ring', 'slam', 'spiral', 'volley', 'summon', 'slam', 'ring', 'blink'],
        ringCount: 22,
        slamCount: 5,
        slamRadius: 84,
        slamDelaySeconds: 0.95,
        slamDamageMultiplier: 0.8,
        spiralShots: 36,
        spiralIntervalSeconds: 0.07,
        summonType: 'WRAITH',
        summonCount: 5,
        projectileSpeed: 175,
        projectileRadius: 8,
        projectileDamageMultiplier: 0.7,
        projectileTorchDamage: 3,
        enrageRatio: 0.4,
        enrageGapMultiplier: 0.6,
        enrageSpeedMultiplier: 1.4,
        walkShakeIntensity: 10,
        walkShakeIntervalSeconds: 3.5,
        scoreReward: 1500,
        goldBase: 300,
        goldVariance: 0,
        xpRewardBase: 500,
        xpRewardPerTurn: 40,
    }
};

export const BOSS_SPAWNING = {
    everyTurns: 4,
    spawnScreenRatio: 0.5,
    // Ordem em que os bosses aparecem (repete do início quando acaba)
    rotation: ['DEMON_LORD', 'BLOOD_COUNTESS', 'LONG_NIGHT']
};

export function isBossTurn(turn) {
    return turn % BOSS_SPAWNING.everyTurns === 0;
}

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
