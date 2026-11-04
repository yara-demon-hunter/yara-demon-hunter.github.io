import { TEXTS } from '../../data_model/texts.js';
import { H, W, ctx } from '../core/canvas.js';
import { state } from '../core/state.js';
import { players } from '../entities/player.js';
import { FX } from '../../data_model/visuals/sprites.js';
import { drawPickups } from './arena.js';
import { drawBlob, drawGhost, snap } from './blob.js';
import { drawGlow, getDustSprite, getStarSprite } from './fx/sprites.js';
import { drawArena } from './scenery.js';
import { isTouch } from '../ui/touch_controls.js';

export function drawEffects() {
    state.particles.forEach(p => {
        const size = Math.max(0, p.radius * p.life) * FX.particleGlowScale;
        if (p.kind === 'dust') {
            ctx.globalAlpha = 0.6 * p.life;
            ctx.drawImage(getDustSprite(), p.x - size, p.y - size, size * 2, size * 2);
            ctx.globalAlpha = 1;
        } else {
            drawGlow(ctx, p.color, p.x, p.y, size, Math.min(1, p.life * 1.4));
        }
    });
    state.rings.forEach(r => {
        const t = 1 - r.life / FX.ring.life;
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = FX.ring.width * (1 - t * 0.7);
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.maxRadius * t, r.maxRadius * t * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
    });
    state.bursts.forEach(b => {
        const t = b.life / FX.star.life;
        const size = b.size * (1.3 - t * 0.5);
        ctx.globalAlpha = Math.min(1, t * 1.5);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.drawImage(getStarSprite(b.color), -size / 2, -size / 2, size, size);
        ctx.restore();
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px "Segoe UI", sans-serif';
    state.popups.forEach(p => {
        ctx.globalAlpha = Math.min(1, p.life / 20);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1;
}

export function render() {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    if (state.cameraShake > 0.5) {
        ctx.translate((Math.random() - 0.5) * state.cameraShake, (Math.random() - 0.5) * state.cameraShake);
    }

    if (state.gameState === 'REPLAY') {
        ctx.translate(W / 2, H / 2);
        ctx.scale(state.replayCam.z, state.replayCam.z);
        ctx.translate(-state.replayCam.x, -state.replayCam.y);
        drawArena();
        state.replayFrames[Math.floor(state.replayIndex)].forEach(drawBlob);
    } else {
        drawArena();
        drawPickups();
        players.forEach(p => {
            const shot = snap(p);
            p.trail.forEach(t => drawGhost(shot, t));
        });
        players.forEach(p => drawBlob(snap(p)));
    }
    drawEffects();
    ctx.restore();

    if (state.gameState === 'REPLAY') {
        ctx.font = 'bold 18px "Segoe UI", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = state.frameCount % 40 < 20 ? '#ff4757' : 'rgba(255,71,87,0.3)';
        ctx.fillText('●', 24, 118);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('REPLAY', 44, 118);
        ctx.textAlign = 'center';
        ctx.font = '13px "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(isTouch ? TEXTS.replaySkipTouch : TEXTS.replaySkipKey, W / 2, H - 40);
    }
}


