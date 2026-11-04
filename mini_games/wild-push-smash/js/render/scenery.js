import { ARENA } from '../../data_model/match.js';
import { PLAYERS } from '../../data_model/players.js';
import { STAGES } from '../../data_model/stages.js';
import { SCENERY as C, STAGE_VISUALS } from '../../data_model/visuals/arena.js';
import { leftWall, platform, rightWall, setTerrain, terrain, zigzagY } from '../core/arena.js';
import { H, W, ctx } from '../core/canvas.js';
import { state } from '../core/state.js';
import { drawGlow, getGlowSprite, makeCanvas } from './fx/sprites.js';

// --- CENÁRIO ---
// Cada arena tem fundo, plataforma e paredes desenhados uma vez; por quadro só há drawImage.
// O que se mexe (vaga-lumes, areia, neve) é só glow sprite.
const K = ARENA.scale;

function rng(seed) {
    let s = seed;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function ridgeY(hill, x) {
    x /= K;     // a forma dos morros foi pensada para 800 de largura
    switch (hill.shape) {
        case 'dunes':
            return hill.base - (Math.sin(x * 0.008 + hill.seed) * 0.5 + 0.5) * hill.amplitude;
        case 'peaks': {
            const t = (x * 0.006 + hill.seed) % 1;
            return hill.base - (1 - Math.abs(t * 2 - 1)) * hill.amplitude * (0.6 + 0.4 * Math.sin(x * 0.013 + hill.seed));
        }
        default:
            return hill.base - Math.abs(Math.sin(x * 0.011 + hill.seed)) * hill.amplitude;
    }
}

function drawDecor(g, v) {
    const d = v.decor;
    if (!d) return;
    const rand = rng(d.seed);
    g.fillStyle = d.color;
    for (let i = 0; i < d.count; i++) {
        const x = 30 + rand() * (W - 60);
        const y = ridgeY(v.hills[0], x) + 4;
        const s = 0.7 + rand() * 0.6;
        if (d.type === 'cactus') {
            g.beginPath();
            g.roundRect(x - 4 * s, y - 38 * s, 8 * s, 40 * s, 4 * s);
            g.roundRect(x - 14 * s, y - 26 * s, 6 * s, 14 * s, 3 * s);
            g.roundRect(x - 14 * s, y - 16 * s, 12 * s, 5 * s, 2 * s);
            g.roundRect(x + 8 * s, y - 32 * s, 6 * s, 14 * s, 3 * s);
            g.roundRect(x + 2 * s, y - 22 * s, 12 * s, 5 * s, 2 * s);
            g.fill();
        } else if (d.type === 'pine') {
            for (let k = 0; k < 3; k++) {
                const w = (16 - k * 4) * s;
                const top = y - (14 + k * 11) * s;
                g.fillStyle = d.color;
                g.beginPath();
                g.moveTo(x - w, top + 14 * s); g.lineTo(x, top - 6 * s); g.lineTo(x + w, top + 14 * s);
                g.closePath();
                g.fill();
                g.fillStyle = '#ffffff';
                g.beginPath();
                g.moveTo(x - w * 0.35, top + 1 * s); g.lineTo(x, top - 6 * s); g.lineTo(x + w * 0.35, top + 1 * s);
                g.closePath();
                g.fill();
            }
            g.fillStyle = d.color;
        }
    }
}

function bakeBackground(v) {
    return makeCanvas(W, H, (g) => {
        const sky = g.createLinearGradient(0, 0, 0, H);
        v.sky.forEach((c, i) => sky.addColorStop(i / (v.sky.length - 1), c));
        g.fillStyle = sky;
        g.fillRect(0, 0, W, H);

        const rand = rng(v.stars.seed);
        g.fillStyle = v.stars.color;
        for (let i = 0; i < v.stars.count; i++) {
            g.globalAlpha = 0.25 + rand() * 0.6;
            const big = rand() < 0.15 ? 2 : 1;
            g.fillRect(rand() * W, rand() * H * 0.45, big, big);
        }
        g.globalAlpha = 1;

        const m = v.celestial;
        g.globalAlpha = 0.5;
        g.drawImage(getGlowSprite(m.glow), m.x - m.radius * 3.2, m.y - m.radius * 3.2, m.radius * 6.4, m.radius * 6.4);
        g.globalAlpha = 1;
        g.fillStyle = m.color;
        g.beginPath();
        g.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        g.fill();
        if (m.craters) {
            g.fillStyle = 'rgba(120, 130, 190, 0.35)';
            [[-10, -8, 8], [12, 6, 6], [-4, 14, 5]].forEach(([dx, dy, r]) => {
                g.beginPath();
                g.arc(m.x + dx, m.y + dy, r, 0, Math.PI * 2);
                g.fill();
            });
        }

        v.hills.forEach((hill, i) => {
            g.fillStyle = hill.color;
            g.beginPath();
            g.moveTo(0, H);
            for (let x = 0; x <= W; x += 8) g.lineTo(x, ridgeY(hill, x));
            g.lineTo(W, H);
            g.closePath();
            g.fill();
            if (hill.shape === 'peaks') {
                // Neve mais clara no alto dos picos
                g.save();
                g.clip();
                g.fillStyle = 'rgba(255, 255, 255, 0.7)';
                g.fillRect(0, 0, W, hill.base - hill.amplitude * 0.55);
                g.restore();
            }
            if (i === 0) drawDecor(g, v);
        });

        const fog = g.createLinearGradient(0, H * 0.6, 0, H);
        fog.addColorStop(0, 'rgba(0, 0, 0, 0)');
        fog.addColorStop(1, v.fog);
        g.fillStyle = fog;
        g.fillRect(0, H * 0.6, W, H * 0.4);
    });
}

// Plataforma em 3 partes (ponta esquerda, miolo repetível, ponta direita) para acompanhar o encolhimento
function bakePlatform(v) {
    const P = v.platform;
    const depth = C.undersideDepth;
    const h = ARENA.platform.height + depth;
    const bottom = ARENA.platform.height;
    const stone = (g, w, cap) => {
        const grad = g.createLinearGradient(0, 0, 0, bottom);
        grad.addColorStop(0, P.stoneLight);
        grad.addColorStop(0.18, P.stone);
        grad.addColorStop(1, P.stoneDark);
        g.fillStyle = grad;
        g.beginPath();
        if (cap === 'left') {
            g.moveTo(w, 0); g.lineTo(6, 0); g.quadraticCurveTo(0, 0, 0, 8);
            g.lineTo(4, bottom + depth * 0.5); g.lineTo(w, bottom + depth * 0.3);
        } else if (cap === 'right') {
            g.moveTo(0, 0); g.lineTo(w - 6, 0); g.quadraticCurveTo(w, 0, w, 8);
            g.lineTo(w - 4, bottom + depth * 0.5); g.lineTo(0, bottom + depth * 0.3);
        } else {
            g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, bottom + depth * 0.3); g.lineTo(0, bottom + depth * 0.3);
        }
        g.closePath();
        g.fill();
        g.save();
        g.clip();
        g.strokeStyle = P.crack;
        g.lineWidth = 1;
        g.globalAlpha = 0.6;
        g.beginPath();
        for (let y = 7; y < bottom; y += 8) {
            g.moveTo(0, y); g.lineTo(w, y);
            for (let x = (y / 8) % 2 ? 8 : 18; x < w; x += 20) { g.moveTo(x, y); g.lineTo(x, y + 8); }
        }
        g.stroke();
        g.restore();
        if (P.cap) {
            // Camada de neve por cima, com bordinha ondulada
            g.fillStyle = P.cap;
            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(w, 0);
            for (let x = w; x >= 0; x -= 6) g.lineTo(x, 5 + Math.sin(x * 0.7) * 2);
            g.closePath();
            g.fill();
        }
    };
    const underside = (g, w, seed) => {
        const r = rng(seed);
        for (let i = 0; i < Math.max(1, Math.floor(w / 22)); i++) {
            const cx = 8 + r() * (w - 16);
            const len = 8 + r() * (depth - 4);
            g.fillStyle = P.undersideColors[Math.floor(r() * P.undersideColors.length)];
            g.globalAlpha = 0.9;
            g.beginPath();
            if (P.underside === 'rocks') {
                g.ellipse(cx, bottom + len * 0.3, 6 + r() * 4, len * 0.45, 0, 0, Math.PI * 2);
            } else {
                const half = P.underside === 'icicles' ? 2.5 : 4;
                g.moveTo(cx - half, bottom - 2);
                g.lineTo(cx, bottom + len);
                g.lineTo(cx + half, bottom - 2);
                g.closePath();
            }
            g.fill();
        }
        g.globalAlpha = 1;
    };
    const part = (w, cap, seed) => makeCanvas(w, h, (g) => { underside(g, w, seed); stone(g, w, cap); });
    return { left: part(C.capWidth, 'left', 5), mid: part(C.tileWidth, 'mid', 9), right: part(C.capWidth, 'right', 13) };
}

