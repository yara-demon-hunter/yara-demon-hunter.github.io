import { ctx } from '../../core/canvas.js';
import { add } from '../../characters/hunter/kit25d.js';

// --- ADAGA ---
// Lâmina curta, reta e pontuda, guarda pequena de ferro e cabo de couro. hand = mão no cabo, dir = direção da lâmina.
export function drawDagger(rig, hand, dir, alpha, Z) {
    const { project, limb, ball, C } = rig;
    const at = (d) => add(hand, dir, d);
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat, dir[0] / flat, 0];
    const L = Z.bladeLength;
    const half = Z.bladeWidth / 2;
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    limb([at(-1.6), at(0.1)], 0.85, C.grip);
    ball(at(-1.75), 0.42, C.guard);
    limb([add(at(0.35), w, -0.85), add(at(0.35), w, 0.85)], 0.55, C.guard);

    const side = (d, k) => project(...add(at(d), w, k));
    const tip = project(...at(L));
    const shape = [side(0.6, -half), side(L - 1.4, -half * 0.85), tip, side(L - 1.4, half * 0.85), side(0.6, half)];
    ctx.fillStyle = C.blade;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.22;
    ctx.beginPath();
    shape.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    limb([at(1), at(L - 1.6)], 0.25, C.bladeCore);
    ctx.globalAlpha = baseAlpha;
}
