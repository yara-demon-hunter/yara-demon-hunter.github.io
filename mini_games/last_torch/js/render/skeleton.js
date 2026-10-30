import { SKELETON_VISUALS as V } from '../../data_model/visuals/monsters/skeleton_visual.js';
import { ctx, state } from '../core/state.js';
import { lerpAngle } from './fx/easing.js';
import { renderNow } from './fx/clock.js';
import { drawGlow } from './fx/glow.js';

// --- ESQUELETO (desenho procedural, sem imagens) ---
// Referência: art_reference/skeleton. Vista de cima; no sistema local +x é a frente do esqueleto
// e +y é o lado direito. Ordem de desenho (de baixo para cima): sombra, pernas, trapo, bacia,
// coluna, alma, costelas, clavículas, braços e crânio.
// Os dados visuais ficam em SKELETON_VISUALS (data_model/visuals/monsters/skeleton_visual.js).

// Estado visual por monstro (não afeta a lógica do jogo); some junto com o objeto do monstro
const animBySkeleton = new WeakMap();

function getAnim(e) {
    let a = animBySkeleton.get(e);
    if (!a) {
        a = {
            lastTime: renderNow(),
            lastX: e.x,
            lastY: e.y,
            speed: 0,
            stride: e.phase,
            facing: e.angle,
            lastHp: e.hp,
            rattle: 0           // 1 ao levar dano, cai até 0
        };
        animBySkeleton.set(e, a);
    }
    return a;
}

function updateAnim(e, a) {
    const now = renderNow();
    const dt = Math.min((now - a.lastTime) / 1000, 0.05);
    a.lastTime = now;
    const dx = e.x - a.lastX;
    const dy = e.y - a.lastY;
    a.lastX = e.x;
    a.lastY = e.y;

    // Levou dano: os ossos chacoalham
    if (e.hp < a.lastHp) a.rattle = 1;
    a.lastHp = e.hp;

    if (state.gameState !== 'PLAYING' || dt <= 0) return;

    const speed = Math.min(600, Math.hypot(dx, dy) / dt);
    a.speed += (speed - a.speed) * Math.min(1, dt * 6);
    a.stride += dt * V.walkHz * Math.PI * 2 * Math.max(0.3, a.speed / V.walkReferenceSpeed);
    a.facing = lerpAngle(a.facing, e.angle, Math.min(1, dt * V.turnSmoothing));
    a.rattle = Math.max(0, a.rattle - dt / V.rattleSeconds);
}

