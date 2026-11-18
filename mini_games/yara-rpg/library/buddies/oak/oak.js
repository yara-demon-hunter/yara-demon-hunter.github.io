// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/oak/oak.js e rode o sync.
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
export const ANCIENT_TRUNK_W = 48;
export const ANCIENT_TRUNK_H = 64;
export const ANCIENT_CROWN_W = 130;
export const ANCIENT_CROWN_H = 92;

// --- ÁRVORE ANCESTRAL 3D (forma Ancient Grove) ---
// Atlas gravado da árvore 3D do Laboratório (tools/lab/arvore_foto.js, bake_arvore.py): 5 linhas = de que lado se vê (0 frente, 1 frente-lado,
// 2 lado, 3 costas-lado, 4 costas; olhando para a direita, à esquerda o jogo espelha) e 20 colunas = 12 quadros de andar + 8 de ataque.
export const ANCIENT3D = { cell: 144, walk: 12, attack: 8, walkSeconds: 1.5, attackSeconds: 0.42, attackFrom: 2, size: 132, feet: 56 };
let ancient3d = null;
const ancientBase = /\/_?library\//.test(import.meta.url) ? new URL('./', import.meta.url).href : new URL('library/buddies/oak/', document.baseURI).href;
export function prepareAncientTree() {
    if (ancient3d) return ancient3d;
    const image = new Image();
    ancient3d = { image, ready: false };
    image.onload = () => { ancient3d.ready = true; };
    image.src = new URL('ancient_tree_atlas.webp', ancientBase).href;
    return ancient3d;
}
// Linha do atlas pela direção que a árvore olha (dx, dy na tela, y para baixo)
export function ancientTreeView(dx, dy) {
    const a = Math.atan2(dy, Math.abs(dx)) / (Math.PI / 2);
    const m = Math.abs(a);
    if (m < 0.25) return 2;
    if (m < 0.75) return a > 0 ? 1 : 3;
    return a > 0 ? 0 : 4;
}
// Desenha a árvore (pés em x, y). k = escala do jogo; walkPhase 0..1 (ciclo de passos); attackAge = segundos desde o golpe (ou muito grande)
export function drawAncientTree(g, x, y, k, face, walkPhase, attackAge, alpha = 1) {
    const atlas = prepareAncientTree();
    if (!atlas.ready) return false;
    const A = ANCIENT3D;
    let col = Math.floor(walkPhase * A.walk) % A.walk;
    if (attackAge < A.attackSeconds) col = A.walk + Math.min(A.attack - 1, A.attackFrom + Math.floor(attackAge / A.attackSeconds * (A.attack - A.attackFrom)));
    const row = ancientTreeView(face.x, face.y);
    const side = A.size * k;
    g.save();
    g.translate(x, y - A.feet * k);
    if (face.x < 0) g.scale(-1, 1);
    g.globalAlpha *= alpha;
    g.drawImage(atlas.image, col * A.cell, row * A.cell, A.cell, A.cell, -side / 2, -side / 2, side, side);
    g.restore();
    return true;
}
let trunkSprite = null;
let crownSprite = null;
let ancientTrunkSprite = null;
let ancientCrownSprite = null;
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

