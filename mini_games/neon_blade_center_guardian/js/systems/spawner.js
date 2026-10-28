import { MONSTER_SPAWNING, chooseMonsterType, createMonster } from '../../data_model/monsters.js';
import { state } from '../core/state.js';
import { updateHUD } from '../ui/hud.js';
import { shakeScreen } from './effects.js';

// --- SPAWNER DE INIMIGOS ---
export function spawnEnemy() {
    if (state.turn % MONSTER_SPAWNING.bossEveryTurns === 0
        && !state.currentBoss
        && state.enemies.length < MONSTER_SPAWNING.maximumEnemiesBeforeBoss) {
        spawnBoss();
        return;
    }

    const spawnDist = Math.max(state.width, state.height) * MONSTER_SPAWNING.regularSpawnScreenRatio
        + MONSTER_SPAWNING.regularSpawnOffset;
    const angle = Math.random() * Math.PI * 2;
    const x = state.coreX + Math.cos(angle) * spawnDist;
    const y = state.coreY + Math.sin(angle) * spawnDist;
    const type = chooseMonsterType();
    state.enemies.push(createMonster(type, state.turn, x, y));
}

export function spawnBoss() {
    const spawnDist = Math.max(state.width, state.height) * MONSTER_SPAWNING.bossSpawnScreenRatio;
    const angle = Math.random() * Math.PI * 2;
    const x = state.coreX + Math.cos(angle) * spawnDist;
    const y = state.coreY + Math.sin(angle) * spawnDist;

    state.currentBoss = createMonster('BOSS', state.turn, x, y);
    state.enemies.push(state.currentBoss);
    updateHUD();
    shakeScreen(12);
}

export function updateSpawner(dt) {
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
        spawnEnemy();
        state.spawnTimer = Math.max(
            MONSTER_SPAWNING.minimumIntervalSeconds,
            MONSTER_SPAWNING.initialIntervalSeconds
                - state.turn * MONSTER_SPAWNING.intervalReductionPerTurnSeconds
        );
    }
}
