import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras, furryCircle } from './character_fluffy.js';

// --- GATO PRETO (esfera de pelo) ---
// Segue art_reference/cat: esfera preta felpuda, barriga branca redonda, focinho branco, nariz rosa,
// olhos dourados, bigodes longos enrolados e cauda preta de ponta branca, jogada para trás e balançando.
// Sem braços e sem pernas.
const TAU = Math.PI * 2;

// Cauda fina que sai de trás e sobe em "S"; balança em volta da base
function tail(g, spec, pose) {
    g.save();
    g.translate(-0.72, 0.42);
    g.rotate(-pose.tail * 0.45);
    const P = [[0, 0], [-0.75, 0.05], [-0.25, -0.75], [-0.62, -1.25]];
    const at = (t) => {
        const u = 1 - t;
        const f = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
        return [0, 1].map(k => f[0] * P[0][k] + f[1] * P[1][k] + f[2] * P[2][k] + f[3] * P[3][k]);
    };
    const line = (width, color) => {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineCap = 'round';
        g.beginPath();
        for (let t = 0; t <= 1.0001; t += 0.04) g[t === 0 ? 'moveTo' : 'lineTo'](...at(t));
        g.stroke();
    };
    line(0.5, spec.rim);
    line(0.42, spec.body);
    g.globalAlpha = 0.6;
    line(0.14, spec.bodyLight);      // brilho no pelo: a cauda preta aparece no fundo escuro
    g.globalAlpha = 1;
    const [tx, ty] = at(1);
    g.fillStyle = spec.white;
    g.beginPath();
    g.ellipse(tx, ty - 0.05, 0.27, 0.23, -0.3, 0, TAU);
    g.fill();
    g.restore();
}

function ears(g, spec, pose) {
    [-1, 1].forEach((side) => {
        g.save();
        g.translate(side * 0.55, -0.72);
        g.rotate(side * (0.28 + pose.ear * 0.35));
        g.beginPath();
        g.moveTo(-0.32, 0.3);
        g.quadraticCurveTo(-0.3, -0.25, 0.02, -0.55);
        g.quadraticCurveTo(0.34, -0.22, 0.34, 0.3);
        g.closePath();
        g.fillStyle = spec.body;
        g.fill();
        g.strokeStyle = spec.rim;
        g.lineWidth = 0.05;
        g.stroke();
        g.beginPath();
        g.moveTo(-0.16, 0.24);
        g.quadraticCurveTo(-0.15, -0.1, 0.03, -0.32);
        g.quadraticCurveTo(0.2, -0.08, 0.18, 0.24);
        g.closePath();
        g.fillStyle = spec.earInner;
        g.fill();
        g.restore();
    });
}

function body(g, spec) {
    const grad = g.createRadialGradient(-0.35, -0.5, 0.05, 0, 0, 1.15);
    grad.addColorStop(0, spec.bodyLight);
    grad.addColorStop(0.55, spec.body);
    grad.addColorStop(1, spec.bodyDark);
    furryCircle(g);
    g.fillStyle = grad;
    g.fill();
    // Borda clara: separa o gato preto do fundo escuro
    g.strokeStyle = spec.rim;
    g.lineWidth = 0.05;
    g.stroke();

    // Barriga branca redonda
    const belly = g.createRadialGradient(-0.1, 0.3, 0.05, 0, 0.45, 0.5);
    belly.addColorStop(0, spec.white);
    belly.addColorStop(1, spec.whiteShade);
    g.fillStyle = belly;
    g.beginPath();
    g.ellipse(0.02, 0.45, 0.42, 0.4, 0, 0, TAU);
    g.fill();
}

