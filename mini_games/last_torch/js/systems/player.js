import { CHARACTER_MODEL } from '../../data_model/character.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { joystick, keys, player, state } from '../core/state.js';
import { getPlayerMaxSpeed } from './stats.js';

// Ponto (x, y) empurrado para a borda da área bloqueada da tocha, se estiver dentro dela.
// Empurrar só para fora faz o herói deslizar em volta da tocha em vez de travar.
function pushOutOfTorch(x, y) {
    const dx = x - state.coreX;
    const dy = y - state.coreY;
    const dist = Math.hypot(dx, dy);
    const radius = CORE_MODEL.playerBlockRadius;
    if (dist >= radius) return { x, y };
    if (dist === 0) return { x, y: state.coreY + radius };
    return { x: state.coreX + (dx / dist) * radius, y: state.coreY + (dy / dist) * radius };
}

// Andando até um clique: encostado na tocha e indo para dentro dela, segue pela borda em vez de parar
function aroundTorch(dirX, dirY) {
    const toCoreX = state.coreX - player.x;
    const toCoreY = state.coreY - player.y;
    const dist = Math.hypot(toCoreX, toCoreY);
    const touching = dist <= CORE_MODEL.playerBlockRadius + 1;
    if (!touching || dirX * toCoreX + dirY * toCoreY <= 0) return { x: dirX, y: dirY };

    const side = -toCoreY * dirX + toCoreX * dirY >= 0 ? 1 : -1;
    return { x: -toCoreY / dist * side, y: toCoreX / dist * side };
}

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

    const joyMag = Math.hypot(joystick.x, joystick.y);

    if (joyMag > 0) {
        // Analógico: inclinar menos anda mais devagar
        player.x += (joystick.x / joyMag) * Math.min(1, joyMag) * speed * dt;
        player.y += (joystick.y / joyMag) * Math.min(1, joyMag) * speed * dt;
        player.targetX = player.x;
        player.targetY = player.y;
    } else if (moveX !== 0 || moveY !== 0) {
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
            const dir = aroundTorch(dx / dist, dy / dist);
            player.x += dir.x * moveDist;
            player.y += dir.y * moveDist;
        }
    }

    player.x = Math.max(15, Math.min(state.width - 15, player.x));
    player.y = Math.max(15, Math.min(state.height - 15, player.y));

    // A tocha é sólida: nem o herói nem o ponto clicado ficam dentro dela
    const pos = pushOutOfTorch(player.x, player.y);
    player.x = pos.x;
    player.y = pos.y;
    const target = pushOutOfTorch(player.targetX, player.targetY);
    player.targetX = target.x;
    player.targetY = target.y;

    // Atualizar rastro de luz de movimento do herói
    player.trail.unshift({ x: player.x, y: player.y, alpha: 1.0 });
    if (player.trail.length > CHARACTER_MODEL.trailLength) {
        player.trail.pop();
    }
    player.trail.forEach(t => t.alpha -= dt * CHARACTER_MODEL.trailFadePerSecond);
}
