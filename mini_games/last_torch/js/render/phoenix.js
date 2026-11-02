import { PHOENIX_VISUALS as V } from '../../data_model/visuals/effects/phoenix_visual.js';
import { WORLD } from '../../data_model/world.js';
import { ctx, passives, state } from '../core/state.js';
import { makeCanvas } from './fx/sprites.js';
import { drawGlow } from './fx/glow.js';
import { renderNow } from './fx/clock.js';

// --- FÊNIX ---
// Ave de fogo do Phoenix Pact. A arte tem muitas penas e degradês: é desenhada uma vez por quadro da batida de
// asa e guardada num atlas (como os monstros); em campo custa um drawImage. Olhando para a direita, com a origem no peito.
const TAU = Math.PI * 2;
const mix = (a, b, k) => a + (b - a) * k;

// Degradê ao longo de um segmento
export function ramp(g, x0, y0, x1, y1, colors) {
    const grad = g.createLinearGradient(x0, y0, x1, y1);
    colors.forEach((color, i) => grad.addColorStop(i / (colors.length - 1), color));
    return grad;
}

// Pena: uma folha de (x, y) na direção `angle`, curvada por `bend`, com a nervura no meio
export function feather(g, x, y, angle, length, width, bend, colors, vein = true) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const tipX = x + dx * length - dy * bend;
    const tipY = y + dy * length + dx * bend;
    const midX = x + dx * length * 0.55 - dy * bend * 0.2;
    const midY = y + dy * length * 0.55 + dx * bend * 0.2;
    const sideX = -dy * width;
    const sideY = dx * width;
    g.fillStyle = ramp(g, x, y, tipX, tipY, colors);
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(midX + sideX, midY + sideY, tipX, tipY);
    g.quadraticCurveTo(midX - sideX, midY - sideY, x, y);
    g.fill();
    if (!vein) return;
    g.strokeStyle = V.vein;
    g.lineWidth = 0.5;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(midX, midY, mix(midX, tipX, 0.7), mix(midY, tipY, 0.7));
    g.stroke();
}

// Lambida de fogo na ponta de uma pena: nasce transparente e termina clara
function flameLick(g, x, y, angle, size, phase, seed) {
    const flicker = 0.75 + 0.25 * Math.sin(phase * TAU * 2 + seed);
    feather(g, x - Math.cos(angle) * size * 0.5, y - Math.sin(angle) * size * 0.5, angle + Math.sin(phase * TAU + seed) * 0.12, size * 1.5 * flicker, size * 0.34, -1, V.flame, false);
}

// Asa em duas partes (braço e mão): a mão atrasa em relação ao braço, e a asa recolhe na subida
function drawWing(g, phase, shoulderX, shoulderY, colors, phaseShift) {
    const beat = phase + phaseShift;
    const lift = 0.5 + 0.5 * Math.cos(beat * TAU);
    const trail = 0.5 + 0.5 * Math.cos((beat - 0.09) * TAU);
    const rising = Math.max(0, -Math.sin(beat * TAU));      // subida: asa recolhida
    const reach = 1 - rising * 0.3;
    const spread = mix(0.17, 0.11, rising);
    const arm = mix(-3.3, -1.72, lift);
    const hand = mix(-3.45, -1.5, trail);
    const elbowX = shoulderX + Math.cos(arm) * 17 * reach;
    const elbowY = shoulderY + Math.sin(arm) * 17 * reach;
    const wristX = elbowX + Math.cos(hand) * 17 * reach;
    const wristY = elbowY + Math.sin(hand) * 17 * reach;

    // Rêmiges primárias, abertas em leque a partir do punho: as mais longas ficam por baixo
    for (let i = 6; i >= 0; i--) {
        const angle = hand + 0.1 - i * spread;
        const length = (37 - i * 2.4) * reach;
        feather(g, wristX, wristY, angle, length, 5.2, -3 - i * 0.4, colors);
        if (i < 4) flameLick(g, wristX + Math.cos(angle) * length, wristY + Math.sin(angle) * length, angle, 6, phase, i * 1.7);
    }
    // Secundárias: saem do braço e seguem para trás do corpo
    for (let i = 0; i < 7; i++) {
        const k = i / 6;
        const x = k < 0.5 ? mix(wristX, elbowX, k * 2) : mix(elbowX, shoulderX, k * 2 - 1);
        const y = k < 0.5 ? mix(wristY, elbowY, k * 2) : mix(elbowY, shoulderY, k * 2 - 1);
        const angle = hand - 7 * spread - k * 0.55;
        feather(g, x, y, angle, mix(27, 20, k) * reach, 5, -2, colors);
    }
    // Braço da asa: forma cheia que afina até o punho, por baixo das coberteiras
    const armColors = colors === V.far ? colors.slice(1) : V.covert;
    g.fillStyle = ramp(g, shoulderX, shoulderY, wristX, wristY, armColors);
    g.beginPath();
    g.moveTo(shoulderX - 5, shoulderY + 5);
    g.quadraticCurveTo(elbowX - 3, elbowY - 3.5, wristX, wristY);
    g.quadraticCurveTo(elbowX + 4, elbowY + 4, shoulderX + 5, shoulderY - 3);
    g.closePath();
    g.fill();
    // Coberteiras: camada curta e clara sobre a base das penas
    for (let i = 0; i < 7; i++) {
        const k = i / 6;
        const x = k < 0.5 ? mix(wristX, elbowX, k * 2) : mix(elbowX, shoulderX, k * 2 - 1);
        const y = k < 0.5 ? mix(wristY, elbowY, k * 2) : mix(elbowY, shoulderY, k * 2 - 1);
        feather(g, x, y, hand - 0.55 - k * 1, 12.5 - k * 2, 3.8, -1, armColors, false);
    }
}

