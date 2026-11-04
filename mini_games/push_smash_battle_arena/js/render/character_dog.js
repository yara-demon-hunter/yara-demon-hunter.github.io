import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras } from './character_fluffy.js';

// --- CACHORRO (esfera de pelo curtinho) ---
// Segue art_reference/dog/images/dog_new.jpeg: esfera caramelo quase lisa, vista em 3/4 (rosto virado para
// o lado em que olha), focinho creme saltado com nariz vermelho grande, olhos castanhos, orelhas dobradas
// e cauda curtinha jogada para trás, abanando. Sem braços e sem pernas.
const TAU = Math.PI * 2;
const EYES = [[0.0, -0.24], [0.5, -0.24]];

function tail(g, spec, pose) {
    g.save();
    g.translate(-0.86, 0.45);
    g.rotate(-0.15 - pose.tail * 0.7);
    g.beginPath();
    g.moveTo(0.05, 0.12);
    g.quadraticCurveTo(-0.3, 0.1, -0.42, -0.38);
    g.quadraticCurveTo(-0.2, -0.18, -0.12, -0.3);
    g.quadraticCurveTo(-0.05, -0.05, 0.08, -0.08);
    g.closePath();
    g.fillStyle = spec.body;
    g.fill();
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.03;
    g.stroke();
    g.restore();
}

// Orelhas pontudas nos cantos de cima, com o interior mais escuro
function ears(g, spec, pose) {
    [[-1, 0.5, 0.9], [1, 0.62, 1]].forEach(([side, x, size]) => {
        g.save();
        g.translate(side * x + 0.1, -0.76);
        g.scale(side * size, size);
        g.rotate(0.35 + pose.ear * 0.4);
        // Orelha: triângulo de pontas arredondadas
        g.beginPath();
        g.moveTo(-0.26, 0.22);
        g.quadraticCurveTo(-0.16, -0.25, 0.02, -0.52);
        g.quadraticCurveTo(0.2, -0.24, 0.28, 0.22);
        g.closePath();
        g.fillStyle = spec.bodyLight;
        g.fill();
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.035;
        g.stroke();
        // Dentro da orelha, mais escuro
        g.fillStyle = spec.earInner;
        g.beginPath();
        g.moveTo(-0.12, 0.18);
        g.quadraticCurveTo(-0.06, -0.12, 0.03, -0.3);
        g.quadraticCurveTo(0.12, -0.1, 0.14, 0.18);
        g.closePath();
        g.fill();
        g.restore();
    });
}

function body(g, spec) {
    const grad = g.createRadialGradient(-0.3, -0.45, 0.05, 0, 0, 1.15);
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
    // Barriga um pouco mais clara embaixo e pelinho curto nas bordas
    g.fillStyle = 'rgba(255, 235, 210, 0.18)';
    g.beginPath();
    g.ellipse(0.1, 0.62, 0.55, 0.3, 0, 0, TAU);
    g.fill();
    // Testa: dois calombinhos claros acima dos olhos
    g.fillStyle = 'rgba(255, 235, 210, 0.22)';
    EYES.forEach(([x, y]) => {
        g.beginPath();
        g.ellipse(x + 0.08, y - 0.2, 0.2, 0.1, 0, 0, TAU);
        g.fill();
    });
}

