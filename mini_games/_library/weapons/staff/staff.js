import { ctx } from '../../core/canvas.js';
import { add, olimb } from '../../characters/hunter/kit25d.js';

// --- CAJADO ---
// Madeira retorcida: o cabo desce até perto do chão, sobe além da mão e termina numa espiral que segura a esfera laranja.
// hand = mão no cabo, dir = direção do cajado (a "ponta da lâmina" é a semente, a Z.bladeLength da mão).
export function drawStaff(rig, hand, dir, alpha, Z) {
    const { project, limb, ball, C } = rig;
    const at = (d) => add(hand, dir, d);
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat, dir[0] / flat, 0];
    const L = Z.bladeLength;
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    // Cabo com um leve desvio no meio (madeira torta), mais grosso embaixo
    const bend = (d, k) => add(at(d), w, k);
    olimb(rig, [at(-Z.staffBelow), bend(-Z.staffBelow * 0.45, 0.35), at(0)], 0.78, C.wood);
    olimb(rig, [at(0), bend(L * 0.45, -0.4), at(L - 2.2)], 0.66, C.wood);
    limb([at(-Z.staffBelow * 0.9), bend(-Z.staffBelow * 0.4, 0.3), at(L - 3)].map(p => add(p, w, 0.2)), 0.18, C.woodLight);
    // Nó de corda onde a mão segura e uma folha brotando do cabo
    limb([at(-0.9), at(0.9)], 0.95, C.leatherShade);
    olimb(rig, [bend(L * 0.5, -0.5), bend(L * 0.5 + 1.4, -1.9)], 0.5, C.leaf);
    // Espiral: a madeira sobe por um lado, faz a volta por cima da esfera e termina enrolada para dentro
    const seed = at(L);
    const r = Z.seedRadius + 0.75;
    const curl = [at(L - 2.2)];
    for (let k = 0; k <= 9; k++) {
        const a = -Math.PI * 0.85 + k * (Math.PI * 1.75 / 9);
        const rr = r * (1 - k * 0.035);
        curl.push(add(bend(L + Math.sin(a) * rr, -Math.cos(a) * rr), [0, 0, 0], 1));
    }
    olimb(rig, curl, 0.55, C.wood);
    limb(curl.slice(1, 7).map(p => add(p, [0, 0, 0.15], 1)), 0.14, C.woodLight);
    // Esfera: brilho, corpo e miolo claro (pulsa devagar)
    const p = project(...seed);
    const pulse = 1 + 0.08 * Math.sin((rig.anim?.t ?? 0) * 3);
    ctx.fillStyle = C.seedGlow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Z.seedRadius * 1.7 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ball(seed, Z.seedRadius * pulse, C.seed);
    ball(add(seed, [0.2, 0, 0.4], 1), Z.seedRadius * 0.4, C.seedCore);
    ctx.globalAlpha = baseAlpha;
}