// Paredes: pilar de pedra com a faixa neon do time
function bakeWall(v, color, side) {
    return makeCanvas(leftWall.width, leftWall.height, (g) => {
        const grad = g.createLinearGradient(0, 0, leftWall.width, 0);
        grad.addColorStop(0, side === 'left' ? v.wall.stone : v.wall.stoneLight);
        grad.addColorStop(1, side === 'left' ? v.wall.stoneLight : v.wall.stone);
        g.fillStyle = grad;
        g.fillRect(0, 0, leftWall.width, leftWall.height);
        g.fillStyle = 'rgba(0, 0, 0, 0.22)';
        for (let y = 14; y < leftWall.height; y += 28) g.fillRect(0, y, leftWall.width, 2);
        g.fillStyle = color;
        g.fillRect(side === 'left' ? leftWall.width - 3 : 0, 0, 3, leftWall.height);
    });
}

const baked = new Map();
function getStageArt(id) {
    if (!baked.has(id)) {
        const v = STAGE_VISUALS[id];
        baked.set(id, {
            v,
            background: bakeBackground(v),
            platform: bakePlatform(v),
            walls: [bakeWall(v, PLAYERS[0].color, 'left'), bakeWall(v, PLAYERS[1].color, 'right')]
        });
    }
    return baked.get(id);
}