function eyes(g, spec, pose) {
    g.lineCap = 'round';
    EYES.forEach(([x, y]) => {
        if (pose.eye === 'x') {
            g.strokeStyle = spec.mouth;
            g.lineWidth = 0.06;
            g.beginPath();
            g.moveTo(x - 0.11, y - 0.11); g.lineTo(x + 0.11, y + 0.11);
            g.moveTo(x + 0.11, y - 0.11); g.lineTo(x - 0.11, y + 0.11);
            g.stroke();
            return;
        }
        if (pose.eye === 'blink') {
            g.strokeStyle = spec.mouth;
            g.lineWidth = 0.05;
            g.beginPath();
            g.arc(x, y - 0.02, 0.12, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
            return;
        }
        const r = pose.eye === 'wide' ? 0.17 : pose.eye === 'angry' ? 0.12 : 0.14;
        const ry = r * (pose.eye === 'angry' ? 0.75 : 1.1);
        g.fillStyle = '#ffffff';
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.025;
        g.beginPath();
        g.ellipse(x, y, r, ry, 0, 0, TAU);
        g.fill();
        g.stroke();
        g.fillStyle = spec.iris;
        g.beginPath();
        g.ellipse(x + 0.02, y + 0.01, r * 0.78, ry * 0.8, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#120a06';
        g.beginPath();
        g.ellipse(x + 0.02, y + 0.01, r * 0.45, ry * 0.46, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(x - r * 0.2, y - ry * 0.3, r * 0.25, 0, TAU);
        g.fill();
    });
    if (pose.eye === 'angry') {
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.07;
        g.beginPath();
        g.moveTo(EYES[0][0] - 0.18, EYES[0][1] - 0.26); g.lineTo(EYES[0][0] + 0.16, EYES[0][1] - 0.14);
        g.moveTo(EYES[1][0] + 0.18, EYES[1][1] - 0.26); g.lineTo(EYES[1][0] - 0.16, EYES[1][1] - 0.14);
        g.stroke();
    }
}

function face(g, spec, pose) {
    // Focinho creme saltado para o lado em que olha, com queixinho embaixo
    const mx = 0.55;
    g.fillStyle = 'rgba(0, 0, 0, 0.1)';
    g.beginPath();
    g.ellipse(mx - 0.02, 0.24, 0.42, 0.28, 0, 0, TAU);
    g.fill();
    const muzzle = g.createRadialGradient(mx - 0.1, 0.0, 0.02, mx, 0.12, 0.45);
    muzzle.addColorStop(0, spec.cream);
    muzzle.addColorStop(1, spec.creamShade);
    g.fillStyle = muzzle;
    g.beginPath();
    g.ellipse(mx, 0.12, 0.42, 0.3, -0.08, 0, TAU);
    g.ellipse(mx - 0.08, 0.36, 0.22, 0.13, 0, 0, TAU);
    g.fill();

    // Nariz vermelho grande, com narinas e brilho
    const nx = mx + 0.12;
    const ny = -0.02;
    const nose = g.createRadialGradient(nx - 0.06, ny - 0.06, 0.01, nx, ny, 0.24);
    nose.addColorStop(0, spec.noseLight);
    nose.addColorStop(1, spec.nose);
    g.fillStyle = nose;
    g.beginPath();
    g.ellipse(nx, ny, 0.22, 0.15, 0, 0, TAU);
    g.fill();
    g.fillStyle = spec.noseDark;
    g.beginPath();
    g.ellipse(nx - 0.08, ny + 0.05, 0.03, 0.02, -0.3, 0, TAU);
    g.ellipse(nx + 0.08, ny + 0.05, 0.03, 0.02, 0.3, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255, 255, 255, 0.5)';
    g.beginPath();
    g.ellipse(nx - 0.06, ny - 0.07, 0.06, 0.025, -0.2, 0, TAU);
    g.fill();

    const my = 0.24;
    const cx = mx;
    g.strokeStyle = spec.mouth;
    g.fillStyle = spec.mouth;
    g.lineWidth = 0.035;
    g.lineCap = 'round';
    g.beginPath();
    switch (pose.mouth) {
        case 'open':
            g.ellipse(cx, my + 0.04, 0.13, 0.11, 0, 0, TAU);
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(cx, my + 0.09, 0.08, 0.05, 0, 0, TAU);
            g.fill();
            break;
        case 'o':
            g.arc(cx, my + 0.03, 0.06, 0, TAU);
            g.fill();
            break;
        case 'flat':
            g.moveTo(cx - 0.18, my + 0.02); g.lineTo(cx + 0.2, my);
            g.stroke();
            break;
        case 'frown':
            g.arc(cx, my + 0.16, 0.15, Math.PI * 1.15, Math.PI * 1.85);
            g.stroke();
            break;
        case 'tongue':
            g.arc(cx, my - 0.02, 0.16, 0.1, Math.PI - 0.1);
            g.closePath();
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(cx + 0.03, my + 0.13, 0.08, 0.11, 0, 0, TAU);
            g.fill();
            break;
        default: // sorriso largo, subindo para o lado da bochecha
            g.moveTo(cx - 0.3, my - 0.02);
            g.quadraticCurveTo(cx - 0.05, my + 0.12, cx + 0.32, my - 0.08);
            g.stroke();
    }
}

export function drawDog(g, spec, pose) {
    g.save();
    g.translate(0, pose.bob);
    tail(g, spec, pose);
    body(g, spec);
    ears(g, spec, pose);   // por cima: as orelhas dobram sobre a cabeça
    eyes(g, spec, pose);
    face(g, spec, pose);
    g.restore();
    drawExtras(g, pose);
}
