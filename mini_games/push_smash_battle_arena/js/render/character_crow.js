import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras } from './character_fluffy.js';

// --- CORVO (esfera de penas) ---
// Segue art_reference/crow: esfera preta com brilho azulado, olhos grandes, bico cinza curto apontando para o
// lado em que olha, topete de 3 penas, leque de penas na cauda e duas asinhas coladas nos lados.
// As asas são a única exceção à regra "sem membros": fechadas quase somem atrás da esfera e só abrem
// no pulo e, inteiras, ao planar (pose.wings = abertura 0..1, pose.flap = batida -1..1).
const TAU = Math.PI * 2;
const EYES = [[-0.06, -0.22], [0.48, -0.22]];
const LIGHT_LINE = '#e8ebf5';    // traços (piscar, X, sobrancelha) claros para aparecer no corpo preto

const lerp = (a, b, t) => a + (b - a) * t;

// Asa de um lado (side 1 = frente, -1 = trás), saindo da lateral da esfera
function wing(g, spec, side, spread, flap) {
    const L = 0.42 + 0.68 * spread;
    g.save();
    g.translate(side * 0.7 + 0.04, 0.02);
    g.scale(side, 1);
    g.rotate(lerp(1.2, -0.25, spread) - flap * 0.4 * spread);
    // Três pontas de pena na borda de baixo
    const tips = [[L + 0.06, -0.12], [L * 0.86, 0.07], [L * 0.62, 0.19]];
    const notches = [[L * 0.78, -0.03], [L * 0.56, 0.09]];
    g.beginPath();
    g.moveTo(0, -0.22);
    g.quadraticCurveTo(L * 0.6, -0.42, tips[0][0], tips[0][1]);
    g.quadraticCurveTo(L * 0.92, -0.02, notches[0][0], notches[0][1]);
    g.quadraticCurveTo(L * 0.86, 0.04, tips[1][0], tips[1][1]);
    g.quadraticCurveTo(L * 0.7, 0.07, notches[1][0], notches[1][1]);
    g.quadraticCurveTo(L * 0.64, 0.15, tips[2][0], tips[2][1]);
    g.quadraticCurveTo(L * 0.3, 0.26, 0, 0.22);
    g.closePath();
    const grad = g.createLinearGradient(0, -0.4, 0, 0.25);
    grad.addColorStop(0, spec.wingLight);
    grad.addColorStop(1, spec.wing);
    g.fillStyle = grad;
    g.fill();
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.03;
    g.lineJoin = 'round';
    g.stroke();
    // Linhas das penas
    g.strokeStyle = spec.rim;
    g.globalAlpha = 0.55;
    g.lineWidth = 0.025;
    g.lineCap = 'round';
    g.beginPath();
    notches.forEach(([x, y]) => { g.moveTo(x, y); g.lineTo(x * 0.45, y * 0.4 - 0.04); });
    g.stroke();
    g.globalAlpha = 1;
    g.restore();
}

// Topete: três peninhas no alto da cabeça, balançando
function tuft(g, spec, pose) {
    g.save();
    g.translate(0.12, -0.9);
    g.rotate(-0.15 - pose.ear * 0.25);
    [[-0.5, 0.34], [-0.1, 0.42], [0.3, 0.3]].forEach(([a, len]) => {
        g.save();
        g.rotate(a);
        g.beginPath();
        g.moveTo(-0.07, 0.12);
        g.quadraticCurveTo(-0.08, -len * 0.6, 0.02, -len);
        g.quadraticCurveTo(0.08, -len * 0.5, 0.07, 0.12);
        g.closePath();
        g.fillStyle = spec.wingLight;
        g.fill();
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.025;
        g.stroke();
        g.restore();
    });
    g.restore();
}

// Cauda: leque de três penas para trás
function tail(g, spec, pose) {
    g.save();
    g.translate(-0.82, 0.38);
    g.rotate(-0.15 - pose.tail * 0.35);
    [[-0.35, 0.5], [0, 0.6], [0.35, 0.48]].forEach(([a, len]) => {
        g.save();
        g.rotate(a);
        g.beginPath();
        g.moveTo(0.05, -0.1);
        g.quadraticCurveTo(-len * 0.6, -0.16, -len, -0.02);
        g.lineTo(-len * 0.92, 0.06);
        g.quadraticCurveTo(-len * 0.6, 0.12, 0.05, 0.1);
        g.closePath();
        g.fillStyle = spec.wing;
        g.fill();
        g.strokeStyle = spec.bodyDark;
        g.lineWidth = 0.025;
        g.stroke();
        g.restore();
    });
    g.restore();
}

