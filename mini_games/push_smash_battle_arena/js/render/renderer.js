import { TEXTS } from '../../data_model/texts.js';
import { H, W, ctx } from '../core/canvas.js';
import { state } from '../core/state.js';
import { players } from '../entities/player.js';
import { drawArena, drawPickups } from './arena.js';
import { drawBlob, snap } from './blob.js';
import { isTouch } from '../ui/touch_controls.js';

export function drawEffects() {
    state.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0, p.radius * p.life), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    });
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
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
            p.trail.forEach(t => {
                ctx.beginPath();
                ctx.arc(t.x, t.y, p.radius * 0.9, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = t.alpha * 0.4;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });
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


