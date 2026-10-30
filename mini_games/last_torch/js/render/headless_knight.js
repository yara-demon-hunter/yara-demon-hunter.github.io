import { HEADLESS_KNIGHT_VISUALS as V } from '../../data_model/visuals/monsters/headless_knight_visual.js';
import { ctx } from '../core/state.js';
import { renderNow } from './fx/clock.js';
import { drawGlow } from './fx/glow.js';

// --- CAVALEIRO SEM CABEÇA (desenho procedural, sem imagens) ---
// Referência: art_reference/headless_knight. Vista de cima; no sistema local +x é a frente e +y o lado direito.
// Ordem (de baixo para cima): espada, pernas, tronco, braços, capa, corrente, ombreiras, gorjal com a chama e elmo.
// A capa vem depois das pernas e do tronco: ela cobre as costas, e os pés só aparecem pela frente do corpo.
// Todo ritmo é múltiplo inteiro do passo (g), para o ciclo do sprite fechar sem salto.
const TAU = Math.PI * 2;

// Posição do elmo no mundo, sem a oscilação (de onde sai o tiro e o brilho da mira)
export function knightHeadPosition(e) {
    const r = e.radius * V.scale;
    const f = e.facing ?? e.angle;
    const lx = V.head.x * r;
    const ly = V.head.y * r;
    return { x: e.x + Math.cos(f) * lx - Math.sin(f) * ly, y: e.y + Math.sin(f) * lx + Math.cos(f) * ly };
}

function flame(x, y, length, width, wave, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - width);
    ctx.quadraticCurveTo(x - length * 0.55, y - width * 0.6 + wave * 0.4, x - length, y + wave);
    ctx.quadraticCurveTo(x - length * 0.5, y + width * 0.6 + wave * 0.4, x, y + width);
    ctx.closePath();
    ctx.fill();
}

function disc(x, y, radius, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
}

function path(points, close = true) {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (close) ctx.closePath();
}

// Montante arrastando no chão do lado direito, com o sulco na lâmina, dentes no gume e faíscas na ponta
function sword(r, g) {
    const c = V.colors;
    const hx = 0.34 * r, hy = 1.04 * r;
    const tx = -1.98 * r, ty = 1.32 * r;
    const len = Math.hypot(tx - hx, ty - hy);
    const dx = (tx - hx) / len, dy = (ty - hy) / len;
    const nx = -dy, ny = dx;
    const wd = r * 0.11;
    const at = (k, side) => [hx + dx * len * k + nx * side, hy + dy * len * k + ny * side];

    // Risco no chão
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = r * 0.05;
    path([at(1, 0), [tx - r * 0.3, ty + r * 0.04]], false);
    ctx.stroke();

    ctx.fillStyle = c.blade;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.05;
    path([at(0, wd), at(0.34, wd), at(0.38, wd * 0.55), at(0.44, wd), at(0.7, wd * 0.9), at(0.74, wd * 0.45), at(0.8, wd * 0.8), at(1, 0), at(0.86, -wd * 0.7), at(0.6, -wd), at(0.55, -wd * 0.5), at(0.5, -wd), at(0, -wd)]);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = c.steelDark;
    ctx.lineWidth = r * 0.04;
    path([at(0.02, 0), at(0.8, 0)], false);
    ctx.stroke();
    ctx.strokeStyle = c.edge;
    ctx.lineWidth = r * 0.02;
    path([at(0.02, wd * 0.55), at(0.7, wd * 0.5)], false);
    ctx.stroke();

    // Guarda
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.15;
    path([at(0, r * 0.36), at(0, -r * 0.36)], false);
    ctx.stroke();
    ctx.strokeStyle = c.gold;
    ctx.lineWidth = r * 0.08;
    ctx.stroke();

    // Faíscas
    for (let i = 0; i < 3; i++) {
        const flick = Math.sin(g * 5 + i * 2.1);
        if (flick < -0.2) continue;
        ctx.fillStyle = c.spark;
        ctx.fillRect(tx - (i + 1) * r * 0.1 + flick * r * 0.05, ty + (i - 1) * r * 0.09, r * 0.06, r * 0.06);
    }
}

