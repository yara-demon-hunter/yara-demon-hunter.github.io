import { BLOATER_VISUALS as V } from '../../data_model/visuals/monsters/bloater_visual.js';
import { ctx } from '../core/state.js';
import { renderNow } from './fx/clock.js';
import { drawGlow } from './fx/glow.js';

// --- INCHADO (desenho procedural, sem imagens) ---
// Vista de cima; no sistema local +x é a frente. Pulsa mais rápido conforme perde vida:
// o jogador lê de longe que aquilo vai estourar.
export function renderBloater(e) {
    const c = V.colors;
    const t = renderNow() / 1000;
    const r = e.radius * V.scale;
    const hurt = 1 - Math.max(0, e.hp / e.maxHp);
    const hz = V.pulseHz + (V.pulseHzLowHp - V.pulseHz) * hurt;
    const pulse = 1 + Math.sin(t * hz * Math.PI * 2 + e.phase) * V.pulseAmount * (1 + hurt);

    if (!e.baking) {
        drawGlow(ctx, c.aura, e.x, e.y, r * V.auraRadius * pulse, V.auraAlpha + hurt * 0.2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(e.x + r * 0.1, e.y + r * 0.34, r * 1.02, r * 0.56, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    ctx.scale(pulse, pulse);

    // Bracinhos curtos
    ctx.strokeStyle = c.skinDark;
    ctx.lineWidth = r * 0.2;
    ctx.lineCap = 'round';
    [1, -1].forEach(side => {
        const swing = Math.sin(t * hz * Math.PI * 2 + e.phase + side) * r * 0.1;
        ctx.beginPath();
        ctx.moveTo(r * 0.2, side * r * 0.82);
        ctx.lineTo(r * 0.7 + swing, side * r * 0.86);
        ctx.stroke();
    });

    // Corpo
    ctx.fillStyle = c.skinDark;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(-r * 0.06, -r * 0.05, r * 0.88, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.skinLight;
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.28, r * 0.42, r * 0.26, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Bolsas de gás brilhando
    for (let i = 0; i < V.sacCount; i++) {
        const a = (i / V.sacCount) * Math.PI * 2 + 0.7;
        const d = r * (0.42 + (i % 2) * 0.24);
        const sac = r * (0.14 + (i % 3) * 0.05) * (1 + Math.sin(t * hz * 3 + i) * 0.14);
        const sx = Math.cos(a) * d - r * 0.1;
        const sy = Math.sin(a) * d;
        drawGlow(ctx, c.sacGlow, sx, sy, sac * 2.2, 0.55 + hurt * 0.4);
        ctx.fillStyle = c.sac;
        ctx.beginPath();
        ctx.arc(sx, sy, sac, 0, Math.PI * 2);
        ctx.fill();
    }

    // Boca costurada e olhos miúdos, na frente
    ctx.strokeStyle = c.stitch;
    ctx.lineWidth = Math.max(0.8, r * 0.06);
    ctx.beginPath();
    ctx.moveTo(r * 0.68, -r * 0.3);
    ctx.quadraticCurveTo(r * 0.84, 0, r * 0.68, r * 0.3);
    ctx.stroke();
    for (let i = -2; i <= 2; i++) {
        const y = i * r * 0.11;
        ctx.beginPath();
        ctx.moveTo(r * 0.7, y);
        ctx.lineTo(r * 0.84, y);
        ctx.stroke();
    }
    ctx.fillStyle = c.eye;
    [1, -1].forEach(side => {
        ctx.beginPath();
        ctx.arc(r * 0.46, side * r * 0.2, r * 0.065, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}
