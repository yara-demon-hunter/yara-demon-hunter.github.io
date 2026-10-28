import { CHARACTER_MODEL } from '../../data_model/character.js';
import { keys, player, state } from '../core/state.js';
import { getPlayerMaxSpeed } from './stats.js';

// --- MOVIMENTAÇÃO DO HERÓI ---
export function updatePlayer(dt) {
    // Timers
    if (player.iFrames > 0) player.iFrames -= dt;

    let moveX = 0;
    let moveY = 0;

    if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    const speed = getPlayerMaxSpeed();

    if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        player.x += (moveX / len) * speed * dt;
        player.y += (moveY / len) * speed * dt;
        player.targetX = player.x;
        player.targetY = player.y;
    } else {
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3) {
            const step = speed * dt;
            const moveDist = Math.min(dist, step);
            player.x += (dx / dist) * moveDist;
            player.y += (dy / dist) * moveDist;
        }
    }

    player.x = Math.max(15, Math.min(state.width - 15, player.x));
    player.y = Math.max(15, Math.min(state.height - 15, player.y));

    // Atualizar rastro de luz de movimento do herói
    player.trail.unshift({ x: player.x, y: player.y, alpha: 1.0 });
    if (player.trail.length > CHARACTER_MODEL.trailLength) {
        player.trail.pop();
    }
    player.trail.forEach(t => t.alpha -= dt * CHARACTER_MODEL.trailFadePerSecond);
}
