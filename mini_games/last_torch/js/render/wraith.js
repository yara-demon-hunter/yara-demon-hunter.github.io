import { WRAITH_VISUALS as V } from '../../data_model/visuals/monsters/wraith_visual.js';
import { ctx } from '../core/state.js';
import { renderNow } from './fx/clock.js';
import { drawGlow } from './fx/glow.js';

// --- ESPECTRO (desenho procedural, sem imagens) ---
// Vista de cima; no sistema local +x é a frente. Mirando ele brilha; disparando, os fiapos esticam.
export function renderWraith(e) {
    const c = V.colors;
    const t = renderNow() / 1000;
    const r = e.radius * V.scale;
    const aiming = e.lungeState === 1;
    const lunging = e.lungeState === 2;
    const float = e.baking ? 0 : Math.sin(t * V.floatHz * Math.PI * 2 + e.phase) * r * V.floatAmount;
    const facing = lunging ? Math.atan2(e.lungeY, e.lungeX) : e.angle;

    if (!e.baking) drawGlow(ctx, aiming ? c.aimAura : c.aura, e.x, e.y, r * V.auraRadius, aiming ? 0.5 : V.auraAlpha);

    ctx.save();
    ctx.translate(e.x, e.y - float);
    ctx.rotate(facing);
    ctx.globalAlpha *= V.alpha;

    // Fiapos do manto, ondulando para trás
    const length = r * V.wispLength * (lunging ? 2.1 : 1);
    ctx.strokeStyle = c.wisp;
    ctx.lineCap = 'round';
    for (let i = 0; i < V.wisps; i++) {
        const k = i / (V.wisps - 1) - 0.5;
        const y0 = k * r * 1.1;
        const wave = Math.sin(t * V.wispHz * Math.PI * 2 + i * 1.7 + e.phase) * r * V.wispWave;
        ctx.lineWidth = Math.max(1, r * (0.22 - Math.abs(k) * 0.12));
        ctx.beginPath();
        ctx.moveTo(-r * 0.2, y0);
        ctx.quadraticCurveTo(-length * 0.55, y0 + wave, -length, y0 * 0.6 - wave * 0.6);
        ctx.stroke();
    }

    // Manto e capuz
    ctx.fillStyle = c.cloak;
    ctx.beginPath();
    ctx.ellipse(-r * 0.12, 0, r * 0.62, r * 0.66, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.cloakLight;
    ctx.beginPath();
    ctx.arc(r * 0.16, 0, r * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(r * 0.3, 0, r * 0.26, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olhos frios
    [1, -1].forEach(side => {
        drawGlow(ctx, c.eyeGlow, r * 0.38, side * r * 0.14, r * 0.26, 0.9);
        ctx.fillStyle = c.eye;
        ctx.beginPath();
        ctx.arc(r * 0.38, side * r * 0.14, r * 0.07, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}
