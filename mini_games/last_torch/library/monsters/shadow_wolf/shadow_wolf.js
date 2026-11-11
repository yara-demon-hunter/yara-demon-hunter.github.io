// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/shadow_wolf/shadow_wolf.js e rode o sync.
import { SHADOW_WOLF_VISUALS as V } from './shadow_wolf_visual.js';
import { ctx } from '../../core/canvas.js';
import { renderNow } from '../../core/clock.js';
import { drawGlow } from '../../core/glow.js';

// --- LOBO SOMBRIÇO (desenho procedural, sem imagens) ---
// O mesmo lobo do Yara RPG (shadow-wolf.webp), visto de cima. No sistema local +x é a frente e +y o lado direito.
// Ordem (de baixo para cima): fumaça, cauda, pernas, corpo, pelo desfiado, juba, cabeça.
// Tudo anima em múltiplos do galope (o sprite fecha o ciclo sem salto).
const TAU = Math.PI * 2;

// Mecha (pelo ou fumaça) saindo de (x, y) para trás (-x), com a ponta balançando
function tuft(x, y, length, width, wave, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - width);
    ctx.quadraticCurveTo(x - length * 0.55, y - width * 0.5 + wave * 0.5, x - length, y + wave);
    ctx.quadraticCurveTo(x - length * 0.5, y + width * 0.5 + wave * 0.5, x, y + width);
    ctx.closePath();
    ctx.fill();
}

function leg(r, side, front, gallop) {
    const c = V.colors;
    const swing = Math.sin(gallop + (front ? 0 : Math.PI * 0.62) + (side > 0 ? 0 : Math.PI * 0.45));
    const hx = (front ? 0.5 : -0.55) * r;
    const hy = side * 0.34 * r;
    const kx = hx + swing * 0.3 * r;
    const ky = side * 0.5 * r;
    const fx = hx + swing * 0.62 * r;
    const fy = side * 0.6 * r;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.26;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.strokeStyle = c.furDark;
    ctx.lineWidth = r * 0.17;
    ctx.stroke();
}

