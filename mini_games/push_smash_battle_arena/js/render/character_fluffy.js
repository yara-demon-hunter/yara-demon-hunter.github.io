import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { shade } from './character_art.js';

// --- BICHO FOFINHO (esfera de pelo) ---
// Segue art_reference/<id>: rosto de frente, pelo macio sem contorno escuro, sem braços e sem pernas.
// Só a esfera, orelhas, cauda e rosto; quem se mexe é o corpo inteiro (squash & stretch no desenho em campo).
const TAU = Math.PI * 2;

// Esfera de raio 1 com a borda levemente felpuda
export function furryCircle(g, tufts = 36, length = 0.035) {
    g.beginPath();
    for (let i = 0; i <= tufts * 2; i++) {
        const a = (i / (tufts * 2)) * TAU;
        const r = 1 + (i % 2 ? length : 0);
        g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
}

function ears(g, spec, pose) {
    [-1, 1].forEach((side) => {
        g.save();
        g.translate(side * 0.6, -0.78);
        g.rotate(side * (0.32 + pose.ear * 0.35) - pose.ear * 0.1 * side);
        g.beginPath();
        g.moveTo(-0.3, 0.3);
        g.quadraticCurveTo(-0.34, -0.3, 0.02, -0.62);
        g.quadraticCurveTo(0.36, -0.28, 0.32, 0.3);
        g.closePath();
        g.fillStyle = spec.bodyDark;
        g.fill();
        g.strokeStyle = shade(spec.body, -0.25);
        g.lineWidth = 0.04;
        g.stroke();
        g.beginPath();
        g.moveTo(-0.17, 0.26);
        g.quadraticCurveTo(-0.2, -0.12, 0.02, -0.4);
        g.quadraticCurveTo(0.22, -0.1, 0.18, 0.26);
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
    g.strokeStyle = shade(spec.body, -0.3);
    g.lineWidth = 0.035;
    g.stroke();

    // Fios mais claros, só para dar textura de pelo
    g.strokeStyle = spec.bodyLight;
    g.globalAlpha = 0.45;
    g.lineWidth = 0.03;
    g.lineCap = 'round';
    g.beginPath();
    [[-0.7, -0.35, -0.62, -0.5], [-0.55, -0.62, -0.42, -0.74], [0.5, -0.66, 0.62, -0.5], [-0.9, 0.1, -0.86, -0.1],
        [0.88, -0.1, 0.9, 0.12], [-0.78, 0.5, -0.66, 0.62]].forEach(([x1, y1, x2, y2]) => {
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
    });
    g.stroke();
    g.globalAlpha = 1;
}

// Bochechas, focinho e peito cremes, como numa gravata
function cream(g, spec) {
    const grad = g.createLinearGradient(0, -0.1, 0, 1);
    grad.addColorStop(0, spec.cream);
    grad.addColorStop(1, spec.creamShade);
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(-0.4, 0.12, 0.52, 0.3, 0.35, 0, TAU);
    g.ellipse(0.4, 0.12, 0.52, 0.3, -0.35, 0, TAU);
    g.ellipse(0, 0.62, 0.34, 0.4, 0, 0, TAU);
    g.ellipse(0, 0.2, 0.3, 0.26, 0, 0, TAU);
    g.fill();
}

// Cauda grossa jogada para trás (lado oposto ao que olha), subindo curvada; balança em volta da base
function tail(g, spec, pose) {
    g.save();
    g.translate(-0.72, 0.5);
    g.rotate(-pose.tail * 0.5);
    const P = [[0, 0], [-0.7, 0.15], [-1.0, -0.5], [-0.72, -1.0]];
    const at = (t) => {
        const u = 1 - t;
        const f = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
        return [0, 1].map(k => f[0] * P[0][k] + f[1] * P[1][k] + f[2] * P[2][k] + f[3] * P[3][k]);
    };
    const line = (t0, t1, width, color) => {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineCap = 'round';
        g.beginPath();
        for (let t = t0; t <= t1 + 1e-6; t += 0.04) g[t === t0 ? 'moveTo' : 'lineTo'](...at(t));
        g.stroke();
    };
    line(0, 1, 0.84, shade(spec.body, -0.3));
    line(0, 1, 0.78, spec.body);
    line(0, 0.85, 0.24, spec.bodyLight);
    // Faixas escuras atravessando a cauda
    g.strokeStyle = spec.stripe;
    g.lineWidth = 0.09;
    [0.22, 0.42].forEach((t) => {
        const [x, y] = at(t);
        const [x2, y2] = at(t + 0.02);
        const a = Math.atan2(y2 - y, x2 - x) + Math.PI / 2;
        g.beginPath();
        // Curtas o bastante para ficar dentro da cauda (a cauda tem ~0,39 de meia largura, menos a borda)
        g.moveTo(x - Math.cos(a) * 0.14, y - Math.sin(a) * 0.14);
        g.lineTo(x + Math.cos(a) * 0.14, y + Math.sin(a) * 0.14);
        g.stroke();
    });
    line(0.8, 1, 0.78, spec.tailTip);
    g.restore();
}

function eyes(g, spec, pose) {
    const ex = 0.36;
    const ey = -0.28;
    g.lineCap = 'round';
    [-1, 1].forEach((side) => {
        const x = side * ex;
        if (pose.eye === 'x') {
            g.strokeStyle = spec.eyeColor;
            g.lineWidth = 0.07;
            g.beginPath();
            g.moveTo(x - 0.13, ey - 0.13); g.lineTo(x + 0.13, ey + 0.13);
            g.moveTo(x + 0.13, ey - 0.13); g.lineTo(x - 0.13, ey + 0.13);
            g.stroke();
        } else if (pose.eye === 'blink') {
            g.strokeStyle = spec.eyeColor;
            g.lineWidth = 0.07;
            g.beginPath();
            g.arc(x, ey + 0.05, 0.16, Math.PI * 1.1, Math.PI * 1.9);
            g.stroke();
        } else {
            const r = pose.eye === 'wide' ? 0.25 : pose.eye === 'angry' ? 0.17 : 0.2;
            g.fillStyle = spec.eyeColor;
            g.beginPath();
            g.ellipse(x, ey, r, r * (pose.eye === 'angry' ? 0.85 : 1), 0, 0, TAU);
            g.fill();
            g.fillStyle = '#ffffff';
            g.beginPath();
            g.arc(x - r * 0.3, ey - r * 0.35, r * 0.34, 0, TAU);
            g.fill();
            g.beginPath();
            g.arc(x + r * 0.35, ey + r * 0.35, r * 0.15, 0, TAU);
            g.fill();
        }
    });
    if (pose.eye === 'angry') {
        g.strokeStyle = spec.stripe;
        g.lineWidth = 0.09;
        g.beginPath();
        g.moveTo(-ex - 0.24, ey - 0.3); g.lineTo(-ex + 0.2, ey - 0.15);
        g.moveTo(ex + 0.24, ey - 0.3); g.lineTo(ex - 0.2, ey - 0.15);
        g.stroke();
    }
}

function mouth(g, spec, pose) {
    const ny = -0.14;
    // Narizinho
    g.fillStyle = spec.nose;
    g.beginPath();
    g.moveTo(-0.1, ny - 0.04);
    g.quadraticCurveTo(0, ny - 0.08, 0.1, ny - 0.04);
    g.quadraticCurveTo(0.08, ny + 0.06, 0, ny + 0.08);
    g.quadraticCurveTo(-0.08, ny + 0.06, -0.1, ny - 0.04);
    g.fill();
    g.fillStyle = 'rgba(255, 255, 255, 0.55)';
    g.beginPath();
    g.ellipse(-0.03, ny - 0.03, 0.03, 0.015, 0, 0, TAU);
    g.fill();

    const my = ny + 0.14;
    g.strokeStyle = spec.nose;
    g.fillStyle = spec.nose;
    g.lineWidth = 0.045;
    g.lineCap = 'round';
    g.beginPath();
    switch (pose.mouth) {
        case 'open':
            g.ellipse(0, my + 0.06, 0.13, 0.16, 0, 0, TAU);
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(0, my + 0.12, 0.08, 0.07, 0, 0, TAU);
            g.fill();
            break;
        case 'o':
            g.arc(0, my + 0.05, 0.07, 0, TAU);
            g.fill();
            break;
        case 'flat':
            g.moveTo(-0.13, my + 0.04); g.lineTo(0.13, my + 0.04);
            g.stroke();
            break;
        case 'frown':
            g.arc(0, my + 0.2, 0.14, Math.PI * 1.15, Math.PI * 1.85);
            g.stroke();
            break;
        case 'tongue':
            g.arc(0, my - 0.02, 0.15, 0.1, Math.PI - 0.1);
            g.closePath();
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(0.02, my + 0.13, 0.08, 0.1, 0, 0, TAU);
            g.fill();
            break;
        default: // sorriso em "w"
            g.moveTo(0, ny + 0.08); g.lineTo(0, my - 0.03);
            g.moveTo(-0.15, my - 0.05);
            g.quadraticCurveTo(-0.07, my + 0.07, 0, my - 0.03);
            g.quadraticCurveTo(0.07, my + 0.07, 0.15, my - 0.05);
            g.stroke();
    }
}

export function drawFluffy(g, spec, pose) {
    g.save();
    g.translate(0, pose.bob);
    tail(g, spec, pose);
    ears(g, spec, pose);
    body(g, spec);
    cream(g, spec);
    // O rosto fica levemente virado para o lado em que o bicho olha
    g.save();
    g.translate(0.1, 0);
    eyes(g, spec, pose);
    mouth(g, spec, pose);
    g.restore();
    g.restore();

    drawExtras(g, pose);
}

// Estrelinhas de tontura e gota de suor (comuns aos bichos sem contorno)
export function drawExtras(g, pose) {
    if (pose.stars !== undefined) {
        g.fillStyle = S.star;
        for (let i = 0; i < 3; i++) {
            const a = pose.stars + i * 2.09;
            g.save();
            g.translate(Math.cos(a) * 0.95 + 0.1, -1.15 + Math.sin(a) * 0.22);
            g.rotate(a * 2);
            g.beginPath();
            for (let k = 0; k < 8; k++) {
                const r = k % 2 === 0 ? 0.18 : 0.07;
                const t = (k / 8) * TAU;
                g.lineTo(Math.cos(t) * r, Math.sin(t) * r);
            }
            g.closePath();
            g.fill();
            g.restore();
        }
    }
    if (pose.sweat) {
        g.fillStyle = S.sweat;
        g.beginPath();
        g.moveTo(0.95, -0.6);
        g.quadraticCurveTo(1.15, -0.3, 0.95, -0.26);
        g.quadraticCurveTo(0.75, -0.3, 0.95, -0.6);
        g.fill();
    }
}