// Partículas do ar: posição calculada pelo relógio, sem estado
function drawAmbient(a, f) {
    for (let i = 0; i < a.count; i++) {
        const seed = i * 97.3;
        let x;
        let y;
        let size = a.size;
        let alpha = 0.75;
        if (a.type === 'snow') {
            y = (seed * 3.1 * K + f * (0.6 + (i % 4) * 0.25)) % (H + 20) - 10;
            x = (seed * 7.7 * K) % W + Math.sin(f * 0.02 + seed) * 14;
            size = a.size * (0.6 + (i % 3) * 0.3);
            alpha = 0.9;
        } else if (a.type === 'sand') {
            x = (seed * 5.3 + f * (1.4 + (i % 3) * 0.6)) % (W + 40) - 20;
            y = (180 + (seed * 2.9) % 220) * K + Math.sin(f * 0.03 + seed) * 8;
            alpha = 0.55;
        } else {
            x = ((i * 137) % 800) * K + Math.sin(f * 0.012 + i * 1.7) * (20 + (i % 5) * 8);
            y = (80 + ((i * 71) % 260)) * K + Math.cos(f * 0.0156 + i * 1.7) * (12 + (i % 5) * 5);
            size = a.size * (0.7 + 0.3 * Math.sin(f * 0.05 + i));
            alpha = 0.7;
        }
        drawGlow(ctx, a.color, x, y, size, alpha);
    }
}

function drawPlatformParts(g, parts, x, y, width, scale = 1) {
    const midW = width - C.capWidth * 2;
    const h = parts.mid.height;
    g.drawImage(parts.left, x, y, C.capWidth * scale, h * scale);
    for (let tx = 0; tx < midW; tx += C.tileWidth) {
        const w = Math.min(C.tileWidth, midW - tx);
        g.drawImage(parts.mid, 0, 0, w, h, x + (C.capWidth + tx) * scale, y, w * scale, h * scale);
    }
    g.drawImage(parts.right, x + (width - C.capWidth) * scale, y, C.capWidth * scale, h * scale);
}