// Pernas: partem do quadril e só o pé que avança passa da frente do corpo
function legs(r, g) {
    const c = V.colors;
    [1, -1].forEach(s => {
        const step = Math.sin(g + (s > 0 ? 0 : Math.PI));
        const x = (0.26 + step * 0.4) * r;
        const y = s * 0.36 * r;
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = r * 0.3;
        path([[0, y], [x, y]], false);
        ctx.stroke();
        ctx.strokeStyle = c.steelDark;
        ctx.lineWidth = r * 0.2;
        ctx.stroke();

        // Bota de placas, pontuda, com a sola marcada
        ctx.fillStyle = c.steel;
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = r * 0.055;
        path([[x - 0.14 * r, y - 0.17 * r], [x + 0.2 * r, y - 0.16 * r], [x + 0.44 * r, y], [x + 0.2 * r, y + 0.16 * r], [x - 0.14 * r, y + 0.17 * r]]);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = c.steelLight;
        ctx.lineWidth = r * 0.03;
        path([[x - 0.1 * r, y], [x + 0.3 * r, y]], false);
        ctx.stroke();
        ctx.strokeStyle = c.steelDark;
        [0.04, 0.18].forEach(k => {
            path([[x + k * r, y - 0.14 * r], [x + k * r, y + 0.14 * r]], false);
            ctx.stroke();
        });
    });
}

