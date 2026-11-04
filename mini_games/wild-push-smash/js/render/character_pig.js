import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras } from './character_fluffy.js';

// --- PORCO (esfera lisa) ---
// Segue art_reference/pig/images/pig.webp: esfera rosa lisa, orelhas triangulares nos cantos de cima com o
// interior mais escuro, olhinhos, focinho grande saltado com duas narinas, bochechas rosadas e rabinho
// enrolado jogado para trás. Sem braços, pernas nem cascos. Boca só aparece nas expressões.
const TAU = Math.PI * 2;
const EYES = [[-0.04, -0.24], [0.46, -0.24]];

// Rabinho enrolado em mola, balançando
function tail(g, spec, pose) {
    g.save();
    g.translate(-0.94, 0.5);
    g.rotate(-pose.tail * 0.5);
    const path = () => {
        g.moveTo(0.06, 0);
        g.bezierCurveTo(-0.15, 0.04, -0.28, -0.12, -0.2, -0.24);
        g.bezierCurveTo(-0.12, -0.34, 0.0, -0.22, -0.08, -0.14);
        g.bezierCurveTo(-0.16, -0.06, -0.3, -0.08, -0.36, 0.02);
    };
    g.lineCap = 'round';
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.1;
    g.beginPath(); path(); g.stroke();
    g.strokeStyle = spec.body;
    g.lineWidth = 0.065;
    g.beginPath(); path(); g.stroke();
    g.restore();
}

function ears(g, spec, pose) {
    [-1, 1].forEach((side) => {
        g.save();
        g.translate(side * 0.66 + 0.06, -0.66);
        g.scale(side, 1);
        g.rotate(0.55 + pose.ear * 0.3);
        g.beginPath();
        g.moveTo(-0.24, 0.22);
        g.quadraticCurveTo(-0.24, -0.25, 0.02, -0.5);
        g.quadraticCurveTo(0.28, -0.22, 0.26, 0.22);
        g.closePath();
        g.fillStyle = spec.body;
        g.fill();
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.035;
        g.stroke();
        g.fillStyle = spec.earInner;
        g.beginPath();
        g.moveTo(-0.13, 0.18);
        g.quadraticCurveTo(-0.13, -0.15, 0.02, -0.32);
        g.quadraticCurveTo(0.16, -0.14, 0.15, 0.18);
        g.closePath();
        g.fill();
        g.restore();
    });
}

function body(g, spec) {
    const grad = g.createRadialGradient(-0.3, -0.45, 0.05, 0, 0.05, 1.15);
    grad.addColorStop(0, spec.bodyLight);
    grad.addColorStop(0.6, spec.body);
    grad.addColorStop(1, spec.bodyDark);
    g.fillStyle = grad;
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.035;
    g.beginPath();
    g.arc(0, 0, 1, 0, TAU);
    g.fill();
    g.stroke();
    // Bochechas rosadas
    g.fillStyle = spec.blush;
    g.globalAlpha = 0.55;
    g.beginPath();
    g.ellipse(-0.5, 0.18, 0.18, 0.15, 0, 0, TAU);
    g.ellipse(0.82, 0.16, 0.16, 0.15, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 1;
}

function eyes(g, spec, pose) {
    g.lineCap = 'round';
    EYES.forEach(([x, y]) => {
        if (pose.eye === 'x') {
            g.strokeStyle = spec.eye;
            g.lineWidth = 0.055;
            g.beginPath();
            g.moveTo(x - 0.09, y - 0.09); g.lineTo(x + 0.09, y + 0.09);
            g.moveTo(x + 0.09, y - 0.09); g.lineTo(x - 0.09, y + 0.09);
            g.stroke();
            return;
        }
        if (pose.eye === 'blink') {
            g.strokeStyle = spec.eye;
            g.lineWidth = 0.045;
            g.beginPath();
            g.arc(x, y - 0.02, 0.09, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
            return;
        }
        const r = pose.eye === 'wide' ? 0.13 : 0.1;
        const ry = r * (pose.eye === 'angry' ? 0.7 : 1.1);
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.ellipse(x, y, r * 1.15, ry * 1.1, 0, 0, TAU);
        g.fill();
        g.fillStyle = spec.eye;
        g.beginPath();
        g.ellipse(x + 0.01, y + 0.01, r * 0.85, ry * 0.85, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(x - r * 0.25, y - ry * 0.3, r * 0.3, 0, TAU);
        g.fill();
    });
    if (pose.eye === 'angry') {
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.06;
        g.beginPath();
        g.moveTo(EYES[0][0] - 0.14, EYES[0][1] - 0.18); g.lineTo(EYES[0][0] + 0.12, EYES[0][1] - 0.1);
        g.moveTo(EYES[1][0] + 0.14, EYES[1][1] - 0.18); g.lineTo(EYES[1][0] - 0.12, EYES[1][1] - 0.1);
        g.stroke();
    }
}

// Focinho grande saltado (um pouco para o lado em que olha), com narinas
function snout(g, spec, pose) {
    const sx = 0.28;
    const sy = 0.06;
    // Boca: só nas expressões (na pose normal o focinho esconde)
    const open = { open: 0.1, tongue: 0.1, o: 0.06 }[pose.mouth];
    if (open) {
        g.fillStyle = spec.mouth;
        g.beginPath();
        g.ellipse(sx, sy + 0.26, 0.1, open, 0, 0, TAU);
        g.fill();
        if (pose.mouth !== 'o') {
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(sx, sy + 0.26 + open * 0.5, 0.06, 0.04, 0, 0, TAU);
            g.fill();
        }
    } else if (pose.mouth === 'frown') {
        g.strokeStyle = spec.mouth;
        g.lineWidth = 0.035;
        g.beginPath();
        g.arc(sx, sy + 0.36, 0.1, Math.PI * 1.2, Math.PI * 1.8);
        g.stroke();
    }
    g.fillStyle = 'rgba(0, 0, 0, 0.12)';
    g.beginPath();
    g.ellipse(sx + 0.01, sy + 0.05, 0.27, 0.19, 0, 0, TAU);
    g.fill();
    const grad = g.createRadialGradient(sx - 0.08, sy - 0.08, 0.02, sx, sy, 0.3);
    grad.addColorStop(0, spec.snoutLight);
    grad.addColorStop(1, spec.snout);
    g.fillStyle = grad;
    g.strokeStyle = spec.snoutDark;
    g.lineWidth = 0.03;
    g.beginPath();
    g.ellipse(sx, sy, 0.27, 0.19, 0, 0, TAU);
    g.fill();
    g.stroke();
    g.fillStyle = spec.snoutDark;
    g.beginPath();
    g.ellipse(sx - 0.08, sy, 0.04, 0.07, 0, 0, TAU);
    g.ellipse(sx + 0.08, sy, 0.04, 0.07, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255, 255, 255, 0.4)';
    g.beginPath();
    g.ellipse(sx - 0.08, sy - 0.11, 0.1, 0.03, -0.1, 0, TAU);
    g.fill();
}

export function drawPig(g, spec, pose) {
    g.save();
    g.translate(0, pose.bob);
    tail(g, spec, pose);
    ears(g, spec, pose);
    body(g, spec);
    eyes(g, spec, pose);
    snout(g, spec, pose);
    g.restore();
    drawExtras(g, pose);
}
