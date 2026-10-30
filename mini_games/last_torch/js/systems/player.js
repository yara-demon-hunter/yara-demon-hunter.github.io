import { CHARACTER_MODEL } from '../../data_model/character.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { audio, joystick, keys, player, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { updateHUD } from '../ui/hud.js';
import { moveDash } from './dash.js';
import { addNumber, addShockwave, createExplosion, registerPlayerHit, screenFlash, shakeScreen, slowMotion } from './effects.js';
import { mod } from './modifiers.js';
import { beginDeath } from './night.js';
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

// --- DANO NO HERÓI ---
// Contato e tiros passam por aqui. Devolve false se o golpe não pegou (invulnerável).
export function hurtPlayer(amount, fromX, fromY, invulnerableSeconds) {
    if (player.iFrames > 0 || state.phase !== 'HUNT') return false;
    const damage = amount * Math.max(0.1, 1 + mod('damageTaken'));
    player.hp -= damage;
    player.iFrames = invulnerableSeconds;
    registerPlayerHit(fromX, fromY);
    createExplosion(player.x, player.y, '#f43f5e', 12);
    addNumber(player.x, player.y - 40, damage, -1, 'hurt');
    shakeScreen(6);
    audio.playHurt();
    if (player.hp <= 0) heroDown();
    updateHUD();
    return true;
}

// Com um Last Prayer sobrando o herói levanta; senão, a noite acaba
function heroDown() {
    if (state.revives <= 0) {
        player.hp = 0;
        beginDeath('PLAYER');
        return;
    }
    state.revives--;
    state.run.revivesUsed++;
    player.hp = player.maxHp * 0.5;
    player.iFrames = 2.5;
    state.enemyProjectiles.length = 0;
    state.enemies.forEach(e => {
        const a = Math.atan2(e.y - player.y, e.x - player.x);
        if (!e.isBoss) {
            e.vx += Math.cos(a) * 900;
            e.vy += Math.sin(a) * 900;
        }
    });
    slowMotion(0.3, 0.8);
    screenFlash('#fef3c7', 0.7);
    addShockwave(player.x, player.y, { radius: 420, color: '#fde68a', width: 10, seconds: 0.7 });
    showBanner('', 'NOT YET', 'The prayer is answered', 'gold');
    audio.playRevive();
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

    if (player.dashTimer > 0) {
        moveDash(dt);
    } else if (joyMag > 0) {
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
    player.y = Math.max(CHARACTER_MODEL.topMargin, Math.min(state.height - 15, player.y));

    // A tocha é sólida: nem o herói nem o ponto clicado ficam dentro dela
    const pos = pushOutOfTorch(player.x, player.y);
    player.x = pos.x;
    player.y = pos.y;
    const target = pushOutOfTorch(player.targetX, player.targetY);
    player.targetX = target.x;
    player.targetY = target.y;

    // Atualizar rastro de luz de movimento do herói: reaproveita o ponto mais antigo
    const { trail } = player;
    const point = trail.length >= CHARACTER_MODEL.trailLength ? trail.pop() : {};
    point.x = player.x;
    point.y = player.y;
    point.alpha = 1;
    trail.unshift(point);
    for (const t of trail) t.alpha -= dt * CHARACTER_MODEL.trailFadePerSecond;
}
