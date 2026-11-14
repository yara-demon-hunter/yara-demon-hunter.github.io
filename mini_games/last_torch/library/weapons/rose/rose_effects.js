// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/rose/rose_effects.js e rode o sync.
import { ROSE_VISUALS } from './rose_visual.js';

const TAU = Math.PI * 2;
const E = ROSE_VISUALS.effects;
const D = ROSE_VISUALS.dark.colors;

// --- EFEITOS DA DARK ROSES ---
// Dois desenhos prontos para virar sprite (o jogo os desenha uma vez e depois só carimba).

// Uma rosa negra aberta, de frente (como um emblema): é a MARCA que fica sobre o monstro atingido. Origem no centro; ~16 unidades.
// t = tempo (o anel pulsa).
export function drawRoseMark(ctx, t) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 4);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Fundo violeta claro (a rosa é escura: sem ele some em cima do chão e do monstro) e anel pulsante
    ctx.fillStyle = E.markBack;
    ctx.beginPath();
    ctx.arc(0, 0, 7.6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = E.markRing;
    ctx.globalAlpha = 0.7 + 0.3 * pulse;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, 7.4, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Folhinhas e espinho embaixo
    ctx.fillStyle = D.leaf;
    for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, 3.2);
        ctx.quadraticCurveTo(s * 4.2, 3.6, s * 5.4, 6.1);
        ctx.quadraticCurveTo(s * 2.4, 6.2, 0, 3.2);
        ctx.fill();
    }
    // Pétalas de fora, de dentro e o miolo em espiral
    ctx.strokeStyle = D.petalShade;
    ctx.lineWidth = 0.4;
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.3;
        ctx.fillStyle = D.petalShade;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 3.4, Math.sin(a) * 3.4 - 0.4, 3.1, 0, TAU);
        ctx.fill();
    }
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU;
        ctx.fillStyle = D.petal;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 2.1, Math.sin(a) * 2.1 - 0.4, 2.6, 0, TAU);
        ctx.fill();
        ctx.stroke();
    }
    ctx.fillStyle = D.petalLight;
    ctx.beginPath();
    ctx.arc(-1, -1.9, 1.1, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = E.markRing;
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.arc(0.2, -0.3, 1.5, 0.4, 4.7);
    ctx.stroke();
}

// Rosas de espinho no chão, vistas de cima: trepadeiras com espinhos saindo do centro e três rosas negras abertas (sem tapete
// de terra em volta: só as rosas e os espinhos). Origem no centro; ~64 x 50 unidades. seed muda o desenho (3 variações).
export function drawThornPatch(ctx, seed = 0) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Trepadeiras: curvas saindo do centro, cada uma com espinhos
    const vines = 7;
    for (let i = 0; i < vines; i++) {
        const a = (i / vines) * TAU + seed * 0.9;
        const len = 21 + ((i * 7 + seed * 5) % 6);
        const bend = (i % 2 ? 1 : -1) * (0.55 + 0.15 * seed);
        const x1 = Math.cos(a + bend * 0.4) * len * 0.55;
        const y1 = Math.sin(a + bend * 0.4) * len * 0.55 * 0.8;
        const x2 = Math.cos(a + bend) * len;
        const y2 = Math.sin(a + bend) * len * 0.8;
        ctx.strokeStyle = E.vineShade;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(x1, y1, x2, y2);
        ctx.stroke();
        ctx.strokeStyle = E.vine;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Espinhos ao longo da curva (alternando de lado)
        for (let k = 1; k <= 4; k++) {
            const u = k / 4.6;
            const px = (1 - u) * (1 - u) * 0 + 2 * (1 - u) * u * x1 + u * u * x2;
            const py = 2 * (1 - u) * u * y1 + u * u * y2;
            const dx = 2 * (1 - u) * x1 + 2 * u * (x2 - x1);
            const dy = 2 * (1 - u) * y1 + 2 * u * (y2 - y1);
            const n = Math.hypot(dx, dy) || 1;
            const side = k % 2 ? 1 : -1;
            const nx = (-dy / n) * side;
            const ny = (dx / n) * side;
            ctx.fillStyle = E.spike;
            ctx.beginPath();
            ctx.moveTo(px - (dx / n) * 1.1, py - (dy / n) * 1.1);
            ctx.lineTo(px + nx * 3.6 + (dx / n) * 0.8, py + ny * 3.6 + (dy / n) * 0.8);
            ctx.lineTo(px + (dx / n) * 1.1, py + (dy / n) * 1.1);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = E.spikeTip;
            ctx.beginPath();
            ctx.arc(px + nx * 3.4 + (dx / n) * 0.8, py + ny * 3.4 + (dy / n) * 0.8, 0.5, 0, TAU);
            ctx.fill();
        }
    }
    // Três rosas negras abertas no meio e nas pontas
    const roses = [[0, 0, 7.6], [-14 + seed * 2, -6, 5.6], [13 - seed * 2, 7, 5.8]];
    for (const [rx, ry, r] of roses) {
        ctx.fillStyle = E.glow;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(rx, ry, r * 1.5, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * TAU + seed;
            ctx.fillStyle = D.petalShade;
            ctx.beginPath();
            ctx.arc(rx + Math.cos(a) * r * 0.55, ry + Math.sin(a) * r * 0.55, r * 0.55, 0, TAU);
            ctx.fill();
        }
        ctx.strokeStyle = D.petalShade;
        ctx.lineWidth = 0.35;
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * TAU;
            ctx.fillStyle = D.petal;
            ctx.beginPath();
            ctx.arc(rx + Math.cos(a) * r * 0.36, ry + Math.sin(a) * r * 0.36, r * 0.46, 0, TAU);
            ctx.fill();
            ctx.stroke();
        }
        ctx.fillStyle = D.petalLight;
        ctx.beginPath();
        ctx.arc(rx - r * 0.2, ry - r * 0.22, r * 0.2, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = E.markRing;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.arc(rx + r * 0.05, ry, r * 0.2, 0.5, 4.6);
        ctx.stroke();
    }
}
