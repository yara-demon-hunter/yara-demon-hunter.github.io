import { RAVEN_VISUALS as V } from './raven_visual.js';
import { drawGlow } from '../../core/glow.js';
import { renderNow } from '../../core/clock.js';
import { feather, ramp } from '../phoenix/phoenix.js';

function makeCanvas(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    if (draw) draw(canvas.getContext('2d'));
    return canvas;
}

// --- CORVO (buddy) ---
// Ave pequena que anda com o herói (no Last Torch, o Shadow Raven). Como a fênix: desenhada uma vez por quadro da batida de asa, guardada num atlas e
// em campo custa um drawImage. Olhando para a direita, com a origem no peito.
const TAU = Math.PI * 2;
const mix = (a, b, k) => a + (b - a) * k;

// Asa em duas partes (braço e mão). A asa varre do alto, passa por trás e vai para baixo; a mão atrasa um pouco
function drawWing(g, phase, shoulderX, shoulderY, colors, phaseShift) {
    const beat = phase + phaseShift;
    const lift = 0.5 + 0.5 * Math.cos(beat * TAU);
    const trail = 0.5 + 0.5 * Math.cos((beat - 0.1) * TAU);
    const down = Math.max(0, -Math.sin(beat * TAU));        // subida: asa recolhida
    const reach = 1 - down * 0.25;
    const spread = mix(0.19, 0.12, down);
    const arm = mix(-3.95, -2.05, lift);
    const hand = mix(-4.1, -1.85, trail);
    const elbowX = shoulderX + Math.cos(arm) * 12 * reach;
    const elbowY = shoulderY + Math.sin(arm) * 12 * reach;
    const wristX = elbowX + Math.cos(hand) * 11 * reach;
    const wristY = elbowY + Math.sin(hand) * 11 * reach;

    // Primárias abertas em leque a partir do punho: as mais longas ficam por baixo
    for (let i = 5; i >= 0; i--) {
        const angle = hand + 0.12 - i * spread;
        feather(g, wristX, wristY, angle, (26 - i * 1.7) * reach, 3.4, -2 - i * 0.3, colors);
    }
    // Secundárias: saem do braço e seguem para trás do corpo
    for (let i = 0; i < 5; i++) {
        const k = i / 4;
        const x = k < 0.5 ? mix(wristX, elbowX, k * 2) : mix(elbowX, shoulderX, k * 2 - 1);
        const y = k < 0.5 ? mix(wristY, elbowY, k * 2) : mix(elbowY, shoulderY, k * 2 - 1);
        feather(g, x, y, hand - 6 * spread - k * 0.5, mix(19, 14, k) * reach, 3.2, -1.5, colors);
    }
    // Braço: forma cheia que afina até o punho, por baixo das coberteiras
    g.fillStyle = ramp(g, shoulderX, shoulderY, wristX, wristY, V.covert);
    g.beginPath();
    g.moveTo(shoulderX - 3.5, shoulderY + 3.5);
    g.quadraticCurveTo(elbowX - 2, elbowY - 2.5, wristX, wristY);
    g.quadraticCurveTo(elbowX + 3, elbowY + 3, shoulderX + 3.5, shoulderY - 2.5);
    g.closePath();
    g.fill();
}

function drawTail(g, phase) {
    const sway = Math.sin(phase * TAU) * 0.05;
    [2.95, 3.12, 3.3, 3.47].forEach((angle, i) => {
        feather(g, -11, 3, angle + sway * (i - 1.5), 21 - Math.abs(i - 1.5) * 2.4, 2.9, 0.8, V.far, i % 2 === 0);
    });
}

function drawBody(g, phase) {
    const B = V.body;
    const breath = Math.sin(phase * TAU) * 0.5;
    g.fillStyle = ramp(g, 14, -12, -12, 9, [B.head, B.neck, B.back]);
    g.beginPath();
    g.moveTo(-13, 5);
    g.bezierCurveTo(-11, -4, -3, -10, 7, -11);
    g.bezierCurveTo(14, -11, 17, -5, 15 + breath, 1);
    g.bezierCurveTo(12 + breath, 9, 0, 11, -13, 5);
    g.fill();

    // Brilho violeta no dorso e peito um pouco mais claro
    g.fillStyle = B.sheen;
    g.beginPath();
    g.ellipse(-2, -6, 9, 2.2, -0.12, 0, TAU);
    g.fill();
    g.fillStyle = B.belly;
    g.beginPath();
    g.ellipse(7, 3, 7, 4.2, 0.35, 0, TAU);
    g.fill();

    // Patas recolhidas
    g.strokeStyle = V.leg;
    g.lineWidth = 1.1;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(1, 9);
    g.lineTo(-3, 13);
    g.moveTo(5, 9);
    g.lineTo(2, 13.5);
    g.stroke();
}