// Rampa em U (halfpipe): casca de gelo com a espessura do terreno, seguindo os arcos. Desenhada por caminho
// (poucos pontos), sem gradiente novo por quadro.
function uPath(g, x, y, width, R, T, scale) {
    const left = x + R;
    const right = x + width - R;
    const cy = y - R;
    const steps = 16;
    const pt = (cx, a, r) => [(cx + Math.cos(a) * r) * scale, (cy + Math.sin(a) * r) * scale];
    g.beginPath();
    // Superfície de cima: da ponta esquerda, descendo o arco, pelo meio reto, e subindo a direita
    for (let i = 0; i <= steps; i++) g.lineTo(...pt(left, Math.PI - (Math.PI / 2) * (i / steps), R));
    for (let i = 0; i <= steps; i++) g.lineTo(...pt(right, Math.PI / 2 - (Math.PI / 2) * (i / steps), R));
    // Por baixo, voltando com o raio maior (a espessura do gelo)
    for (let i = steps; i >= 0; i--) g.lineTo(...pt(right, Math.PI / 2 - (Math.PI / 2) * (i / steps), R + T));
    for (let i = steps; i >= 0; i--) g.lineTo(...pt(left, Math.PI - (Math.PI / 2) * (i / steps), R + T));
    g.closePath();
}

function surfacePath(g, x, y, width, R, scale) {
    const left = x + R;
    const right = x + width - R;
    const cy = y - R;
    const steps = 16;
    g.beginPath();
    for (let i = 0; i <= steps; i++) {
        const a = Math.PI - (Math.PI / 2) * (i / steps);
        g.lineTo((left + Math.cos(a) * R) * scale, (cy + Math.sin(a) * R) * scale);
    }
    for (let i = 0; i <= steps; i++) {
        const a = Math.PI / 2 - (Math.PI / 2) * (i / steps);
        g.lineTo((right + Math.cos(a) * R) * scale, (cy + Math.sin(a) * R) * scale);
    }
}

function drawHalfpipe(g, P, edgeColor, x, y, width, scale = 1) {
    const R = terrain.radius;
    const T = terrain.thickness;
    uPath(g, x, y, width, R, T, scale);
    g.fillStyle = P.stone;
    g.fill();
    g.strokeStyle = P.stoneDark;
    g.lineWidth = 3 * scale;
    g.lineJoin = 'round';
    g.stroke();
    // Faixa clara de gelo logo abaixo da superfície e brilho neon na borda
    surfacePath(g, x, y + 7, width, R, scale);
    g.strokeStyle = P.stoneLight;
    g.lineWidth = 8 * scale;
    g.stroke();
    surfacePath(g, x, y, width, R, scale);
    g.strokeStyle = edgeColor;
    g.lineWidth = 3.5 * scale;
    g.stroke();
}

// Chão em "WWW": arenito com camadas, picos pontudos e borda neon seguindo o desenho
function drawZigzag(g, P, edgeColor, x, y, width, scale = 1) {
    const T = terrain.thickness;
    const surface = (dy) => {
        g.beginPath();
        for (let px = x; px <= x + width; px += 4) g.lineTo(px * scale, (zigzagY(px, x, width, y) + dy) * scale);
        g.lineTo((x + width) * scale, (zigzagY(x + width, x, width, y) + dy) * scale);
    };
    surface(0);
    g.lineTo((x + width) * scale, (y + T) * scale);
    g.lineTo(x * scale, (y + T) * scale);
    g.closePath();
    g.fillStyle = P.stone;
    g.fill();
    g.strokeStyle = P.stoneDark;
    g.lineWidth = 3 * scale;
    g.lineJoin = 'round';
    g.stroke();
    // Camadas do arenito
    g.globalAlpha = 0.5;
    g.strokeStyle = P.crack;
    g.lineWidth = 2 * scale;
    [16, 28].forEach((dy) => { surface(dy); g.stroke(); });
    g.globalAlpha = 1;
    surface(6);
    g.strokeStyle = P.stoneLight;
    g.lineWidth = 6 * scale;
    g.stroke();
    surface(0);
    g.strokeStyle = edgeColor;
    g.lineWidth = 3.5 * scale;
    g.stroke();
}

