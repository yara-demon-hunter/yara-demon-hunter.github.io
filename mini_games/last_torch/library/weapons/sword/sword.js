// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/sword/sword.js e rode o sync.
import { ctx } from '../../core/canvas.js';

// --- ESPADA (a lâmina do Demon Hunter) ---
// Lâmina 3D: plana na horizontal, com cabo, guarda, fio brilhante e runas que acendem em onda.
// hand = mão no cabo, dir = direção da lâmina, t = tempo (as runas), alpha = opacidade. Medidas: { bladeLength, bladeWidth, runeCount }
// (vêm do boneco: hunter/hero25d_visual.js e os Juramentos que mudam o tamanho). Cores: C.blade, C.bladeCore, C.runes, C.glove, C.buckle.
export function drawSword(rig, hand, dir, t, alpha, { bladeLength, bladeWidth, runeCount }) {
    const { project, limb, C } = rig;
    const at = (d) => [hand[0] + dir[0] * d, hand[1] + dir[1] * d, hand[2] + dir[2] * d];
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat * bladeWidth / 2, dir[0] / flat * bladeWidth / 2, 0];
    const side = (p, k) => project(p[0] + w[0] * k, p[1] + w[1] * k, p[2]);
    const base = at(0.8);
    const shoulderPt = at(bladeLength - 3);
    const tip = project(...at(bladeLength));

    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    limb([at(-3), hand], 1.8, C.glove);
    limb([[base[0] - w[0] * 1.8, base[1] - w[1] * 1.8, base[2]], [base[0] + w[0] * 1.8, base[1] + w[1] * 1.8, base[2]]], 1.1, C.buckle);

    const corners = [side(base, -1), side(shoulderPt, -1), tip, side(shoulderPt, 1), side(base, 1)];
    ctx.fillStyle = C.blade;
    ctx.beginPath();
    corners.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();

    limb([at(1.5), at(bladeLength - 2.5)], 0.7, C.bladeCore);

    // Runas que acendem em onda ao longo do gume
    ctx.fillStyle = C.runes;
    for (let i = 0; i < runeCount; i++) {
        const p = project(...at(3 + i * ((bladeLength - 7) / (runeCount - 1))));
        ctx.globalAlpha = baseAlpha * alpha * (0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - i * 1.2)));
        ctx.fillRect(p.x - 0.6, p.y - 0.5, 1.2, 1);
    }
    ctx.globalAlpha = baseAlpha;
}
