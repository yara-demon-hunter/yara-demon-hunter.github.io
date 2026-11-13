import { ctx } from '../../core/canvas.js';
import { add, norm, olimb, sub } from '../../characters/hunter/kit25d.js';

// --- MACHADO DE DUAS LÂMINAS ---
// Cabo comprido de madeira e cabeça de ferro dupla (em forma de borboleta) na ponta, presa por uma amarração.
// hand = mão de baixo no cabo, dir = direção do cabo (do cabo para a cabeça). As lâminas ficam no plano que contém o
// cabo e uma direção entre a vertical e o lado (mostram largura de qualquer ângulo).
export function drawAxe(rig, hand, dir, alpha, O) {
    const { project, limb, C } = rig;
    const at = (d) => add(hand, dir, d);
    const L = O.bladeLength;
    const S = O.axeHeadSize;
    // Lâminas de pé (no plano do cabo com a vertical), como nas imagens; com o cabo em pé, ficam para os lados
    const side = norm([-dir[1], dir[0], 0]);
    let up = sub([0, 0, 1], dir.map(v => v * dir[2]));
    const perp = Math.hypot(...up) < 0.45 ? side : norm(up);
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    // Cabo
    olimb(rig, [at(-2.6), at(L + 0.3)], 0.75, C.haft);
    limb([at(-2.4), at(L - 2)].map(p => add(p, perp, 0.15)), 0.22, C.haftShade);
    // Cabeça dupla: uma lâmina para cada lado do cabo, mais larga no fio (curvo)
    const hc = L - 1.1;
    for (const s of [-1, 1]) {
        const q = (d, k) => project(...add(at(hc + d), perp, s * k));
        const shape = [q(-0.8, 0.35), q(-2.3, S * 0.95), q(-0.35, S * 1.1), q(1.6, S * 0.95), q(0.7, 0.35)];
        ctx.fillStyle = C.axeHead;
        ctx.strokeStyle = C.outline;
        ctx.lineWidth = 0.3;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(shape[0].x, shape[0].y);
        ctx.lineTo(shape[1].x, shape[1].y);
        ctx.quadraticCurveTo(shape[2].x, shape[2].y, shape[3].x, shape[3].y);
        ctx.lineTo(shape[4].x, shape[4].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Meio mais escuro e fio claro
        const m = [q(-0.6, 0.4), q(-1.45, S * 0.6), q(0.85, S * 0.6), q(0.5, 0.4)];
        ctx.fillStyle = C.axeDark;
        ctx.beginPath();
        m.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = C.axeEdge;
        ctx.lineWidth = 0.32;
        ctx.beginPath();
        const e1 = q(-2.1, S * 0.92);
        const e2 = q(-0.35, S * 1.05);
        const e3 = q(1.45, S * 0.92);
        ctx.moveTo(e1.x, e1.y);
        ctx.quadraticCurveTo(e2.x, e2.y, e3.x, e3.y);
        ctx.stroke();
    }
    // Amarração no encaixe
    limb([at(hc - 0.85), at(hc + 0.7)], 1.0, C.binding);
    limb([at(hc - 0.1), at(hc + 0.1)], 1.05, C.haftShade);
    ctx.globalAlpha = baseAlpha;
}