// Pluma da cauda: fita fina que ondula e abre numa ponta de fogo em forma de lágrima
function drawPlume(g, baseAngle, length, width, phase, seed) {
    const STEPS = 22;
    const dx = Math.cos(baseAngle);
    const dy = Math.sin(baseAngle);
    const point = (u) => {
        const wave = Math.sin((u * 1.15 - phase) * TAU + seed) * 9 * u;
        const curl = u * u * 20;        // a ponta se abre para trás
        return { x: -12 + dx * length * u - dy * wave - curl, y: 12 + dy * length * u + dx * wave };
    };
    const left = [];
    const right = [];
    for (let i = 0; i <= STEPS; i++) {
        const u = i / STEPS;
        const p = point(u);
        const q = point(Math.min(1, u + 0.02));
        const a = Math.atan2(q.y - p.y, q.x - p.x);
        // Larga na base, fina no meio e abrindo de novo na ponta
        const w = width * (u < 0.3 ? mix(1.5, 0.5, u / 0.3) : mix(0.5, 1.15, ((u - 0.3) / 0.7) ** 2.2)) * (u > 0.93 ? (1 - u) / 0.07 : 1);
        left.push([p.x - Math.sin(a) * w, p.y + Math.cos(a) * w]);
        right.push([p.x + Math.sin(a) * w, p.y - Math.cos(a) * w]);
    }
    const tip = point(1);
    g.fillStyle = ramp(g, -12, 12, tip.x, tip.y, V.tail);
    g.beginPath();
    g.moveTo(left[0][0], left[0][1]);
    left.forEach(([x, y]) => g.lineTo(x, y));
    right.reverse().forEach(([x, y]) => g.lineTo(x, y));
    g.closePath();
    g.fill();

    // Lágrima clara perto da ponta, com o miolo quente
    const eye = point(0.87);
    const next = point(0.92);
    g.save();
    g.translate(eye.x, eye.y);
    g.rotate(Math.atan2(next.y - eye.y, next.x - eye.x));
    [[5.6, width * 0.85, V.tailEye.ring], [3.7, width * 0.55, V.tailEye.mid], [1.9, width * 0.28, V.tailEye.core]].forEach(([rx, ry, color]) => {
        g.fillStyle = color;
        g.beginPath();
        g.ellipse(0, 0, rx, ry, 0, 0, TAU);
        g.fill();
    });
    g.restore();
}

// Penas curtas da base da cauda: escondem a raiz das plumas
function drawTailCoverts(g) {
    [2.75, 2.35, 1.95, 1.55, 1.2].forEach((angle, i) => {
        feather(g, -11, 9, angle, 24 - Math.abs(i - 2) * 3, 4.6, 1, V.far, true);
    });
    [2.5, 2.05, 1.6].forEach((angle) => feather(g, -10, 8, angle, 15, 3.8, 1, V.covert, false));
}

