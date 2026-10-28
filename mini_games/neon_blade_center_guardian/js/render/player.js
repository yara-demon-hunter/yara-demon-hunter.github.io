import { CHARACTER_MODEL } from '../../data_model/character.js';
import { ctx, player, state } from '../core/state.js';

// --- HERÓI ---
// Render do Rastro de Luz de Movimento do Herói
export function renderPlayerTrail() {
    for (let i = 0; i < player.trail.length; i++) {
        const pt = player.trail[i];
        if (pt.alpha <= 0) continue;
        ctx.save();
        const trailRadius = Math.max(2, 11 * (1 - i / player.trail.length));
        ctx.globalAlpha = Math.max(0, pt.alpha * (1 - i / player.trail.length) * 0.5);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, trailRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export function renderPlayer() {
    const frenzyActive = state.frenzyActiveTimer > 0;

    ctx.save();
    ctx.shadowBlur = frenzyActive ? 25 : 15;
    ctx.shadowColor = frenzyActive ? '#e879f9' : player.doubleDmgTimer > 0 ? '#f59e0b' : '#38bdf8';
    ctx.fillStyle = player.iFrames > 0
        && Math.floor(performance.now() / CHARACTER_MODEL.damageImmunityFlashIntervalMs) % 2 === 0
        ? '#ffffff'
        : ctx.shadowColor;

    ctx.beginPath();
    ctx.arc(player.x, player.y, CHARACTER_MODEL.collisionRadius, 0, Math.PI * 2);
    ctx.fill();

    // Escudo Visual
    if (player.shieldTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, CHARACTER_MODEL.shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}