function drawHead(g, phase) {
    const bob = Math.sin(phase * TAU) * 0.5;
    g.fillStyle = ramp(g, 10, -18, 20, -6, [V.body.head, V.body.neck]);
    g.beginPath();
    g.ellipse(15, -9 + bob, 6.4, 5.6, 0.15, 0, TAU);
    g.fill();

    // Bico forte e reto, com a ponta curvada
    g.fillStyle = ramp(g, 20, -12, 30, -4, [V.beak.light, V.beak.dark]);
    g.beginPath();
    g.moveTo(19.5, -12 + bob);
    g.bezierCurveTo(24, -12.5 + bob, 29, -9.5 + bob, 30.5, -4.5 + bob);
    g.bezierCurveTo(26, -6.5 + bob, 22.5, -5.5 + bob, 19.5, -5.5 + bob);
    g.closePath();
    g.fill();

    g.fillStyle = V.eye.iris;
    g.beginPath();
    g.arc(17.2, -10.4 + bob, 1.6, 0, TAU);
    g.fill();
    g.fillStyle = V.eye.pupil;
    g.beginPath();
    g.arc(17.6, -10.4 + bob, 0.8, 0, TAU);
    g.fill();
    g.fillStyle = V.eye.glint;
    g.beginPath();
    g.arc(17.9, -10.9 + bob, 0.35, 0, TAU);
    g.fill();
}

// A ave inteira na fase `phase` da batida (0 a 1), em unidades da arte. Também usada na prévia, ampliada.
export function drawRavenArt(g, phase) {
    // Asa de trás: gira para a frente e encurta, para as duas asas se lerem
    g.save();
    g.translate(4, -6);
    g.rotate(0.6);
    g.scale(0.82, 0.9);
    drawWing(g, phase, 0, 0, V.far, -0.05);
    g.restore();
    drawTail(g, phase);
    drawBody(g, phase);
    drawHead(g, phase);
    drawWing(g, phase, -2, -5, V.near, 0);
}

// --- ATLAS ---
let atlas = null;

function buildAtlas(mobile) {
    const B = V.bounds;
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
            drawRavenArt(art, f / V.frames);
            // A silhueta brilha de leve: é o que separa o corvo preto do chão escuro
            g.shadowColor = V.glow;
            g.shadowBlur = 5 * pixels;
            g.drawImage(layer, f * cellW, 0);
        }
    });
    atlas = { canvas, cellW, cellH };
    return atlas;
}

// Monta o atlas e o desenha uma vez fora da tela (o navegador sobe a imagem para a placa de vídeo no primeiro
// desenho): melhor aqui, com a tela de skills aberta, do que no primeiro quadro em que o corvo aparece
// mobile: tela pequena (sprite com menos pixels); o jogo decide
export function prepareRaven(mobile = false) {
    if (atlas) return atlas;
    buildAtlas(mobile);
    makeCanvas(1, 1).getContext('2d').drawImage(atlas.canvas, 0, 0, atlas.cellW, atlas.cellH, 0, 0, 1, 1);
    return atlas;
}

// Corvo em (x, y) no mundo, desenhado em g. size multiplica o tamanho normal; facing: 1 = direita, -1 = esquerda.
// speed: 1 = batida normal; maior bate mais rápido (mergulho).
export function drawRavenSprite(g, x, y, size, facing, tilt, alpha = 1, speed = 1) {
    const { canvas, cellW, cellH } = prepareRaven();
    const B = V.bounds;
    const frame = Math.floor(renderNow() / 1000 * V.framesPerSecond * speed) % V.frames;
    const scale = V.scale * size;
    g.save();
    g.translate(x, y);
    g.rotate(tilt);
    g.scale(facing * scale, scale);
    g.globalAlpha = alpha;
    g.drawImage(canvas, frame * cellW, 0, cellW, cellH, B.left, B.top, B.width, B.height);
    g.restore();
}

// O corvo em campo: brilho, ave e penas soltas no rastro. Nasce crescendo de uma sombra.
// bird: { x, y, facing, tilt, dive, rise }
export function renderRavenBuddy(g, bird) {
    const { x, y, facing, tilt, dive, rise } = bird;
    const t = renderNow() / 1000;
    g.save();
    g.globalCompositeOperation = 'lighter';
    drawGlow(g, V.glow, x, y - 2, 22 + Math.sin(t * 6) * 2 + dive * 10, 0.6 + dive * 0.3);
    if (dive > 0) {
        // Penas soltas atrás do corvo mergulhando
        for (let i = 0; i < V.feathers; i++) {
            const u = (t * 2.4 + i / V.feathers) % 1;
            drawGlow(g, V.glowHot, x - facing * (6 + u * 18), y + (u - 0.3) * 10, 2.4 * (1 - u) + 0.6, 0.7 * (1 - u) * dive);
        }
    }
    g.restore();
    drawRavenSprite(g, x, y, 0.2 + 0.8 * Math.min(1, rise) ** 0.6, facing, tilt, 1, 1 + dive * 0.7);
}