function drawBody(g, phase) {
    const B = V.body;
    const breath = Math.sin(phase * TAU) * 0.7;
    g.fillStyle = ramp(g, 12, -28, -12, 15, [B.head, B.neck, B.chest, B.rump]);
    g.beginPath();
    g.moveTo(-15, 15);
    g.bezierCurveTo(-13, 0, -7, -12, 5, -23);
    g.bezierCurveTo(9, -27, 16, -24, 16, -18);
    g.bezierCurveTo(15, -12, 15 + breath, -8, 15 + breath, -1);
    g.bezierCurveTo(14 + breath, 9, 3, 16, -15, 15);
    g.fill();

    // Peito claro
    g.fillStyle = B.belly;
    g.beginPath();
    g.moveTo(14.5, -14);
    g.bezierCurveTo(15.5 + breath, -5, 14 + breath, 5, 1, 11);
    g.bezierCurveTo(7, 3, 8, -7, 14.5, -14);
    g.fill();

    // Escamas de pena no dorso
    g.strokeStyle = B.scale;
    g.lineWidth = 0.7;
    for (let row = 0; row < 4; row++) {
        for (let i = 0; i < 4; i++) {
            const x = -8 + i * 4.6 - row * 0.9 + (row % 2) * 2.3;
            const y = 7 - row * 4.6 - i * 1.1;
            g.beginPath();
            g.arc(x, y, 2.4, 0.35, Math.PI - 0.35);
            g.stroke();
        }
    }
}

function drawHead(g, phase) {
    const sway = Math.sin(phase * TAU) * 1.4;
    // Crista: três plumas para trás, com ponta quente
    [[-2.2, 26, 0], [-2.65, 23, 0.8], [-3.05, 18, 1.6]].forEach(([angle, length, seed]) => {
        const a = angle + Math.sin(phase * TAU + seed) * 0.06;
        feather(g, 9, -29, a, length, 2.6, -3 + sway, V.crest, false);
        const tipX = 9 + Math.cos(a) * length + Math.sin(a) * (3 - sway);
        const tipY = -29 + Math.sin(a) * length - Math.cos(a) * (3 - sway);
        g.fillStyle = V.tailEye.ring;
        g.beginPath();
        g.arc(tipX, tipY, 1.5, 0, TAU);
        g.fill();
    });

    // Cabeça
    g.fillStyle = ramp(g, 8, -36, 14, -20, [V.body.head, V.body.neck]);
    g.beginPath();
    g.ellipse(12, -28, 7.2, 6.4, -0.25, 0, TAU);
    g.fill();

    // Bico curvo
    g.fillStyle = ramp(g, 17, -32, 27, -24, [V.beak.light, V.beak.dark]);
    g.beginPath();
    g.moveTo(17, -33);
    g.bezierCurveTo(23, -33, 28, -29, 27, -22.5);
    g.bezierCurveTo(25.5, -26, 22, -26.6, 17.5, -25.5);
    g.closePath();
    g.fill();

    // Olho com máscara vermelha
    g.fillStyle = V.eye.socket;
    g.beginPath();
    g.moveTo(9, -29);
    g.quadraticCurveTo(14, -33.5, 18.5, -29.5);
    g.quadraticCurveTo(14, -27, 9, -29);
    g.fill();
    g.fillStyle = V.eye.iris;
    g.beginPath();
    g.arc(14.5, -30, 1.8, 0, TAU);
    g.fill();
    g.fillStyle = V.eye.pupil;
    g.beginPath();
    g.arc(15, -30, 0.8, 0, TAU);
    g.fill();
}

// A ave inteira na fase `phase` da batida (0 a 1), em unidades da arte. Também usada na prévia, ampliada.
export function drawPhoenixArt(g, phase) {
    // Asa de trás: gira para a frente e encurta na perspectiva, para as duas asas se lerem
    g.save();
    g.translate(5, -11);
    g.rotate(0.72);
    g.scale(0.82, 0.9);
    drawWing(g, phase, 0, 0, V.far, -0.04);
    g.restore();
    [[2.5, 76, 2.6, 2.6], [1.5, 62, 2.2, 4.4], [2.25, 88, 3, 1.3], [1.8, 72, 2.4, 5.4], [2, 82, 2.8, 0.4]]
        .forEach(([angle, length, width, seed]) => drawPlume(g, angle, length, width, phase, seed));
    drawTailCoverts(g);
    drawBody(g, phase);
    drawHead(g, phase);
    drawWing(g, phase, -3, -7, V.near, 0);
}

