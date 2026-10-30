import { MOTH_VISUALS as V } from '../../data_model/visuals/monsters/moth_visual.js';
import { ctx } from '../core/state.js';
import { renderNow } from './fx/clock.js';
import { drawGlow } from './fx/glow.js';

// --- MARIPOSA DE CINZAS (desenho procedural, sem imagens) ---
// Vista de cima; no sistema local +x é a frente e +y é o lado direito.
function drawWing(r, side, open) {
    const c = V.colors;
    const span = r * (V.flapMin + (1 - V.flapMin) * open);

    // Asa de trás, menor
    ctx.fillStyle = c.wing;
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, side * r * 0.12);
    ctx.quadraticCurveTo(-r * 1.0, side * span * 0.9, -r * 0.75, side * span * 0.28);
    ctx.quadraticCurveTo(-r * 0.6, side * r * 0.1, -r * 0.15, side * r * 0.12);
    ctx.fill();

    // Asa da frente, com a ponta larga
    ctx.fillStyle = c.wingLight;
    ctx.strokeStyle = c.wingEdge;
    ctx.lineWidth = Math.max(0.6, r * 0.07);
    ctx.beginPath();
    ctx.moveTo(r * 0.2, side * r * 0.12);
    ctx.quadraticCurveTo(r * 0.5, side * span * 1.2, -r * 0.4, side * span * 1.35);
    ctx.quadraticCurveTo(-r * 0.55, side * span * 0.6, -r * 0.2, side * r * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Olho desenhado na asa
    const ex = -r * 0.1;
    const ey = side * span * 0.82;
    ctx.fillStyle = c.eyeRing;
    ctx.beginPath();
    ctx.arc(ex, ey, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.arc(ex, ey, r * 0.11, 0, Math.PI * 2);
    ctx.fill();
}

export function renderMoth(e) {
    const c = V.colors;
    const t = renderNow() / 1000;
    const r = e.radius * V.scale;
    const flap = 0.5 + 0.5 * Math.sin(t * V.flapHz * Math.PI * 2 + e.phase);
    const wobble = e.baking ? 0 : Math.sin(t * V.wobbleHz * Math.PI * 2 + e.phase) * V.wobbleAmount;

    if (!e.baking) {
        drawGlow(ctx, c.aura, e.x, e.y, r * V.auraRadius, V.auraAlpha);

        // Rastro de cinzas em brasa
        ctx.fillStyle = c.ember;
        for (let i = 0; i < V.embers; i++) {
            const p = (t * 1.4 + i / V.embers + e.phase) % 1;
            ctx.globalAlpha = (1 - p) * 0.7;
            ctx.beginPath();
            ctx.arc(e.x - Math.cos(e.angle) * r * (0.6 + p * 1.8) + Math.sin(t * 9 + i) * 3,
                e.y - Math.sin(e.angle) * r * (0.6 + p * 1.8) + Math.cos(t * 7 + i) * 3, 1.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle + wobble);

    drawWing(r, 1, flap);
    drawWing(r, -1, flap);

    // Corpo peludo e antenas
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, 0, r * 0.52, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.fuzz;
    ctx.beginPath();
    ctx.ellipse(r * 0.22, 0, r * 0.2, r * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.fuzz;
    ctx.lineWidth = Math.max(0.5, r * 0.05);
    [1, -1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(r * 0.36, side * r * 0.06);
        ctx.quadraticCurveTo(r * 0.72, side * r * 0.14, r * 0.78, side * r * 0.42);
        ctx.stroke();
    });

    ctx.restore();
}
