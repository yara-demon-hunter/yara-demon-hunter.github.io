// --- NEON BLADE: CENTER GUARDIAN ---
// Ponto de entrada: importa os motores e roda o game loop.
// Dados (balanceamento) ficam em ../data_model/; o estado da partida em ./core/state.js.
import { setupInput } from './core/input.js';
import { resize } from './core/resize.js';
import { state } from './core/state.js';
import { render } from './render/renderer.js';
import { updateAutoAttack } from './systems/combat.js';
import { updateEffects } from './systems/effects.js';
import { updateEnemies, updateEnemyProjectiles } from './systems/enemies.js';
import { updatePlayer } from './systems/player.js';
import { updatePowerups } from './systems/powerups.js';
import { updateSpawner } from './systems/spawner.js';
import { setupButtons } from './ui/buttons.js';

let lastTime = performance.now();

// --- UPDATE LOOP ---
function update(dt) {
    if (state.gameState !== 'PLAYING') return;
    dt = Math.min(dt, 0.05);

    updatePlayer(dt);
    updateAutoAttack(dt);
    updateSpawner(dt);

    updateEnemies(dt);
    if (state.gameState === 'GAMEOVER') return;

    updateEnemyProjectiles(dt);
    if (state.gameState === 'GAMEOVER') return;

    updatePowerups(dt);
    updateEffects(dt);
}

// --- GAME LOOP ---
function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', resize);
resize();
setupInput();
setupButtons();
requestAnimationFrame(gameLoop);