// --- ATLAS ---
let atlas = null;

function buildAtlas() {
    const B = V.bounds;
    const mobile = Math.min(window.innerWidth, window.innerHeight) < WORLD.mobileMaxShortSide;
    const pixels = mobile ? V.pixels.mobile : V.pixels.desktop;
    const cellW = Math.ceil(B.width * pixels);
    const cellH = Math.ceil(B.height * pixels);
    const canvas = makeCanvas(cellW * V.frames, cellH, (g) => {
        const layer = makeCanvas(cellW, cellH);
        const art = layer.getContext('2d');
        for (let f = 0; f < V.frames; f++) {
            art.setTransform(1, 0, 0, 1, 0, 0);
            art.clearRect(0, 0, cellW, cellH);
            art.setTransform(pixels, 0, 0, pixels, -B.left * pixels, -B.top * pixels);
            drawPhoenixArt(art, f / V.frames);
            // A silhueta inteira brilha: é o que separa a ave do fundo escuro
            g.shadowColor = V.glow;
            g.shadowBlur = 7 * pixels;
            g.drawImage(layer, f * cellW, 0);
        }
    });
    atlas = { canvas, cellW, cellH };
    return atlas;
}

// Monta o atlas e o desenha uma vez fora da tela: o navegador sobe a imagem para a placa de vídeo no primeiro
// desenho, e é melhor que isso aconteça aqui do que no primeiro quadro em que a ave aparece
export function preparePhoenix() {
    if (atlas) return atlas;
    buildAtlas();
    makeCanvas(1, 1).getContext('2d').drawImage(atlas.canvas, 0, 0, atlas.cellW, atlas.cellH, 0, 0, 1, 1);
    return atlas;
}

// Ave em (x, y) no mundo. size multiplica o tamanho normal; facing: 1 = direita, -1 = esquerda.
export function drawPhoenixSprite(x, y, size, facing, tilt, alpha = 1) {
    const { canvas, cellW, cellH } = preparePhoenix();
    const B = V.bounds;
    const frame = Math.floor(renderNow() / 1000 * V.framesPerSecond) % V.frames;
    const scale = V.scale * size;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(facing * scale, scale);
    ctx.globalAlpha = alpha;
    ctx.drawImage(canvas, frame * cellW, 0, cellW, cellH, B.left, B.top, B.width, B.height);
    ctx.restore();
}

// Ponto da ave de onde sai a bola de fogo (o bico)
export function phoenixBeak(x, y, facing) {
    return { x: x + facing * 27 * V.scale, y: y - 27 * V.scale };
}

// Fênix em campo: brilho, ave e fagulhas caindo da cauda. Nasce crescendo de uma brasa.
export function renderPhoenixBird() {
    const bird = state.phoenix;
    if (passives.phoenixPact.lvl <= 0 || !bird.placed) return;
    const { x, y, facing, tilt, flash, rise } = bird;
    const t = renderNow() / 1000;
    const hot = Math.max(0, 1 - rise) + (flash > 0 ? 0.6 : 0);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, V.glow, x, y - 4, 46 + Math.sin(t * 5) * 3 + hot * 34, 0.7);
    if (hot > 0) drawGlow(ctx, V.glowHot, x, y - 8, 20 + hot * 18, Math.min(1, hot));
    const embers = state.quality >= 2 ? 3 : V.embers;
    for (let i = 0; i < embers; i++) {
        const u = (t * 0.55 + i / embers) % 1;
        const ex = x - facing * (8 + u * 16) + Math.sin(t * 3 + i * 2.4) * (4 + u * 7);
        const ey = y + 12 + u * 42;
        drawGlow(ctx, V.glowHot, ex, ey, 3.4 * (1 - u) + 0.8, 0.9 * (1 - u));
    }
    ctx.restore();
    drawPhoenixSprite(x, y, 0.2 + 0.8 * Math.min(1, rise) ** 0.6, facing, tilt);
    if (flash > 0) {
        const beak = phoenixBeak(x, y, facing);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, V.glowHot, beak.x, beak.y, 13, 1);
        ctx.restore();
    }
}
