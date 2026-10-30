import { WITCH_VISUALS as V } from '../../data_model/visuals/monsters/witch_visual.js';
import { ctx, state } from '../core/state.js';
import { easeOutCubic, lerpAngle } from './fx/easing.js';
import { renderNow } from './fx/clock.js';
import { drawGlow } from './fx/glow.js';
import { createRandom } from './fx/random.js';

// --- BRUXA (desenho procedural, sem imagens) ---
// Referência: art_reference/witch. Vista de cima; no sistema local +x é a frente da bruxa
// e +y é o lado direito. Ordem de desenho (de baixo para cima): sombra, manto arrastando,
// braço esquerdo, corpo com cordão, capuz, rosto, cabelo, braço direito e a bola de magia.
// Os dados visuais ficam em WITCH_VISUALS (data_model/visuals/monsters/witch_visual.js).

// Estado visual por monstro (não afeta a lógica do jogo); some junto com o objeto do monstro
const animByWitch = new WeakMap();

const lerp = (a, b, k) => a + (b - a) * k;

function getAnim(e) {
    let a = animByWitch.get(e);
    if (!a) {
        const rand = createRandom(Math.floor(e.phase * 1e6));
        a = {
            lastTime: renderNow(),
            lastX: e.x,
            lastY: e.y,
            speed: 0,
            run: 0,             // 0 a 1, suavizado
            stride: 0,
            facing: e.angle,
            turnRate: 0,        // rad/s suavizado
            lastShootTimer: e.shootTimer,
            release: 0,         // 1 no disparo, cai até 0
            // Pontas fixas do rasgado do manto (cada bruxa tem o seu, sem "tremer")
            jag: Array.from({ length: V.robeStrips + 1 }, (_, i) => (i % 2 === 0 ? 1 : 0.6 + rand() * 0.22))
        };
        animByWitch.set(e, a);
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
    if (state.gameState !== 'PLAYING' || dt <= 0) return;

    const speed = Math.min(600, Math.hypot(dx, dy) / dt);
    a.speed += (speed - a.speed) * Math.min(1, dt * V.speedSmoothing);
    a.run = Math.min(1, a.speed / V.runSpeedForFullEffect);
    a.stride += dt * V.hobbleHz * Math.PI * 2 * (0.3 + a.run);

    // Vira devagar para o alvo
    const before = a.facing;
    a.facing = lerpAngle(a.facing, e.angle, Math.min(1, dt * V.turnSmoothing));
    let dAng = a.facing - before;
    while (dAng > Math.PI) dAng -= Math.PI * 2;
    while (dAng < -Math.PI) dAng += Math.PI * 2;
    a.turnRate += (dAng / dt - a.turnRate) * Math.min(1, dt * 10);

    // Disparo: o cooldown do tiro "pula" para cima no instante em que ela atira
    if (e.shootTimer > a.lastShootTimer + 0.1) a.release = 1;
    a.lastShootTimer = e.shootTimer;
    a.release = Math.max(0, a.release - dt / V.releaseSeconds);
}

// Quanto o feitiço está carregado: 0 = longe do tiro, 1 = no momento do disparo
function getCharge(e) {
    return Math.max(0, Math.min(1, 1 - e.shootTimer / V.chargeSeconds));
}

// Manto esfarrapado arrastando atrás, com rasgos, sombra interna e dobras
function drawRobe(r, t, a, phase) {
    const c = V.colors;
    const n = V.robeStrips;
    const length = r * (V.robeBaseLength + V.robeRunExtraLength * a.run);
    const tailHalf = r * V.robeTailWidth * 0.5;
    const shoulderHalf = r * V.shoulderWidth * 0.95;
    const wave = r * lerp(V.robeWaveIdle, V.robeWaveRun, a.run);
    const turnLag = Math.max(-1, Math.min(1, -a.turnRate * V.robeTurnLag)) * r * 0.5;

    const tips = [];
    for (let i = 0; i <= n; i++) {
        const k = i / n;
        const edge = Math.abs(k - 0.5) * 2;                 // 0 no meio, 1 nas pontas
        const flutter = Math.sin(t * V.robeWaveHz * Math.PI * 2 + phase + i * 1.3) * wave;
        tips.push({
            x: -length * a.jag[i] - Math.abs(flutter) * 0.6,
            y: -tailHalf + k * tailHalf * 2 + turnLag * (0.5 + edge * 0.5) + flutter * 0.5
        });
    }

    const outline = (inset) => {
        ctx.beginPath();
        ctx.moveTo(r * 0.1, -shoulderHalf * inset);
        for (let i = 0; i <= n; i++) {
            const p = tips[i];
            if (i > 0) {
                const q = tips[i - 1];
                ctx.lineTo((p.x + q.x) / 2 * 0.82 * inset, (p.y + q.y) / 2 * inset);
            }
            ctx.lineTo(p.x * inset, p.y * inset);
        }
        ctx.lineTo(r * 0.1, shoulderHalf * inset);
        ctx.closePath();
    };

    outline(1);
    ctx.fillStyle = c.robe;
    ctx.fill();
    ctx.strokeStyle = c.robeEdge;
    ctx.lineWidth = Math.max(0.4, r * 0.025);
    ctx.lineJoin = 'round';
    ctx.stroke();

    const baseAlpha = ctx.globalAlpha;
    outline(0.7);
    ctx.fillStyle = c.robeShade;
    ctx.globalAlpha = baseAlpha * 0.55;
    ctx.fill();
    ctx.globalAlpha = baseAlpha;

    ctx.globalAlpha = baseAlpha * 0.6;
    ctx.strokeStyle = c.robeFold;
    ctx.lineWidth = Math.max(0.4, r * 0.03);
    for (let i = 1; i < n; i += 2) {
        const p = tips[i];
        ctx.beginPath();
        ctx.moveTo(-r * 0.05, (p.y / tailHalf) * shoulderHalf * 0.7);
        ctx.quadraticCurveTo(p.x * 0.5, p.y * 0.6, p.x * 0.85, p.y * 0.92);
        ctx.stroke();
    }
    ctx.globalAlpha = baseAlpha;
}

// Manga larga + mão ossuda com garras. spread: 0 = garras fechadas, 1 = mão aberta conjurando
function drawArm(r, side, handX, handY, spread) {
    const c = V.colors;
    const sx = r * 0.02;
    const sy = side * r * V.shoulderWidth * 0.85;
    const ang = Math.atan2(handY - sy, handX - sx);
    const handR = r * V.handRadius;
    const wristX = handX - Math.cos(ang) * handR * 1.2;
    const wristY = handY - Math.sin(ang) * handR * 1.2;
    const elbowX = (sx + wristX) / 2 - r * 0.05;
    const elbowY = (sy + wristY) / 2 + side * r * 0.15;

    ctx.lineCap = 'round';
    ctx.strokeStyle = c.robe;
    ctx.lineWidth = r * V.sleeveWidth;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(elbowX, elbowY, wristX, wristY);
    ctx.stroke();
    // Dobra clara ao longo da manga
    ctx.strokeStyle = c.robeFold;
    ctx.lineWidth = Math.max(0.4, r * 0.035);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(elbowX, elbowY, wristX, wristY);
    ctx.stroke();

    ctx.fillStyle = c.hand;
    ctx.beginPath();
    ctx.arc(handX, handY, handR, 0, Math.PI * 2);
    ctx.fill();

    // Garras: dedos longos que dobram na ponta
    ctx.strokeStyle = c.claw;
    ctx.lineWidth = Math.max(0.4, r * 0.025);
    ctx.beginPath();
    for (let i = 0; i < V.clawCount; i++) {
        const k = i / (V.clawCount - 1) - 0.5;
        const fingerAng = ang + k * (0.5 + spread * 0.9);
        const len = r * V.clawLength * (0.8 + spread * 0.3);
        const baseX = handX + Math.cos(fingerAng) * handR * 0.6;
        const baseY = handY + Math.sin(fingerAng) * handR * 0.6;
        const hook = fingerAng - side * 0.6 * (1 - spread * 0.6);
        ctx.moveTo(baseX, baseY);
        ctx.quadraticCurveTo(
            baseX + Math.cos(fingerAng) * len * 0.8, baseY + Math.sin(fingerAng) * len * 0.8,
            baseX + Math.cos(fingerAng) * len * 0.8 + Math.cos(hook) * len * 0.3,
            baseY + Math.sin(fingerAng) * len * 0.8 + Math.sin(hook) * len * 0.3
        );
    }
    ctx.stroke();
}

// Ombros curvados (corcunda) e a ponta do cordão da cintura pendurada, balançando
function drawBody(r, a, phase) {
    const c = V.colors;
    const depth = r * V.shoulderDepth;
    const width = r * V.shoulderWidth;

    ctx.fillStyle = c.robe;
    ctx.beginPath();
    ctx.ellipse(0, 0, depth, width, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corcunda: as costas são o ponto mais alto, pegam mais luz
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * 0.6;
    ctx.fillStyle = c.robeFold;
    ctx.beginPath();
    ctx.ellipse(-depth * 0.3, 0, depth * 0.6, width * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = baseAlpha;

    ctx.strokeStyle = c.rope;
    ctx.lineWidth = Math.max(0.5, r * 0.035);
    ctx.lineCap = 'round';
    const sway = Math.sin(a.stride + phase) * r * 0.06;
    ctx.beginPath();
    ctx.moveTo(-depth * 0.7, width * 0.45);
    ctx.quadraticCurveTo(-depth * 1.2, width * 0.5 + sway * 0.5, -depth * 1.6, width * 0.42 + sway);
    ctx.stroke();
    ctx.fillStyle = c.rope;
    ctx.beginPath();
    ctx.arc(-depth * 0.7, width * 0.45, r * 0.04, 0, Math.PI * 2);
    ctx.fill();
}

// Capuz profundo: ponta caindo para trás, dobras e abertura escura na frente
function drawHood(r, a, hx) {
    const c = V.colors;
    const hr = r * V.hoodRadius;
    const tipSway = Math.max(-1, Math.min(1, -a.turnRate * 0.3)) * hr * 0.4;

    ctx.fillStyle = c.hood;
    ctx.beginPath();
    ctx.moveTo(hx - hr * 0.2, -hr * 0.8);
    ctx.quadraticCurveTo(hx - hr - r * V.hoodTipLength, tipSway, hx - hr * 0.2, hr * 0.8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(hx, 0, hr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.robeEdge;
    ctx.lineWidth = Math.max(0.4, r * 0.025);
    ctx.stroke();

    ctx.strokeStyle = c.hoodFold;
    ctx.lineWidth = Math.max(0.4, r * 0.03);
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(hx - hr * 0.9, side * hr * 0.25);
        ctx.quadraticCurveTo(hx - hr * 0.2, side * hr * 0.9, hx + hr * 0.3, side * hr * 0.85);
        ctx.stroke();
    }

    ctx.fillStyle = c.hoodInner;
    ctx.beginPath();
    ctx.ellipse(hx + hr * 0.45, 0, hr * 0.52, hr * 0.66, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Rosto pálido e enrugado: nariz comprido para fora do capuz, um olho vermelho e outro afundado
function drawFace(r, hx, t, phase, charge) {
    const c = V.colors;
    const fx = hx + r * V.faceOffset;
    const fl = r * V.faceLength * 0.5;
    const fw = r * V.faceWidth * 0.5;

    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.ellipse(fx, 0, fl, fw, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sombra do capuz sobre a parte de trás do rosto
    ctx.fillStyle = c.skinShade;
    ctx.beginPath();
    ctx.ellipse(fx - fl * 0.4, 0, fl * 0.6, fw * 0.9, 0, Math.PI / 2, Math.PI * 1.5);
    ctx.fill();

    // Rugas na testa
    ctx.strokeStyle = c.wrinkle;
    ctx.lineWidth = Math.max(0.3, r * 0.015);
    for (const off of [-0.45, -0.1]) {
        ctx.beginPath();
        ctx.moveTo(fx + fl * off, -fw * 0.6);
        ctx.quadraticCurveTo(fx + fl * (off + 0.15), 0, fx + fl * off, fw * 0.6);
        ctx.stroke();
    }

    // Nariz comprido e torto
    const noseX = fx + fl * 0.55;
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.moveTo(noseX, -fw * 0.28);
    ctx.lineTo(noseX + r * V.noseLength, fw * 0.12);
    ctx.lineTo(noseX, fw * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = c.skinShade;
    ctx.beginPath();
    ctx.moveTo(noseX, fw * 0.05);
    ctx.lineTo(noseX + r * V.noseLength * 0.9, fw * 0.12);
    ctx.stroke();

    // Olho afundado (direito) e olho vermelho brilhante (esquerdo), mais forte ao conjurar
    const eyeX = fx + fl * 0.2;
    const eyeR = Math.max(0.6, r * 0.03);
    ctx.fillStyle = c.eyeSocket;
    ctx.beginPath();
    ctx.arc(eyeX, fw * 0.5, eyeR * 1.2, 0, Math.PI * 2);
    ctx.fill();
    const flicker = 0.85 + 0.15 * Math.sin(t * 7 + phase);
    drawGlow(ctx, c.eyeGlow, eyeX, -fw * 0.5, r * (0.12 + charge * 0.12), (0.5 + charge * 0.5) * flicker);
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.arc(eyeX, -fw * 0.5, eyeR, 0, Math.PI * 2);
    ctx.fill();
}

// Mechas grisalhas caindo dos lados do rosto por cima da borda do capuz
function drawHair(r, t, phase, hx) {
    const c = V.colors;
    const fx = hx + r * V.faceOffset;
    const fw = r * V.faceWidth * 0.5;
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * 0.85;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(0.4, r * 0.03);
    for (const side of [-1, 1]) {
        for (let i = 0; i < V.hairLocks; i++) {
            const k = V.hairLocks > 1 ? i / (V.hairLocks - 1) : 0;
            const sway = Math.sin(t * 2 + phase + i * 1.7 + side) * r * V.hairSwayAmount;
            const startX = fx - r * 0.06 + k * r * 0.03;
            const startY = side * fw * (0.85 + k * 0.1);
            const endX = startX + r * V.hairLength * (0.4 + k * 0.4) + sway * 0.5;
            const endY = side * (fw + r * V.hairLength * (0.55 + k * 0.35)) + sway;
            ctx.strokeStyle = i % 2 === 0 ? c.hair : c.hairShade;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(startX + r * 0.02, endY, endX, endY);
            ctx.stroke();
        }
    }
    ctx.globalAlpha = baseAlpha;
}

// Bola de magia escura na frente da mão: cresce sugando partículas e explode para fora no disparo
function drawSpell(r, t, phase, handX, handY, charge, release) {
    const c = V.colors;
    const ox = handX + r * V.orbOffset;
    const oy = handY;
    const spin = t * V.orbSpinHz * Math.PI * 2 + phase;
    const size = Math.max(0.6, r * V.particleSize);
    const baseAlpha = ctx.globalAlpha;

    if (charge > 0) {
        const grow = easeOutCubic(charge);
        const orbR = r * lerp(V.orbMinRadius, V.orbMaxRadius, grow) * (1 + Math.sin(spin * 2) * 0.06);
        drawGlow(ctx, c.orbGlow, ox, oy, r * V.orbGlowRadius * (0.4 + charge * 0.6), 0.35 + charge * 0.5);

        // Partículas sugadas em espiral para dentro do orbe
        for (let i = 0; i < V.particleCount; i++) {
            const k = i / V.particleCount;
            const life = (t * 0.9 + k + phase) % 1;              // 0 = longe, 1 = chegou no orbe
            const dist = orbR + r * V.particleOrbit * (1 - life) * (0.5 + charge * 0.5);
            const ang = spin * 0.6 + k * Math.PI * 2 + life * 2;
            ctx.globalAlpha = baseAlpha * charge * Math.min(1, life * 3);
            ctx.fillStyle = i % 2 === 0 ? c.particleLight : c.particleDark;
            ctx.fillRect(ox + Math.cos(ang) * dist - size / 2, oy + Math.sin(ang) * dist - size / 2, size, size);
        }
        ctx.globalAlpha = baseAlpha;

        ctx.fillStyle = c.orbCore;
        ctx.beginPath();
        ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c.orbRim;
        ctx.lineWidth = Math.max(0.5, orbR * 0.25);
        ctx.stroke();
        ctx.strokeStyle = c.orbSwirl;
        ctx.lineWidth = Math.max(0.4, orbR * 0.15);
        ctx.beginPath();
        ctx.arc(ox, oy, orbR * 0.55, spin, spin + Math.PI * 0.9);
        ctx.stroke();
    }

    // Disparo: partículas espalham para fora e somem
    if (release > 0) {
        for (let i = 0; i < V.particleCount; i++) {
            const ang = (i / V.particleCount) * Math.PI * 2 + phase;
            const dist = r * (0.1 + 0.5 * (1 - release));
            ctx.globalAlpha = baseAlpha * release;
            ctx.fillStyle = i % 2 === 0 ? c.particleLight : c.particleDark;
            ctx.fillRect(ox + Math.cos(ang) * dist - size / 2, oy + Math.sin(ang) * dist - size / 2, size, size);
        }
        ctx.globalAlpha = baseAlpha;
    }
}

export function renderWitch(e) {
    const c = V.colors;
    const t = renderNow() / 1000;
    const r = e.radius * V.scale;
    const a = getAnim(e);
    updateAnim(e, a);
    const charge = getCharge(e);
    // Pose dos braços: 0 = andando, 1 = braço direito esticado conjurando
    const cast = Math.max(easeOutCubic(charge), a.release);

    // Aura escura (mais forte ao conjurar) e sombra
    if (!e.baking) {
        drawGlow(ctx, c.aura, e.x, e.y, r * V.auraRadius, V.auraAlpha + charge * 0.25);
        ctx.fillStyle = `rgba(0, 0, 0, ${V.shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(e.x + r * 0.12, e.y + r * 0.35, r * 0.75, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Mancando: o corpo balança de um lado para o outro
    const hobble = Math.sin(a.stride) * V.hobbleAmount * (0.3 + a.run * 0.7);

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(a.facing + hobble);

    // Andando: mão direita agarrando à frente, esquerda balançando atrás
    const swing = Math.sin(a.stride);
    const rightX = lerp(r * (0.36 + swing * 0.04), r * 0.95, cast);
    const rightY = lerp(r * 0.5, r * 0.22, cast);
    const leftX = lerp(r * (-0.12 - swing * 0.06), -r * 0.28, cast);
    const leftY = -r * 0.55;
    const hx = r * V.hunchForward;

    drawRobe(r, t, a, e.phase);
    drawArm(r, -1, leftX, leftY, 0);
    drawBody(r, a, e.phase);
    drawHood(r, a, hx);
    drawFace(r, hx, t, e.phase, charge);
    drawHair(r, t, e.phase, hx);
    drawArm(r, 1, rightX, rightY, cast);
    drawSpell(r, t, e.phase, rightX, rightY, charge, a.release);

    ctx.restore();
}

// Projétil da bruxa: bola de magia escura girando com rastro de partículas
export function renderWitchBolt(p) {
    const B = V.bolt;
    const c = V.colors;
    const t = renderNow() / 1000;
    const spin = t * B.spinHz * Math.PI * 2;

    drawGlow(ctx, B.glowColor, p.x, p.y, p.radius * B.glowRadius, 0.7);

    // Rastro: partículas atrás, na direção oposta ao movimento
    const len = Math.hypot(p.vx, p.vy) || 1;
    const backX = -p.vx / len;
    const backY = -p.vy / len;
    for (let i = 1; i <= B.trailParticles; i++) {
        const fade = 1 - i / (B.trailParticles + 1);
        const d = p.radius * (0.6 + i * B.trailSpacing);
        const jitter = Math.sin(t * 20 + i * 2.3) * p.radius * 0.35;
        const px = p.x + backX * d - backY * jitter;
        const py = p.y + backY * d + backX * jitter;
        const s = Math.max(0.6, p.radius * 0.45 * fade);
        ctx.globalAlpha = fade;
        ctx.fillStyle = i % 2 === 0 ? c.particleLight : c.particleDark;
        ctx.fillRect(px - s / 2, py - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = c.orbCore;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.orbRim;
    ctx.lineWidth = Math.max(0.6, p.radius * 0.3);
    ctx.stroke();
    ctx.strokeStyle = c.orbSwirl;
    ctx.lineWidth = Math.max(0.4, p.radius * 0.18);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 0.55, spin, spin + Math.PI * 0.9);
    ctx.stroke();
}
