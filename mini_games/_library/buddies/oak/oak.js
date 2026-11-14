// --- BUDDY: O CARVALHO (a árvore do Wicked Oak, e o treant andando depois da Ancient Grove) ---
// Árvore 2D desenhada em canvas, em sprites separados (a copa muda de transparência no jogo): tronco com um rosto assombrado e
// bracinhos de galho, copa de folhas, versão acordada (escura e roxa, olhos vermelhos, dentes e garras) e, quando anda, dois pezinhos
// de raiz. Uso no jogo: drawImage dos sprites; ficha em art_reference/buddy.md. Prévia: tools/buddy_viewer.html.
const TAU = Math.PI * 2;
const PX = 2;                       // pixels do sprite por unidade do mundo
function makeCanvas(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    if (draw) draw(canvas.getContext('2d'));
    return canvas;
}

// Carvalho: tronco e copa em sprites separados (a copa muda de transparência)
export const TRUNK_W = 34;
export const TRUNK_H = 58;
export const CROWN_W = 104;
export const CROWN_H = 80;
let trunkSprite = null;
let crownSprite = null;
export function getTrunk() {
    if (trunkSprite) return trunkSprite;
    trunkSprite = makeCanvas(TRUNK_W * PX, TRUNK_H * PX, (g) => {
        g.scale(PX, PX);
        g.translate(TRUNK_W / 2, TRUNK_H - 5);
        // Raízes na base
        g.fillStyle = '#2f1d0e';
        g.beginPath();
        g.moveTo(-15, 3);
        g.quadraticCurveTo(-8, -3, -6, -9);
        g.lineTo(6, -9);
        g.quadraticCurveTo(8, -3, 15, 3);
        g.quadraticCurveTo(0, 6, -15, 3);
        g.fill();
        // Tronco afinando para cima
        g.fillStyle = '#4a2f17';
        g.beginPath();
        g.moveTo(-7, 0);
        g.quadraticCurveTo(-5, -26, -6, -50);
        g.lineTo(6, -50);
        g.quadraticCurveTo(5, -26, 7, 0);
        g.closePath();
        g.fill();
        // Luz de um lado, sombra do outro, veios da casca
        g.fillStyle = '#6b4423';
        g.beginPath();
        g.moveTo(-6, -2);
        g.quadraticCurveTo(-4.4, -26, -5.2, -50);
        g.lineTo(-1.5, -50);
        g.quadraticCurveTo(-1, -26, -2, -2);
        g.closePath();
        g.fill();
        g.strokeStyle = '#2f1d0e';
        g.lineWidth = 0.9;
        for (const x of [-2.5, 1.2, 3.8]) {
            g.beginPath();
            g.moveTo(x, -4);
            g.quadraticCurveTo(x + 1.2, -24, x - 0.4, -46);
            g.stroke();
        }
        // Galhos abrindo para a copa
        g.strokeStyle = '#4a2f17';
        g.lineWidth = 3.2;
        g.lineCap = 'round';
        for (const [dx, dy] of [[-13, -9], [12, -8]]) {
            g.beginPath();
            g.moveTo(dx * 0.2, -40);
            g.lineTo(dx, -42 + dy);
            g.stroke();
        }
        g.translate(0, 13);          // a copa cobre o alto do tronco: o rosto e os braços ficam na parte de baixo
        // Rosto de árvore assombrada: olhos fundos com um brilho âmbar, sobrancelhas franzidas e uma boca torta
        g.fillStyle = '#1a0d05';
        g.beginPath();
        g.ellipse(-2.3, -31, 1.9, 2.3, 0, 0, TAU);
        g.ellipse(2.3, -31, 1.9, 2.3, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#fbbf24';
        g.beginPath();
        g.arc(-2.1, -30.6, 0.8, 0, TAU);
        g.arc(2.5, -30.6, 0.8, 0, TAU);
        g.fill();
        g.strokeStyle = '#1a0d05';
        g.lineWidth = 1.1;
        g.beginPath();
        g.moveTo(-5, -35.2); g.lineTo(-0.9, -33.4);
        g.moveTo(5, -35.2); g.lineTo(0.9, -33.4);
        g.stroke();
        g.beginPath();
        g.moveTo(-2.8, -25.6);
        g.quadraticCurveTo(-0.5, -27.4, 0.6, -25.8);
        g.quadraticCurveTo(1.8, -24.6, 3, -26);
        g.stroke();
        // Bracinhos de galho caídos dos lados, com dedos finos
        g.strokeStyle = '#4a2f17';
        g.lineWidth = 2;
        for (const side of [-1, 1]) {
            g.beginPath();
            g.moveTo(side * 5.6, -27);
            g.quadraticCurveTo(side * 11.5, -25, side * 12.5, -17);
            g.stroke();
            g.lineWidth = 0.9;
            for (const d of [-0.5, 0.1, 0.7]) {
                g.beginPath();
                g.moveTo(side * 12.5, -17);
                g.lineTo(side * (12.5 + d * 2.2), -13.4 + Math.abs(d) * 0.8);
                g.stroke();
            }
            g.lineWidth = 2;
        }
    });
    return trunkSprite;
}
export function getCrown() {
    if (crownSprite) return crownSprite;
    crownSprite = makeCanvas(CROWN_W * PX, CROWN_H * PX, (g) => {
        g.scale(PX, PX);
        g.translate(CROWN_W / 2, CROWN_H / 2);
        // Massas de folha: escuras embaixo, claras em cima (posições fixas: a árvore é sempre a mesma)
        const blobs = [
            [-28, 10, 20, '#14532d'], [26, 12, 19, '#14532d'], [0, 16, 22, '#14532d'], [-14, -2, 23, '#166534'], [16, -1, 22, '#166534'],
            [-30, -6, 15, '#166534'], [32, -4, 14, '#15803d'], [0, -12, 24, '#15803d'], [-16, -18, 16, '#16a34a'], [14, -19, 15, '#16a34a'],
            [0, -24, 13, '#22c55e']
        ];
        for (const [x, y, r, color] of blobs) {
            g.fillStyle = color;
            g.beginPath();
            g.ellipse(x, y, r, r * 0.82, 0, 0, TAU);
            g.fill();
        }
        // Pontos de luz nas folhas
        g.fillStyle = 'rgba(187, 247, 208, 0.5)';
        for (const [x, y] of [[-20, -22], [-6, -30], [10, -26], [22, -14], [-32, -10], [2, -14], [-12, -8]]) {
            g.beginPath();
            g.ellipse(x, y, 2.6, 1.5, -0.5, 0, TAU);
            g.fill();
        }
    });
    return crownSprite;
}

// Carvalho acordado: a mesma silhueta, escura e roxa, com rosto no tronco e garras nos galhos
let evilTrunkSprite = null;
let evilCrownSprite = null;
export function getEvilTrunk() {
    if (evilTrunkSprite) return evilTrunkSprite;
    evilTrunkSprite = makeCanvas(TRUNK_W * PX, TRUNK_H * PX, (g) => {
        g.scale(PX, PX);
        g.drawImage(getTrunk(), 0, 0, TRUNK_W, TRUNK_H);
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = 'rgba(30, 6, 40, 0.55)';
        g.fillRect(0, 0, TRUNK_W, TRUNK_H);
        g.globalCompositeOperation = 'source-over';
        g.translate(TRUNK_W / 2, TRUNK_H - 5 + 14);
        // Rosto: olhos vermelhos tortos e uma boca de dentes
        g.fillStyle = '#0a0410';
        g.beginPath();
        g.ellipse(-2.4, -32, 2.1, 1.3, -0.45, 0, TAU);
        g.ellipse(2.4, -32, 2.1, 1.3, 0.45, 0, TAU);
        g.fill();
        g.fillStyle = '#ef4444';
        g.beginPath();
        g.ellipse(-2.4, -32, 1.2, 0.7, -0.45, 0, TAU);
        g.ellipse(2.4, -32, 1.2, 0.7, 0.45, 0, TAU);
        g.fill();
        g.fillStyle = '#0a0410';
        g.beginPath();
        g.moveTo(-3.4, -27.6);
        g.quadraticCurveTo(0, -23.4, 3.4, -27.6);
        g.quadraticCurveTo(0, -26.2, -3.4, -27.6);
        g.fill();
        g.fillStyle = '#fef3c7';
        for (const x of [-2, -0.6, 0.8, 2.2]) {
            g.beginPath();
            g.moveTo(x - 0.45, -27);
            g.lineTo(x, -25.4);
            g.lineTo(x + 0.45, -27);
            g.fill();
        }
        // Galhos em garra
        g.strokeStyle = '#1b0f26';
        g.lineWidth = 1.4;
        g.lineCap = 'round';
        for (const side of [-1, 1]) {
            g.beginPath();
            g.moveTo(side * 5, -34);
            g.quadraticCurveTo(side * 12, -30, side * 14, -22);
            g.stroke();
            for (const d of [-0.5, 0.1, 0.7]) {
                g.beginPath();
                g.moveTo(side * 14, -22);
                g.lineTo(side * (14 + Math.cos(d + (side < 0 ? 2.4 : 0.1)) * 3.2), -22 + Math.sin(d + 0.9) * 3.2);
                g.stroke();
            }
        }
    });
    return evilTrunkSprite;
}
export function getEvilCrown() {
    if (evilCrownSprite) return evilCrownSprite;
    evilCrownSprite = makeCanvas(CROWN_W * PX, CROWN_H * PX, (g) => {
        g.scale(PX, PX);
        g.drawImage(getCrown(), 0, 0, CROWN_W, CROWN_H);
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = 'rgba(46, 16, 70, 0.62)';
        g.fillRect(0, 0, CROWN_W, CROWN_H);
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = 'rgba(239, 68, 68, 0.55)';
        for (const [x, y] of [[-22, -6], [18, -10], [-4, -22], [30, 4], [-32, 8]]) {
            g.beginPath();
            g.arc(CROWN_W / 2 + x, CROWN_H / 2 + y, 1.2, 0, TAU);
            g.fill();
        }
    });
    return evilCrownSprite;
}

// Pezinhos de raiz do treant: andando, um sobe enquanto o outro desce
export function drawRootFeet(ctx, ox, oy, k, oak) {
    const walk = oak.moving ? 1 : 0;
    for (const side of [-1, 1]) {
        const g = oak.stepT * 9 + (side > 0 ? Math.PI : 0);
        const lift = Math.max(0, Math.sin(g)) * 3.4 * walk;
        const reach = Math.cos(g) * 2.2 * walk * oak.facing;
        const x = ox + side * 5.5 * k + reach;
        const y = oy + 4 - lift;
        ctx.fillStyle = '#2f1d0e';
        ctx.beginPath();
        ctx.ellipse(x, y, 4.6 * k, 2.4 * k, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#4a2f17';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        for (const d of [-1, 0, 1]) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + d * 3.2 * k + side * 1.2, y + 1.6);
            ctx.stroke();
        }
    }
}

// A árvore inteira num lugar só (para a prévia): tronco, pés, copa; awake 0..1 mistura a versão acordada
export function drawOakBuddy(g, x, y, { t = 0, awake = 0, walking = false, feet = true, facing = 1 } = {}) {
    const oak = { stepT: t, moving: walking, facing };
    const tw = TRUNK_W, th = TRUNK_H, cw = CROWN_W, ch = CROWN_H;
    g.globalAlpha = 1;
    g.drawImage(getTrunk(), x - tw / 2, y - th + 5, tw, th);
    if (awake > 0.02) { g.globalAlpha = awake; g.drawImage(getEvilTrunk(), x - tw / 2, y - th + 5, tw, th); }
    g.globalAlpha = 1;
    if (feet) drawRootFeet(g, x, y, 1, oak);
    g.globalAlpha = 0.9;
    g.drawImage(getCrown(), x - cw / 2, y - 66 - ch / 2, cw, ch);
    if (awake > 0.02) { g.globalAlpha = 0.9 * awake; g.drawImage(getEvilCrown(), x - cw / 2, y - 66 - ch / 2, cw, ch); }
    g.globalAlpha = 1;
}
