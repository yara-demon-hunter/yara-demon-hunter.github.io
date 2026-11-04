import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras, furryCircle } from './character_fluffy.js';

// --- CACHORRO (esfera de pelo curtinho) ---
// BEAGLE. Segue art_reference/dog/images/dog_beagle.webp: esfera marrom em 3/4 (rosto virado para o lado em que
// olha), faixa branca descendo da testa ao focinho, focinho e barriga brancos, mancha preta nas costas, orelhas
// longas e caídas, nariz escuro, linguinha para fora e rabinho de ponta branca. Sem braços e sem pernas.
const TAU = Math.PI * 2;
const EYES = [[-0.06, -0.2], [0.52, -0.2]];

function tail(g, spec, pose) {
    g.save();
    g.translate(-0.88, 0.5);
    g.rotate(-0.2 - pose.tail * 0.7);
    g.beginPath();
    g.ellipse(-0.14, -0.1, 0.22, 0.12, -0.5, 0, TAU);
    g.fillStyle = spec.patch;
    g.fill();
    g.beginPath();
    g.ellipse(-0.3, -0.2, 0.13, 0.1, -0.5, 0, TAU);       // ponta branca
    g.fillStyle = spec.cream;
    g.fill();
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.025;
    g.stroke();
    g.restore();
}

