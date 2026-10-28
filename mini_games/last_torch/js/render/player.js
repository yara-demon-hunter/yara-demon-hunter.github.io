import { CHARACTER_MODEL } from '../../data_model/character.js';
import { HERO_VISUALS as V } from '../../data_model/visuals.js';
import { ctx, player, state } from '../core/state.js';
import { easeOutCubic, easeOutQuad, lerpAngle } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';

// --- HERÓI (desenho procedural, sem imagens) ---
// Referência: art_reference/hero. Vista de cima: capa esfarrapada atrás (com física), botas
// enfaixadas, ombros e braços, capuz profundo com máscara de osso e espada rúnica azul.
// No sistema local, +x é a frente do herói e +y é o lado direito.
// Todo movimento passa por suavização para não haver "saltos" entre poses.

// Estado puramente visual (não afeta a lógica do jogo)
const anim = {
    lastTime: performance.now(),
    lastX: 0,
    lastY: 0,
    velX: 0,            // velocidade suavizada (px/s, mundo)
    velY: 0,
    speed: 0,
    run: 0,             // 0 a 1, suavizado
    stride: 0,
    facing: -Math.PI / 2,
    turnRate: 0,        // rad/s suavizado
    capeX: 0,           // atraso da capa (local)
    capeY: 0,
    lastComboStep: 1,
    swingActive: false,
    swingElapsed: 0,
    swingKey: 1,
    swingFrom: 0,
    swingTo: 0,
    swingSeconds: 0.2,
    swingBlend: 0
};

// Pontas fixas da barra da capa (aleatórias uma vez, para o rasgado não "tremer")
const capeJag = Array.from({ length: V.capeStrips + 1 }, (_, i) => (i % 2 === 0 ? 1 : 0.58 + Math.random() * 0.2));

function startSwing(step) {
    const lastSlash = state.bladeSlashes[state.bladeSlashes.length - 1];
    const key = lastSlash && lastSlash.spin ? 'whirl' : step;
    const combo = V.combo[key];
    const half = lastSlash ? lastSlash.arcWidth / 2 : 0.7;
    anim.swingKey = key;
    anim.swingSeconds = combo.seconds;
    anim.swingElapsed = 0;
    anim.swingActive = true;
    if (combo.spin) {
        anim.swingFrom = -Math.PI;
        anim.swingTo = Math.PI;
    } else {
        anim.swingFrom = combo.from * (half + combo.extraArc);
        anim.swingTo = combo.to * (half + combo.extraArc);
    }
}

// Ângulo local da lâmina em um instante do golpe: preparação → corte → segura no fim
function swingAngleAt(elapsed) {
    const dur = anim.swingSeconds;
    const windEnd = dur * V.windupFraction;
    const dir = Math.sign(anim.swingTo - anim.swingFrom) || 1;
    const windAngle = anim.swingFrom - dir * V.windupExtra;
    if (elapsed <= 0) return anim.swingFrom;
    if (elapsed < windEnd) {
        // Puxa a lâmina para trás antes de cortar (antecipação)
        const p = easeOutQuad(elapsed / windEnd);
        return anim.swingFrom + (windAngle - anim.swingFrom) * p;
    }
    const p = Math.min(1, (elapsed - windEnd) / (dur - windEnd));
    return windAngle + (anim.swingTo - windAngle) * easeOutCubic(p);
}

