import { CHARACTER_MODEL } from '../../data_model/character.js';
import { HERO_VISUALS as V } from '../../data_model/visuals.js';
import { ctx, player, state } from '../core/state.js';
import { easeOutCubic, lerpAngle } from './fx/easing.js';

// --- HERÓI (desenho procedural, sem imagens) ---
// Referência: art_reference/hero. Vista de cima: capa atrás, botas, ombros,
// capuz profundo com máscara de osso e espada rúnica azul na mão direita.
// No sistema local, +x é a frente do herói e +y é o lado direito.

// Estado puramente visual (não afeta a lógica do jogo)
const anim = {
    lastTime: performance.now(),
    lastX: 0,
    lastY: 0,
    speed: 0,
    stride: 0,
    facing: -Math.PI / 2,
    lastComboStep: 1,
    swingTimer: 0,
    swingSeconds: 0,
    swingStep: 1,
    swingFrom: 0,
    swingTo: 0
};

// Pontas fixas da barra da capa (aleatórias uma vez, para o rasgado não "tremer")
const capeJag = Array.from({ length: V.capeStrips + 1 }, (_, i) => (i % 2 === 0 ? 1 : 0.6 + Math.random() * 0.2));

function startSwing(step) {
    const combo = V.combo[step];
    const half = state.bladeSlashes.length ? state.bladeSlashes[state.bladeSlashes.length - 1].arcWidth / 2 : 0.7;
    anim.swingStep = step;
    anim.swingSeconds = combo.seconds;
    anim.swingTimer = combo.seconds;
    if (combo.spin) {
        anim.swingFrom = -Math.PI;
        anim.swingTo = Math.PI;
    } else {
        anim.swingFrom = combo.from * (half + combo.extraArc);
        anim.swingTo = combo.to * (half + combo.extraArc);
    }
}