function torso(r) {
    const c = V.colors;
    ctx.fillStyle = c.steelDark;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.07;
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.6 * r, 0.92 * r, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Peitoral: crista central e placas sobrepostas
    ctx.fillStyle = c.steel;
    ctx.beginPath();
    ctx.ellipse(0.06 * r, 0, 0.48 * r, 0.74 * r, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = c.steelDark;
    ctx.lineWidth = r * 0.04;
    [0.24, 0.4].forEach(x => {
        ctx.beginPath();
        ctx.ellipse(-0.16 * r, 0, (x + 0.2) * r, (x + 0.34) * r, 0, -0.75, 0.75);
        ctx.stroke();
    });
    ctx.strokeStyle = c.steelLight;
    ctx.lineWidth = r * 0.05;
    path([[0.5 * r, 0], [-0.1 * r, 0]], false);
    ctx.stroke();

    // Rebites e marcas de golpes
    [[0.3, 0.42], [0.3, -0.42], [0.14, 0.56], [0.14, -0.56]].forEach(([x, y]) => disc(x * r, y * r, r * 0.03, c.steelLight));
    disc(0.42 * r, 0.24 * r, r * 0.07, c.rust);
    disc(0.2 * r, -0.28 * r, r * 0.055, c.rust);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.03;
    path([[0.5 * r, -0.2 * r], [0.34 * r, -0.08 * r]], false);
    ctx.stroke();
}

// Manoplas: o braço esquerdo balança com o passo; o direito segura o punho da espada
function arms(r, g) {
    const c = V.colors;
    const reach = Math.sin(g) * 0.08;
    [[-1, 0.74 + reach, -0.66], [1, 0.34, 0.98]].forEach(([s, hx, hy]) => {
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = r * 0.32;
        path([[0.05 * r, s * 0.85 * r], [hx * r, hy * r]], false);
        ctx.stroke();
        ctx.strokeStyle = c.steel;
        ctx.lineWidth = r * 0.21;
        ctx.stroke();
        ctx.fillStyle = c.steelDark;
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = r * 0.05;
        ctx.beginPath();
        ctx.arc(hx * r, hy * r, r * 0.16, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = c.steelLight;
        ctx.lineWidth = r * 0.025;
        [-0.07, 0, 0.07].forEach(k => {
            path([[(hx + 0.02) * r, (hy + k) * r], [(hx + 0.12) * r, (hy + k) * r]], false);
            ctx.stroke();
        });
    });
}

// Capa sobre as costas: nasce atrás do gorjal e dos ombros e cobre tudo o que fica para trás
function cape(r, g) {
    const c = V.colors;
    const tatter = (i) => Math.sin(g * 2 + i * 1.3) * r * 0.09;
    const flare = Math.sin(g) * r * 0.05;
    const front = [[0.04 * r, -1.02 * r], [-0.22 * r, -0.5 * r], [-0.28 * r, 0], [-0.22 * r, 0.5 * r], [0.04 * r, 1.02 * r]];
    const hem = [
        [-0.8 * r, 1.26 * r + flare], [-1.45 * r + tatter(0), 1.16 * r + flare], [-1.2 * r + tatter(1), 0.86 * r],
        [-1.68 * r + tatter(2), 0.56 * r], [-1.3 * r + tatter(3), 0.26 * r], [-1.74 * r + tatter(4), -0.08 * r],
        [-1.3 * r + tatter(5), -0.38 * r], [-1.64 * r + tatter(6), -0.68 * r], [-1.2 * r + tatter(7), -0.92 * r],
        [-1.42 * r + tatter(8), -1.16 * r - flare], [-0.8 * r, -1.26 * r - flare]
    ];

    ctx.fillStyle = c.cloth;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.07;
    path([...front, ...hem]);
    ctx.fill();
    ctx.stroke();

    // Dobras: sombra no meio e vincos que descem até as tiras
    ctx.fillStyle = c.clothDark;
    path([[-0.34 * r, -0.2 * r], [-0.34 * r, 0.2 * r], [-1.3 * r + tatter(3), 0.26 * r], [-1.6 * r + tatter(4), -0.08 * r], [-1.3 * r + tatter(5), -0.38 * r]]);
    ctx.fill();
    ctx.strokeStyle = c.clothMid;
    ctx.lineWidth = r * 0.05;
    [[-0.86, 0.5], [-0.5, 0.26], [0.5, -0.26], [0.86, -0.5]].forEach(([y, bend], i) => {
        ctx.beginPath();
        ctx.moveTo(-0.32 * r, y * 0.8 * r);
        ctx.quadraticCurveTo(-0.8 * r, (y + bend * 0.2) * r, -1.2 * r + tatter(i * 2 + 1), y * 1.1 * r);
        ctx.stroke();
    });

    // Barra clara, gasta, seguindo as tiras
    ctx.strokeStyle = c.clothEdge;
    ctx.lineWidth = r * 0.035;
    path(hem.slice(1, -1), false);
    ctx.stroke();

    // Gola da capa, dobrada sobre as costas
    ctx.strokeStyle = c.clothMid;
    ctx.lineWidth = r * 0.09;
    path(front, false);
    ctx.stroke();
}

// Corrente de ouro prendendo a capa, de um ombro ao outro, passando pelo peito
function clasp(r) {
    const c = V.colors;
    for (let i = 0; i <= 10; i++) {
        const k = i / 10;
        const y = (k * 2 - 1) * 0.82 * r;
        const x = (0.2 + 0.36 * (1 - (k * 2 - 1) ** 2)) * r;
        if (i % 2 === 0) disc(x, y, r * 0.04, c.gold);
    }
    [1, -1].forEach(s => {
        disc(0.2 * r, s * 0.82 * r, r * 0.11, c.ink);
        disc(0.2 * r, s * 0.82 * r, r * 0.08, c.gold);
    });
}

function pauldron(r, s, g) {
    const c = V.colors;
    const x = (0.05 + Math.sin(g + (s > 0 ? Math.PI : 0)) * 0.05) * r;
    const y = s * 0.98 * r;

    ctx.fillStyle = c.steelDark;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.06;
    [[-0.28, 0.62], [0.05, 0.8], [0.34, 0.62]].forEach(([dx, length]) => {
        path([[x + (dx - 0.13) * r, y + s * 0.34 * r], [x + dx * r * 1.25, y + s * length * r], [x + (dx + 0.13) * r, y + s * 0.34 * r]]);
        ctx.fill();
        ctx.stroke();
    });

    // Placas em camadas, da borda para o centro
    [[0.5, c.steelDark], [0.41, c.steel], [0.29, c.steelLight], [0.2, c.steel]].forEach(([size, fill], i) => {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, size * r, 0, TAU);
        ctx.fill();
        if (i === 0) ctx.stroke();
    });
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        disc(x + Math.cos(a) * 0.45 * r, y + Math.sin(a) * 0.45 * r, r * 0.028, c.steelLight);
    }
    disc(x - 0.16 * r, y + s * 0.2 * r, r * 0.07, c.rust);
}