function updateAnim() {
    const now = performance.now();
    const dt = Math.min((now - anim.lastTime) / 1000, 0.05);
    anim.lastTime = now;
    const playing = state.gameState === 'PLAYING';

    const dx = player.x - anim.lastX;
    const dy = player.y - anim.lastY;
    anim.lastX = player.x;
    anim.lastY = player.y;

    if (playing && dt > 0) {
        // Velocidade suavizada
        const k = Math.min(1, dt * V.speedSmoothing);
        anim.velX += (Math.max(-600, Math.min(600, dx / dt)) - anim.velX) * k;
        anim.velY += (Math.max(-600, Math.min(600, dy / dt)) - anim.velY) * k;
        anim.speed = Math.hypot(anim.velX, anim.velY);

        const runTarget = Math.min(1, anim.speed / V.runSpeedForFullEffect);
        anim.run += (runTarget - anim.run) * Math.min(1, dt * V.runSmoothing);
        anim.stride += dt * V.strideSpeed * (0.25 + anim.run);

        // Giro suave para o lado do movimento (não durante o golpe)
        const before = anim.facing;
        if (Math.hypot(dx, dy) > 0.3 && !anim.swingActive) {
            anim.facing = lerpAngle(anim.facing, Math.atan2(dy, dx), Math.min(1, dt * V.turnSmoothing));
        }
        let dAng = anim.facing - before;
        while (dAng > Math.PI) dAng -= Math.PI * 2;
        while (dAng < -Math.PI) dAng += Math.PI * 2;
        anim.turnRate += (dAng / dt - anim.turnRate) * Math.min(1, dt * 10);

        // Capa: atraso suave oposto à velocidade (no referencial do herói)
        const cos = Math.cos(-anim.facing);
        const sin = Math.sin(-anim.facing);
        const lx = anim.velX * cos - anim.velY * sin;
        const ly = anim.velX * sin + anim.velY * cos;
        const clamp = (v) => Math.max(-V.capeMaxLag, Math.min(V.capeMaxLag, v));
        const targetX = clamp(-lx * V.capeDragPerSpeed);
        const targetY = clamp(-ly * V.capeDragPerSpeed - anim.turnRate * V.capeTurnLag);
        const f = Math.min(1, dt * V.capeFollow);
        anim.capeX += (targetX - anim.capeX) * f;
        anim.capeY += (targetY - anim.capeY) * f;
    }

    // Novo golpe: o passo executado é o valor anterior do combo
    if (player.comboStep !== anim.lastComboStep) {
        const executedStep = anim.lastComboStep;
        anim.lastComboStep = player.comboStep;
        anim.facing = player.angle;
        startSwing(executedStep);
    }

    if (anim.swingActive && playing) {
        anim.swingElapsed += dt;
        if (anim.swingElapsed > anim.swingSeconds + V.recoverSeconds) anim.swingActive = false;
    }
    // Mistura suave entre a pose de repouso e a pose de golpe (entra e sai sem estalo)
    const blendTarget = anim.swingActive && anim.swingElapsed < anim.swingSeconds + V.recoverSeconds * 0.4 ? 1 : 0;
    anim.swingBlend += (blendTarget - anim.swingBlend) * Math.min(1, dt * V.swingBlendRate);
    if (anim.swingBlend < 0.001) anim.swingBlend = 0;
}

