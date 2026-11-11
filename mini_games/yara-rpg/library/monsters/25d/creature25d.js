// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/creature25d.js e rode o sync.
import { registerBody } from '../../characters/hunter/body_registry.js';
import { HERO_VISUALS } from '../../characters/hunter/hero_visual.js';
import { ctx } from '../../core/canvas.js';
import { drawGlow } from '../../core/glow.js';

// --- CRIATURAS 2.5D (monstros sem corpo de gente) ---
// O boneco 2.5D (characters/hunter/hero25d.js) foi feito para heróis: pernas, tronco, braços, cabeça. Um morcego ou um
// lobo não tem nada disso. registerCreature registra um boneco em que todas as peças de gente ficam vazias e o
// monstro inteiro é uma lista de peças próprias, { depth, draw }, que o motor ordena e desenha com a câmera do jogo.
// O motor continua cuidando da câmera, do giro, da passada (rig.anim.stride, pose.run) e da sombra no chão.
// Coordenadas locais: a = frente, b = direita, z = altura. pose.t = tempo em segundos.

// O que todo boneco precisa ter, mesmo sem arma nem corpo de gente (junte no <id>25d_visual.js)
export const CREATURE_DEFAULTS = { bladeLength: 6, bladeWidth: 1, glowScale: 0, bodyScale: 1 };
// Cores que o motor espera existir (anel de dano etc.): junte antes das cores do monstro
export const BASE_COLORS = HERO_VISUALS.colors;

const NOTHING = { depth: -1e9, draw() {} };
const ORIGIN = { shoulder: [0, 0, 0], elbow: [0, 0, 0], hand: [0, 0, 0] };

// parts(pose, rig) → lista de peças { depth, draw }. extra: outros ganchos do boneco (ex.: poseTweak)
export function registerCreature(id, vis, parts, extra = {}) {
    registerBody(id, {
        vis,
        drawLeg: () => {},
        drawTorso: () => {},
        drawBack: () => {},
        freeArm: () => ORIGIN,
        drawArm: () => {},
        swordArmPart: () => NOTHING,
        drawn: () => 0,
        headParts: (pose, rig) => parts(pose, rig),
        ...extra
    });
}

// Polígono no 3D (pontos locais) projetado na tela
export function poly(rig, pts, fill, stroke = null, width = 0.4) {
    ctx.beginPath();
    pts.forEach((p, i) => {
        const s = rig.project(...p);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
    });
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }
}

// Brilho num ponto do 3D
export function glowAt(rig, p, color, radius, alpha = 1) {
    const s = rig.project(...p);
    drawGlow(ctx, color, s.x, s.y, radius, alpha);
}

// O ponto está do lado da câmera em relação ao centro? (para olhos, bocas e detalhes que somem de costas)
export function facesCamera(rig, p, center, margin = 0) {
    return rig.project(...p).depth >= rig.project(...center).depth - margin;
}

// Língua de chama da base até a ponta (pontos 3D), em camadas: colors da de fora para a de dentro. wave entorta a ponta
export function flame(rig, base, tip, width, colors, wave = 0) {
    const b = rig.project(...base);
    const tp = rig.project(...tip);
    const dx = tp.x - b.x;
    const dy = tp.y - b.y;
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    colors.forEach((color, i) => {
        const k = 1 - i * 0.3;
        const w = width * k;
        const tx = b.x + dx * k + nx * wave * k;
        const ty = b.y + dy * k + ny * wave * k;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(b.x - nx * w, b.y - ny * w);
        ctx.quadraticCurveTo(b.x - nx * w * 0.9 + dx * 0.45, b.y - ny * w * 0.9 + dy * 0.45, tx, ty);
        ctx.quadraticCurveTo(b.x + nx * w * 0.9 + dx * 0.45, b.y + ny * w * 0.9 + dy * 0.45, b.x + nx * w, b.y + ny * w);
        ctx.closePath();
        ctx.fill();
    });
}

// Desenha com transparência (monstros fantasmagóricos)
export function withAlpha(alpha, fn) {
    const base = ctx.globalAlpha;
    ctx.globalAlpha = base * alpha;
    try {
        fn();
    } finally {
        ctx.globalAlpha = base;
    }
}

// --- PEÇAS PARA MONSTROS COM CORPO DE GENTE ---
// Tronco: quadril, corpo entre quadril e ombros, e o topo dos ombros. bottom/top/wb/wt vêm do gancho drawTorso;
// widen alarga os ombros (monstros de peito largo)
export function trunk(rig, bottom, top, wb, wt, color, outline, widen = 1, topColor = color) {
    const pb = rig.project(bottom.a, 0, bottom.z);
    const pt = rig.project(top.a, 0, top.z);
    const w = wt * widen;
    ctx.fillStyle = color;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 0.45;
    ctx.lineJoin = 'round';
    rig.disk([bottom.a, 0, bottom.z], [bottom.A, 0, 0], [0, bottom.B, 0]);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pb.x - wb, pb.y);
    ctx.lineTo(pt.x - w, pt.y);
    ctx.lineTo(pt.x + w, pt.y);
    ctx.lineTo(pb.x + wb, pb.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = topColor;
    rig.disk([top.a, 0, top.z], [top.A, 0, 0], [0, top.B * widen, 0]);
    ctx.fill();
    ctx.stroke();
}

// Faixa em volta do corpo (cinto, cordão): só a metade da frente do anel de raios A (frente) e B (lados)
export function frontArc(rig, a, z, A, B, width, color) {
    const pts = [];
    for (let j = 0; j <= 10; j++) {
        const phi = -Math.PI / 2 + (j / 10) * Math.PI;
        pts.push([a + A * Math.cos(phi), B * Math.sin(phi), z]);
    }
    rig.limb(pts, width, color);
}

// Montante: cabo, guarda, lâmina larga com fio claro e ponta. colors: { blade, edge, guard, grip, dark }
export function greatsword(rig, hand, dir, length, width, colors) {
    const at = (d) => [hand[0] + dir[0] * d, hand[1] + dir[1] * d, hand[2] + dir[2] * d];
    const flat = Math.hypot(dir[0], dir[1]);
    const side = flat > 0.05 ? [-dir[1] / flat, dir[0] / flat, 0] : [0, 1, 0];
    rig.limb([at(-2.6), at(0.6)], 1.3, colors.grip);
    rig.ball(at(-2.8), 0.9, colors.guard);
    const g = at(1);
    rig.limb([[g[0] - side[0] * width * 1.5, g[1] - side[1] * width * 1.5, g[2]], [g[0] + side[0] * width * 1.5, g[1] + side[1] * width * 1.5, g[2]]], 1.2, colors.guard);
    rig.limb([at(1.2), at(length - width)], width + 0.5, colors.dark);
    rig.limb([at(length - width * 1.2), at(length)], width * 0.55 + 0.4, colors.dark);
    rig.limb([at(1.2), at(length - width)], width, colors.blade);
    rig.limb([at(length - width * 1.2), at(length)], width * 0.55, colors.blade);
    rig.limb([at(1.6), at(length - width)], width * 0.28, colors.edge);
    return at(length);
}

// Corrente de pontos desenhada afinando (caudas, chifres): w0 na raiz, w1 na ponta, com contorno
export function taper(rig, chain, w0, w1, color, outline) {
    const n = chain.length - 1;
    if (outline) for (let i = 0; i < n; i++) rig.limb([chain[i], chain[i + 1]], w0 + (w1 - w0) * (i / n) + 0.5, outline);
    for (let i = 0; i < n; i++) rig.limb([chain[i], chain[i + 1]], w0 + (w1 - w0) * (i / n), color);
}