function body(g, spec) {
    const grad = g.createRadialGradient(-0.3, -0.45, 0.05, 0, 0.05, 1.15);
    grad.addColorStop(0, spec.bodyLight);
    grad.addColorStop(0.55, spec.body);
    grad.addColorStop(1, spec.bodyDark);
    g.fillStyle = grad;
    g.strokeStyle = spec.bodyDark;
    g.lineWidth = 0.035;
    g.beginPath();
    g.arc(0, 0, 1, 0, TAU);
    g.fill();
    g.stroke();
    // Peito um pouco mais claro, com escamas de pena
    g.fillStyle = spec.chest;
    g.globalAlpha = 0.6;
    g.beginPath();
    g.ellipse(0.18, 0.5, 0.52, 0.38, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 0.2;
    g.strokeStyle = spec.rim;
    g.lineWidth = 0.025;
    g.beginPath();
    [[-0.05, 0.5], [0.2, 0.62], [0.42, 0.5], [0.08, 0.76], [0.32, 0.78]].forEach(([x, y]) => {
        g.moveTo(x - 0.08, y);
        g.quadraticCurveTo(x, y + 0.07, x + 0.08, y);
    });
    g.stroke();
    // Brilho azulado das penas (luz de cima à esquerda)
    g.globalAlpha = 0.7;
    g.strokeStyle = spec.rim;
    g.lineWidth = 0.08;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(0, 0, 0.84, Math.PI * 1.1, Math.PI * 1.42);
    g.stroke();
    g.globalAlpha = 1;
}

function eyes(g, spec, pose) {
    g.lineCap = 'round';
    EYES.forEach(([x, y]) => {
        if (pose.eye === 'x') {
            g.strokeStyle = LIGHT_LINE;
            g.lineWidth = 0.06;
            g.beginPath();
            g.moveTo(x - 0.1, y - 0.1); g.lineTo(x + 0.1, y + 0.1);
            g.moveTo(x + 0.1, y - 0.1); g.lineTo(x - 0.1, y + 0.1);
            g.stroke();
            return;
        }
        if (pose.eye === 'blink') {
            g.strokeStyle = LIGHT_LINE;
            g.lineWidth = 0.05;
            g.beginPath();
            g.arc(x, y - 0.03, 0.11, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
            return;
        }
        const r = pose.eye === 'wide' ? 0.24 : 0.2;
        const ry = r * (pose.eye === 'angry' ? 0.72 : 1.1);
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.ellipse(x, y, r, ry, 0, 0, TAU);
        g.fill();
        g.fillStyle = spec.eye;
        g.beginPath();
        g.ellipse(x + 0.03, y + 0.01, r * 0.66, ry * 0.7, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(x - r * 0.05, y - ry * 0.3, r * 0.26, 0, TAU);
        g.fill();
    });
    if (pose.eye === 'angry') {
        g.strokeStyle = LIGHT_LINE;
        g.lineWidth = 0.06;
        g.beginPath();
        g.moveTo(EYES[0][0] - 0.17, EYES[0][1] - 0.22); g.lineTo(EYES[0][0] + 0.14, EYES[0][1] - 0.11);
        g.moveTo(EYES[1][0] + 0.17, EYES[1][1] - 0.22); g.lineTo(EYES[1][0] - 0.14, EYES[1][1] - 0.11);
        g.stroke();
    }
}

// Bico curto e grosso, um pouco para o lado em que olha; abre nas expressões
function beak(g, spec, pose) {
    const bx = 0.2;
    const by = 0.12;
    const open = { open: 0.12, tongue: 0.12, o: 0.07, frown: 0.03 }[pose.mouth] ?? 0;
    if (open > 0) {
        g.fillStyle = spec.mouth;
        g.beginPath();
        g.ellipse(bx + 0.12, by + open / 2 + 0.02, 0.2, open / 2 + 0.04, 0, 0, TAU);
        g.fill();
        if (pose.mouth === 'open' || pose.mouth === 'tongue') {
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(bx + 0.12, by + open, 0.08, 0.035, 0, 0, TAU);
            g.fill();
        }
    }
    const half = (top) => {
        const grad = g.createLinearGradient(0, by - 0.14, 0, by + 0.16);
        grad.addColorStop(0, spec.beakLight);
        grad.addColorStop(1, spec.beak);
        g.fillStyle = grad;
        g.beginPath();
        if (top) {
            g.moveTo(bx - 0.14, by + 0.02);
            g.quadraticCurveTo(bx - 0.06, by - 0.15, bx + 0.18, by - 0.1);
            g.quadraticCurveTo(bx + 0.4, by - 0.04, bx + 0.46, by + 0.06);   // pontinha curvada
            g.quadraticCurveTo(bx + 0.3, by + 0.04, bx - 0.14, by + 0.02);
        } else {
            g.moveTo(bx - 0.1, by + 0.03 + open);
            g.quadraticCurveTo(bx + 0.12, by + 0.15 + open, bx + 0.36, by + 0.06 + open);
            g.quadraticCurveTo(bx + 0.2, by + 0.03 + open, bx - 0.1, by + 0.03 + open);
        }
        g.closePath();
        g.fill();
        g.strokeStyle = spec.beakDark;
        g.lineWidth = 0.025;
        g.stroke();
    };
    g.save();
    g.translate(bx, by);
    g.scale(1.3, 1.3);
    g.translate(-bx, -by);
    half(false);
    half(true);
    // Narina e brilho
    g.fillStyle = spec.beakDark;
    g.beginPath();
    g.ellipse(bx + 0.06, by - 0.05, 0.03, 0.018, -0.2, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255, 255, 255, 0.5)';
    g.beginPath();
    g.ellipse(bx + 0.12, by - 0.08, 0.09, 0.022, 0.1, 0, TAU);
    g.fill();
    g.restore();
}

export function drawCrow(g, spec, pose) {
    // Abertura das asas: a pose de planar manda; nas outras, armUp abre um pouco (pulo, smash, provocar)
    const spread = pose.wings ?? Math.max(0, Math.min(0.55, pose.armUp * 0.45));
    const flap = pose.flap ?? pose.armSwing * 0.5;
    g.save();
    g.translate(0, pose.bob);
    tail(g, spec, pose);
    tuft(g, spec, pose);
    wing(g, spec, -1, spread, flap);
    wing(g, spec, 1, spread, flap);
    body(g, spec);
    eyes(g, spec, pose);
    beak(g, spec, pose);
    g.restore();
    drawExtras(g, pose);
}
