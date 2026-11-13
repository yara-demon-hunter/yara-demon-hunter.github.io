import { ctx } from '../../core/canvas.js';
import { add, cross, norm } from '../../characters/hunter/kit25d.js';

// --- KATANA ---
// Guarda (tsuba): disco perpendicular à espada, no ponto p, com o eixo da espada em dir. A posição ao longo da
// espada vem de guardOffset (+ para o lado da lâmina) e o tamanho de guardSize; a cor é colors.tsuba.
export function drawGuard(rig, p, dir, A) {
    const { disk, C } = rig;
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat, dir[0] / flat, 0];
    const v = norm(cross(dir, w));
    const r = A.guardSize;
    ctx.fillStyle = C.tsuba;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.3;
    disk(p, w.map(x => x * r), v.map(x => x * r));
    ctx.fill();
    ctx.stroke();
}

// Lâmina curva e fina, com cabo trançado e guarda redonda; hand = mão no cabo, dir = direção da lâmina
export function drawKatana(rig, hand, dir, alpha, A, color = null) {
    const { project, limb, ball, C } = rig;
    const at = (d) => add(hand, dir, d);
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat, dir[0] / flat, 0];
    const L = A.bladeLength;
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    if (!color) {
        limb([at(-3.2), at(0.3)], 1.1, C.hilt);
        drawGuard(rig, at(0.7 + A.guardOffset), dir, A);
    }

    // Costas e fio: a lâmina curva para o lado das costas e afina na ponta
    const spine = [];
    const edge = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
        const k = i / steps;
        const p = at(1 + (L - 1) * k);
        const bend = A.bladeCurve * k * k;
        const half = A.bladeWidth / 2 * (1 - 0.45 * k);
        spine.push(project(p[0] - w[0] * (bend + half), p[1] - w[1] * (bend + half), p[2]));
        edge.push(project(p[0] - w[0] * (bend - half), p[1] - w[1] * (bend - half), p[2]));
    }
    const tipPt = add(at(L + 0.8), w, -A.bladeCurve * 1.3);
    const tip = project(...tipPt);
    ctx.fillStyle = color ?? C.blade;
    ctx.beginPath();
    spine.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.lineTo(tip.x, tip.y);
    for (let i = steps; i >= 0; i--) ctx.lineTo(edge[i].x, edge[i].y);
    ctx.closePath();
    ctx.fill();

    if (!color) {
        ctx.strokeStyle = C.bladeCore;
        ctx.lineWidth = 0.35;
        ctx.beginPath();
        edge.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();
    }
    ctx.globalAlpha = baseAlpha;
}
