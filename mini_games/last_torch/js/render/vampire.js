import { VAMPIRE_VISUALS as V } from '../../data_model/visuals/monsters/vampire_visual.js';
import { ctx, player, state } from '../core/state.js';
import { easeOutCubic, lerpAngle } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';
import { createRandom } from './fx/random.js';

// --- VAMPIRO (desenho procedural, sem imagens) ---
// Referência: art_reference/vampire. Vista de cima; no sistema local +x é a frente do vampiro
// e +y é o lado direito. Ordem de desenho (de baixo para cima): sombra, capa, braços,
// corpo com medalhão, gola alta, cabeça (cabelo, rosto, olhos e presas).
// Os dados visuais ficam em VAMPIRE_VISUALS (data_model/visuals/monsters/vampire_visual.js).

// Estado visual por monstro (não afeta a lógica do jogo); some junto com o objeto do monstro
const animByVampire = new WeakMap();

const lerp = (a, b, k) => a + (b - a) * k;

function getAnim(e) {
    let a = animByVampire.get(e);
    if (!a) {
        const rand = createRandom(Math.floor(e.phase * 1e6));
        a = {
            lastTime: performance.now(),
            facing: e.angle,
            turnRate: 0,        // rad/s suavizado
            grab: 0,            // 0 = braços para trás, 1 = esticados agarrando
            // Pontas fixas da barra da capa (cada vampiro tem o seu)
            jag: Array.from({ length: V.capeStrips + 1 }, (_, i) => (i % 2 === 0 ? 1 : 0.8 + rand() * 0.1))
        };
        animByVampire.set(e, a);
    }
    return a;
}

function updateAnim(e, a) {
    const now = performance.now();
    const dt = Math.min((now - a.lastTime) / 1000, 0.05);
    a.lastTime = now;
    if (state.gameState !== 'PLAYING' || dt <= 0) return;

    const before = a.facing;
    a.facing = lerpAngle(a.facing, e.angle, Math.min(1, dt * V.turnSmoothing));
    let dAng = a.facing - before;
    while (dAng > Math.PI) dAng -= Math.PI * 2;
    while (dAng < -Math.PI) dAng += Math.PI * 2;
    a.turnRate += (dAng / dt - a.turnRate) * Math.min(1, dt * 10);

    const near = Math.hypot(player.x - e.x, player.y - e.y) < V.grabDistance + e.radius ? 1 : 0;
    a.grab += (near - a.grab) * Math.min(1, dt * V.grabSmoothing);
}

