import { drawGlow } from '../../library/core/glow.js';
import { FEATHER_RAIN, RAVEN_DECOY } from '../../data_model/passives.js';
import { ctx, player, state } from '../core/state.js';

// --- FEATHER DODGE (js/systems/skills_shadow.js, tryFeatherDodge) ---
// Penas de corvo no ar (state.feathers) e, enquanto o herói está intocável, um anel de penas girando em volta dele. Só caminhos de canvas, sem sprite.
const TAU = Math.PI * 2;
const TONES = [['#1e1b4b', '#a78bfa'], ['#312e81', '#c4b5fd'], ['#4c1d95', '#ddd6fe']];
const RING = 10;

function feather(x, y, rot, size, tone, alpha) {
    const [body, edge] = TONES[tone % 3];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = body;
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.quadraticCurveTo(-size * 0.2, -size * 0.55, size, 0);
    ctx.quadraticCurveTo(-size * 0.2, size * 0.55, -size, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 1.1, 0);
    ctx.lineTo(size * 0.8, 0);
    ctx.stroke();
    ctx.restore();
}

export function renderFeathers() {
    const dodge = state.featherDodge;
    const d = state.decoy;
    if (d) {
        const k = d.age / d.seconds, pulse = 0.5 + 0.5 * Math.sin(state.runTime * 14);
        drawGlow(ctx, '#a78bfa', d.x, d.y - 12, 26 + pulse * 6, 0.3 + k * 0.3);
        ctx.save();
        ctx.strokeStyle = '#a78bfa'; ctx.globalAlpha = 0.25 + k * 0.5; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(d.x, d.y, RAVEN_DECOY.radius * k, RAVEN_DECOY.radius * k * 0.5, 0, 0, TAU); ctx.stroke();
        ctx.restore();
        // pena deitada no chão, com uma exclamação vermelha pulsando em cima
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.scale(1, 0.55);
        feather(0, 0, -0.35, 22, 1, 1);
        ctx.restore();
        const bob = Math.sin(state.runTime * 9) * 2;
        ctx.save();
        ctx.translate(d.x, d.y - 34 + bob);
        ctx.scale(1.5 + pulse * 0.15, 1.5 + pulse * 0.15);
        ctx.fillStyle = '#dc2626'; ctx.strokeStyle = '#fee2e2'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-3.2, -9); ctx.lineTo(3.2, -9); ctx.lineTo(1.8, 2); ctx.lineTo(-1.8, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 6, 2.1, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.restore();
    }
    const list = state.feathers;
    for (const q of state.quills) {
        const t = q.age - q.delay;
        if (t < 0) continue;
        if (!q.hit) {
            const k = t / q.fall, e = q.target;
            feather(e.x + q.ox, e.y + q.oy - (1 - k) * 170, Math.PI / 2 + Math.sin(q.ox) * 0.2, 8, 1, Math.min(1, k * 3));
        } else {
            // fincada no chão: a ponta no ponto de impacto, levemente torta, some nos últimos 0,4 s
            const left = FEATHER_RAIN.stuckSeconds - (t - q.fall);
            feather(q.x, q.y - 7, Math.PI / 2 + Math.sin(q.ox) * 0.2, 8, 1, Math.max(0, Math.min(1, left / 0.4)));
        }
    }
    if (!dodge && list.length === 0) return;
    for (const f of list) {
        const left = 1 - f.age / f.life;
        feather(f.x, f.y, f.rot, f.size, f.tone, Math.min(1, left * 1.6));
    }
    if (dodge) {
        const k = 1 - dodge.age / dodge.seconds;
        for (let i = 0; i < RING; i++) {
            const a = (i / RING) * TAU + state.runTime * 6;
            const r = 20 + Math.sin(state.runTime * 5 + i) * 2;
            feather(player.x + Math.cos(a) * r, player.y - 14 + Math.sin(a) * r * 0.5, a + Math.PI / 2, 5.5, i, Math.min(1, k * 1.5));
        }
    }
}