// Ancient Grove: uma copa ampla e um tronco antigo marcado pela runa verde da evolução
export function getAncientTrunk() {
    if (ancientTrunkSprite) return ancientTrunkSprite;
    ancientTrunkSprite = makeCanvas(ANCIENT_TRUNK_W * PX, ANCIENT_TRUNK_H * PX, (g) => {
        g.scale(PX, PX);
        g.translate(ANCIENT_TRUNK_W / 2, ANCIENT_TRUNK_H - 5);
        g.fillStyle = '#24160b';
        g.beginPath();
        g.moveTo(-22, 2);
        g.quadraticCurveTo(-11, -7, -8, -14);
        g.lineTo(8, -14);
        g.quadraticCurveTo(11, -7, 22, 2);
        g.quadraticCurveTo(0, 7, -22, 2);
        g.fill();
        g.fillStyle = '#3b2817';
        g.beginPath();
        g.moveTo(-11, 0);
        g.quadraticCurveTo(-7, -27, -9, -55);
        g.quadraticCurveTo(0, -62, 9, -55);
        g.quadraticCurveTo(7, -27, 11, 0);
        g.closePath();
        g.fill();
        g.fillStyle = '#624425';
        g.beginPath();
        g.moveTo(-8, -3);
        g.quadraticCurveTo(-5, -30, -7, -54);
        g.lineTo(-2, -57);
        g.quadraticCurveTo(-1, -28, -3, -2);
        g.closePath();
        g.fill();
        g.strokeStyle = '#21160d';
        g.lineWidth = 1.4;
        g.lineCap = 'round';
        for (const [x, lean] of [[-5, -1], [1, 0.5], [6, 1]]) {
            g.beginPath();
            g.moveTo(x, -6);
            g.quadraticCurveTo(x + lean * 3, -28, x + lean * 2, -50);
            g.stroke();
        }
        // Raízes que sobem pelas laterais do tronco, em vez de um pé liso.
        g.lineCap = 'round';
        for (const side of [-1, 1]) {
            g.strokeStyle = '#24160b';
            g.lineWidth = 7;
            g.beginPath();
            g.moveTo(side * 18, 1);
            g.bezierCurveTo(side * 12, -5, side * 15, -12, side * 8, -17);
            g.bezierCurveTo(side * 2, -22, side * 9, -28, side * 6, -36);
            g.stroke();
            g.strokeStyle = '#75491f';
            g.lineWidth = 2.8;
            g.beginPath();
            g.moveTo(side * 18, 1);
            g.bezierCurveTo(side * 12, -5, side * 15, -12, side * 8, -17);
            g.bezierCurveTo(side * 2, -22, side * 9, -28, side * 6, -36);
            g.stroke();
            g.strokeStyle = '#24160b';
            g.lineWidth = 4;
            g.beginPath();
            g.moveTo(side * 17, -2);
            g.bezierCurveTo(side * 21, -8, side * 15, -12, side * 11, -14);
            g.stroke();
        }
        // Rosto-runa esculpido na casca, seguindo a marca verde da Ancient Grove
        g.save();
        g.shadowColor = '#86efac';
        g.shadowBlur = 10;
        g.strokeStyle = '#65ff45';
        g.lineWidth = 3.4;
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(0, -53);
        g.lineTo(-4, -46);
        g.lineTo(-10, -42);
        g.lineTo(-9, -34);
        g.quadraticCurveTo(-11, -27, -7, -21);
        g.lineTo(0, -13);
        g.lineTo(7, -21);
        g.quadraticCurveTo(11, -27, 9, -34);
        g.lineTo(10, -42);
        g.lineTo(4, -46);
        g.closePath();
        g.stroke();
        g.beginPath();
        g.moveTo(0, -48);
        g.lineTo(0, -54);
        g.lineTo(3, -49);
        g.moveTo(-8, -41);
        g.lineTo(-13, -46);
        g.lineTo(-9, -38);
        g.moveTo(8, -41);
        g.lineTo(13, -46);
        g.lineTo(9, -38);
        g.moveTo(-7, -34);
        g.lineTo(-3, -30);
        g.lineTo(0, -34);
        g.lineTo(3, -30);
        g.lineTo(7, -34);
        g.moveTo(0, -30);
        g.lineTo(0, -19);
        g.lineTo(-4, -24);
        g.moveTo(0, -19);
        g.lineTo(4, -24);
        g.stroke();
        g.fillStyle = '#bbf7d0';
        g.beginPath();
        g.ellipse(-4.5, -32, 2, 1.1, -0.35, 0, TAU);
        g.ellipse(4.5, -32, 2, 1.1, 0.35, 0, TAU);
        g.fill();
        g.fillStyle = '#bbf7d0';
        g.beginPath();
        g.arc(0, -53, 1.8, 0, TAU);
        g.fill();
        g.restore();
        g.strokeStyle = 'rgba(134, 239, 172, 0.5)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(-13, -4);
        g.quadraticCurveTo(-17, -9, -18, -13);
        g.moveTo(13, -4);
        g.quadraticCurveTo(17, -9, 18, -13);
        g.stroke();
    });
    return ancientTrunkSprite;
}

