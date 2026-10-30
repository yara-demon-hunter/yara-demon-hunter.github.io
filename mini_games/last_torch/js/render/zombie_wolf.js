import { ZOMBIE_WOLF_VISUALS as V } from '../../data_model/visuals/monsters/zombie_wolf_visual.js';
import { ctx } from '../core/state.js';
import { renderNow } from './fx/clock.js';
import { drawGlow } from './fx/glow.js';

// --- LOBO ZUMBI (desenho procedural, sem imagens) ---
// Referência: art_reference/zombie_wolf. Vista de cima; no sistema local +x é a frente do lobo e +y o lado direito.
// Ordem (de baixo para cima): chama da cauda, pernas, corpo, costelas, chama da espinha, pescoço, cabeça, coleira.
const TAU = Math.PI * 2;

// Língua de chama apontada para trás (-x), com a ponta balançando
function flame(x, y, length, width, wave, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - width);
    ctx.quadraticCurveTo(x - length * 0.55, y - width * 0.6 + wave * 0.4, x - length, y + wave);
    ctx.quadraticCurveTo(x - length * 0.5, y + width * 0.6 + wave * 0.4, x, y + width);
    ctx.closePath();
    ctx.fill();
}

function leg(r, side, front, gallop) {
    const c = V.colors;
    const swing = Math.sin(gallop + (front ? 0 : Math.PI * 0.62) + (side > 0 ? 0 : Math.PI * 0.45));
    const hx = (front ? 0.55 : -0.58) * r;
    const hy = side * 0.36 * r;
    const kx = hx + swing * 0.3 * r;
    const ky = side * 0.5 * r;
    const fx = hx + swing * 0.62 * r;
    const fy = side * 0.62 * r;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.27;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.strokeStyle = c.furDark;
    ctx.lineWidth = r * 0.18;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.fillStyle = c.bone;
    ctx.beginPath();
    ctx.arc(fx + r * 0.05, fy, r * 0.07, 0, TAU);
    ctx.fill();
}

