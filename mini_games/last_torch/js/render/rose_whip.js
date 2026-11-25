import { ROSE_WHIP } from '../../data_model/passives.js';
import { ctx, passives, player, state } from '../core/state.js';
import { drawRose } from '../../library/weapons/rose/rose.js';
import { drawGlow } from '../../library/core/glow.js';

// --- ROSE WHIP (js/systems/skills_nature.js, updateRoseWhip) ---
// Um chicote de espinhos com uma rosa na ponta: o cabo, perto da mão, é grosso e cheio de espinhos; o resto é um caule verde mais fino com espinhos
// menores, e a flor (a mesma rosa de arremesso da biblioteca) fecha a ponta. Em voo estala em onda até o monstro; enrolado, dá voltas em espiral
// em volta dele e a rosa descansa no topo. Só traços e a rosa da biblioteca (nada de sprite novo).
const TAU = Math.PI * 2;
const C = { handle: '#3b2412', handleLight: '#5a3a1e', vine: '#2f6b2a', vineLight: '#4f9a3a', thorn: '#7f1d1d', thornLight: '#fda4af' };

// Pontos do chicote de (x0, y0) a (x1, y1): uma curva com sag (cai no meio) e uma onda que anda
function whipPoints(x0, y0, x1, y1, sag, wave, n = 16) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const pts = [];
    for (let i = 0; i <= n; i++) {
        const k = i / n;
        const w = Math.sin(k * Math.PI) * wave * Math.sin(k * 9 - state.runTime * 18);
        pts.push({ x: x0 + dx * k + nx * w, y: y0 + dy * k + ny * w + Math.sin(k * Math.PI) * sag });
    }
    return pts;
}

// Desenha a corda de pontos: grossa e escura no começo (o cabo), fina e verde depois; espinhos dos dois lados
function strokeVine(pts, thick = 1) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < pts.length; i++) {
        const k = i / (pts.length - 1);
        const isHandle = k < 0.22;
        const w = (isHandle ? 3.4 - k * 5 : 2.1 - (k - 0.22) * 1.4) * thick;
        ctx.strokeStyle = C.handle;
        ctx.lineWidth = w + 1;
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.strokeStyle = isHandle ? C.handleLight : (i % 2 ? C.vine : C.vineLight);
        ctx.lineWidth = w;
        ctx.stroke();
    }
    // Espinhos: no cabo, grandes e juntos; no caule, pequenos e espaçados
    ctx.fillStyle = C.thorn;
    for (let i = 1; i < pts.length - 1; i++) {
        const k = i / (pts.length - 1);
        const handle = k < 0.22;
        if (!handle && i % 2) continue;
        const a = pts[i - 1];
        const b = pts[i + 1];
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        const side = i % 4 < 2 ? 1 : -1;
        const len = (handle ? 3.6 : 2.4) * thick;
        const base = (handle ? 1.3 : 0.9) * thick;
        const p = pts[i];
        const nx = -Math.sin(ang) * side;
        const ny = Math.cos(ang) * side;
        ctx.beginPath();
        ctx.moveTo(p.x - Math.cos(ang) * base, p.y - Math.sin(ang) * base);
        ctx.lineTo(p.x + nx * len + Math.cos(ang) * 0.6, p.y + ny * len + Math.sin(ang) * 0.6);
        ctx.lineTo(p.x + Math.cos(ang) * base, p.y + Math.sin(ang) * base);
        ctx.closePath();
        ctx.fill();
    }
}

// A rosa na ponta, virada para onde o chicote aponta (ang) e um brilho suave
const TIP_ROSE_SIZE = 1.3;        // a rosa da ponta é 30% maior (em voo e enrolado)
function drawTipRose(x, y, ang, scale = 1.4, glow = 0.35) {
    scale *= TIP_ROSE_SIZE;
    const dark = passives.darkRoses.lvl > 0;          // Dark Roses (Rowan): as rosas de todos os golpes ficam negras
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, dark ? 'rgba(139, 92, 246, 0.9)' : 'rgba(251, 113, 133, 0.9)', x, y, 11 * scale, glow);
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(scale, scale);
    drawRose(ctx, state.runTime, dark);
    ctx.restore();
}