// Capa em leque atrás; ao virar, um lado abre e mostra o forro vermelho
function drawCape(r, t, a, phase) {
    const c = V.colors;
    const n = V.capeStrips;
    const length = r * V.capeLength;
    const tailHalf = r * V.capeTailWidth * 0.5;
    const shoulderHalf = r * V.shoulderWidth;
    const turn = Math.max(-1, Math.min(1, -a.turnRate * V.capeTurnOpen));

    const tips = [];
    for (let i = 0; i <= n; i++) {
        const k = i / n;
        const wave = Math.sin(t * V.capeWaveHz * Math.PI * 2 + phase + i * 0.9) * r * V.capeWave;
        tips.push({
            x: -length * a.jag[i] - Math.abs(wave),
            y: -tailHalf + k * tailHalf * 2 + turn * r * 0.3 + wave * 0.4
        });
    }

    const outline = (inset) => {
        ctx.beginPath();
        ctx.moveTo(r * 0.05, -shoulderHalf * inset);
        for (let i = 0; i <= n; i++) {
            const p = tips[i];
            if (i > 0) {
                const q = tips[i - 1];
                // Barra em arcos (pontas da capa)
                ctx.quadraticCurveTo((p.x + q.x) / 2 * 0.9 * inset, (p.y + q.y) / 2 * inset, p.x * inset, p.y * inset);
            } else {
                ctx.lineTo(p.x * inset, p.y * inset);
            }
        }
        ctx.lineTo(r * 0.05, shoulderHalf * inset);
        ctx.closePath();
    };

    // Forro aparecendo do lado que abre
    const baseAlpha = ctx.globalAlpha;
    if (Math.abs(turn) > 0.05) {
        const side = Math.sign(turn);
        ctx.globalAlpha = baseAlpha * Math.min(1, Math.abs(turn) * 1.5);
        ctx.fillStyle = c.lining;
        ctx.beginPath();
        ctx.moveTo(0, side * shoulderHalf * 0.6);
        ctx.quadraticCurveTo(-length * 0.5, side * (tailHalf + r * 0.25), -length * 0.95, side * tailHalf * 1.05);
        ctx.lineTo(-length * 0.7, side * tailHalf * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = baseAlpha;
    }

    outline(1);
    ctx.fillStyle = c.cape;
    ctx.fill();
    ctx.strokeStyle = c.capeEdge;
    ctx.lineWidth = Math.max(0.4, r * 0.025);
    ctx.lineJoin = 'round';
    ctx.stroke();

    outline(0.65);
    ctx.fillStyle = c.capeShade;
    ctx.globalAlpha = baseAlpha * 0.6;
    ctx.fill();
    ctx.globalAlpha = baseAlpha;
}

// Manga escura + mão pálida com unhas pontudas. spread: 0 = fechada, 1 = aberta agarrando
function drawArm(r, side, handX, handY, spread) {
    const c = V.colors;
    const sx = r * 0.02;
    const sy = side * r * V.shoulderWidth * 0.8;
    const ang = Math.atan2(handY - sy, handX - sx);
    const handR = r * V.handRadius;

    ctx.lineCap = 'round';
    ctx.strokeStyle = c.collar;
    ctx.lineWidth = r * V.sleeveWidth;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + handX) / 2, (sy + handY) / 2 + side * r * 0.1, handX, handY);
    ctx.stroke();

    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(handX, handY, handR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = c.nail;
    ctx.lineWidth = Math.max(0.4, r * 0.02);
    ctx.beginPath();
    for (let i = 0; i < V.nailCount; i++) {
        const k = i / (V.nailCount - 1) - 0.5;
        const fingerAng = ang + k * (0.4 + spread * 1.0);
        const len = r * V.nailLength * (0.6 + spread * 0.5);
        const bx = handX + Math.cos(fingerAng) * handR * 0.7;
        const by = handY + Math.sin(fingerAng) * handR * 0.7;
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(fingerAng) * len, by + Math.sin(fingerAng) * len);
    }
    ctx.stroke();
}

// Ombros eretos, colete e medalhão vermelho pulsando
function drawBody(r, t, phase) {
    const c = V.colors;
    const depth = r * V.shoulderDepth;
    const width = r * V.shoulderWidth;

    ctx.fillStyle = c.collar;
    ctx.beginPath();
    ctx.ellipse(0, 0, depth, width, 0, 0, Math.PI * 2);
    ctx.fill();

    const mx = depth * 0.75;
    const pulse = 0.6 + 0.4 * Math.sin(t * 3 + phase);
    drawGlow(ctx, c.eyeGlow, mx, 0, r * 0.12, 0.4 * pulse);
    ctx.fillStyle = c.medallionRim;
    ctx.beginPath();
    ctx.arc(mx, 0, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.medallion;
    ctx.beginPath();
    ctx.arc(mx, 0, r * 0.04, 0, Math.PI * 2);
    ctx.fill();
}

// Gola alta: duas pontas rígidas atrás e dos lados da cabeça, com forro vermelho
function drawCollar(r, hx) {
    const c = V.colors;
    const hr = r * V.headRadius;
    const spread = r * V.collarSpread;
    const back = r * V.collarBack;

    for (const [fill, k] of [[c.collar, 1], [c.collarLining, 0.78]]) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(hx + hr * 0.3, -hr * 1.05 * k);
        ctx.lineTo(hx - back * k, -spread * k);
        ctx.quadraticCurveTo(hx - hr * 1.5 * k, 0, hx - back * k, spread * k);
        ctx.lineTo(hx + hr * 0.3, hr * 1.05 * k);
        ctx.quadraticCurveTo(hx - hr * 0.6, 0, hx + hr * 0.3, -hr * 1.05 * k);
        ctx.closePath();
        ctx.fill();
    }
}