export function getAncientCrown() {
    if (ancientCrownSprite) return ancientCrownSprite;
    ancientCrownSprite = makeCanvas(ANCIENT_CROWN_W * PX, ANCIENT_CROWN_H * PX, (g) => {
        g.scale(PX, PX);
        g.translate(ANCIENT_CROWN_W / 2, ANCIENT_CROWN_H / 2);
        // Galhos principais ficam visíveis entre as poucas massas de folhas.
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = '#24160b';
        g.lineWidth = 6;
        g.beginPath();
        // O eixo central começa acima do rosto-runa para não atravessar a marca luminosa.
        g.moveTo(0, -5);
        g.lineTo(-5, -7);
        g.lineTo(-24, -23);
        g.moveTo(-5, -7);
        g.lineTo(-8, -31);
        g.lineTo(-20, -43);
        g.moveTo(-23, -22);
        g.lineTo(-44, -18);
        g.lineTo(-57, -29);
        g.moveTo(0, -5);
        g.lineTo(8, -8);
        g.lineTo(24, -24);
        g.lineTo(25, -42);
        g.moveTo(8, -8);
        g.lineTo(38, -11);
        g.lineTo(52, -26);
        g.moveTo(24, -24);
        g.lineTo(43, -37);
        g.stroke();
        g.strokeStyle = '#75491f';
        g.lineWidth = 2.4;
        g.stroke();
        const blobs = [
            [-52, 0, 13, '#14532d'], [-46, -17, 14, '#15803d'], [-37, -31, 14, '#16a34a'],
            [-24, -38, 14, '#22c55e'], [-9, -43, 14, '#16a34a'], [7, -43, 15, '#22c55e'],
            [23, -39, 15, '#16a34a'], [38, -30, 15, '#15803d'], [49, -16, 15, '#16a34a'],
            [54, 1, 13, '#14532d'], [-50, 16, 12, '#166534'], [-37, 13, 14, '#16a34a'],
            [-23, 9, 13, '#15803d'], [-9, 5, 13, '#166534'], [8, 5, 13, '#14532d'],
            [23, 9, 14, '#166534'], [39, 14, 13, '#15803d'], [50, 17, 11, '#14532d']
        ];
        for (const [x, y, r, color] of blobs) {
            g.fillStyle = '#0b2f1b';
            g.beginPath();
            g.ellipse(x, y + 2, r + 1.5, r * 0.82 + 1.5, 0, 0, TAU);
            g.fill();
            g.fillStyle = color;
            const points = [];
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * TAU;
                const radius = r * ([0.9, 0.78, 1, 0.82][i % 4]);
                points.push([x + Math.cos(angle) * radius, y + Math.sin(angle) * radius * 0.82]);
            }
            const last = points[points.length - 1];
            const first = points[0];
            g.beginPath();
            g.moveTo((last[0] + first[0]) / 2, (last[1] + first[1]) / 2);
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                const next = points[(i + 1) % points.length];
                g.quadraticCurveTo(point[0], point[1], (point[0] + next[0]) / 2, (point[1] + next[1]) / 2);
            }
            g.closePath();
            g.fill();
        }
        g.fillStyle = 'rgba(190, 255, 110, 0.82)';
        for (const [x, y] of [[-43, -22], [-27, -35], [-8, -45], [9, -46], [28, -37], [45, -23], [-49, -3], [49, 4], [-25, 5], [27, 5], [-39, 20], [38, 20]]) {
            g.beginPath();
            g.ellipse(x, y, 2.4, 1.4, -0.5, 0, TAU);
            g.fill();
        }
    });
    return ancientCrownSprite;
}

