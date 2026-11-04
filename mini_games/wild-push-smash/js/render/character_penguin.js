import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawExtras, furryCircle } from './character_fluffy.js';

// --- PINGUIM (esfera de pelo preto e branco) ---
// Segue art_reference/penguin/images/pinguim.webp: esfera preta felpuda vista em 3/4, máscara branca que
// sobe em dois lobos em volta dos olhos e desce até a barriga, olhinhos pretos e bico amarelo brilhante.
// A asa é só uma marca no corpo (não sai da esfera). Sem braços e sem pernas. Ginga de um lado para o outro.
const TAU = Math.PI * 2;
const EYES = [[-0.04, -0.24, 0.1], [0.48, -0.24, 0.11]];

function body(g, spec) {
    const grad = g.createRadialGradient(-0.3, -0.5, 0.05, 0, 0, 1.15);
    grad.addColorStop(0, spec.bodyLight);
    grad.addColorStop(0.55, spec.body);
    grad.addColorStop(1, spec.bodyDark);
    furryCircle(g);
    g.fillStyle = grad;
    g.fill();
    // Borda clara: separa o pinguim do fundo noturno
    g.strokeStyle = spec.rim;
    g.lineWidth = 0.05;
    g.stroke();

    // Asa: só uma marca na lateral de trás
    g.strokeStyle = spec.bodyLight;
    g.globalAlpha = 0.6;
    g.lineWidth = 0.05;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-0.72, -0.15);
    g.quadraticCurveTo(-0.98, 0.25, -0.7, 0.62);
    g.stroke();
    g.globalAlpha = 1;
}

// Máscara branca: dois lobos em volta dos olhos (com o "V" preto entre eles) e a barriga embaixo
function mask(g, spec) {
    g.save();
    furryCircle(g);
    g.clip();
    const grad = g.createRadialGradient(0.1, 0.0, 0.1, 0.15, 0.25, 1.0);
    grad.addColorStop(0, spec.white);
    grad.addColorStop(1, spec.whiteShade);
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(-0.06, -0.16, 0.26, 0.36, 0.2, 0, TAU);
    g.ellipse(0.5, -0.16, 0.28, 0.38, -0.2, 0, TAU);
    g.ellipse(0.22, 0.55, 0.62, 0.5, 0, 0, TAU);
    g.ellipse(0.22, 0.12, 0.48, 0.28, 0, 0, TAU);
    g.ellipse(0.5, 0.12, 0.3, 0.32, 0, 0, TAU);       // fecha o vão entre o lobo do olho e a barriga
    g.fill();
    g.restore();
}

function eyes(g, spec, pose) {
    g.lineCap = 'round';
    EYES.forEach(([x, y, base]) => {
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
            g.arc(x, y - 0.02, 0.1, Math.PI * 0.15, Math.PI * 0.85);
            g.stroke();
            return;
        }
        const r = base * (pose.eye === 'wide' ? 1.4 : 1);
        const ry = r * (pose.eye === 'angry' ? 0.7 : 1.1);
        g.fillStyle = spec.eye;
        g.beginPath();
        g.ellipse(x, y, r, ry, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(x - r * 0.3, y - ry * 0.35, r * 0.32, 0, TAU);
        g.fill();
    });
    if (pose.eye === 'angry') {
        g.strokeStyle = spec.body;
        g.lineWidth = 0.07;
        g.beginPath();
        g.moveTo(EYES[0][0] - 0.16, EYES[0][1] - 0.22); g.lineTo(EYES[0][0] + 0.14, EYES[0][1] - 0.12);
        g.moveTo(EYES[1][0] + 0.16, EYES[1][1] - 0.22); g.lineTo(EYES[1][0] - 0.14, EYES[1][1] - 0.12);
        g.stroke();
    }
}

// Bico amarelo brilhante, deitado, com a linha da boca no meio; abre nas expressões
function beak(g, spec, pose) {
    const bx = 0.26;
    const by = 0.04;
    const open = { open: 0.12, tongue: 0.12, o: 0.07, frown: 0.03 }[pose.mouth] ?? 0;
    const half = (top) => {
        const grad = g.createLinearGradient(0, by - 0.14, 0, by + 0.14);
        grad.addColorStop(0, spec.beakLight);
        grad.addColorStop(1, spec.beak);
        g.fillStyle = grad;
        g.beginPath();
        if (top) {
            g.moveTo(bx - 0.27, by);
            g.quadraticCurveTo(bx - 0.2, by - 0.15, bx + 0.02, by - 0.14);
            g.quadraticCurveTo(bx + 0.26, by - 0.12, bx + 0.29, by);
        } else {
            g.moveTo(bx - 0.25, by + open);
            g.quadraticCurveTo(bx - 0.12, by + 0.15 + open, bx + 0.04, by + 0.14 + open);
            g.quadraticCurveTo(bx + 0.24, by + 0.12 + open, bx + 0.27, by + open);
        }
        g.closePath();
        g.fill();
        g.strokeStyle = spec.beakDark;
        g.lineWidth = 0.025;
        g.stroke();
    };
    if (open > 0) {
        g.fillStyle = spec.mouth;
        g.beginPath();
        g.ellipse(bx + 0.01, by + open / 2 + 0.01, 0.24, open / 2 + 0.03, 0, 0, TAU);
        g.fill();
        if (pose.mouth === 'open' || pose.mouth === 'tongue') {
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(bx + 0.02, by + open, 0.1, 0.04, 0, 0, TAU);
            g.fill();
        }
    }
    half(false);
    half(true);
    // Brilho do bico
    g.fillStyle = 'rgba(255, 255, 255, 0.55)';
    g.beginPath();
    g.ellipse(bx - 0.04, by - 0.08, 0.1, 0.03, -0.1, 0, TAU);
    g.fill();
    if (pose.mouth === 'smile' || pose.mouth === 'flat') {
        g.strokeStyle = spec.beakDark;
        g.lineWidth = 0.03;
        g.beginPath();
        g.moveTo(bx - 0.24, by + 0.005);
        g.quadraticCurveTo(bx, by + (pose.mouth === 'smile' ? 0.04 : 0.01), bx + 0.26, by);
        g.stroke();
    }
}

export function drawPenguin(g, spec, pose) {
    g.save();
    g.translate(0, pose.bob);
    g.rotate(pose.tail * 0.08);       // gingado: sem cauda, o corpo todo balança
    body(g, spec);
    mask(g, spec);
    eyes(g, spec, pose);
    beak(g, spec, pose);
    g.restore();
    drawExtras(g, pose);
}
