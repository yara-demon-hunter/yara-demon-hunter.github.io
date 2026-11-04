import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras } from './character_fluffy.js';

// --- ELEFANTE (esfera lisa e grande) ---
// Segue art_reference/elephant/images/elephant.jpeg: esfera cinza lisa, orelhas enormes atrás dos lados,
// olhinhos, tromba que desce do meio do rosto e enrola na ponta, presas brancas curtas e cauda fininha
// com tufo, jogada para trás. É o maior bicho do jogo (o tamanho vem da massa). Sem braços e sem pernas.
const TAU = Math.PI * 2;
const EYES = [[-0.08, -0.26], [0.44, -0.26]];

function tail(g, spec, pose) {
    g.save();
    g.translate(-0.9, 0.5);
    g.rotate(-pose.tail * 0.6);
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.06;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(-0.25, 0.1, -0.38, -0.12);
    g.stroke();
    g.fillStyle = spec.bodyDark;
    g.beginPath();
    g.moveTo(-0.36, -0.1);
    g.lineTo(-0.5, -0.3); g.lineTo(-0.42, -0.16); g.lineTo(-0.36, -0.34); g.lineTo(-0.32, -0.16); g.lineTo(-0.22, -0.28);
    g.closePath();
    g.fill();
    g.restore();
}

function ears(g, spec, pose) {
    // Iguais e espelhadas: mesmo tamanho e formato dos dois lados
    [-1, 1].forEach((side) => {
        g.save();
        g.translate(side * 0.86, -0.42);
        g.rotate(side * (0.18 + pose.ear * 0.25));
        g.beginPath();
        g.ellipse(side * 0.1, 0, 0.56, 0.72, 0, 0, TAU);
        g.fillStyle = spec.body;
        g.fill();
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.035;
        g.stroke();
        g.fillStyle = spec.earInner;
        g.beginPath();
        g.ellipse(side * 0.16, 0.05, 0.4, 0.55, 0, 0, TAU);
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
}

function eyes(g, spec, pose) {
    g.lineCap = 'round';
    EYES.forEach(([x, y]) => {
        if (pose.eye === 'x') {
            g.strokeStyle = spec.eye;
            g.lineWidth = 0.05;
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

function tusk(g, spec, from, mid, to) {
    g.lineCap = 'round';
    g.strokeStyle = spec.tuskShade;
    g.lineWidth = 0.13;
    g.beginPath(); g.moveTo(...from); g.quadraticCurveTo(...mid, ...to); g.stroke();
    g.strokeStyle = spec.tusk;
    g.lineWidth = 0.09;
    g.beginPath(); g.moveTo(...from); g.quadraticCurveTo(...mid, ...to); g.stroke();
}

// Tromba: desce do meio do rosto, entre as duas presas, e a ponta enrola para trás; balança um pouco
const TRUNK = [[0, 0], [0.02, 0.42], [0.02, 0.74], [-0.16, 0.8]];
function trunk(g, spec, pose) {
    g.save();
    g.translate(0.18, -0.08);
    g.rotate(pose.tail * 0.06);
    const at = (t) => {
        const u = 1 - t;
        const f = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
        return [0, 1].map(k => f[0] * TRUNK[0][k] + f[1] * TRUNK[1][k] + f[2] * TRUNK[2][k] + f[3] * TRUNK[3][k]);
    };
    g.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
        for (let t = 0; t < 1; t += 0.05) {
            const w = 0.28 * (1 - t * 0.35);
            g.strokeStyle = pass ? spec.trunk : spec.bodyDark;
            g.lineWidth = w + (pass ? 0 : 0.05);
            g.beginPath(); g.moveTo(...at(t)); g.lineTo(...at(t + 0.05)); g.stroke();
        }
    }
    // Pontinha enrolada para cima
    const [ex, ey] = at(1);
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.045;
    g.beginPath();
    g.arc(ex + 0.02, ey - 0.08, 0.08, Math.PI * 0.5, Math.PI * 1.6);
    g.stroke();
    // Rugas
    g.lineWidth = 0.02;
    for (let t = 0.15; t < 0.8; t += 0.12) {
        const [x, y] = at(t);
        g.beginPath();
        g.moveTo(x - 0.1, y - 0.01);
        g.quadraticCurveTo(x, y + 0.03, x + 0.1, y - 0.01);
        g.stroke();
    }
    g.restore();
}

export function drawElephant(g, spec, pose) {
    g.save();
    g.translate(0, pose.bob);
    tail(g, spec, pose);
    ears(g, spec, pose);
    body(g, spec);
    eyes(g, spec, pose);
    // Presas curtinhas, uma de cada lado da base da tromba, espelhadas; a tromba fica no meio, nunca por cima
    tusk(g, spec, [0.0, 0.2], [-0.1, 0.42], [-0.24, 0.36]);
    tusk(g, spec, [0.36, 0.2], [0.46, 0.42], [0.6, 0.36]);
    trunk(g, spec, pose);
    g.restore();
    drawExtras(g, pose);
}