// Rastro de sombra escura, quase imperceptível
export function renderPlayerTrail() {
    updateAnim();
    for (let i = 0; i < player.trail.length; i++) {
        const pt = player.trail[i];
        if (pt.alpha <= 0) continue;
        const fade = 1 - i / player.trail.length;
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha * fade * V.shadowTrailAlpha);
        ctx.fillStyle = V.colors.shadowTrail;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(2, V.shadowTrailRadius * fade), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Capa preta esfarrapada em duas camadas, com física de arrasto, rasgos e dobras
function drawCape(t) {
    const run = anim.run;
    const length = V.capeBaseLength + V.capeRunExtraLength * run + Math.max(0, -anim.capeX) * 0.5;
    const wave = V.capeWaveIdle + (V.capeWaveRun - V.capeWaveIdle) * run;
    const tailHalf = (V.capeTailWidth / 2) * (1 - run * 0.25);
    const shoulderHalf = V.shoulderWidth * 0.95;
    const n = V.capeStrips;

    // Pontas: seguem o atraso da capa; as das extremidades se afastam mais (efeito de leque)
    const tips = [];
    for (let i = 0; i <= n; i++) {
        const k = i / n;
        const edge = Math.abs(k - 0.5) * 2;                 // 0 no meio, 1 nas pontas
        const flutter = Math.sin(t * V.capeWaveSpeed + i * 1.3) * wave;
        const lag = 0.55 + edge * 0.45;
        tips.push({
            x: -length * capeJag[i] + anim.capeX * lag - Math.abs(flutter) * 0.6,
            y: (-tailHalf + k * tailHalf * 2) + anim.capeY * (0.6 + edge * 0.5) + flutter * 0.5
        });
    }

    // Contorno com rasgos (entalhes entre as pontas)
    const outline = (inset) => {
        ctx.beginPath();
        ctx.moveTo(1, -shoulderHalf * inset);
        for (let i = 0; i <= n; i++) {
            const p = tips[i];
            if (i > 0) {
                const q = tips[i - 1];
                ctx.lineTo((p.x + q.x) / 2 * 0.86 * inset + 0.5, (p.y + q.y) / 2 * inset);
            }
            ctx.lineTo(p.x * inset, p.y * inset);
        }
        ctx.lineTo(1, shoulderHalf * inset);
        ctx.closePath();
    };

    outline(1);
    ctx.fillStyle = V.colors.cape;
    ctx.fill();
    ctx.strokeStyle = V.colors.capeEdge;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Camada interna mais clara (forro), mostra profundidade
    const baseAlpha = ctx.globalAlpha;
    outline(0.72);
    ctx.fillStyle = V.colors.capeInner;
    ctx.globalAlpha = baseAlpha * 0.65;
    ctx.fill();
    ctx.globalAlpha = baseAlpha;

    // Dobras: linhas do ombro até as pontas longas
    ctx.strokeStyle = V.colors.capeFold;
    ctx.lineWidth = 0.9;
    for (let i = 1; i < n; i += 2) {
        const p = tips[i];
        ctx.beginPath();
        ctx.moveTo(-1.5, (p.y / tailHalf) * shoulderHalf * 0.7);
        ctx.quadraticCurveTo(p.x * 0.5, p.y * 0.55 + anim.capeY * 0.2, p.x * 0.88, p.y * 0.95);
        ctx.stroke();
    }
}

// Pontas da faixa da cintura esvoaçando atrás
function drawSashTails(t) {
    ctx.strokeStyle = V.colors.sash;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
        const flutter = Math.sin(t * 7 + side) * (1 + anim.run * 1.5);
        ctx.beginPath();
        ctx.moveTo(-3, side * 2.2);
        ctx.quadraticCurveTo(-6 + anim.capeX * 0.4, side * 3 + anim.capeY * 0.3 + flutter * 0.5, -8.5 + anim.capeX * 0.7, side * 3.6 + anim.capeY * 0.5 + flutter);
        ctx.stroke();
    }
}

// Botas enfaixadas alternando a passada (suavizadas pela corrida)
function drawBoots() {
    const run = anim.run;
    const step = Math.sin(anim.stride) * V.strideLength * (0.25 + run * 0.9);
    for (const side of [-1, 1]) {
        const bx = 1 + side * step;
        const by = side * 3.2;
        ctx.fillStyle = V.colors.boots;
        ctx.beginPath();
        ctx.ellipse(bx, by, V.bootLength / 2 + 0.4, 1.7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Faixas da bota
        ctx.strokeStyle = V.colors.sash;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(bx - 0.6, by - 1.3);
        ctx.lineTo(bx - 0.6, by + 1.3);
        ctx.moveTo(bx + 0.5, by - 1.3);
        ctx.lineTo(bx + 0.5, by + 1.3);
        ctx.stroke();
    }
}

function getBladeColors(frenzy) {
    if (frenzy) return { soft: V.colors.bladeGlowSoftFrenzy };
    return { soft: V.colors.bladeGlowSoft };
}

// Lâmina (com cabo, guarda, gume e runas) apontando para +x a partir da origem atual
function drawBladeShape(t) {
    const L = V.bladeLength;
    const w = V.bladeWidth;

    // Cabo e guarda
    ctx.fillStyle = V.colors.glove;
    ctx.fillRect(-3.4, -0.9, 3.2, 1.8);
    ctx.fillStyle = V.colors.buckle;
    ctx.fillRect(-0.4, -2.2, 1.1, 4.4);

    // Lâmina com bisel (metade mais escura)
    ctx.fillStyle = V.colors.blade;
    ctx.beginPath();
    ctx.moveTo(0.7, -w / 2);
    ctx.lineTo(L - 3, -w / 2);
    ctx.lineTo(L, 0);
    ctx.lineTo(L - 3, w / 2);
    ctx.lineTo(0.7, w / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(2, 20, 40, 0.28)';
    ctx.fillRect(0.7, 0, L - 3.7, w / 2);

    // Fio central brilhante
    ctx.strokeStyle = V.colors.bladeCore;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(1.5, 0);
    ctx.lineTo(L - 2.5, 0);
    ctx.stroke();

    // Runas que acendem em onda ao longo do gume
    ctx.fillStyle = V.colors.runes;
    const base = ctx.globalAlpha;
    for (let i = 0; i < V.runeCount; i++) {
        const rx = 3 + i * ((L - 7) / (V.runeCount - 1));
        const wave = 0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - i * 1.2));
        ctx.globalAlpha = base * wave;
        ctx.fillRect(rx, -0.5, 1.4, 1);
        ctx.fillRect(rx + 0.4, -1.1, 0.5, 0.4);
        ctx.fillRect(rx + 0.4, 0.7, 0.5, 0.4);
    }
    ctx.globalAlpha = base;
}