// Raízes vivas em espiral, desenhadas antes do tronco para parecerem brotar do chão.
export function drawAncientRoots(g, x, y, scale = 1, t = 0, motion = 0) {
    g.save();
    g.translate(x, y);
    g.scale(scale, scale);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    const gait = 0.28 + motion * 0.72;
    for (const side of [-1, 1]) {
        const phase = t * 1.05 + (side > 0 ? Math.PI : 0);
        const stride = Math.sin(phase);
        const lift = Math.max(0, Math.cos(phase)) * gait * 5;
        const reach = stride * gait * 9;
        const sway = Math.sin(t * 0.8 + side) * 1.2 + reach * 0.35;
        const tipX = side * (28 + reach);
        const tipY = 8 - lift + sway;
        const root = (color, width) => {
            g.strokeStyle = color;
            g.lineWidth = width;
            g.beginPath();
            g.moveTo(side * 4, -3 - lift * 0.18);
            g.bezierCurveTo(side * (10 + reach * 0.25), 2 - lift, side * (18 + reach * 0.55), 5 - lift, side * (24 + reach), 1 + sway);
            g.bezierCurveTo(side * (35 + reach), -2 - lift, side * (38 + reach), 9 - lift, side * (30 + reach), tipY);
            g.stroke();
        };
        g.strokeStyle = '#24160b';
        root('#24160b', 7);
        root('#5b3a1a', 3.2);
        // Dedos grossos abrem e fecham devagar enquanto a raiz se apoia e avança.
        for (const toe of [-1, 0, 1]) {
            const spread = (4 + Math.max(0, stride) * 2) * gait;
            const endX = tipX + side * (toe === 0 ? 6 : 3.5);
            const endY = tipY + toe * spread;
            g.strokeStyle = '#24160b';
            g.lineWidth = toe === 0 ? 3.1 : 2.4;
            g.beginPath();
            g.moveTo(tipX, tipY);
            g.quadraticCurveTo(tipX + side * 3, tipY + toe * spread * 0.35 - lift * 0.12, endX, endY);
            g.stroke();
            g.strokeStyle = '#75491f';
            g.lineWidth = 1;
            g.beginPath();
            g.moveTo(tipX, tipY);
            g.quadraticCurveTo(tipX + side * 3, tipY + toe * spread * 0.35 - lift * 0.12, endX, endY);
            g.stroke();
        }
        g.fillStyle = '#86efac';
        g.beginPath();
        g.arc(tipX, tipY - 0.4, 1.8, 0, TAU);
        g.fill();
    }
    // Folhagem luminosa baixa, como as brotações verdes da referência.
    for (const side of [-1, 1]) {
        const phase = t * 1.05 + (side > 0 ? Math.PI : 0);
        const x = side * (31 + Math.sin(phase) * (1.5 + motion * 3));
        const y = 5 - Math.max(0, Math.cos(phase)) * (motion * 1.5);
        g.fillStyle = '#14532d';
        g.beginPath();
        g.ellipse(x, y, 10, 5, side * 0.12, 0, TAU);
        g.fill();
        for (let i = 0; i < 4; i++) {
            const lx = x + side * (i - 1.5) * 3.5;
            const ly = y - (i % 2) * 3 + Math.sin(t * 0.9 + i + side) * 0.5;
            g.fillStyle = i % 2 ? '#65d936' : '#9bfa38';
            g.beginPath();
            g.ellipse(lx, ly, 3.2, 1.8, side * -0.55 + Math.sin(t * 0.8 + i) * 0.06, 0, TAU);
            g.fill();
        }
    }
    g.strokeStyle = '#3b2817';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(-8, 1);
    g.quadraticCurveTo(0, 8, 8, 1);
    g.stroke();
    g.restore();
}

