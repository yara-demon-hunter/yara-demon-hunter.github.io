import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras } from './character_fluffy.js';

// --- RATO (esfera lisa) ---
// Segue art_reference/mouse (em versão fofa; a imagem é brava): esfera cinza lisa (sem pelo), orelhas grandes com o interior rosa,
// barriga rosa, nariz rosa e cauda rosa, fina e pelada, jogada para trás e balançando.
// Sem braços e sem pernas.
const TAU = Math.PI * 2;

function tail(g, spec, pose) {
    g.save();
    g.translate(-0.8, 0.5);
    g.rotate(-pose.tail * 0.5);
    const P = [[0, 0], [-0.7, 0.35], [-0.9, -0.55], [-1.25, -0.4]];
    const at = (t) => {
        const u = 1 - t;
        const f = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
        return [0, 1].map(k => f[0] * P[0][k] + f[1] * P[1][k] + f[2] * P[2][k] + f[3] * P[3][k]);
    };
    // Afina até a ponta: vários trechos, cada um mais fino
    g.lineCap = 'round';
    for (let t = 0; t < 1; t += 0.05) {
        const w = 0.13 * (1 - t * 0.7);
        g.strokeStyle = spec.tailDark;
        g.lineWidth = w + 0.04;
        g.beginPath(); g.moveTo(...at(t)); g.lineTo(...at(t + 0.05)); g.stroke();
    }
    for (let t = 0; t < 1; t += 0.05) {
        g.strokeStyle = spec.tail;
        g.lineWidth = 0.13 * (1 - t * 0.7);
        g.beginPath(); g.moveTo(...at(t)); g.lineTo(...at(t + 0.05)); g.stroke();
    }
    // Aneizinhos: cauda pelada, sem pelo
    g.strokeStyle = spec.tailDark;
    g.lineWidth = 0.018;
    for (let t = 0.1; t < 0.95; t += 0.09) {
        const [x, y] = at(t);
        const [x2, y2] = at(t + 0.02);
        const a = Math.atan2(y2 - y, x2 - x) + Math.PI / 2;
        const w = 0.065 * (1 - t * 0.7);
        g.beginPath();
        g.moveTo(x - Math.cos(a) * w, y - Math.sin(a) * w);
        g.lineTo(x + Math.cos(a) * w, y + Math.sin(a) * w);
        g.stroke();
    }
    g.restore();
}

function ears(g, spec, pose) {
    [-1, 1].forEach((side) => {
        g.save();
        g.translate(side * 0.6, -0.72);
        g.rotate(side * (0.15 + pose.ear * 0.35));
        g.fillStyle = spec.body;
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.04;
        g.beginPath();
        g.arc(0, -0.08, 0.46, 0, TAU);
        g.fill();
        g.stroke();
        g.fillStyle = spec.earInner;
        g.beginPath();
        g.arc(0, -0.06, 0.31, 0, TAU);
        g.fill();
        g.restore();
    });
}

function body(g, spec) {
    const grad = g.createRadialGradient(-0.35, -0.45, 0.05, 0, 0.05, 1.15);
    grad.addColorStop(0, spec.bodyLight);
    grad.addColorStop(0.55, spec.body);
    grad.addColorStop(1, spec.bodyDark);
    g.fillStyle = grad;
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.04;
    g.beginPath();
    g.arc(0, 0, 1, 0, TAU);
    g.fill();
    g.stroke();
    // Brilho de superfície lisa
    g.fillStyle = 'rgba(255, 255, 255, 0.22)';
    g.beginPath();
    g.ellipse(-0.42, -0.42, 0.28, 0.14, -0.7, 0, TAU);
    g.fill();
    // Barriga rosa
    g.fillStyle = spec.pink;
    g.beginPath();
    g.ellipse(0.02, 0.58, 0.42, 0.32, 0, 0, TAU);
    g.fill();
}

