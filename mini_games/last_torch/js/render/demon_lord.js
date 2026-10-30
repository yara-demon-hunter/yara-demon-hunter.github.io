import { DEMON_LORD_VISUALS as V } from '../../data_model/visuals/bosses/demon_lord_visual.js';
import { ctx, state } from '../core/state.js';
import { easeOutCubic, lerpAngle } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';

// --- DEMON LORD (desenho procedural, sem imagens) ---
// Referência: art_reference/demon_lord. Vista de cima; no sistema local +x é a frente do boss
// e +y é o lado direito. Ordem de desenho (de baixo para cima): sombra, cauda, asas, braços,
// tronco, cabeça (orelhas, rosto, olhos), chifres e a bola de fogo na mão.
// Os dados visuais ficam em DEMON_LORD_VISUALS (data_model/visuals/bosses/demon_lord_visual.js).

// Estado visual por boss (não afeta a lógica do jogo); some junto com o objeto do boss
const animByBoss = new WeakMap();

const DEG = Math.PI / 180;
const lerp = (a, b, k) => a + (b - a) * k;

function getAnim(e) {
    let a = animByBoss.get(e);
    if (!a) {
        a = {
            lastTime: performance.now(),
            facing: e.angle,
            lastShootTimer: e.shootTimer,
            release: 0          // 1 logo após o disparo, cai até 0
        };
        animByBoss.set(e, a);
    }
    return a;
}

function updateAnim(e, a) {
    const now = performance.now();
    const dt = Math.min((now - a.lastTime) / 1000, 0.05);
    a.lastTime = now;
    if (state.gameState !== 'PLAYING' || dt <= 0) return;

    a.facing = lerpAngle(a.facing, e.angle, Math.min(1, dt * V.turnSmoothing));
    // O cooldown do tiro "pula" para cima quando ele dispara
    if (e.shootTimer > a.lastShootTimer + 0.1) a.release = 1;
    a.lastShootTimer = e.shootTimer;
    a.release = Math.max(0, a.release - dt / V.releaseSeconds);
}

function getCharge(e) {
    return Math.max(0, Math.min(1, 1 - e.shootTimer / V.chargeSeconds));
}

// Bola de fogo em camadas (vermelho → laranja → amarelo → núcleo claro), tremulando
function drawFlameBall(x, y, radius, t, seed) {
    const F = V.fireball;
    const c = F.colors;
    const flicker = k => radius * k * (1 + Math.sin(t * F.flickerHz + seed + k * 5) * 0.08);

    drawGlow(ctx, F.glowColor, x, y, radius * F.glowRadius, 0.8);
    [[c.outer, 1], [c.mid, 0.75], [c.inner, 0.5], [c.core, 0.28]].forEach(([color, k]) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, flicker(k), 0, Math.PI * 2);
        ctx.fill();
    });
}

// Cauda ondulando atrás, afinando até a ponta de lança
function drawTail(r, t, phase) {
    const c = V.colors;
    const n = V.tailSegments;
    const length = r * V.tailLength;
    const points = [];
    for (let i = 0; i <= n; i++) {
        const s = i / n;
        points.push([
            -r * 0.3 - s * length,
            Math.sin(t * V.tailWaveHz * Math.PI * 2 - s * 3 + phase) * V.tailWave * r * s
        ]);
    }

    ctx.lineCap = 'round';
    [[c.outline, 2], [c.skin, 0]].forEach(([color, extra]) => {
        ctx.strokeStyle = color;
        for (let i = 0; i < n; i++) {
            ctx.lineWidth = r * V.tailWidth * (1 - (i / n) * 0.65) + extra;
            ctx.beginPath();
            ctx.moveTo(points[i][0], points[i][1]);
            ctx.lineTo(points[i + 1][0], points[i + 1][1]);
            ctx.stroke();
        }
    });

    // Ponta de lança alinhada com o último segmento
    const [px, py] = points[n - 1];
    const [tx, ty] = points[n];
    const len = r * V.spearLength;
    const w = r * V.spearWidth;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(Math.atan2(ty - py, tx - px));
    ctx.fillStyle = c.spear;
    ctx.strokeStyle = c.outline;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-len * 0.1, 0);
    ctx.lineTo(len * 0.3, -w);
    ctx.lineTo(len, 0);
    ctx.lineTo(len * 0.3, w);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = c.spearEdge;
    ctx.beginPath();
    ctx.moveTo(len * 0.15, 0);
    ctx.lineTo(len * 0.9, 0);
    ctx.stroke();
    ctx.restore();
}

