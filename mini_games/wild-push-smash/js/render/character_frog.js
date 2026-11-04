import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras } from './character_fluffy.js';

// --- SAPO (esfera lisa) ---
// Segue art_reference/frog: esfera verde lisa e brilhante, olhos dourados saltados no alto,
// sorriso fino, bochechas claras. Sem braços, pernas nem cauda.
const TAU = Math.PI * 2;
const EYES = [[-0.42, -0.7], [0.4, -0.7]];

function body(g, spec) {
    const grad = g.createRadialGradient(-0.35, -0.45, 0.05, 0, 0.05, 1.15);
    grad.addColorStop(0, spec.bodyLight);
    grad.addColorStop(0.55, spec.body);
    grad.addColorStop(1, spec.bodyDark);
    g.fillStyle = grad;
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.04;
    g.beginPath();
    g.ellipse(0, 0.03, 1.05, 0.97, 0, 0, TAU);
    g.fill();
    g.stroke();
    // Brilho de pele lisa
    g.fillStyle = 'rgba(255, 255, 255, 0.18)';
    g.beginPath();
    g.ellipse(-0.42, -0.25, 0.3, 0.16, -0.6, 0, TAU);
    g.fill();
    // Manchinhas claras no lado
    g.fillStyle = spec.spots;
    [[0.74, -0.52, 0.09, 0.05], [0.86, -0.32, 0.07, 0.045], [0.92, -0.12, 0.05, 0.035], [0.62, -0.66, 0.06, 0.035]]
        .forEach(([x, y, rx, ry]) => {
            g.beginPath();
            g.ellipse(x, y, rx, ry, 0.9, 0, TAU);
            g.fill();
        });
}

// Olhos saltados: bolinha da cor do corpo com pálpebra clara em cima, íris dourada
function eyes(g, spec, pose) {
    EYES.forEach(([x, y]) => {
        g.fillStyle = spec.body;
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.04;
        g.beginPath();
        g.arc(x, y, 0.32, 0, TAU);
        g.fill();
        g.stroke();
        g.strokeStyle = spec.lid;
        g.lineWidth = 0.07;
        g.lineCap = 'round';
        g.beginPath();
        g.arc(x, y + 0.02, 0.27, Math.PI * 1.15, Math.PI * 1.85);
        g.stroke();

        if (pose.eye === 'x') {
            g.strokeStyle = spec.pupil;
            g.lineWidth = 0.07;
            g.beginPath();
            g.moveTo(x - 0.13, y - 0.11); g.lineTo(x + 0.13, y + 0.13);
            g.moveTo(x + 0.13, y - 0.11); g.lineTo(x - 0.13, y + 0.13);
            g.stroke();
            return;
        }
        if (pose.eye === 'blink') {
            g.strokeStyle = spec.mouth;
            g.lineWidth = 0.06;
            g.beginPath();
            g.arc(x, y - 0.02, 0.15, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
            return;
        }
        const r = pose.eye === 'wide' ? 0.25 : pose.eye === 'angry' ? 0.19 : 0.22;
        const iris = g.createRadialGradient(x - 0.05, y - 0.05, 0.02, x, y, r);
        iris.addColorStop(0, spec.irisLight);
        iris.addColorStop(1, spec.iris);
        g.fillStyle = iris;
        g.strokeStyle = spec.irisEdge;
        g.lineWidth = 0.035;
        g.beginPath();
        g.ellipse(x, y, r, r * (pose.eye === 'angry' ? 0.8 : 1), 0, 0, TAU);
        g.fill();
        g.stroke();
        g.fillStyle = spec.pupil;
        g.beginPath();
        g.arc(x + 0.01, y + 0.01, r * 0.62, 0, TAU);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(x - r * 0.3, y - r * 0.35, r * 0.24, 0, TAU);
        g.fill();
        g.beginPath();
        g.arc(x + r * 0.3, y + r * 0.3, r * 0.1, 0, TAU);
        g.fill();
    });
    if (pose.eye === 'angry') {
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.08;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(EYES[0][0] - 0.26, EYES[0][1] - 0.36); g.lineTo(EYES[0][0] + 0.2, EYES[0][1] - 0.2);
        g.moveTo(EYES[1][0] + 0.26, EYES[1][1] - 0.36); g.lineTo(EYES[1][0] - 0.2, EYES[1][1] - 0.2);
        g.stroke();
    }
}

function face(g, spec, pose) {
    g.fillStyle = spec.spots;
    g.beginPath();
    g.ellipse(-0.64, -0.22, 0.15, 0.09, 0, 0, TAU);
    g.ellipse(0.6, -0.22, 0.15, 0.09, 0, 0, TAU);
    g.fill();

    g.fillStyle = spec.mouth;
    g.beginPath();
    g.ellipse(-0.06, -0.4, 0.025, 0.018, 0.4, 0, TAU);
    g.ellipse(0.06, -0.4, 0.025, 0.018, -0.4, 0, TAU);
    g.fill();

    const my = -0.22;
    g.strokeStyle = spec.mouth;
    g.fillStyle = spec.mouth;
    g.lineWidth = 0.045;
    g.lineCap = 'round';
    g.beginPath();
    switch (pose.mouth) {
        case 'open':
            g.ellipse(0, my + 0.06, 0.2, 0.14, 0, 0, TAU);
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(0, my + 0.12, 0.11, 0.06, 0, 0, TAU);
            g.fill();
            break;
        case 'o':
            g.arc(0, my + 0.04, 0.07, 0, TAU);
            g.fill();
            break;
        case 'flat':
            g.moveTo(-0.2, my + 0.03); g.lineTo(0.2, my + 0.03);
            g.stroke();
            break;
        case 'frown':
            g.arc(0, my + 0.22, 0.2, Math.PI * 1.2, Math.PI * 1.8);
            g.stroke();
            break;
        case 'tongue':
            g.arc(0, my - 0.03, 0.22, 0.15, Math.PI - 0.15);
            g.closePath();
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(0.03, my + 0.2, 0.09, 0.13, 0, 0, TAU);
            g.fill();
            break;
        default: // sorriso largo e fino
            g.arc(0, my - 0.22, 0.3, Math.PI * 0.3, Math.PI * 0.7);
            g.stroke();
    }
}

export function drawFrog(g, spec, pose) {
    g.save();
    g.translate(0, pose.bob);
    body(g, spec);
    // Rosto levemente virado para o lado em que olha
    g.save();
    g.translate(0.08, 0);
    eyes(g, spec, pose);
    face(g, spec, pose);
    g.restore();
    g.restore();
    drawExtras(g, pose);
}
