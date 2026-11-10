import { SKILLS_VISUALS } from '../../data_model/visuals/effects/skills_visual.js';
import { ctx } from '../core/state.js';
import { drawGlow } from '../../library/core/glow.js';

const F = SKILLS_VISUALS.fire;

// Língua de fogo subindo de (x, y). seed separa o tremor de cada uma.
export function drawFlameTongue(x, y, size, t, seed, hot = false) {
    const flicker = 0.75 + 0.25 * Math.sin(t * 13 + seed * 2.7);
    const height = size * 2.1 * flicker;
    const sway = Math.sin(t * 9 + seed) * size * 0.35;
    const layer = (scale, color) => {
        const w = size * 0.62 * scale;
        const h = height * scale;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - w, y);
        ctx.quadraticCurveTo(x - w * 0.8, y - h * 0.55, x + sway * scale, y - h);
        ctx.quadraticCurveTo(x + w * 0.8, y - h * 0.55, x + w, y);
        ctx.quadraticCurveTo(x, y + w * 0.9, x - w, y);
        ctx.fill();
    };
    layer(1, hot ? F.hotOuter : F.outer);
    layer(0.68, hot ? F.hotMid : F.mid);
    layer(0.36, F.core);
}

// Bola de fogo: núcleo claro, chama em volta e cauda para trás de `angle`
export function drawFireOrb(x, y, radius, t, angle = -Math.PI / 2, tail = 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, F.glow, x, y, radius * 3, 0.8);
    ctx.restore();
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    for (let i = F.orbTail; i >= 1; i--) {
        const k = i / F.orbTail;
        const wobble = Math.sin(t * 20 + i) * radius * 0.2;
        ctx.globalAlpha = (1 - k) * 0.75 * Math.min(1, tail);
        ctx.fillStyle = k > 0.5 ? F.outer : F.mid;
        ctx.beginPath();
        ctx.arc(x - dx * k * radius * 3.4 * tail - dy * wobble, y - dy * k * radius * 3.4 * tail + dx * wobble, radius * (1 - k * 0.65), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    [[1, F.outer], [0.72, F.mid], [0.4, F.core]].forEach(([k, color]) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius * k * (0.94 + 0.06 * Math.sin(t * 17)), 0, Math.PI * 2);
        ctx.fill();
    });
}