function updateAnim() {
    const now = performance.now();
    const dt = Math.min((now - anim.lastTime) / 1000, 0.05);
    anim.lastTime = now;
    const playing = state.gameState === 'PLAYING';

    // Velocidade real (derivada da posição)
    const dx = player.x - anim.lastX;
    const dy = player.y - anim.lastY;
    anim.lastX = player.x;
    anim.lastY = player.y;
    if (playing && dt > 0) {
        const instant = Math.hypot(dx, dy) / dt;
        anim.speed += (Math.min(instant, 600) - anim.speed) * Math.min(1, dt * 12);
        anim.stride += dt * V.strideSpeed * Math.min(1, anim.speed / V.runSpeedForFullEffect);
        if (Math.hypot(dx, dy) > 0.3 && anim.swingTimer <= 0) {
            anim.facing = lerpAngle(anim.facing, Math.atan2(dy, dx), Math.min(1, dt * V.turnSmoothing));
        }
    }

    // Novo golpe: o passo executado é o valor anterior do combo
    if (player.comboStep !== anim.lastComboStep) {
        const executedStep = anim.lastComboStep;
        anim.lastComboStep = player.comboStep;
        anim.facing = player.angle;
        startSwing(executedStep);
    }
    if (anim.swingTimer > 0 && playing) anim.swingTimer -= dt;
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

// Capa preta esfarrapada com dobras
function drawCape(t, run) {
    const length = V.capeBaseLength + V.capeRunExtraLength * run;
    const wave = V.capeWaveIdle + (V.capeWaveRun - V.capeWaveIdle) * run;
    const tailHalf = (V.capeTailWidth / 2) * (1 - run * 0.25);
    const shoulderHalf = V.shoulderWidth * 0.95;

    const tips = [];
    for (let i = 0; i <= V.capeStrips; i++) {
        const k = i / V.capeStrips;
        const flutter = Math.sin(t * V.capeWaveSpeed + i * 1.3) * wave;
        tips.push({
            x: -length * capeJag[i] - Math.abs(flutter) * 0.6,
            y: -tailHalf + k * tailHalf * 2 + flutter * 0.5
        });
    }

    ctx.beginPath();
    ctx.moveTo(1, -shoulderHalf);
    tips.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(1, shoulderHalf);
    ctx.closePath();
    ctx.fillStyle = V.colors.cape;
    ctx.fill();
    ctx.strokeStyle = V.colors.capeEdge;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Dobras texturizadas: linhas do ombro até as pontas longas
    ctx.strokeStyle = V.colors.capeFold;
    ctx.lineWidth = 0.9;
    for (let i = 2; i < V.capeStrips; i += 2) {
        const p = tips[i];
        ctx.beginPath();
        ctx.moveTo(-2, (p.y / tailHalf) * shoulderHalf * 0.8);
        ctx.lineTo(p.x * 0.85, p.y * 0.95);
        ctx.stroke();
    }
}

// Botas enfaixadas aparecendo na passada
function drawBoots(run) {
    if (run < 0.05) return;
    const step = Math.sin(anim.stride) * V.strideLength * run;
    ctx.fillStyle = V.colors.boots;
    [[step, -3], [-step, 3]].forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.ellipse(bx + 1, by, V.bootLength / 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function getBladeGlowColor(frenzy) {
    if (frenzy) return V.colors.bladeGlowFrenzy;
    if (player.doubleDmgTimer > 0) return V.colors.bladeGlowDoubleDmg;
    return V.colors.bladeGlow;
}

// Uma lâmina (com cabo e runas) apontando para +x a partir da origem atual
function drawBladeShape(t, glowColor, glowBlur, alpha = 1) {
    ctx.globalAlpha = alpha;

    // Cabo e guarda
    ctx.fillStyle = V.colors.sleeve;
    ctx.fillRect(-3, -0.9, 3, 1.8);
    ctx.fillStyle = V.colors.maskShade;
    ctx.fillRect(-0.3, -2, 1, 4);

    // Lâmina com brilho
    ctx.shadowBlur = glowBlur;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = V.colors.blade;
    ctx.beginPath();
    ctx.moveTo(1, -V.bladeWidth / 2);
    ctx.lineTo(V.bladeLength - 3, -V.bladeWidth / 2);
    ctx.lineTo(V.bladeLength, 0);
    ctx.lineTo(V.bladeLength - 3, V.bladeWidth / 2);
    ctx.lineTo(1, V.bladeWidth / 2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Runas que acendem em onda ao longo do gume
    ctx.fillStyle = V.colors.runes;
    for (let i = 0; i < V.runeCount; i++) {
        const rx = 3 + i * ((V.bladeLength - 7) / (V.runeCount - 1));
        const wave = 0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - i * 1.2));
        ctx.globalAlpha = alpha * wave;
        ctx.fillRect(rx, -0.5, 1.4, 1);
    }
    ctx.globalAlpha = alpha;
}

function drawSwordArm(t, frenzy) {
    const glowColor = getBladeGlowColor(frenzy);
    const pulse = 0.5 + 0.5 * Math.sin((t / V.bladePulsePeriodSeconds) * Math.PI * 2);
    let glowBlur = V.bladeGlowMin + (V.bladeGlowMax - V.bladeGlowMin) * pulse;

    let angle = V.restBladeAngle;
    let handX = 1;
    let handY = V.handOffset;
    const swinging = anim.swingTimer > 0;
    if (swinging) {
        const p = easeOutCubic(1 - anim.swingTimer / anim.swingSeconds);
        angle = anim.swingFrom + (anim.swingTo - anim.swingFrom) * p;
        handX = Math.cos(angle) * 5;
        handY = Math.sin(angle) * 5;
        glowBlur = V.combo[anim.swingStep].glow;
    }

    // Manga do braço até a mão
    ctx.strokeStyle = V.colors.sleeve;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, V.shoulderWidth * 0.6);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    ctx.save();
    ctx.translate(handX, handY);

    // Finalizador (giro): rastros fantasmas da lâmina
    if (swinging && V.combo[anim.swingStep].spin) {
        for (let g = 3; g >= 1; g--) {
            ctx.save();
            ctx.rotate(angle - g * 0.45);
            drawBladeShape(t, glowColor, glowBlur * 0.6, 0.18 * (4 - g));
            ctx.restore();
        }
    }

    ctx.rotate(angle);
    drawBladeShape(t, glowColor, glowBlur);
    ctx.restore();
}

function drawBody(t, run, hurtFlash) {
    // Respiração ofegante no idle
    const breath = Math.sin((t / V.breathPeriodSeconds) * Math.PI * 2) * V.breathAmount * (1 - run);

    ctx.save();
    ctx.scale(1 - breath * 0.5, 1 + breath);
    // Ombros / túnica
    ctx.fillStyle = hurtFlash ? V.colors.hurtFlash : V.colors.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, V.shoulderDepth, V.shoulderWidth, 0, 0, Math.PI * 2);
    ctx.fill();
    // Faixa na cintura (aparece atrás do capuz)
    if (!hurtFlash) {
        ctx.strokeStyle = V.colors.sash;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(-1, 0, V.shoulderDepth * 0.7, V.shoulderWidth * 0.85, 0, Math.PI * 0.6, Math.PI * 1.4);
        ctx.stroke();
    }
    ctx.restore();
}