// Crimson Surge: a energia vermelha que corre da mão até o monstro POR DENTRO do chicote (path = o caminho todo, da mão ao topo da espiral). Cada pulso é uma
// bola de energia com um rastro brilhante que acende o chicote por onde passou; ao chegar, o jogo faz a explosão (js/systems/skills_nature.js).
function pointAt(path, lens, total, frac) {
    const target = Math.max(0, Math.min(1, frac)) * total;
    for (let i = 1; i < lens.length; i++) {
        if (lens[i] >= target) {
            const span = lens[i] - lens[i - 1] || 1;
            const k = (target - lens[i - 1]) / span;
            return { x: path[i - 1].x + (path[i].x - path[i - 1].x) * k, y: path[i - 1].y + (path[i].y - path[i - 1].y) * k };
        }
    }
    return path[path.length - 1];
}

function drawEnergy(w, path) {
    if (!w.orbs?.length) return;
    const lens = [0];
    for (let i = 1; i < path.length; i++) lens.push(lens[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
    const total = lens[lens.length - 1] || 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const orb of w.orbs) {
        const k = Math.min(1, orb.age / orb.seconds);
        const head = pointAt(path, lens, total, k);
        // Rastro: o trecho de chicote que a energia acabou de atravessar fica aceso
        const from = Math.max(0, k - 0.4);
        const trail = [pointAt(path, lens, total, from)];
        for (let i = 1; i < path.length; i++) if (lens[i] / total > from && lens[i] / total < k) trail.push(path[i]);
        trail.push(head);
        for (const [width, color, alpha] of [[9, 'rgba(239, 68, 68, 0.35)', 1], [4.5, 'rgba(248, 113, 113, 0.8)', 1], [1.6, 'rgba(254, 226, 226, 1)', 1]]) {
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.beginPath();
            trail.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
            ctx.stroke();
        }
        drawGlow(ctx, 'rgba(239, 68, 68, 0.95)', head.x, head.y, 15, 0.9);
        drawGlow(ctx, 'rgba(254, 226, 226, 1)', head.x, head.y, 6, 1);
    }
    ctx.restore();
}

// Enrolado no monstro: o chicote desce da mão com folga, dá voltas em espiral no corpo dele e a rosa fica no topo
function drawWrapped(w) {
    const e = w.target;
    const t = state.runTime;
    const fromX = player.x;
    const fromY = player.y - 14;
    const r = e.radius * 0.95;
    const loops = 3;
    const spiral = [];
    const N = 36;
    for (let i = 0; i <= N; i++) {
        const k = i / N;
        const a = k * loops * TAU + 0.6;
        spiral.push({ x: e.x + Math.cos(a) * r, y: e.y - e.radius * 0.1 - (k - 0.5) * e.radius * 1.5 + Math.sin(a) * r * 0.5 });
    }
    // O último trecho aperta (os espinhos mordem): pulsa a cada tique
    const squeeze = 1 + 0.18 * Math.max(0, 1 - (ROSE_WHIP.tickSeconds - w.tick) * 6);
    // Da mão até o começo da espiral: um arco frouxo
    const slack = whipPoints(fromX, fromY, spiral[0].x, spiral[0].y, Math.min(40, Math.hypot(spiral[0].x - fromX, spiral[0].y - fromY) * 0.2), 1.5, 14);
    ctx.save();
    // Nos últimos 0,7 s o chicote pisca, avisando que vai soltar
    const left = w.hold - w.age;
    if (left < 0.7) ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(t * 22));
    strokeVine(slack, 1);
    strokeVine(spiral, squeeze);
    drawEnergy(w, slack.concat(spiral));
    const tip = spiral[spiral.length - 1];
    drawTipRose(tip.x, tip.y - 2, -Math.PI / 2 + Math.sin(t * 2) * 0.2, 1.5, 0.3);
    ctx.restore();
}

function renderOne(w) {
    if (w.held) {
        drawWrapped(w);
        return;
    }
    // Em voo: do herói até a ponta, estalando em onda; a rosa vai na frente
    const e = w.target;
    const fromX = player.x;
    const fromY = player.y - 14;
    const dist = Math.hypot(e.x - fromX, e.y - fromY) || 1;
    const k = Math.min(1, w.reach / dist);
    const tipX = fromX + (e.x - fromX) * k;
    const tipY = fromY + (e.y - fromY) * k;
    const pts = whipPoints(fromX, fromY, tipX, tipY, 10 * (1 - k), 7 * Math.min(1, w.reach / 60), 14);
    ctx.save();
    strokeVine(pts, 1);
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 3] ?? pts[0];
    drawTipRose(last.x, last.y, Math.atan2(last.y - prev.y, last.x - prev.x), 1.4, 0.4);
    ctx.restore();
}

export function renderRoseWhip() {
    for (const w of state.nature.whips) renderOne(w);
}
