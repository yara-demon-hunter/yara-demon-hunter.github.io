import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras } from './character_fluffy.js';

// --- COELHO (esfera lisa) ---
// Segue art_reference/bunny/images/bunny.webp: esfera cinza lisa, orelhas compridas em pé com o interior
// rosa e tufinhos na base, olhos com sobrancelhas, nariz de coração rosa, focinho branco, bochechas rosadas
// e pompom branco jogado para trás. Sem braços e sem pernas.
const TAU = Math.PI * 2;
const EYES = [[0.0, -0.26], [0.46, -0.26]];

function tail(g, spec) {
    g.fillStyle = spec.white;
    g.strokeStyle = spec.whiteShade;
    g.lineWidth = 0.03;
    [[-0.92, 0.48, 0.2], [-0.82, 0.62, 0.18], [-1.02, 0.6, 0.15]].forEach(([x, y, r]) => {
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
        g.stroke();
    });
}

function ears(g, spec, pose) {
    [[-1, -0.12], [1, 0.42]].forEach(([side, x]) => {
        g.save();
        g.translate(x, -0.72);
        // Orelhas em pé; deitam para trás ao correr/cair (pose.ear) e caem quando tonto ou com medo
        g.rotate(side * 0.18 - pose.ear * 0.55);
        g.beginPath();
        g.ellipse(0, -0.55, 0.2, 0.62, 0, 0, TAU);
        g.fillStyle = spec.body;
        g.fill();
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.035;
        g.stroke();
        g.fillStyle = spec.pink;
        g.beginPath();
        g.ellipse(0, -0.5, 0.11, 0.48, 0, 0, TAU);
        g.fill();
        // Tufinhos rosa na base
        g.strokeStyle = spec.pinkDark;
        g.lineWidth = 0.025;
        g.lineCap = 'round';
        g.beginPath();
        [-0.05, 0, 0.05].forEach((dx) => {
            g.moveTo(dx * 0.6, -0.04);
            g.lineTo(dx, -0.24);
        });
        g.stroke();
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
            g.lineWidth = 0.06;
            g.beginPath();
            g.moveTo(x - 0.1, y - 0.1); g.lineTo(x + 0.1, y + 0.1);
            g.moveTo(x + 0.1, y - 0.1); g.lineTo(x - 0.1, y + 0.1);
            g.stroke();
            return;
        }
        if (pose.eye === 'blink') {
            g.strokeStyle = spec.eye;
            g.lineWidth = 0.05;
            g.beginPath();
            g.arc(x, y - 0.02, 0.11, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
            return;
        }
        const r = pose.eye === 'wide' ? 0.16 : 0.13;
        const ry = r * (pose.eye === 'angry' ? 0.7 : 1.05);
        g.fillStyle = '#ffffff';
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.025;
        g.beginPath();
        g.ellipse(x, y, r, ry, 0, 0, TAU);
        g.fill();
        g.stroke();
        g.fillStyle = spec.iris;
        g.beginPath();
        g.ellipse(x + 0.01, y + 0.01, r * 0.62, ry * 0.65, 0, 0, TAU);
        g.fill();
        g.fillStyle = spec.eye;
        g.beginPath();
        g.ellipse(x + 0.01, y + 0.01, r * 0.38, ry * 0.4, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(x - r * 0.22, y - ry * 0.28, r * 0.22, 0, TAU);
        g.fill();
    });
    // Sobrancelhas: suaves normalmente, franzidas quando bravo
    const angry = pose.eye === 'angry';
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.035;
    g.beginPath();
    EYES.forEach(([x, y], i) => {
        const side = i === 0 ? -1 : 1;
        if (angry) {
            g.moveTo(x + side * 0.15, y - 0.24);
            g.lineTo(x - side * 0.1, y - 0.14);
        } else {
            g.moveTo(x - 0.08, y - 0.2);
            g.quadraticCurveTo(x, y - 0.25, x + 0.08, y - 0.2);
        }
    });
    g.stroke();
}

function face(g, spec, pose) {
    // Bochechas rosadas grandes
    g.fillStyle = spec.blush;
    g.globalAlpha = 0.75;
    g.beginPath();
    g.ellipse(-0.42, 0.12, 0.2, 0.17, 0, 0, TAU);
    g.ellipse(0.82, 0.12, 0.17, 0.17, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 1;

    // Focinho branco
    const fx = 0.23;
    g.fillStyle = spec.white;
    g.beginPath();
    g.ellipse(fx - 0.11, 0.08, 0.14, 0.12, 0, 0, TAU);
    g.ellipse(fx + 0.11, 0.08, 0.14, 0.12, 0, 0, TAU);
    g.ellipse(fx, 0.15, 0.12, 0.1, 0, 0, TAU);
    g.fill();

    // Nariz de coração
    const ny = -0.06;
    g.fillStyle = spec.nose;
    g.beginPath();
    g.moveTo(fx, ny + 0.07);
    g.bezierCurveTo(fx - 0.12, ny - 0.01, fx - 0.07, ny - 0.08, fx, ny - 0.03);
    g.bezierCurveTo(fx + 0.07, ny - 0.08, fx + 0.12, ny - 0.01, fx, ny + 0.07);
    g.fill();

    const my = ny + 0.15;
    g.strokeStyle = spec.mouth;
    g.fillStyle = spec.mouth;
    g.lineWidth = 0.032;
    g.lineCap = 'round';
    g.beginPath();
    switch (pose.mouth) {
        case 'open':
            g.ellipse(fx, my + 0.04, 0.1, 0.1, 0, 0, TAU);
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(fx, my + 0.08, 0.06, 0.04, 0, 0, TAU);
            g.fill();
            break;
        case 'o':
            g.arc(fx, my + 0.03, 0.05, 0, TAU);
            g.fill();
            break;
        case 'flat':
            g.moveTo(fx - 0.1, my + 0.02); g.lineTo(fx + 0.1, my + 0.02);
            g.stroke();
            break;
        case 'frown':
            g.arc(fx, my + 0.13, 0.1, Math.PI * 1.15, Math.PI * 1.85);
            g.stroke();
            break;
        case 'tongue':
            g.arc(fx, my - 0.02, 0.12, 0.1, Math.PI - 0.1);
            g.closePath();
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(fx + 0.02, my + 0.1, 0.06, 0.08, 0, 0, TAU);
            g.fill();
            break;
        default: // sorriso em "w"
            g.moveTo(fx, ny + 0.07); g.lineTo(fx, my - 0.02);
            g.moveTo(fx - 0.13, my - 0.04);
            g.quadraticCurveTo(fx - 0.06, my + 0.05, fx, my - 0.02);
            g.quadraticCurveTo(fx + 0.06, my + 0.05, fx + 0.13, my - 0.04);
            g.stroke();
    }
}

export function drawBunny(g, spec, pose) {
    g.save();
    g.translate(0, pose.bob);
    tail(g, spec);
    ears(g, spec, pose);
    body(g, spec);
    eyes(g, spec, pose);
    face(g, spec, pose);
    g.restore();
    drawExtras(g, pose);
}