// Plataformas no alto: lajes de pedra com a borda de cima clara
function drawLedges(g, P, edgeColor, scale = 1) {
    terrain.ledges.forEach((l) => {
        const x = l.x * scale;
        const y = l.y * scale;
        const w = l.width * scale;
        const h = 16 * scale;
        g.fillStyle = P.stoneDark;
        g.beginPath();
        g.roundRect(x, y + 2 * scale, w, h, 6 * scale);
        g.fill();
        g.fillStyle = P.stone;
        g.beginPath();
        g.roundRect(x, y, w, h - 3 * scale, 6 * scale);
        g.fill();
        g.fillStyle = P.stoneLight;
        g.fillRect(x + 4 * scale, y + 2 * scale, w - 8 * scale, 3 * scale);
        g.fillStyle = edgeColor;
        g.globalAlpha = 0.8;
        g.fillRect(x + 6 * scale, y, w - 12 * scale, 2 * scale);
        g.globalAlpha = 1;
    });
}

export function drawArena() {
    const art = getStageArt(STAGES[state.stage].id);
    ctx.drawImage(art.background, 0, 0);
    drawAmbient(art.v.ambient, state.frameCount);

    // Paredes com brilho do time
    drawGlow(ctx, PLAYERS[0].color, leftWall.x + leftWall.width, leftWall.y + leftWall.height / 2, C.wallGlowSize, C.wallGlowAlpha);
    drawGlow(ctx, PLAYERS[1].color, rightWall.x, rightWall.y + rightWall.height / 2, C.wallGlowSize, C.wallGlowAlpha);
    ctx.drawImage(art.walls[0], leftWall.x, leftWall.y);
    ctx.drawImage(art.walls[1], rightWall.x, rightWall.y);

    // Borda neon: muda de cor conforme a plataforma encolhe
    const danger = 1 - (platform.width - ARENA.platform.minWidth) / (ARENA.platform.fullWidth - ARENA.platform.minWidth);
    const e = { ...C.edge, ...art.v.edge };
    const color = danger > e.dangerAt ? e.danger : danger > e.warnAt ? e.warn : e.safe;
    drawGlow(ctx, color, platform.x + platform.width / 2, platform.y, platform.width * 0.55, 0.12);

    drawLedges(ctx, art.v.platform, color);
    if (terrain.type === 'halfpipe') {
        drawHalfpipe(ctx, art.v.platform, color, platform.x, platform.y, platform.width);
        return;
    }
    if (terrain.type === 'zigzag') {
        drawZigzag(ctx, art.v.platform, color, platform.x, platform.y, platform.width);
        return;
    }
    drawPlatformParts(ctx, art.platform, platform.x, platform.y, platform.width);
    ctx.fillStyle = color;
    ctx.fillRect(platform.x + 4, platform.y, platform.width - 8, 3);
}

// Miniatura da arena para o menu
export function drawStagePreview(g, stageIndex, width, height) {
    const art = getStageArt(STAGES[stageIndex].id);
    const s = width / W;
    g.drawImage(art.background, 0, 0, width, height);
    g.drawImage(art.walls[0], leftWall.x * s, leftWall.y * s, leftWall.width * s, leftWall.height * s);
    g.drawImage(art.walls[1], rightWall.x * s, rightWall.y * s, rightWall.width * s, rightWall.height * s);
    const stage = STAGES[stageIndex];
    if (stage.terrain) {
        // A miniatura usa o mesmo desenho da arena, com o terreno dessa fase
        const saved = { ...terrain };
        setTerrain(stage.terrain);
        const x = (W - ARENA.platform.fullWidth) / 2;
        drawLedges(g, art.v.platform, (art.v.edge?.safe ?? C.edge.safe), s);
        if (terrain.type === 'halfpipe') drawHalfpipe(g, art.v.platform, (art.v.edge?.safe ?? C.edge.safe), x, ARENA.platform.y, ARENA.platform.fullWidth, s);
        else if (terrain.type === 'zigzag') drawZigzag(g, art.v.platform, (art.v.edge?.safe ?? C.edge.safe), x, ARENA.platform.y, ARENA.platform.fullWidth, s);
        Object.assign(terrain, saved);
        return;
    }
    drawPlatformParts(g, art.platform, (W - ARENA.platform.fullWidth) / 2 * s, ARENA.platform.y * s, ARENA.platform.fullWidth, s);
}