// Cabeça: cabelo preto penteado para trás com bico na testa, rosto pálido, olhos e presas
function drawHead(r, hx, t, phase, grab) {
    const c = V.colors;
    const hr = r * V.headRadius;

    // Rosto (parte da frente da cabeça)
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.ellipse(hx, 0, hr * 1.05, hr * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.skinShade;
    ctx.beginPath();
    ctx.ellipse(hx + hr * 0.75, 0, hr * 0.25, hr * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo cobrindo a parte de trás, com bico (widow's peak) apontando para a frente
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.moveTo(hx + hr * 0.15, -hr * 0.85);
    ctx.quadraticCurveTo(hx - hr * 1.3, -hr * 0.9, hx - hr * 1.05, 0);
    ctx.quadraticCurveTo(hx - hr * 1.3, hr * 0.9, hx + hr * 0.15, hr * 0.85);
    ctx.quadraticCurveTo(hx + hr * 0.05, hr * 0.3, hx + hr * 0.45, 0);
    ctx.quadraticCurveTo(hx + hr * 0.05, -hr * 0.3, hx + hr * 0.15, -hr * 0.85);
    ctx.fill();
    // Brilho do cabelo penteado (linhas para trás)
    ctx.strokeStyle = c.hairShine;
    ctx.lineWidth = Math.max(0.3, r * 0.018);
    for (const off of [-0.4, 0, 0.4]) {
        ctx.beginPath();
        ctx.moveTo(hx + hr * 0.1, off * hr);
        ctx.quadraticCurveTo(hx - hr * 0.5, off * hr * 1.3, hx - hr * 0.95, off * hr * 1.1);
        ctx.stroke();
    }

    // Olhos vermelhos (brilham mais ao agarrar)
    const eyeX = hx + hr * 0.6;
    const eyeR = Math.max(0.6, r * 0.035);
    const flicker = 0.85 + 0.15 * Math.sin(t * 6 + phase);
    for (const side of [-1, 1]) {
        drawGlow(ctx, c.eyeGlow, eyeX, side * hr * 0.35, r * (0.1 + grab * 0.1), (0.5 + grab * 0.5) * flicker);
        ctx.fillStyle = c.eye;
        ctx.beginPath();
        ctx.arc(eyeX, side * hr * 0.35, eyeR, 0, Math.PI * 2);
        ctx.fill();
    }

    // Presas
    ctx.fillStyle = c.fang;
    for (const side of [-1, 1]) {
        const fy = side * hr * 0.15;
        ctx.beginPath();
        ctx.moveTo(hx + hr * 0.95, fy - hr * 0.07);
        ctx.lineTo(hx + hr * 1.18, fy);
        ctx.lineTo(hx + hr * 0.95, fy + hr * 0.07);
        ctx.closePath();
        ctx.fill();
    }
}

export function renderVampire(e) {
    const c = V.colors;
    const t = performance.now() / 1000;
    const r = e.radius * V.scale;
    const a = getAnim(e);
    updateAnim(e, a);
    const grab = easeOutCubic(a.grab);

    // Desliza flutuando: a sombra fica, o corpo sobe e desce
    const float = Math.sin(t * V.floatHz * Math.PI * 2 + e.phase) * r * V.floatAmount;

    drawGlow(ctx, c.aura, e.x, e.y, r * V.auraRadius, V.auraAlpha + grab * 0.2);
    ctx.fillStyle = `rgba(0, 0, 0, ${V.shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(e.x + r * 0.1, e.y + r * 0.35, r * 0.8, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(e.x, e.y - float);
    ctx.rotate(a.facing);

    // Braços: para trás segurando a capa → esticados para a frente agarrando
    const handX = lerp(-r * 0.2, r * 0.8, grab);
    const handY = lerp(r * 0.62, r * 0.32, grab);
    const hx = r * V.headForward;

    drawCape(r, t, a, e.phase);
    drawArm(r, -1, handX, -handY, grab);
    drawArm(r, 1, handX, handY, grab);
    drawBody(r, t, e.phase);
    drawCollar(r, hx);
    drawHead(r, hx, t, e.phase, grab);

    ctx.restore();
}
