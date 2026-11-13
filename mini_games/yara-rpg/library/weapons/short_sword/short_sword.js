// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/short_sword/short_sword.js e rode o sync.
import { ctx } from '../../core/canvas.js';
import { add } from '../../characters/hunter/kit25d.js';

// --- ESPADA CURTA ---
// Lâmina reta e larga, cabo de couro, guarda e pomo de metal escuro. hand = mão no cabo, dir = direção da lâmina.
export function drawShortSword(rig, hand, dir, alpha, Y) {
    const { project, limb, ball, C } = rig;
    const at = (d) => add(hand, dir, d);
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat, dir[0] / flat, 0];
    const L = Y.bladeLength;
    const half = Y.bladeWidth / 2;
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    limb([at(-2), at(0.2)], 1, C.leather);
    ball(at(-2.2), 0.55, C.metal);
    limb([add(at(0.5), w, -1.3), add(at(0.5), w, 1.3)], 0.7, C.metal);

    const side = (d, k) => project(...add(at(d), w, k));
    const tip = project(...at(L));
    const shape = [side(0.8, -half), side(L - 1.8, -half * 0.9), tip, side(L - 1.8, half * 0.9), side(0.8, half)];
    ctx.fillStyle = C.blade;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.25;
    ctx.beginPath();
    shape.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    limb([at(1.3), at(L - 2.2)], 0.35, C.bladeCore);
    ctx.globalAlpha = baseAlpha;
}