// Asa de morcego: ossos saindo do ombro e membrana com recortes entre as pontas
function drawWing(r, side, flap) {
    const c = V.colors;
    const rootX = -V.wingRootBack * r;
    const rootY = side * V.wingRootSide * r;
    const span = 1 - V.flapAmount * (0.5 + 0.5 * flap);
    const tips = V.wingBones.map(b => {
        const ang = (b.angle + flap * V.flapSweep) * DEG;
        const len = b.length * r * span;
        return [rootX + Math.cos(ang) * len, rootY + side * Math.sin(ang) * len];
    });
    const pull = ([x, y], k) => [x + (rootX - x) * k, y + (rootY - y) * k];

    // Membrana
    ctx.beginPath();
    ctx.moveTo(rootX, rootY);
    ctx.lineTo(tips[0][0], tips[0][1]);
    for (let i = 1; i < tips.length; i++) {
        const mid = [(tips[i - 1][0] + tips[i][0]) / 2, (tips[i - 1][1] + tips[i][1]) / 2];
        const [cx, cy] = pull(mid, V.wingScallop);
        ctx.quadraticCurveTo(cx, cy, tips[i][0], tips[i][1]);
    }
    const last = tips[tips.length - 1];
    ctx.quadraticCurveTo(last[0] * 0.6 + rootX * 0.4, rootY + side * r * 0.25, -r * 0.35, side * r * 0.15);
    ctx.closePath();
    ctx.fillStyle = c.membrane;
    ctx.fill();
    ctx.strokeStyle = c.membraneEdge;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Painéis mais escuros alternados entre os ossos
    ctx.fillStyle = c.membraneShade;
    ctx.globalAlpha = 0.55;
    for (let i = 1; i < tips.length; i += 2) {
        const mid = [(tips[i - 1][0] + tips[i][0]) / 2, (tips[i - 1][1] + tips[i][1]) / 2];
        const [cx, cy] = pull(mid, V.wingScallop);
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(tips[i - 1][0], tips[i - 1][1]);
        ctx.quadraticCurveTo(cx, cy, tips[i][0], tips[i][1]);
        ctx.closePath();
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Ossos (o da frente é mais grosso)
    ctx.strokeStyle = c.bone;
    ctx.lineCap = 'round';
    tips.forEach(([x, y], i) => {
        ctx.lineWidth = r * (i === 0 ? 0.09 : 0.05);
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(x, y);
        ctx.stroke();
    });

    // Garra preta na ponta do osso da frente
    const [hx, hy] = tips[0];
    ctx.strokeStyle = c.wingClaw;
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.quadraticCurveTo(hx + r * 0.18, hy + side * r * 0.02, hx + r * 0.2, hy - side * r * 0.12);
    ctx.stroke();
}

// Braço musculoso do ombro até a mão com garras
function drawArm(r, side, handX, handY) {
    const c = V.colors;
    const sx = r * 0.05;
    const sy = side * r * 0.5;
    const ex = (sx + handX) / 2;
    const ey = (sy + handY) / 2 + side * r * 0.14;

    const path = () => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(ex, ey, handX, handY);
    };
    ctx.lineCap = 'round';
    path();
    ctx.strokeStyle = c.outline;
    ctx.lineWidth = r * 0.28;
    ctx.stroke();
    ctx.strokeStyle = c.skin;
    ctx.lineWidth = r * 0.23;
    ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = c.skinLight;
    ctx.lineWidth = r * 0.08;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Garras apontando na direção do braço
    const dir = Math.atan2(handY - ey, handX - ex);
    ctx.strokeStyle = c.claw;
    ctx.lineWidth = r * 0.035;
    for (let k = -1; k <= 1; k++) {
        const a = dir + k * 0.45;
        ctx.beginPath();
        ctx.moveTo(handX + Math.cos(a) * r * 0.08, handY + Math.sin(a) * r * 0.08);
        ctx.lineTo(handX + Math.cos(a) * r * 0.2, handY + Math.sin(a) * r * 0.2);
        ctx.stroke();
    }
}

