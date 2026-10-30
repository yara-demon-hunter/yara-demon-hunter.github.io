import { DASH_SKILL } from '../../data_model/skills.js';
import { getPowerLevel } from '../../data_model/powers.js';
import { audio, joystick, keys, player, powers, state } from '../core/state.js';
import { chargeUlt } from './combat.js';
import { dealDamage } from './damage.js';
import { addFloater, createExplosion, hitStop, slowMotion } from './effects.js';
import { bumpStat } from './sanctuary.js';
import { getAtkDamage, getDashCharges, getDashCooldown } from './stats.js';

// --- DASH ---
// Esquiva curta e invulnerável, com cargas. Vai para onde o jogador está indo; parado, para onde
// o mouse aponta ou o herói olha. Esquivar no último instante recompensa com Fúria.
const PERFECT_DISTANCE = 48;
const PERFECT_FURY = 14;

export function resetDash() {
    player.dashCharges = getDashCharges();
    player.dashRecharge = 0;
    player.dashTimer = 0;
}

function getDashDirection() {
    let x = joystick.x;
    let y = joystick.y;
    if (!x && !y) {
        if (keys['KeyW'] || keys['ArrowUp']) y -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) y += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) x -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) x += 1;
    }
    if (!x && !y) {
        x = state.knifeInput.x - player.x;
        y = state.knifeInput.y - player.y;
    }
    if (Math.hypot(x, y) < 1) {
        x = Math.cos(player.angle);
        y = Math.sin(player.angle);
    }
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
}

// Tiro ou investida muito perto no instante do dash
function isNearMiss() {
    const near = (o) => Math.hypot(o.x - player.x, o.y - player.y) < PERFECT_DISTANCE;
    return state.enemyProjectiles.some(p => !p.reflected && near(p))
        || state.enemies.some(e => e.lungeState === 2 && near(e));
}

export function tryDash() {
    if (state.gameState !== 'PLAYING' || (state.phase !== 'HUNT' && state.phase !== 'CLEAR')) return;
    if (player.dashCharges <= 0 || player.dashTimer > 0) return;

    const dir = getDashDirection();
    player.dashCharges--;
    if (player.dashRecharge <= 0) player.dashRecharge = getDashCooldown();
    player.dashTimer = DASH_SKILL.seconds;
    player.dashX = dir.x;
    player.dashY = dir.y;
    player.dashStruck = null;
    player.iFrames = Math.max(player.iFrames, DASH_SKILL.invulnerableSeconds);
    audio.playDash();

    if (isNearMiss()) {
        addFloater(player.x, player.y - 46, 'PERFECT DODGE', '#67e8f9');
        chargeUlt(PERFECT_FURY);
        hitStop(0.05);
        slowMotion(0.4, 0.3);
        audio.playPerfect();
        bumpStat('perfectDodges');
    }
}

// Avanço do dash (chamado no lugar do movimento normal, em js/systems/player.js)
export function moveDash(dt) {
    const speed = DASH_SKILL.distance / DASH_SKILL.seconds;
    const step = Math.min(dt, player.dashTimer) * speed;
    player.x += player.dashX * step;
    player.y += player.dashY * step;
    player.dashTimer -= dt;
    player.targetX = player.x;
    player.targetY = player.y;

    const spacing = DASH_SKILL.distance / DASH_SKILL.ghosts;
    const last = state.dashGhosts[state.dashGhosts.length - 1];
    if (!last || Math.hypot(last.x - player.x, last.y - player.y) >= spacing) {
        state.dashGhosts.push({ x: player.x, y: player.y, age: 0, seconds: 0.3 });
    }

    // Phantom Rush: o dash corta o que estiver no caminho
    const level = getPowerLevel(powers.phantomDash);
    if (!level) return;
    state.enemies.forEach(e => {
        if (player.dashStruck?.has(e) || Math.hypot(e.x - player.x, e.y - player.y) > e.radius + 26) return;
        (player.dashStruck ??= new Set()).add(e);
        const a = Math.atan2(player.dashY, player.dashX);
        dealDamage(e, getAtkDamage() * level.damage, { kbX: Math.cos(a) * 200, kbY: Math.sin(a) * 200 });
        createExplosion(e.x, e.y, '#67e8f9', 5);
    });
}

// Recarga das cargas
export function updateDash(dt) {
    const max = getDashCharges();
    if (player.dashCharges >= max) {
        player.dashRecharge = 0;
        return;
    }
    player.dashRecharge -= dt;
    if (player.dashRecharge <= 0) {
        player.dashCharges++;
        player.dashRecharge = player.dashCharges < max ? getDashCooldown() : 0;
    }
}