function body(r) {
    const c = V.colors;
    const parts = [[-0.56, 0.58, 0.42], [0.42, 0.62, 0.53], [-0.06, 0.62, 0.38]];
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.09;
    ctx.fillStyle = c.fur;
    parts.forEach(([x, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(x * r, 0, rx * r, ry * r, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
    });
    // Sem contorno por cima: as três peças viram um corpo só
    ctx.fillStyle = c.fur;
    ctx.beginPath();
    ctx.ellipse(-0.06 * r, 0, 0.6 * r, 0.36 * r, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = c.furLight;
    ctx.lineWidth = r * 0.07;
    ctx.beginPath();
    ctx.moveTo(-0.95 * r, 0);
    ctx.lineTo(0.9 * r, 0);
    ctx.stroke();
}

function ribs(r) {
    const c = V.colors;
    ctx.fillStyle = c.gum;
    ctx.beginPath();
    ctx.ellipse(0.02 * r, 0, 0.46 * r, 0.34 * r, 0, 0, TAU);
    ctx.fill();
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
        const x = (0.28 - i * 0.2) * r;
        [1, -1].forEach(s => {
            ctx.strokeStyle = c.boneDark;
            ctx.lineWidth = r * 0.085;
            ctx.beginPath();
            ctx.moveTo(x, s * 0.08 * r);
            ctx.quadraticCurveTo(x - 0.1 * r, s * 0.22 * r, x - 0.03 * r, s * 0.38 * r);
            ctx.stroke();
            ctx.strokeStyle = c.bone;
            ctx.lineWidth = r * 0.045;
            ctx.stroke();
        });
    }
}

function head(r, t, e) {
    const c = V.colors;
    const bob = Math.sin(t * V.gallopHz * TAU * 2 + e.phase) * r * 0.03;
    // Pescoço
    ctx.fillStyle = c.fur;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.ellipse(0.92 * r, bob, 0.3 * r, 0.27 * r, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Orelhas, coladas para trás
    [1, -1].forEach(s => {
        ctx.fillStyle = c.furLight;
        ctx.beginPath();
        ctx.moveTo(1.1 * r, bob + s * 0.2 * r);
        ctx.lineTo(0.84 * r, bob + s * 0.46 * r);
        ctx.lineTo(0.96 * r, bob + s * 0.18 * r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = c.gum;
        ctx.beginPath();
        ctx.moveTo(1.02 * r, bob + s * 0.24 * r);
        ctx.lineTo(0.9 * r, bob + s * 0.38 * r);
        ctx.lineTo(0.96 * r, bob + s * 0.22 * r);
        ctx.closePath();
        ctx.fill();
    });
    // Crânio e focinho comprido
    ctx.fillStyle = c.fur;
    ctx.beginPath();
    ctx.moveTo(1.5 * r, bob - 0.19 * r);
    ctx.quadraticCurveTo(1.82 * r, bob - 0.1 * r, 1.84 * r, bob);
    ctx.quadraticCurveTo(1.82 * r, bob + 0.1 * r, 1.5 * r, bob + 0.19 * r);
    ctx.ellipse(1.18 * r, bob, 0.34 * r, 0.31 * r, 0, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Crânio exposto de um lado
    ctx.fillStyle = c.bone;
    ctx.beginPath();
    ctx.ellipse(1.14 * r, bob - 0.14 * r, 0.15 * r, 0.1 * r, 0.3, 0, TAU);
    ctx.fill();
    // Boca aberta: presas dos dois lados
    ctx.fillStyle = c.gum;
    ctx.beginPath();
    ctx.moveTo(1.6 * r, bob - 0.07 * r);
    ctx.lineTo(1.86 * r, bob);
    ctx.lineTo(1.6 * r, bob + 0.07 * r);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.fang;
    [1, -1].forEach(s => [1.6, 1.7].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x * r, bob + s * 0.09 * r);
        ctx.lineTo((x + 0.04) * r, bob + s * 0.02 * r);
        ctx.lineTo((x + 0.08) * r, bob + s * 0.08 * r);
        ctx.closePath();
        ctx.fill();
    }));
    ctx.fillStyle = c.ink;
    ctx.beginPath();
    ctx.arc(1.83 * r, bob, r * 0.045, 0, TAU);
    ctx.fill();
    // Olhos que brilham
    [1, -1].forEach(s => {
        drawGlow(ctx, c.eyeGlow, 1.36 * r, bob + s * 0.14 * r, r * 0.24, 0.9);
        ctx.fillStyle = c.eye;
        ctx.beginPath();
        ctx.arc(1.36 * r, bob + s * 0.14 * r, r * 0.05, 0, TAU);
        ctx.fill();
    });
    // Coleira partida e a corrente chacoalhando
    ctx.strokeStyle = c.iron;
    ctx.lineWidth = r * 0.07;
    ctx.beginPath();
    ctx.ellipse(0.96 * r, bob, 0.09 * r, 0.29 * r, 0, -Math.PI * 0.42, Math.PI * 1.55);
    ctx.stroke();
    ctx.fillStyle = c.rust;
    for (let i = 0; i < 3; i++) {
        const sway = Math.sin(t * V.gallopHz * TAU * 2 + i + e.phase) * r * 0.05;
        ctx.fillRect(0.9 * r - i * 0.1 * r + sway, bob + 0.3 * r + i * 0.05 * r, r * 0.07, r * 0.07);
    }
}

export function renderZombieWolf(e) {
    const c = V.colors;
    const t = renderNow() / 1000;
    const r = e.radius * V.scale;
    const gallop = t * V.gallopHz * TAU + e.phase;
    const pulse = 0.5 + 0.5 * Math.sin(gallop);

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Cauda: pelo e, na ponta, a chama
    const tailWave = Math.sin(gallop * 2) * r * 0.22;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.26;
    ctx.beginPath();
    ctx.moveTo(-1.0 * r, 0);
    ctx.quadraticCurveTo(-1.2 * r, tailWave * 0.5, -1.38 * r, tailWave);
    ctx.stroke();
    ctx.strokeStyle = c.fur;
    ctx.lineWidth = r * 0.17;
    ctx.stroke();
    drawGlow(ctx, c.flameGlow, -1.5 * r, tailWave, r * 0.55, 0.7);
    flame(-1.36 * r, tailWave, r * (0.55 + 0.12 * pulse), r * 0.2, tailWave * 0.5, c.flame);
    flame(-1.36 * r, tailWave, r * 0.38, r * 0.11, tailWave * 0.3, c.flameMid);

    // Pernas: o par da frente em oposição ao de trás
    leg(r, 1, false, gallop);
    leg(r, -1, true, gallop);
    leg(r, -1, false, gallop);
    leg(r, 1, true, gallop);

    body(r);
    ribs(r);

    // Chama da maldição ao longo da espinha, apontando para trás
    drawGlow(ctx, c.flameGlow, -0.1 * r, 0, r * 1.1, 0.35 + 0.15 * pulse);
    for (let i = 0; i < 6; i++) {
        const x = (0.78 - i * 0.28) * r;
        const wave = Math.sin(gallop * 2 + i * 1.4) * r * 0.1;
        const length = r * (0.42 + 0.14 * pulse + (i % 2) * 0.1);
        flame(x, 0, length, r * 0.13, wave, c.flame);
        flame(x, 0, length * 0.6, r * 0.07, wave * 0.6, c.flameMid);
    }

    head(r, t, e);
    ctx.restore();
}