// Tronco largo: costas, ombros saltados e a coluna
function drawTorso(r) {
    const c = V.colors;
    ctx.fillStyle = c.outline;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * V.torsoLength + 1.5, r * V.torsoWidth + 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * V.torsoLength, r * V.torsoWidth, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = c.skinLight;
    ctx.globalAlpha = 0.55;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(r * 0.06, side * r * 0.3, r * 0.2, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = c.skinShade;
    ctx.lineWidth = r * 0.05;
    ctx.beginPath();
    ctx.moveTo(-r * 0.36, 0);
    ctx.lineTo(r * 0.18, 0);
    ctx.stroke();
}

// Chifre de carneiro: sai da cabeça, abre para o lado, curva para trás e a ponta volta à frente
function hornPath(hx, hr, side) {
    ctx.beginPath();
    ctx.moveTo(hx - hr * 0.2, side * hr * 0.6);
    ctx.bezierCurveTo(hx + hr * 0.1, side * hr * 1.5, hx - hr * 0.9, side * hr * 2.2, hx - hr * 1.3, side * hr * 1.6);
    ctx.quadraticCurveTo(hx - hr * 1.5, side * hr * 1.1, hx - hr * 1.0, side * hr * 1.05);
}

function drawHead(r, charge) {
    const c = V.colors;
    const hx = r * V.headForward;
    const hr = r * V.headRadius;

    // Orelhas pontudas
    ctx.fillStyle = c.skinShade;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(hx - hr * 0.1, side * hr * 0.7);
        ctx.lineTo(hx - hr * 0.7, side * (hr + r * 0.2));
        ctx.lineTo(hx - hr * 0.55, side * hr * 0.4);
        ctx.closePath();
        ctx.fill();
    }

    // Cabeça e focinho
    ctx.fillStyle = c.outline;
    ctx.beginPath();
    ctx.ellipse(hx, 0, hr * 1.1 + 1.5, hr + 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.ellipse(hx, 0, hr * 1.1, hr, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.skinShade;
    ctx.beginPath();
    ctx.ellipse(hx + hr * 0.75, 0, hr * 0.4, hr * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dentes à mostra na frente do focinho
    ctx.fillStyle = c.teeth;
    for (let k = -2; k <= 2; k++) {
        ctx.fillRect(hx + hr * 1.08, k * hr * 0.12 - hr * 0.04, hr * 0.12, hr * 0.08);
    }

    // Testa franzida sobre os olhos
    ctx.strokeStyle = c.skinShade;
    ctx.lineWidth = r * 0.035;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(hx + hr * 0.25, side * hr * 0.1);
        ctx.lineTo(hx + hr * 0.45, side * hr * 0.6);
        ctx.stroke();
    }

    // Olhos em brasa (mais fortes enquanto carrega o fogo)
    for (const side of [-1, 1]) {
        const ex = hx + hr * 0.6;
        const ey = side * hr * 0.36;
        drawGlow(ctx, c.eyeGlow, ex, ey, r * (0.12 + charge * 0.1), 0.6 + charge * 0.4);
        ctx.fillStyle = c.eye;
        ctx.beginPath();
        ctx.arc(ex, ey, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }

    // Chifres por cima de tudo
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
        hornPath(hx, hr, side);
        ctx.strokeStyle = c.hornDark;
        ctx.lineWidth = r * V.hornWidth * 1.35;
        ctx.stroke();
        ctx.strokeStyle = c.horn;
        ctx.lineWidth = r * V.hornWidth;
        ctx.stroke();
        // Anéis do chifre
        ctx.strokeStyle = c.hornRidge;
        ctx.lineWidth = r * V.hornWidth * 0.4;
        ctx.setLineDash([r * 0.05, r * 0.05]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

export function renderDemonLord(e) {
    const c = V.colors;
    const t = performance.now() / 1000;
    const r = e.radius * V.scale;
    const a = getAnim(e);
    updateAnim(e, a);
    const charge = getCharge(e);
    const attack = easeOutCubic(Math.max(charge, a.release));

    const step = t * V.stepHz * Math.PI * 2 + e.phase;
    const flap = Math.sin(t * V.flapHz * Math.PI * 2 + e.phase);

    drawGlow(ctx, c.aura, e.x, e.y, r * V.auraRadius, V.auraAlpha + charge * 0.15);
    ctx.fillStyle = `rgba(0, 0, 0, ${V.shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(e.x + r * 0.1, e.y + r * 0.4, r * 1.1, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(a.facing + Math.sin(step) * V.stepSway);

    // Mãos: balançam no passo; a direita estica para a frente para lançar o fogo
    const swing = Math.sin(step) * r * 0.08;
    const leftX = r * 0.32 - swing;
    const leftY = -r * 0.78;
    const rightX = lerp(r * 0.32 + swing, r * 0.85, attack);
    const rightY = lerp(r * 0.78, r * 0.3, attack);

    drawTail(r, t, e.phase);
    drawWing(r, -1, flap);
    drawWing(r, 1, flap);
    drawArm(r, -1, leftX, leftY);
    drawArm(r, 1, rightX, rightY);
    drawTorso(r);
    drawHead(r, charge);

    // Bola de fogo crescendo na mão e clarão no disparo
    if (charge > 0) {
        const size = r * V.fireballInHand * easeOutCubic(charge);
        drawFlameBall(rightX + r * 0.12, rightY, size, t, e.phase);
    }
    if (a.release > 0) {
        drawGlow(ctx, V.fireball.glowColor, rightX + r * 0.12, rightY, r * 0.7, a.release);
    }

    ctx.restore();
}

// Projétil: bola de fogo com rastro de chamas
export function renderDemonFireball(p) {
    const F = V.fireball;
    const c = F.colors;
    const t = performance.now() / 1000;
    const len = Math.hypot(p.vx, p.vy) || 1;
    const backX = -p.vx / len;
    const backY = -p.vy / len;

    for (let i = F.trailParticles; i >= 1; i--) {
        const fade = 1 - i / (F.trailParticles + 1);
        const d = p.radius * (0.4 + i * F.trailSpacing);
        const jitter = Math.sin(t * 25 + i * 2.1) * p.radius * 0.3;
        ctx.globalAlpha = fade;
        ctx.fillStyle = i % 2 === 0 ? c.mid : c.outer;
        ctx.beginPath();
        ctx.arc(p.x + backX * d - backY * jitter, p.y + backY * d + backX * jitter, p.radius * 0.75 * fade, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    drawFlameBall(p.x, p.y, p.radius, t, p.x * 0.1);
}