export function drawAncientMist(g, x, y, scale = 1, t = 0) {
    g.save();
    g.translate(x, y);
    g.scale(scale, scale);
    g.lineCap = 'round';
    const groundFog = g.createRadialGradient(0, 1, 2, 0, 1, 38);
    groundFog.addColorStop(0, 'rgba(74, 222, 128, 0.35)');
    groundFog.addColorStop(0.55, 'rgba(74, 222, 128, 0.16)');
    groundFog.addColorStop(1, 'rgba(74, 222, 128, 0)');
    g.fillStyle = groundFog;
    g.beginPath();
    g.ellipse(0, 1, 38, 14, 0, 0, TAU);
    g.fill();
    for (const side of [-1, 1]) {
        const phase = t * 0.65 + side * 1.7;
        const drift = Math.sin(phase) * 4;
        const rise = (Math.sin(phase * 0.7) + 1) * 4;
        g.shadowColor = '#4ade80';
        g.shadowBlur = 12;
        g.strokeStyle = 'rgba(74, 222, 128, 0.12)';
        g.lineWidth = 10;
        g.beginPath();
        g.moveTo(side * 22, 4);
        g.bezierCurveTo(side * (31 + drift), 0, side * (15 - drift), -8 - rise, side * (25 + drift), -15 - rise);
        g.bezierCurveTo(side * (34 - drift), -21 - rise, side * (19 + drift), -27 - rise, side * (28 - drift), -34 - rise);
        g.stroke();
        g.strokeStyle = 'rgba(134, 239, 172, 0.3)';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(side * 22, 4);
        g.bezierCurveTo(side * (31 + drift), 0, side * (15 - drift), -8 - rise, side * (25 + drift), -15 - rise);
        g.bezierCurveTo(side * (34 - drift), -21 - rise, side * (19 + drift), -27 - rise, side * (28 - drift), -34 - rise);
        g.stroke();
    }
    g.shadowBlur = 0;
    g.fillStyle = 'rgba(74, 222, 128, 0.24)';
    for (let i = 0; i < 5; i++) {
        const phase = t * 0.9 + i * 1.7;
        const xOffset = Math.sin(phase) * (18 + i * 2);
        const yOffset = -5 - ((t * 3 + i * 9) % 18);
        g.beginPath();
        g.arc(xOffset, yOffset, 1.1 + (i % 2) * 0.6, 0, TAU);
        g.fill();
    }
    g.restore();
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
export function drawOakBuddy(g, x, y, { t = 0, awake = 0, ancient = false, walking = false, feet = true, facing = 1 } = {}) {
    const oak = { stepT: t, moving: walking, facing };
    const tw = ancient ? ANCIENT_TRUNK_W : TRUNK_W;
    const th = ancient ? ANCIENT_TRUNK_H : TRUNK_H;
    const cw = ancient ? ANCIENT_CROWN_W : CROWN_W;
    const ch = ancient ? ANCIENT_CROWN_H : CROWN_H;
    g.globalAlpha = 1;
    if (ancient) {
        drawAncientMist(g, x, y, 1, t);
        drawAncientRoots(g, x, y + 2, 1, t, walking ? 1 : 0.18);
    }
    g.drawImage(ancient ? getAncientTrunk() : getTrunk(), x - tw / 2, y - th + 5, tw, th);
    if (awake > 0.02 && !ancient) { g.globalAlpha = awake; g.drawImage(getEvilTrunk(), x - tw / 2, y - th + 5, tw, th); }
    g.globalAlpha = 1;
    if (feet) drawRootFeet(g, x, y, 1, oak);
    g.globalAlpha = 0.9;
    g.drawImage(ancient ? getAncientCrown() : getCrown(), x - cw / 2, y - (ancient ? 72 : 66) - ch / 2, cw, ch);
    if (awake > 0.02 && !ancient) { g.globalAlpha = 0.9 * awake; g.drawImage(getEvilCrown(), x - cw / 2, y - 66 - ch / 2, cw, ch); }
    g.globalAlpha = 1;
}