// Gorjal oco e a chama azul que sobe onde estaria a cabeça (vista de cima: um clarão que escorre para trás)
function neck(r, g) {
    const c = V.colors;
    const pulse = 0.5 + 0.5 * Math.sin(g * 2);
    const x = 0.14 * r;
    ctx.fillStyle = c.steelDark;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.arc(x, 0, 0.42 * r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.steelLight;
    ctx.beginPath();
    ctx.arc(x, 0, 0.35 * r, 0, TAU);
    ctx.fill();
    disc(x, 0, 0.26 * r, '#04060a');
    drawGlow(ctx, c.flameGlow, x, 0, r * (0.58 + 0.08 * pulse), 0.6);
    for (let i = -1; i <= 1; i++) {
        const wave = Math.sin(g * 3 + i * 1.7) * r * 0.12;
        flame(x, i * r * 0.1, r * (0.7 + 0.2 * pulse - Math.abs(i) * 0.2), r * 0.16, wave, c.flame);
        flame(x, i * r * 0.1, r * (0.45 - Math.abs(i) * 0.1), r * 0.09, wave * 0.6, c.flameMid);
    }
    drawGlow(ctx, c.flameTip, x, 0, r * 0.26, 0.95);
}

// O elmo flutua de lado, vigiando para a frente; é dele que sai o tiro
function helm(r, g) {
    const c = V.colors;
    const hr = V.head.radius * r;
    const hx = V.head.x * r + Math.sin(g) * r * 0.07;
    const hy = V.head.y * r + Math.cos(g) * r * 0.07;

    // Fiapos da chama que o segura
    drawGlow(ctx, c.flameGlow, hx - hr * 0.4, hy, hr * 1.5, 0.55);
    for (let i = -1; i <= 1; i++) {
        flame(hx - hr * 0.5, hy + i * hr * 0.35, hr * (1.1 - Math.abs(i) * 0.3), hr * 0.18, Math.sin(g * 4 + i) * hr * 0.2, c.flame);
    }

    // Pluma rasgada, para trás
    ctx.fillStyle = c.clothMid;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.04;
    [-0.5, 0, 0.5].forEach((k, i) => {
        path([
            [hx - hr * 0.6, hy + k * hr * 0.5 - hr * 0.12],
            [hx - hr * (1.5 + (i % 2) * 0.3), hy + k * hr * 0.9 + Math.sin(g * 3 + i) * hr * 0.15],
            [hx - hr * 0.6, hy + k * hr * 0.5 + hr * 0.12]
        ]);
        ctx.fill();
        ctx.stroke();
    });

    // Cúpula, crista e fenda dos olhos
    ctx.fillStyle = c.steelDark;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, TAU);
    ctx.fill();
    ctx.stroke();
    disc(hx - hr * 0.08, hy, hr * 0.78, c.steel);
    ctx.fillStyle = c.steelLight;
    ctx.fillRect(hx - hr * 0.85, hy - hr * 0.09, hr * 1.5, hr * 0.18);
    ctx.fillRect(hx + hr * 0.3, hy - hr * 0.62, hr * 0.14, hr * 1.24);
    drawGlow(ctx, c.eyeGlow, hx + hr * 0.85, hy, hr * 1.1, 0.8);
    ctx.fillStyle = c.ink;
    ctx.fillRect(hx + hr * 0.62, hy - hr * 0.66, hr * 0.3, hr * 1.32);
    ctx.fillStyle = c.eye;
    ctx.fillRect(hx + hr * 0.7, hy - hr * 0.56, hr * 0.15, hr * 0.46);
    ctx.fillRect(hx + hr * 0.7, hy + hr * 0.1, hr * 0.15, hr * 0.46);
}

export function renderHeadlessKnight(e) {
    const t = renderNow() / 1000;
    const r = e.radius * V.scale;
    const g = t * V.stepHz * TAU + e.phase;

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle + Math.sin(g) * 0.035);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    sword(r, g);
    legs(r, g);
    torso(r);
    arms(r, g);
    cape(r, g);
    clasp(r);
    pauldron(r, 1, g);
    pauldron(r, -1, g);
    neck(r, g);
    helm(r, g);
    ctx.restore();
}
