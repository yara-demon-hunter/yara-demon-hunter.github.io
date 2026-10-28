import { ctx, state } from '../core/state.js';
import { renderAttackRange, renderBackground, renderCore } from './arena.js';
import {
    renderBladeSlashes,
    renderEnemies,
    renderEnemyProjectiles,
    renderParticles,
    renderPowerups
} from './entities.js';
import { renderPlayer, renderPlayerTrail } from './player.js';

// --- RENDER LOOP ---
// A ordem das chamadas define as camadas (do fundo para a frente).
export function render() {
    ctx.save();
    ctx.clearRect(0, 0, state.width, state.height);

    // Screen Shake offset
    if (state.shakeIntensity > 0) {
        const rx = (Math.random() - 0.5) * state.shakeIntensity;
        const ry = (Math.random() - 0.5) * state.shakeIntensity;
        ctx.translate(rx, ry);
    }

    renderBackground();
    renderCore();
    renderAttackRange();
    renderPowerups();
    renderBladeSlashes();
    renderEnemyProjectiles();
    renderEnemies();
    renderPlayerTrail();
    renderPlayer();
    renderParticles();

    ctx.restore();
}