function eyes(g, spec, pose) {
    const ex = 0.32;
    const ey = -0.22;
    g.lineCap = 'round';
    [-1, 1].forEach((side) => {
        const x = side * ex;
        if (pose.eye === 'x') {
            g.strokeStyle = spec.eye;
            g.lineWidth = 0.07;
            g.beginPath();
            g.moveTo(x - 0.12, ey - 0.12); g.lineTo(x + 0.12, ey + 0.12);
            g.moveTo(x + 0.12, ey - 0.12); g.lineTo(x - 0.12, ey + 0.12);
            g.stroke();
            return;
        }
        if (pose.eye === 'blink') {
            g.strokeStyle = spec.eye;
            g.lineWidth = 0.06;
            g.beginPath();
            g.arc(x, ey - 0.02, 0.13, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
            return;
        }
        // Olhos fofos: branco com íris escura grande (a referência é brava; aqui fica fofinho)
        const r = pose.eye === 'wide' ? 0.21 : pose.eye === 'angry' ? 0.15 : 0.18;
        const ry = r * (pose.eye === 'angry' ? 0.75 : 1.1);
        g.fillStyle = '#ffffff';
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.03;
        g.beginPath();
        g.ellipse(x, ey, r * 1.12, ry * 1.08, 0, 0, TAU);
        g.fill();
        g.stroke();
        g.fillStyle = spec.eye;
        g.beginPath();
        g.ellipse(x, ey, r, ry, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(x - r * 0.3, ey - ry * 0.35, r * 0.3, 0, TAU);
        g.fill();
        g.beginPath();
        g.arc(x + r * 0.3, ey + ry * 0.3, r * 0.12, 0, TAU);
        g.fill();
    });
    if (pose.eye === 'angry') {
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.07;
        g.beginPath();
        g.moveTo(-ex - 0.22, ey - 0.28); g.lineTo(-ex + 0.18, ey - 0.14);
        g.moveTo(ex + 0.22, ey - 0.28); g.lineTo(ex - 0.18, ey - 0.14);
        g.stroke();
    }
}

function face(g, spec, pose) {
    g.fillStyle = spec.pink;
    g.globalAlpha = 0.7;
    g.beginPath();
    g.ellipse(-0.6, -0.02, 0.13, 0.08, 0, 0, TAU);
    g.ellipse(0.6, -0.02, 0.13, 0.08, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 1;

    const ny = -0.04;
    g.fillStyle = spec.nose;
    g.beginPath();
    g.ellipse(0, ny, 0.09, 0.065, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255, 255, 255, 0.45)';
    g.beginPath();
    g.ellipse(-0.03, ny - 0.025, 0.03, 0.015, 0, 0, TAU);
    g.fill();

    // Bigodes finos
    g.strokeStyle = spec.whisker;
    g.lineWidth = 0.025;
    g.beginPath();
    [-1, 1].forEach((side) => {
        [-0.05, 0.04].forEach((dy) => {
            g.moveTo(side * 0.12, ny + dy * 0.5);
            g.lineTo(side * 0.72, ny + dy * 2.6);
        });
    });
    g.stroke();

    const my = ny + 0.13;
    g.strokeStyle = spec.mouth;
    g.fillStyle = spec.mouth;
    g.lineWidth = 0.035;
    g.lineCap = 'round';
    g.beginPath();
    switch (pose.mouth) {
        case 'open':
            g.ellipse(0, my + 0.04, 0.1, 0.11, 0, 0, TAU);
            g.fill();
            break;
        case 'o':
            g.arc(0, my + 0.03, 0.05, 0, TAU);
            g.fill();
            break;
        case 'flat':
            g.moveTo(-0.11, my + 0.02); g.lineTo(0.11, my + 0.02);
            g.stroke();
            break;
        case 'frown':
            g.arc(0, my + 0.14, 0.11, Math.PI * 1.15, Math.PI * 1.85);
            g.stroke();
            break;
        case 'tongue':
            g.arc(0, my - 0.02, 0.12, 0.1, Math.PI - 0.1);
            g.closePath();
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(0.02, my + 0.1, 0.06, 0.08, 0, 0, TAU);
            g.fill();
            break;
        default: // sorriso em "w" com dentinhos
            g.moveTo(0, ny + 0.06); g.lineTo(0, my - 0.02);
            g.moveTo(-0.12, my - 0.04);
            g.quadraticCurveTo(-0.06, my + 0.04, 0, my - 0.02);
            g.quadraticCurveTo(0.06, my + 0.04, 0.12, my - 0.04);
            g.stroke();
            g.fillStyle = '#ffffff';
            g.fillRect(-0.045, my, 0.04, 0.06);
            g.fillRect(0.005, my, 0.04, 0.06);
    }
}

export function drawMouse(g, spec, pose) {
    g.save();
    g.translate(0, pose.bob);
    tail(g, spec, pose);
    ears(g, spec, pose);
    body(g, spec);
    g.save();
    g.translate(0.08, 0);
    eyes(g, spec, pose);
    face(g, spec, pose);
    g.restore();
    g.restore();
    drawExtras(g, pose);
}