// Orelhas longas e caídas de beagle, coladas nos lados da cabeça (a de trás um pouco menor)
// Orelhas de beagle soltas, como uma capa: presas só no alto da cabeça e penduradas pelos lados.
// Giram em volta do ponto onde nascem, então se mexem com o corpo:
//   correr / dash  -> voam para trás     pular / smash / provocar / medo -> abrem para cima e para fora
//   parado         -> balançam de leve junto com a cauda
function ears(g, spec, pose) {
    [[-1, 0.62, 0.9], [1, 0.74, 1]].forEach(([side, x, size]) => {
        const lift = pose.armUp ?? 0;                       // braços "levantados" na pose = orelhas abertas
        const trail = pose.ear * 0.32;                       // para trás ao correr/cair
        const wobble = (pose.tail ?? 0) * 0.08;               // balanço leve parado
        const angle = -side * (0.12 + lift * 0.38) + trail + wobble;
        g.save();
        g.translate(side * x, -0.74);
        g.rotate(angle);
        g.scale(side * size, size);

        // Aba da orelha: estreita onde nasce, larga e arredondada na ponta solta
        g.beginPath();
        g.moveTo(-0.12, -0.04);
        g.bezierCurveTo(-0.3, 0.28, -0.26, 0.82, 0.04, 0.9);
        g.bezierCurveTo(0.3, 0.94, 0.34, 0.36, 0.17, -0.06);
        g.quadraticCurveTo(0.02, -0.16, -0.12, -0.04);
        g.closePath();
        const grad = g.createLinearGradient(0, -0.1, 0, 0.9);
        grad.addColorStop(0, spec.earLight);
        grad.addColorStop(0.3, spec.ear);
        grad.addColorStop(1, spec.earDark);
        g.fillStyle = grad;
        g.fill();
        g.strokeStyle = spec.earDark;
        g.lineWidth = 0.035;
        g.lineJoin = 'round';
        g.stroke();

        // Dobra onde a orelha nasce e fios de pelo
        g.fillStyle = spec.earDark;
        g.beginPath();
        g.ellipse(0.02, -0.04, 0.17, 0.09, 0, 0, TAU);
        g.fill();
        g.strokeStyle = spec.earLight;
        g.globalAlpha = 0.45;
        g.lineWidth = 0.03;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(0.06, 0.08);
        g.quadraticCurveTo(0.16, 0.4, 0.08, 0.74);
        g.moveTo(-0.06, 0.12);
        g.quadraticCurveTo(-0.1, 0.42, -0.02, 0.66);
        g.stroke();
        g.globalAlpha = 1;
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
    g.lineWidth = 0.03;
    furryCircle(g, 40, 0.03);   // borda felpudinha
    g.fill();
    g.stroke();

    // Marcas do beagle, recortadas pela esfera
    g.save();
    g.beginPath();
    g.arc(0, 0, 0.99, 0, TAU);
    g.clip();
    // Mancha preta nas costas
    g.fillStyle = spec.patch;
    g.beginPath();
    g.ellipse(-0.82, 0.22, 0.42, 0.6, 0.15, 0, TAU);
    g.fill();
    // Barriga branca
    g.fillStyle = spec.cream;
    g.beginPath();
    g.ellipse(0.12, 0.88, 0.5, 0.28, 0, 0, TAU);
    g.fill();
    // Faixa branca: desce da testa ENTRE os olhos e se abre no focinho
    g.beginPath();
    g.moveTo(0.12, -1.0);
    g.quadraticCurveTo(0.17, -0.6, 0.185, -0.28);
    g.quadraticCurveTo(0.19, -0.08, 0.3, -0.02);
    g.lineTo(0.44, -0.02);
    g.quadraticCurveTo(0.28, -0.1, 0.275, -0.28);
    g.quadraticCurveTo(0.29, -0.6, 0.34, -1.0);
    g.closePath();
    g.fill();
    g.restore();
    // Sobrancelhas marrons mais claras acima dos olhos
    g.fillStyle = 'rgba(255, 215, 160, 0.2)';
    EYES.forEach(([x, y]) => {
        g.beginPath();
        g.ellipse(x + 0.04, y - 0.2, 0.18, 0.08, 0, 0, TAU);
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
        const r = pose.eye === 'wide' ? 0.22 : pose.eye === 'angry' ? 0.15 : 0.19;
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
        g.ellipse(x + 0.015, y + 0.01, r * 0.86, ry * 0.88, 0, 0, TAU);
        g.fill();
        // Brilhos: um grande em cima e um pontinho embaixo (olhar fofo)
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(x - r * 0.28, y - ry * 0.32, r * 0.32, 0, TAU);
        g.fill();
        g.beginPath();
        g.arc(x + r * 0.3, y + ry * 0.32, r * 0.13, 0, TAU);
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
    g.ellipse(mx, 0.12, 0.36, 0.28, -0.08, 0, TAU);
    g.ellipse(mx - 0.06, 0.34, 0.2, 0.12, 0, 0, TAU);
    g.fill();

    // Bochechas rosadas
    g.fillStyle = spec.blush;
    g.globalAlpha = 0.55;
    g.beginPath();
    g.ellipse(-0.14, 0.06, 0.15, 0.1, 0, 0, TAU);
    g.ellipse(0.86, 0.02, 0.1, 0.09, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 1;

    // Nariz grande, com narinas e brilho
    const nx = mx + 0.08;
    const ny = 0.0;
    const nose = g.createRadialGradient(nx - 0.06, ny - 0.06, 0.01, nx, ny, 0.24);
    nose.addColorStop(0, spec.noseLight);
    nose.addColorStop(1, spec.nose);
    g.fillStyle = nose;
    g.beginPath();
    g.moveTo(nx - 0.15, ny - 0.04);
    g.quadraticCurveTo(nx, ny - 0.12, nx + 0.15, ny - 0.04);
    g.quadraticCurveTo(nx + 0.12, ny + 0.09, nx, ny + 0.1);
    g.quadraticCurveTo(nx - 0.12, ny + 0.09, nx - 0.15, ny - 0.04);
    g.fill();
    g.fillStyle = 'rgba(255, 255, 255, 0.55)';
    g.beginPath();
    g.ellipse(nx - 0.04, ny - 0.05, 0.05, 0.022, -0.2, 0, TAU);
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
        default: { // sorriso largo com a linguinha para fora
            g.fillStyle = S.tongue;
            g.beginPath();
            const wx = cx + 0.08;
            g.moveTo(wx - 0.07, my + 0.02);
            g.quadraticCurveTo(wx - 0.08, my + 0.17, wx, my + 0.18);
            g.quadraticCurveTo(wx + 0.08, my + 0.17, wx + 0.07, my + 0.02);
            g.closePath();
            g.fill();
            g.strokeStyle = spec.tongueLine;
            g.lineWidth = 0.018;
            g.beginPath();
            g.moveTo(wx, my + 0.05);
            g.lineTo(wx, my + 0.12);
            g.stroke();
            g.strokeStyle = spec.mouth;
            g.lineWidth = 0.032;
            g.beginPath();
            g.moveTo(wx, my - 0.12);
            g.lineTo(wx, my - 0.02);
            g.moveTo(wx - 0.15, my - 0.04);
            g.quadraticCurveTo(wx - 0.075, my + 0.05, wx, my - 0.02);
            g.quadraticCurveTo(wx + 0.075, my + 0.05, wx + 0.15, my - 0.04);
            g.stroke();
        }
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