// Osso: contorno escuro por baixo e o osso por cima, passando pelas juntas
function bone(points, width, color) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.strokeStyle = V.colors.boneDark;
    ctx.lineWidth = width + Math.max(0.8, width * 0.45);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function joint(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = V.colors.boneDark;
    ctx.lineWidth = Math.max(0.5, radius * 0.5);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

// Pernas alternadas com passada dura; pés compridos apontando para a frente
function drawLegs(r, a, boneColor, shake) {
    for (const side of [-1, 1]) {
        const reach = Math.sin(a.stride + (side > 0 ? 0 : Math.PI)) * r * V.strideLength;
        const hipX = r * V.pelvisX;
        const hipY = side * r * V.hipSpread;
        const footX = hipX + reach + shake(side + 3);
        const footY = side * r * (V.hipSpread + 0.08);
        const kneeX = (hipX + footX) / 2 + r * 0.05;
        const kneeY = side * r * (V.hipSpread + 0.13);
        bone([[hipX, hipY], [kneeX, kneeY], [footX, footY]], r * V.boneWidth * 0.85, boneColor);
        bone([[footX, footY], [footX + r * V.footLength, footY]], r * V.boneWidth * 1.05, boneColor);
        joint(kneeX, kneeY, r * V.jointRadius, boneColor);
    }
}

// Trapo podre preso à bacia: tiras rasgadas arrastando para trás
function drawRag(r, t, phase) {
    const c = V.colors;
    const n = V.ragStrips;
    for (let i = 0; i < n; i++) {
        const y0 = (i / (n - 1) - 0.5) * 2 * r * V.pelvisWidth * 0.7;
        const baseX = r * V.pelvisX - r * 0.04;
        const w = r * 0.09;
        const tipX = baseX - r * V.ragLength * (i % 2 === 0 ? 1 : 0.75);
        const tipY = y0 * 1.25 + Math.sin(t * V.ragFlutterHz * Math.PI * 2 + i * 1.7 + phase) * r * 0.07;
        ctx.fillStyle = c.rag;
        ctx.strokeStyle = c.ragEdge;
        ctx.lineWidth = Math.max(0.5, r * 0.03);
        ctx.beginPath();
        ctx.moveTo(baseX, y0 - w);
        ctx.lineTo(tipX + r * 0.05, tipY - w * 0.4);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(tipX + r * 0.08, tipY + w * 0.5);
        ctx.lineTo(baseX, y0 + w);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

// Bacia (com dois furos) e coluna de vértebras até os ombros
function drawPelvisAndSpine(r, boneColor) {
    const c = V.colors;
    const px = r * V.pelvisX;
    ctx.fillStyle = boneColor;
    ctx.strokeStyle = c.boneDark;
    ctx.lineWidth = Math.max(0.6, r * 0.04);
    ctx.beginPath();
    ctx.ellipse(px, 0, r * 0.12, r * V.pelvisWidth, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.socket;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(px, side * r * V.pelvisWidth * 0.45, r * 0.045, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    const from = px + r * 0.08;
    const to = r * V.shoulderX;
    bone([[from, 0], [to, 0]], r * 0.05, c.boneShade);
    for (let i = 0; i <= 6; i++) {
        joint(from + (to - from) * (i / 6), 0, r * 0.045, boneColor);
    }
}

// Alma: chama verde flutuando dentro da caixa torácica, puxada para trás pelo movimento
function drawSoul(r, pulse) {
    const c = V.colors;
    const sx = r * V.soulX;
    const size = r * V.soulRadius * (0.85 + 0.3 * pulse);
    drawGlow(ctx, c.soulGlow, sx, 0, r * V.soulGlowRadius * (0.8 + 0.3 * pulse), 0.55 + 0.3 * pulse);
    ctx.fillStyle = c.soul;
    ctx.beginPath();
    ctx.moveTo(sx + size, 0);
    ctx.quadraticCurveTo(sx + size * 0.6, size * 1.1, sx - size * (1.8 + pulse * 0.5), 0);
    ctx.quadraticCurveTo(sx + size * 0.6, -size * 1.1, sx + size, 0);
    ctx.fill();
    ctx.fillStyle = c.soulCore;
    ctx.beginPath();
    ctx.arc(sx + size * 0.15, 0, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
}

// Costelas curvas saindo da coluna e clavículas cruzando os ombros
function drawRibsAndCollarbones(r, boneColor) {
    for (let i = 0; i < V.ribPairs; i++) {
        const x0 = r * (V.ribTop - i * V.ribGap);
        const span = r * V.ribSpan * (1 - i * 0.12);
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(x0, 0);
            ctx.quadraticCurveTo(x0 + r * 0.03, side * span * 1.05, x0 - r * 0.14, side * span * 0.72);
            ctx.lineCap = 'round';
            ctx.strokeStyle = V.colors.boneDark;
            ctx.lineWidth = r * 0.075;
            ctx.stroke();
            ctx.strokeStyle = boneColor;
            ctx.lineWidth = r * 0.045;
            ctx.stroke();
        }
    }
    const sx = r * V.shoulderX;
    const spread = r * V.shoulderSpread;
    bone([[sx, -spread], [sx + r * 0.07, 0], [sx, spread]], r * 0.075, boneColor);
}

// Braços esticados à frente, balançando ao contrário das pernas; mãos com 3 garras
function drawArms(r, a, boneColor, shake) {
    for (const side of [-1, 1]) {
        const swing = Math.sin(a.stride + (side > 0 ? Math.PI : 0)) * r * V.armSwing;
        const shoulder = [r * V.shoulderX, side * r * V.shoulderSpread];
        const elbow = [r * V.elbowX + swing * 0.5 + shake(side), side * r * V.elbowSpread];
        const hand = [r * V.handX + swing + shake(side + 1), side * r * V.handSpread + shake(side + 2)];
        bone([shoulder, elbow, hand], r * V.boneWidth, boneColor);
        joint(shoulder[0], shoulder[1], r * V.jointRadius * 1.3, boneColor);
        joint(elbow[0], elbow[1], r * V.jointRadius, boneColor);

        const dir = Math.atan2(hand[1] - elbow[1], hand[0] - elbow[0]);
        for (const spread of [-0.5, 0, 0.5]) {
            const ang = dir + spread;
            bone([hand, [hand[0] + Math.cos(ang) * r * V.clawLength, hand[1] + Math.sin(ang) * r * V.clawLength]], r * 0.035, boneColor);
        }
        joint(hand[0], hand[1], r * V.jointRadius * 0.9, boneColor);
    }
}

// Crânio rachado com órbitas de chama verde e mandíbula que chacoalha
function drawSkull(r, t, phase, pulse, boneColor, shake) {
    const c = V.colors;
    const L = r * V.skullLength;
    const W = r * V.skullWidth;

    // Tranco de cabeça de vez em quando
    const wave = Math.sin(t * V.twitchHz * Math.PI * 2 + phase);
    const twitch = wave > 0.97 ? ((wave - 0.97) / 0.03) * V.twitchAngle * (Math.sin(phase * 7) >= 0 ? 1 : -1) : 0;
    const jawOpen = Math.max(0, Math.sin(t * V.chatterHz * Math.PI * 2 + phase)) * r * V.jawOpenMax;

    ctx.save();
    ctx.translate(r * V.skullX + shake(5), shake(6));
    ctx.rotate(twitch);

    // Mandíbula (por baixo, na frente do crânio) com dentes
    const jx = L * 0.55 + jawOpen;
    ctx.fillStyle = c.boneShade;
    ctx.strokeStyle = c.boneDark;
    ctx.lineWidth = Math.max(0.6, r * 0.035);
    ctx.beginPath();
    ctx.ellipse(jx, 0, r * V.jawLength * 0.7, W * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = c.boneDark;
    ctx.lineWidth = Math.max(0.4, r * 0.02);
    for (const y of [-0.3, 0, 0.3]) {
        ctx.beginPath();
        ctx.moveTo(jx + r * V.jawLength * 0.3, y * W);
        ctx.lineTo(jx + r * V.jawLength * 0.62, y * W);
        ctx.stroke();
    }

    // Crânio com sombra atrás
    ctx.fillStyle = boneColor;
    ctx.strokeStyle = c.boneDark;
    ctx.lineWidth = Math.max(0.6, r * 0.04);
    ctx.beginPath();
    ctx.ellipse(0, 0, L, W, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.boneShade;
    ctx.beginPath();
    ctx.ellipse(-L * 0.35, 0, L * 0.5, W * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rachadura em zigue-zague no topo
    ctx.strokeStyle = c.boneDark;
    ctx.lineWidth = Math.max(0.5, r * 0.03);
    ctx.beginPath();
    ctx.moveTo(-L * 0.9, W * 0.1);
    ctx.lineTo(-L * 0.55, -W * 0.15);
    ctx.lineTo(-L * 0.3, W * 0.12);
    ctx.lineTo(-L * 0.05, -W * 0.1);
    ctx.stroke();

    // Órbitas fundas com chama verde e furo do nariz
    for (const side of [-1, 1]) {
        const ex = L * 0.45;
        const ey = side * W * 0.42;
        ctx.fillStyle = c.socket;
        ctx.beginPath();
        ctx.ellipse(ex, ey, r * 0.075, r * 0.095, 0, 0, Math.PI * 2);
        ctx.fill();
        drawGlow(ctx, c.soulGlow, ex, ey, r * V.eyeGlowRadius * (0.8 + 0.4 * pulse), 0.8);
        ctx.fillStyle = c.soul;
        ctx.beginPath();
        ctx.arc(ex + r * 0.01, ey, r * 0.035 * (0.8 + 0.4 * pulse), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = c.socket;
    ctx.beginPath();
    ctx.moveTo(L * 0.9, 0);
    ctx.lineTo(L * 0.72, -W * 0.12);
    ctx.lineTo(L * 0.72, W * 0.12);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

export function renderSkeleton(e) {
    const c = V.colors;
    const t = renderNow() / 1000;
    const r = e.radius * V.scale;
    const a = getAnim(e);
    updateAnim(e, a);

    const sway = Math.sin(a.stride) * V.swayAmount;
    const pulse = 0.5 + 0.5 * Math.sin(t * V.soulPulseHz * Math.PI * 2 + e.phase);
    const boneColor = a.rattle > 0.5 ? c.hurtFlash : c.bone;
    // Chacoalhar ao levar dano: cada osso treme desencontrado
    const shake = (i) => a.rattle * r * V.rattleAmount * Math.sin(t * 90 + i * 12.9);

    if (!e.baking) {
        drawGlow(ctx, c.aura, e.x, e.y, r * V.auraRadius, V.auraAlpha + pulse * 0.06);
        ctx.fillStyle = `rgba(0, 0, 0, ${V.shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(e.x + r * 0.1, e.y + r * 0.3, r * 0.8, r * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(a.facing + sway);

    drawLegs(r, a, boneColor, shake);
    drawRag(r, t, e.phase);
    drawPelvisAndSpine(r, boneColor);
    drawSoul(r, pulse);
    drawRibsAndCollarbones(r, boneColor);
    drawArms(r, a, boneColor, shake);
    drawSkull(r, t, e.phase, pulse, boneColor, shake);

    ctx.restore();
}
