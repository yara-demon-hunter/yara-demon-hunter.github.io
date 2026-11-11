// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/characters/hunter/hero_topdown.js e rode o sync.
import { HERO_VISUALS as V } from './hero_visual.js';
import { swingAngleAt, capeJag } from './hero_anim.js';
import { ctx } from '../../core/canvas.js';
import { easeOutCubic, easeOutQuad, lerpAngle } from '../../core/easing.js';
import { drawGlow } from '../../core/glow.js';

// --- DEMON HUNTER VISTO DE CIMA (desenho procedural, sem imagens) ---
// Referência: art_reference/ (nesta pasta). Vista de cima: capa esfarrapada atrás (com física), botas
// enfaixadas, ombros e braços, capuz profundo com máscara de osso e espada rúnica azul.
// No sistema local, +x é a frente do herói e +y é o lado direito. O boneco padrão hoje é o 2.5D (hero25d.js); este
// é o desenho antigo, usado no Last Torch com ?hero=topdown. A animação vem de hero_anim.js.

// Estado de animação de quem está sendo desenhado (renderHeroTopDown troca antes de desenhar)
let anim = null;

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
        swingAngle = swingAngleAt(Math.min(anim.swingElapsed, anim.swingSeconds), anim);
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
            const ghostAngle = swingAngleAt(anim.swingElapsed - g * V.ghostGapSeconds, anim);
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

// body: { x, y, hitTime, hitDirX, hitDirY, iFrames }. bodyAnim: de createHeroAnim (hero_anim.js). frenzy: lâmina acesa
export function renderHeroTopDown(body, bodyAnim, frenzy = false) {
    anim = bodyAnim;
    const t = performance.now() / 1000;
    const run = anim.run;

    // Dano: curva do empurrão (0 → 1 no pico → 0), na direção oposta ao golpe
    const K = V.knockback;
    const hitP = (performance.now() - body.hitTime) / 1000 / K.seconds;
    let push = 0;
    if (hitP >= 0 && hitP < 1) {
        push = hitP < K.peakAt
            ? easeOutCubic(hitP / K.peakAt)
            : 1 - easeOutQuad((hitP - K.peakAt) / (1 - K.peakAt));
    }
    const hitAngle = Math.atan2(body.hitDirY, body.hitDirX);

    // Anel de impacto no chão (não é empurrado)
    const ringP = (performance.now() - body.hitTime) / 1000 / K.ringSeconds;
    if (ringP >= 0 && ringP < 1) {
        ctx.save();
        ctx.globalAlpha = (1 - ringP) * 0.7;
        ctx.strokeStyle = V.colors.hurtRing;
        ctx.lineWidth = 2.5 * (1 - ringP) + 0.5;
        ctx.beginPath();
        ctx.arc(body.x, body.y, K.ringStartRadius + (K.ringEndRadius - K.ringStartRadius) * easeOutCubic(ringP), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // Invulnerável: pulso suave de transparência (em vez de piscar branco)
    const pulse = body.iFrames > 0
        ? V.invulnerableAlphaMin + (1 - V.invulnerableAlphaMin) * (0.5 + 0.5 * Math.sin(performance.now() / V.invulnerablePulseMs))
        : 1;
    const rim = hitP >= 0 && hitP < K.rimSeconds / K.seconds;

    ctx.save();
    ctx.globalAlpha = pulse;
    // Recuo + achatamento na direção do golpe
    ctx.translate(body.x + body.hitDirX * K.distance * push, body.y + body.hitDirY * K.distance * push);
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