function eyes(g, spec, pose) {
    const ex = 0.34;
    const ey = -0.3;
    g.lineCap = 'round';
    [-1, 1].forEach((side) => {
        const x = side * ex;
        if (pose.eye === 'x') {
            g.strokeStyle = spec.iris;
            g.lineWidth = 0.07;
            g.beginPath();
            g.moveTo(x - 0.13, ey - 0.13); g.lineTo(x + 0.13, ey + 0.13);
            g.moveTo(x + 0.13, ey - 0.13); g.lineTo(x - 0.13, ey + 0.13);
            g.stroke();
            return;
        }
        if (pose.eye === 'blink') {
            g.strokeStyle = spec.iris;
            g.lineWidth = 0.06;
            g.beginPath();
            g.arc(x, ey - 0.02, 0.15, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
            return;
        }
        const r = pose.eye === 'wide' ? 0.24 : pose.eye === 'angry' ? 0.18 : 0.2;
        const ry = r * (pose.eye === 'angry' ? 0.75 : 1);
        g.fillStyle = spec.iris;
        g.beginPath();
        g.ellipse(x, ey, r, ry, 0, 0, TAU);
        g.fill();
        g.fillStyle = spec.pupil;
        g.beginPath();
        g.ellipse(x + 0.01, ey + 0.01, r * 0.74, ry * 0.74, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(x - r * 0.3, ey - ry * 0.35, r * 0.24, 0, TAU);
        g.fill();
        g.beginPath();
        g.arc(x + r * 0.32, ey + ry * 0.3, r * 0.1, 0, TAU);
        g.fill();
    });
    if (pose.eye === 'angry') {
        g.strokeStyle = spec.rim;
        g.lineWidth = 0.08;
        g.beginPath();
        g.moveTo(-ex - 0.24, ey - 0.3); g.lineTo(-ex + 0.2, ey - 0.15);
        g.moveTo(ex + 0.24, ey - 0.3); g.lineTo(ex - 0.2, ey - 0.15);
        g.stroke();
    }
}

function face(g, spec, pose) {
    // Focinho branco
    g.fillStyle = spec.white;
    g.beginPath();
    g.ellipse(-0.1, -0.04, 0.15, 0.12, 0, 0, TAU);
    g.ellipse(0.1, -0.04, 0.15, 0.12, 0, 0, TAU);
    g.ellipse(0, 0.04, 0.12, 0.1, 0, 0, TAU);
    g.fill();

    // Nariz rosa
    const ny = -0.13;
    g.fillStyle = spec.nose;
    g.beginPath();
    g.moveTo(-0.07, ny - 0.035);
    g.quadraticCurveTo(0, ny - 0.06, 0.07, ny - 0.035);
    g.quadraticCurveTo(0.05, ny + 0.04, 0, ny + 0.05);
    g.quadraticCurveTo(-0.05, ny + 0.04, -0.07, ny - 0.035);
    g.fill();

    const my = ny + 0.12;
    g.strokeStyle = spec.mouth;
    g.fillStyle = spec.mouth;
    g.lineWidth = 0.035;
    g.lineCap = 'round';
    g.beginPath();
    switch (pose.mouth) {
        case 'open':
            g.ellipse(0, my + 0.05, 0.1, 0.12, 0, 0, TAU);
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(0, my + 0.1, 0.06, 0.05, 0, 0, TAU);
            g.fill();
            break;
        case 'o':
            g.arc(0, my + 0.04, 0.055, 0, TAU);
            g.fill();
            break;
        case 'flat':
            g.moveTo(-0.1, my + 0.03); g.lineTo(0.1, my + 0.03);
            g.stroke();
            break;
        case 'frown':
            g.arc(0, my + 0.15, 0.11, Math.PI * 1.15, Math.PI * 1.85);
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
        default: // sorriso em "w"
            g.moveTo(0, ny + 0.05); g.lineTo(0, my - 0.02);
            g.moveTo(-0.12, my - 0.04);
            g.quadraticCurveTo(-0.06, my + 0.05, 0, my - 0.02);
            g.quadraticCurveTo(0.06, my + 0.05, 0.12, my - 0.04);
            g.stroke();
    }

    // Bigodes longos que descem e enrolam na ponta
    g.strokeStyle = spec.white;
    g.lineWidth = 0.035;
    [-1, 1].forEach((side) => {
        [0, 0.08].forEach((dy) => {
            g.beginPath();
            g.moveTo(side * 0.12, -0.05 + dy);
            g.bezierCurveTo(side * 0.5, -0.12 + dy, side * 0.7, 0.28 + dy, side * 0.92, 0.3 + dy);
            g.quadraticCurveTo(side * 1.06, 0.28 + dy, side * 1.0, 0.16 + dy);
            g.stroke();
        });
    });
}

export function drawCat(g, spec, pose) {
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