function body(r, gallop) {
    const c = V.colors;
    // Fumaça preta soltando da traseira, presa ao ciclo do galope
    for (let i = 0; i < 5; i++) {
        const k = ((gallop / TAU) + i / 5) % 1;
        const y = Math.sin(i * 2.3) * 0.32 * r;
        ctx.globalAlpha = (1 - k) * 0.85;
        tuft(-0.8 * r - k * 0.7 * r, y, r * (0.45 + (1 - k) * 0.3), r * 0.12 * (1 - k * 0.5), Math.sin(gallop + i) * r * 0.1, c.smoke);
    }
    ctx.globalAlpha = 1;
    // Corpo: três peças viram uma só, sem contorno por cima
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.09;
    ctx.fillStyle = c.fur;
    [[-0.52, 0.56, 0.4], [0.42, 0.6, 0.5], [-0.05, 0.6, 0.38]].forEach(([x, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(x * r, 0, rx * r, ry * r, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
    });
    ctx.beginPath();
    ctx.ellipse(-0.05 * r, 0, 0.58 * r, 0.36 * r, 0, 0, TAU);
    ctx.fill();
    // Lombo mais claro e mechas claras para trás
    ctx.fillStyle = c.furMid;
    ctx.beginPath();
    ctx.ellipse(-0.05 * r, 0, 0.75 * r, 0.16 * r, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = c.furLight;
    ctx.lineWidth = r * 0.04;
    for (let i = 0; i < 6; i++) {
        const x = (0.65 - i * 0.26) * r;
        const y = Math.sin(i * 1.9) * 0.18 * r;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 0.22 * r, y * 1.15);
        ctx.stroke();
    }
    // Pelo desfiado nos flancos, apontando para trás
    for (let i = 0; i < 6; i++) {
        const x = (0.5 - i * 0.24) * r;
        [1, -1].forEach(s => tuft(x, s * 0.34 * r, r * 0.32, r * 0.07, s * r * 0.07 + Math.sin(gallop * 2 + i) * r * 0.03, i % 2 ? c.furDark : c.smoke));
    }
}

// Juba volumosa em volta do pescoço, em mechas para trás
function mane(r, gallop) {
    const c = V.colors;
    for (let i = 0; i < 9; i++) {
        const a = (i / 8 - 0.5) * 2.2;
        const x = 0.82 * r - Math.abs(a) * 0.08 * r;
        const y = Math.sin(a) * 0.42 * r;
        const color = i % 3 === 0 ? c.furMid : i % 3 === 1 ? c.fur : c.furDark;
        tuft(x, y, r * (0.48 + (i % 2) * 0.14), r * 0.12, y * 0.35 + Math.sin(gallop * 2 + i) * r * 0.05, color);
    }
}

function head(r, t, e) {
    const c = V.colors;
    const bob = Math.sin(t * V.gallopHz * TAU * 2 + e.phase) * r * 0.03;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.08;
    // Orelhas em pé, um pouco para trás
    [1, -1].forEach(s => {
        ctx.fillStyle = c.furDark;
        ctx.beginPath();
        ctx.moveTo(1.12 * r, bob + s * 0.2 * r);
        ctx.lineTo(0.86 * r, bob + s * 0.44 * r);
        ctx.lineTo(0.98 * r, bob + s * 0.12 * r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });
    // Crânio largo e focinho comprido
    ctx.fillStyle = c.fur;
    ctx.beginPath();
    ctx.moveTo(1.5 * r, bob - 0.18 * r);
    ctx.quadraticCurveTo(1.84 * r, bob - 0.1 * r, 1.86 * r, bob);
    ctx.quadraticCurveTo(1.84 * r, bob + 0.1 * r, 1.5 * r, bob + 0.18 * r);
    ctx.ellipse(1.16 * r, bob, 0.36 * r, 0.32 * r, 0, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Faixa clara no focinho e sobrancelhas franzidas
    ctx.fillStyle = c.furLight;
    ctx.beginPath();
    ctx.ellipse(1.58 * r, bob, 0.2 * r, 0.05 * r, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = c.furLight;
    ctx.lineWidth = r * 0.045;
    [1, -1].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(1.2 * r, bob + s * 0.26 * r);
        ctx.lineTo(1.42 * r, bob + s * 0.08 * r);
        ctx.stroke();
    });
    // Boca aberta vermelha, presas brancas
    ctx.fillStyle = c.mouth;
    ctx.beginPath();
    ctx.moveTo(1.58 * r, bob - 0.09 * r);
    ctx.lineTo(1.88 * r, bob);
    ctx.lineTo(1.58 * r, bob + 0.09 * r);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.fang;
    [1, -1].forEach(s => [1.58, 1.7].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x * r, bob + s * 0.11 * r);
        ctx.lineTo((x + 0.04) * r, bob + s * 0.02 * r);
        ctx.lineTo((x + 0.08) * r, bob + s * 0.1 * r);
        ctx.closePath();
        ctx.fill();
    }));
    ctx.fillStyle = c.nose;
    ctx.beginPath();
    ctx.arc(1.85 * r, bob, r * 0.055, 0, TAU);
    ctx.fill();
    // Olhos vermelhos brilhando
    [1, -1].forEach(s => {
        drawGlow(ctx, c.eyeGlow, 1.34 * r, bob + s * 0.15 * r, r * 0.28, 0.95);
        ctx.fillStyle = c.eye;
        ctx.beginPath();
        ctx.arc(1.34 * r, bob + s * 0.15 * r, r * 0.06, 0, TAU);
        ctx.fill();
    });
}

export function renderShadowWolf(e) {
    const c = V.colors;
    const t = renderNow() / 1000;
    const r = e.radius * V.scale;
    const gallop = t * V.gallopHz * TAU + e.phase;

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Cauda de fumaça
    const tailWave = Math.sin(gallop * 2) * r * 0.22;
    tuft(-0.9 * r, 0, r * 0.75, r * 0.16, tailWave, c.furDark);
    tuft(-1.1 * r, tailWave * 0.4, r * 0.55, r * 0.12, tailWave * 1.3, c.smoke);

    leg(r, 1, false, gallop);
    leg(r, -1, true, gallop);
    leg(r, -1, false, gallop);
    leg(r, 1, true, gallop);

    body(r, gallop);
    mane(r, gallop);
    head(r, t, e);
    ctx.restore();
}