// Capuz profundo: a abertura escura projeta sombra sobre o topo da máscara
function drawHoodAndMask(run, hurtFlash) {
    const hx = 1 + run * 1.5;
    const r = V.hoodRadius;

    ctx.fillStyle = hurtFlash ? V.colors.hurtFlash : V.colors.hood;
    ctx.beginPath();
    ctx.arc(hx, 0, r, 0, Math.PI * 2);
    ctx.fill();

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

    // Sombra do capuz sobre a parte de trás (topo) da máscara
    ctx.fillStyle = V.colors.maskShade;
    ctx.beginPath();
    ctx.ellipse(mx - mw * 0.4, 0, mw * 0.6, mh * 0.9, 0, Math.PI / 2, Math.PI * 1.5);
    ctx.fill();

    // Traços: olhos vazados, fenda do nariz e linha da mandíbula
    ctx.fillStyle = V.colors.maskEyes;
    ctx.beginPath();
    ctx.ellipse(mx + 0.3, -1.2, 0.8, 0.65, 0.3, 0, Math.PI * 2);
    ctx.ellipse(mx + 0.3, 1.2, 0.8, 0.65, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(mx + 1.1, -0.2, 0.6, 0.4);
    ctx.strokeStyle = V.colors.maskShade;
    ctx.lineWidth = 0.35;
    ctx.beginPath();
    ctx.moveTo(mx + 1.5, -1.4);
    ctx.lineTo(mx + 1.5, 1.4);
    ctx.stroke();
}

export function renderPlayer() {
    const t = performance.now() / 1000;
    const frenzy = state.frenzyActiveTimer > 0;
    const run = Math.min(1, anim.speed / V.runSpeedForFullEffect);

    // Dano: pisca branco e achata no início da invulnerabilidade
    const hurtElapsed = CHARACTER_MODEL.invulnerabilitySeconds - player.iFrames;
    const squash = player.iFrames > 0 && hurtElapsed < V.hurtSquashSeconds
        ? V.hurtSquash * (1 - hurtElapsed / V.hurtSquashSeconds)
        : 0;
    const hurtFlash = player.iFrames > 0
        && Math.floor(performance.now() / CHARACTER_MODEL.damageImmunityFlashIntervalMs) % 2 === 0;

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(anim.facing);
    ctx.scale(V.scale, V.scale);
    // Corrida estica na direção do movimento; dano achata
    ctx.scale(1 + run * V.runLeanStretch - squash, 1 - run * V.runLeanStretch * 0.5 + squash);

    const swinging = anim.swingTimer > 0;
    drawCape(t, run);
    drawBoots(run);
    if (!swinging) drawSwordArm(t, frenzy);
    drawBody(t, run, hurtFlash);
    drawHoodAndMask(run, hurtFlash);
    if (swinging) drawSwordArm(t, frenzy);

    ctx.restore();

    // Escudo Visual
    if (player.shieldTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, CHARACTER_MODEL.shieldRadius * V.scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