// Brilho pulsante da lâmina (somado à cena)
function drawBladeGlow(t, colors, boost = 1) {
    const pulse = 0.5 + 0.5 * Math.sin((t / V.bladePulsePeriodSeconds) * Math.PI * 2);
    const radius = (V.bladeGlowMin + (V.bladeGlowMax - V.bladeGlowMin) * pulse) * 0.9 * boost;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, colors.soft, V.bladeLength * 0.55, 0, radius, 0.32 + 0.2 * pulse);
    ctx.restore();
}

// Braços e espada. Repouso e golpe são misturados por swingBlend (transição suave).
function drawArmsAndSword(t, frenzy) {
    const colors = getBladeColors(frenzy);
    const blend = anim.swingBlend;
    const run = anim.run;

    // Pose da lâmina em repouso: abaixada ao lado, balançando levemente com a passada
    const restHandX = 1.5 + Math.sin(anim.stride + Math.PI) * V.armSwing * 0.4 * run;
    const restHandY = V.handOffset;
    const restAngle = V.restBladeAngle + Math.sin(anim.stride) * 0.12 * run;

    // Pose de golpe: a mão acompanha o ângulo da lâmina, perto do corpo
    let swingAngle = restAngle;
    if (anim.swingActive || blend > 0) {
        swingAngle = swingAngleAt(Math.min(anim.swingElapsed, anim.swingSeconds));
    }
    const swingHandX = Math.cos(swingAngle) * 8.5;
    const swingHandY = Math.sin(swingAngle) * 8.5;

    const handX = restHandX + (swingHandX - restHandX) * blend;
    const handY = restHandY + (swingHandY - restHandY) * blend;
    const angle = lerpAngle(restAngle, swingAngle, blend);

    // Braço livre (esquerdo): balança contra a passada, recolhido no golpe
    const freeSwing = Math.sin(anim.stride) * V.armSwing * run;
    const freeX = 1 + freeSwing * (1 - blend) - blend * 1.5;
    const freeY = -V.handOffset * (0.8 - blend * 0.25);
    ctx.lineCap = 'round';
    ctx.strokeStyle = V.colors.sleeve;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(0, -V.shoulderWidth * 0.62);
    ctx.quadraticCurveTo(freeX * 0.3, -V.shoulderWidth * 0.9, freeX, freeY);
    ctx.stroke();
    ctx.fillStyle = V.colors.glove;
    ctx.beginPath();
    ctx.arc(freeX, freeY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Braço da espada: ombro → cotovelo (curva) → mão
    ctx.strokeStyle = V.colors.sleeve;
    ctx.lineWidth = 2.7;
    ctx.beginPath();
    ctx.moveTo(0, V.shoulderWidth * 0.62);
    ctx.quadraticCurveTo(handX * 0.4 + 1, V.shoulderWidth * 0.95, handX, handY);
    ctx.stroke();

    ctx.save();
    ctx.translate(handX, handY);

    // Rastro fantasma do corte: cópias da lâmina em instantes anteriores
    if (anim.swingActive && anim.swingElapsed < anim.swingSeconds + 0.05) {
        const base = ctx.globalAlpha;
        for (let g = V.ghostCount; g >= 1; g--) {
            const ghostAngle = swingAngleAt(anim.swingElapsed - g * V.ghostGapSeconds);
            ctx.save();
            ctx.rotate(ghostAngle);
            ctx.globalAlpha = base * 0.5 * (1 - g / (V.ghostCount + 1)) * blend;
            drawBladeShape(t);
            ctx.restore();
        }
    }

    ctx.rotate(angle);
    drawBladeGlow(t, colors, 1 + blend * 0.7);
    drawBladeShape(t);
    ctx.restore();

    // Mão da espada
    ctx.fillStyle = V.colors.glove;
    ctx.beginPath();
    ctx.arc(handX, handY, 1.6, 0, Math.PI * 2);
    ctx.fill();
}

function drawBody(t) {
    const run = anim.run;
    // Respiração ofegante no idle + leve sobe-e-desce na corrida
    const breath = Math.sin((t / V.breathPeriodSeconds) * Math.PI * 2) * V.breathAmount * (1 - run);
    const bob = Math.sin(anim.stride * 2) * V.bobAmount * run;

    ctx.save();
    ctx.scale(1 - breath * 0.5 - bob * 0.4, 1 + breath + bob);

    // Túnica / ombros
    ctx.fillStyle = V.colors.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, V.shoulderDepth, V.shoulderWidth, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ombros arredondados (volume)
    ctx.fillStyle = V.colors.sleeve;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(0.3, side * V.shoulderWidth * 0.68, 3.1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Tira cruzando o peito e fivela
    ctx.strokeStyle = V.colors.strap;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-1.5, -V.shoulderWidth * 0.7);
    ctx.lineTo(2.2, V.shoulderWidth * 0.55);
    ctx.stroke();
    ctx.fillStyle = V.colors.buckle;
    ctx.fillRect(0.2, -0.5, 1.3, 1.1);

    // Faixa na cintura
    ctx.strokeStyle = V.colors.sash;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(-1, 0, V.shoulderDepth * 0.7, V.shoulderWidth * 0.85, 0, Math.PI * 0.6, Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
}

// Capuz profundo: ponta atrás, dobras, abertura escura que sombreia a máscara
function drawHoodAndMask(t) {
    const run = anim.run;
    const hx = 1 + run * 1.5;
    const r = V.hoodRadius;

    // Ponta do capuz caindo para trás
    ctx.fillStyle = V.colors.hood;
    ctx.beginPath();
    ctx.moveTo(hx - r * 0.2, -r * 0.8);
    ctx.quadraticCurveTo(hx - r * 1.9 + anim.capeX * 0.3, anim.capeY * 0.2, hx - r * 0.2, r * 0.8);
    ctx.closePath();
    ctx.fill();

    // Corpo do capuz
    ctx.beginPath();
    ctx.arc(hx, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Dobras do tecido
    ctx.strokeStyle = V.colors.hoodFold;
    ctx.lineWidth = 0.7;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(hx - r * 0.9, side * r * 0.25);
        ctx.quadraticCurveTo(hx - r * 0.2, side * r * 0.9, hx + r * 0.3, side * r * 0.85);
        ctx.stroke();
    }

    // Abertura do capuz
    ctx.fillStyle = V.colors.hoodInner;
    ctx.beginPath();
    ctx.ellipse(hx + r * 0.45, 0, r * 0.5, r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();

    // Máscara de osso
    const mx = hx + V.maskOffset;
    const mw = V.maskWidth / 2;
    const mh = V.maskHeight / 2;
    ctx.fillStyle = V.colors.mask;
    ctx.beginPath();
    ctx.ellipse(mx, 0, mw, mh, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sombra do capuz sobre a parte de trás da máscara
    ctx.fillStyle = V.colors.maskShade;
    ctx.beginPath();
    ctx.ellipse(mx - mw * 0.4, 0, mw * 0.6, mh * 0.9, 0, Math.PI / 2, Math.PI * 1.5);
    ctx.fill();

    // Olhos vazados, fenda do nariz e linha da mandíbula
    ctx.fillStyle = V.colors.maskEyes;
    ctx.beginPath();
    ctx.ellipse(mx + 0.3, -1.2, 0.85, 0.7, 0.3, 0, Math.PI * 2);
    ctx.ellipse(mx + 0.3, 1.2, 0.85, 0.7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(mx + 1.1, -0.2, 0.6, 0.4);
    ctx.strokeStyle = V.colors.maskShade;
    ctx.lineWidth = 0.35;
    ctx.beginPath();
    ctx.moveTo(mx + 1.5, -1.4);
    ctx.lineTo(mx + 1.5, 1.4);
    ctx.stroke();

    // Brilho frio nos olhos, pulsando (a lâmina reflete na máscara)
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * (0.35 + 0.3 * Math.sin(t * 3));
    ctx.fillStyle = V.colors.eyeGlint;
    ctx.fillRect(mx + 0.2, -1.4, 0.6, 0.5);
    ctx.fillRect(mx + 0.2, 0.9, 0.6, 0.5);
    ctx.globalAlpha = baseAlpha;
}

export function renderPlayer() {
    const t = performance.now() / 1000;
    const frenzy = state.frenzyActiveTimer > 0;
    const run = anim.run;

    // Dano: curva do empurrão (0 → 1 no pico → 0), na direção oposta ao golpe
    const K = V.knockback;
    const hitP = (performance.now() - player.hitTime) / 1000 / K.seconds;
    let push = 0;
    if (hitP >= 0 && hitP < 1) {
        push = hitP < K.peakAt
            ? easeOutCubic(hitP / K.peakAt)
            : 1 - easeOutQuad((hitP - K.peakAt) / (1 - K.peakAt));
    }
    const hitAngle = Math.atan2(player.hitDirY, player.hitDirX);

    // Anel de impacto no chão (não é empurrado)
    const ringP = (performance.now() - player.hitTime) / 1000 / K.ringSeconds;
    if (ringP >= 0 && ringP < 1) {
        ctx.save();
        ctx.globalAlpha = (1 - ringP) * 0.7;
        ctx.strokeStyle = V.colors.hurtRing;
        ctx.lineWidth = 2.5 * (1 - ringP) + 0.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, K.ringStartRadius + (K.ringEndRadius - K.ringStartRadius) * easeOutCubic(ringP), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // Invulnerável: pulso suave de transparência (em vez de piscar branco)
    const pulse = player.iFrames > 0
        ? V.invulnerableAlphaMin + (1 - V.invulnerableAlphaMin) * (0.5 + 0.5 * Math.sin(performance.now() / V.invulnerablePulseMs))
        : 1;
    const rim = hitP >= 0 && hitP < K.rimSeconds / K.seconds;

    ctx.save();
    ctx.globalAlpha = pulse;
    // Recuo + achatamento na direção do golpe
    ctx.translate(player.x + player.hitDirX * K.distance * push, player.y + player.hitDirY * K.distance * push);
    if (push > 0) {
        ctx.rotate(hitAngle);
        ctx.scale(1 - K.squash * push, 1 + K.squash * 0.5 * push);
        ctx.rotate(-hitAngle);
    }
    // Inclina levemente para dentro da curva ao virar, e no empurrão
    const turnLean = Math.max(-0.12, Math.min(0.12, anim.turnRate * 0.012));
    ctx.rotate(anim.facing + turnLean + push * K.tilt * (Math.sin(hitAngle - anim.facing) >= 0 ? 1 : -1));
    ctx.scale(V.scale, V.scale);
    // Corrida estica na direção do movimento
    ctx.scale(1 + run * V.runLeanStretch, 1 - run * V.runLeanStretch * 0.5);

    const swinging = anim.swingBlend > 0.35;
    drawCape(t);
    drawSashTails(t);
    drawBoots();
    if (!swinging) drawArmsAndSword(t, frenzy);
    drawBody(t);
    drawHoodAndMask(t);
    if (swinging) drawArmsAndSword(t, frenzy);

    // Contorno rosado só no instante do impacto
    if (rim) {
        ctx.strokeStyle = V.colors.hurtRim;
        ctx.globalAlpha = pulse * (1 - hitP / (K.rimSeconds / K.seconds));
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, V.shoulderDepth + 1.5, V.shoulderWidth + 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}
