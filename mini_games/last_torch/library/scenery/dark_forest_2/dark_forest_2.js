// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/dark_forest_2/dark_forest_2.js e rode o sync.
import { pick, randomRange } from '../../core/random.js';
import { buildSpriteSheet, drawSheetFrame, frameAt, taper } from '../scenery_kit.js';
import { registerScenery } from '../scenery.js';
import { DARK_FOREST_2_VISUALS as F } from './dark_forest_2_visual.js';

// --- CENÁRIO: FLORESTA DA NÉVOA (dark_forest_2) ---
// A primeira fase do yara-rpg vista de cima: chão azul-esverdeado, folhas caídas, raízes, tocos, pedras, samambaias,
// capim, cogumelos que brilham e esporos de luz. Nada fica por cima da ação: o jogador sempre vê o que enfrenta.
// Tudo é procedural. O movimento não custa memória: o que balança ou pulsa (samambaia, capim, cogumelo) é desenhado
// uma vez por quadro de animação num atlas pequeno (buildSpriteSheet, no kit) e em cena é só um drawImage.
// Ficha de como foi criado: art_reference/scenery.md.

const TAU = Math.PI * 2;

// --- O CHÃO (pintado uma vez) ---
function paintGround(g, w, h, rand) {
    const density = (w * h) / 100000;
    const maxR = Math.max(w, h) * F.clearingRadiusRatio;

    g.fillStyle = F.ground[2];
    g.fillRect(0, 0, w, h);
    const floor = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, maxR);
    floor.addColorStop(0, F.ground[0]);
    floor.addColorStop(0.5, F.ground[1]);
    floor.addColorStop(1, F.ground[2]);
    g.fillStyle = floor;
    g.fillRect(0, 0, w, h);

    // Lago de luz fria do portal, fora do centro
    const L = F.portal;
    const pr = Math.min(w, h) * L.radiusRatio * 2;
    const pool = g.createRadialGradient(w * L.x, h * L.y, 0, w * L.x, h * L.y, pr);
    pool.addColorStop(0, L.color);
    pool.addColorStop(1, 'rgba(200, 240, 245, 0)');
    g.fillStyle = pool;
    g.fillRect(w * L.x - pr, h * L.y - pr, pr * 2, pr * 2);

    // Manchas de musgo
    for (let i = 0; i < F.mossPatchesPer100kPx * density; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const r = randomRange(rand, 28, 100);
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, pick(rand, F.mossColors));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Folhas caídas: marrom e laranja queimado no meio das verde-azuladas
    for (let i = 0; i < F.leavesPer100kPx * density; i++) {
        g.save();
        g.translate(rand() * w, rand() * h);
        g.rotate(rand() * Math.PI);
        g.fillStyle = pick(rand, F.leafColors);
        g.beginPath();
        g.ellipse(0, 0, randomRange(rand, 2.4, 5), randomRange(rand, 1.2, 2.2), 0, 0, TAU);
        g.fill();
        g.restore();
    }

    // Pedrinhas
    g.fillStyle = F.pebbleColor;
    for (let i = 0; i < F.pebblesPer100kPx * density; i++) {
        g.beginPath();
        g.ellipse(rand() * w, rand() * h, randomRange(rand, 1.2, 3.4), randomRange(rand, 0.9, 2.4), rand() * Math.PI, 0, TAU);
        g.fill();
    }

    // Raízes atravessando o chão (e a trilha)
    for (let i = 0; i < F.rootsPer100kPx * density; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const a = rand() * TAU;
        const len = randomRange(rand, 26, 52);
        const bend = (rand() - 0.5) * 1.2;
        const ex = x + Math.cos(a + bend * 0.5) * len;
        const ey = y + Math.sin(a + bend * 0.5) * len;
        const cx = x + Math.cos(a - bend) * len * 0.5;
        const cy = y + Math.sin(a - bend) * len * 0.5;
        const rw = randomRange(rand, 3.6, 5.6);
        taper(g, x, y, cx, cy, ex, ey, rw, 0.6, F.trunk);
        g.globalAlpha = 0.5;
        taper(g, x - 0.9, y - 1.1, cx - 0.9, cy - 1.1, ex - 0.5, ey - 0.7, rw * 0.35, 0.2, F.trunkLight);
        g.globalAlpha = 1;
    }

    // Tocos (vistos de cima: o corte com os anéis)
    for (let i = 0, placed = 0; placed < F.stumpsPer100kPx * density && i < 60; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const r0 = randomRange(rand, 11, 16);
        const sides = [rand(), rand(), rand()];
        if (Math.hypot(x - w / 2, y - h / 2) < 90) continue;
        placed++;
        g.fillStyle = 'rgba(0, 0, 0, 0.35)';
        g.beginPath();
        g.ellipse(x + 2.5, y + 3.5, r0 * 1.15, r0 * 1.05, 0, 0, TAU);
        g.fill();
        sides.forEach((s, k) => {
            const a = (k / 3) * TAU + s;
            taper(g, x + Math.cos(a) * r0 * 0.7, y + Math.sin(a) * r0 * 0.7, x + Math.cos(a + 0.3) * r0 * 1.3, y + Math.sin(a + 0.3) * r0 * 1.3,
                x + Math.cos(a + 0.12) * r0 * 1.42, y + Math.sin(a + 0.12) * r0 * 1.42, r0 * 0.62, r0 * 0.3, F.trunk);
        });
        g.fillStyle = F.trunk;
        g.beginPath();
        g.arc(x, y, r0, 0, TAU);
        g.fill();
        g.fillStyle = F.stumpTop;
        g.beginPath();
        g.arc(x, y, r0 * 0.82, 0, TAU);
        g.fill();
        g.strokeStyle = F.stumpRing;
        g.lineWidth = 0.9;
        g.globalAlpha = 0.9;
        [0.62, 0.36].forEach(k => {
            g.beginPath();
            g.arc(x, y, r0 * k, 0, TAU);
            g.stroke();
        });
        g.globalAlpha = 0.55;
        g.fillStyle = F.moss;
        g.beginPath();
        g.ellipse(x - r0 * 0.3, y + r0 * 0.25, r0 * 0.45, r0 * 0.3, 0.5, 0, TAU);
        g.fill();
        g.globalAlpha = 1;
    }

    // Pedras com o topo pegando luz e musgo
    for (let i = 0, placed = 0; placed < F.rocksPer100kPx * density && i < 60; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const R = randomRange(rand, 8, 17);
        const radii = Array.from({ length: 9 }, () => 0.8 + rand() * 0.4);
        const mossAt = [Math.floor(rand() * 9), Math.floor(rand() * 9)];
        if (Math.hypot(x - w / 2, y - h / 2) < 90) continue;
        placed++;
        const outline = (scale, ox, oy) => {
            g.beginPath();
            radii.forEach((rr, k) => {
                const a = (k / 9) * TAU;
                const px = x + ox + Math.cos(a) * R * rr * scale;
                const py = y + oy + Math.sin(a) * R * rr * 0.85 * scale;
                if (k) g.lineTo(px, py); else g.moveTo(px, py);
            });
            g.closePath();
        };
        g.fillStyle = 'rgba(0, 0, 0, 0.38)';
        g.beginPath();
        g.ellipse(x + 3, y + R * 0.55, R * 1.1, R * 0.5, 0, 0, TAU);
        g.fill();
        g.fillStyle = F.rock;
        outline(1, 0, 0);
        g.fill();
        g.fillStyle = F.rockLight;
        g.globalAlpha = 0.5;
        outline(0.62, -R * 0.18, -R * 0.22);
        g.fill();
        g.fillStyle = F.moss;
        g.globalAlpha = 0.6;
        mossAt.forEach(k => {
            const a = (k / 9) * TAU;
            g.beginPath();
            g.ellipse(x + Math.cos(a) * R * 0.6, y + Math.sin(a) * R * 0.5, R * 0.3, R * 0.17, a, 0, TAU);
            g.fill();
        });
        g.globalAlpha = 1;
    }
}

// --- O QUE BALANÇA: UM QUADRO POR FATIA DO CICLO, GUARDADO NUM ATLAS ---
// phase vai de 0 a 1 e o último quadro emenda com o primeiro. r recomeça igual em todo quadro: a forma não pula.

// Samambaia vista de cima: folhas que saem do centro e arqueiam, cada uma balançando em fase própria
function paintFern(g, r, phase) {
    const n = 9 + Math.floor(r() * 4);
    g.fillStyle = F.fern;
    g.beginPath();
    g.arc(0, 0, 2.2, 0, TAU);
    g.fill();
    for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + (r() - 0.5) * 0.35 + F.fern.sway * Math.sin(phase * TAU + i * 0.9);
        const len = 11 + r() * 7;
        const bend = (r() - 0.5) * 0.8;
        const color = i % 2 ? F.fern : F.fernLight;
        const ex = Math.cos(a + bend * 0.3) * len;
        const ey = Math.sin(a + bend * 0.3) * len;
        const cx = Math.cos(a - bend * 0.4) * len * 0.5;
        const cy = Math.sin(a - bend * 0.4) * len * 0.5;
        taper(g, 0, 0, cx, cy, ex, ey, 0.95, 0.2, color);
        g.strokeStyle = color;
        g.lineWidth = 0.55;
        for (let k = 1; k < 9; k++) {
            const t = k / 9;
            const u = 1 - t;
            const x = 2 * u * t * cx + t * t * ex;
            const y = 2 * u * t * cy + t * t * ey;
            const tx = 2 * u * cx + 2 * t * (ex - cx);
            const ty = 2 * u * cy + 2 * t * (ey - cy);
            const tl = Math.hypot(tx, ty) || 1;
            const l = (1 - t) * 3.4 + 0.8;
            g.beginPath();
            g.moveTo(x - (ty / tl) * l + (tx / tl) * l * 0.55, y + (tx / tl) * l + (ty / tl) * l * 0.55);
            g.lineTo(x, y);
            g.lineTo(x + (ty / tl) * l + (tx / tl) * l * 0.55, y - (tx / tl) * l + (ty / tl) * l * 0.55);
            g.stroke();
        }
    }
}

// Tufo de capim: lâminas que se curvam com a rajada
function paintGrass(g, r, phase) {
    const n = 7 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
        const x0 = (r() - 0.5) * 7;
        const h = 6 + r() * 7;
        const lean = (r() - 0.5) * 4;
        const bend = F.grass.bend * Math.sin(phase * TAU + x0 * 0.3);
        taper(g, x0, 0, x0 + (lean + bend) * 0.3, -h * 0.6, x0 + lean + bend, -h, 0.75, 0.12, i % 3 ? F.grass : F.fernLight);
    }
}

// Cogumelos em 2,5D (vistos de cima e de frente ao mesmo tempo): caule, tampa em cúpula e sombra no chão, com o brilho
// azulado pulsando no chão e na tampa. De cima puro viraria só uma bolinha: o caule e a cúpula é que dizem "cogumelo".
function paintMushrooms(g, r, phase) {
    const n = 2 + Math.floor(r() * 3);
    const pulse = 0.5 + 0.5 * Math.sin(phase * TAU);
    const shrooms = Array.from({ length: n }, () => ({ x: (r() - 0.5) * 11, y: (r() - 0.5) * 4, cap: 2.6 + r() * 1.7, stem: 3 + r() * 2.6, lean: (r() - 0.5) * 1.2 }));
    shrooms.sort((p, q) => p.y - q.y);          // os de trás primeiro
    // Luz azulada no chão e em volta das tampas (por baixo de tudo)
    shrooms.forEach(m => {
        const top = m.y - m.stem;
        const halo = g.createRadialGradient(m.x, top, 0, m.x, top, m.cap * 3.4);
        halo.addColorStop(0, `rgba(142, 240, 255, ${0.08 + F.mushrooms.pulse * 0.55 * pulse})`);
        halo.addColorStop(1, 'rgba(142, 240, 255, 0)');
        g.fillStyle = halo;
        g.fillRect(m.x - m.cap * 3.4, top - m.cap * 3.4, m.cap * 6.8, m.cap * 6.8);
        const pool = g.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.cap * 2.6);
        pool.addColorStop(0, `rgba(142, 240, 255, ${0.1 + F.mushrooms.pulse * 0.4 * pulse})`);
        pool.addColorStop(1, 'rgba(142, 240, 255, 0)');
        g.save();
        g.translate(m.x, m.y);
        g.scale(1, 0.4);
        g.translate(-m.x, -m.y);
        g.fillStyle = pool;
        g.fillRect(m.x - m.cap * 2.6, m.y - m.cap * 2.6, m.cap * 5.2, m.cap * 5.2);
        g.restore();
    });
    shrooms.forEach(m => {
        const topX = m.x + m.lean;
        const topY = m.y - m.stem;
        // Caule claro, um pouco mais grosso embaixo
        g.fillStyle = '#b9dfe6';
        g.beginPath();
        g.moveTo(m.x - m.cap * 0.22, m.y);
        g.quadraticCurveTo(m.x - m.cap * 0.14 + m.lean * 0.4, m.y - m.stem * 0.5, topX - m.cap * 0.16, topY);
        g.lineTo(topX + m.cap * 0.16, topY);
        g.quadraticCurveTo(m.x + m.cap * 0.14 + m.lean * 0.4, m.y - m.stem * 0.5, m.x + m.cap * 0.22, m.y);
        g.closePath();
        g.fill();
        // Parte de baixo da tampa (as lâminas, escuras) e a cúpula por cima
        g.fillStyle = '#1f6575';
        g.beginPath();
        g.ellipse(topX, topY, m.cap, m.cap * 0.38, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#3b95a8';
        g.beginPath();
        g.ellipse(topX, topY - m.cap * 0.1, m.cap, m.cap * 0.82, 0, Math.PI, TAU);
        g.closePath();
        g.fill();
        g.fillStyle = F.mushroom;
        g.beginPath();
        g.ellipse(topX - m.cap * 0.08, topY - m.cap * 0.18, m.cap * 0.82, m.cap * 0.62, 0, Math.PI, TAU);
        g.closePath();
        g.fill();
        // Brilho que pulsa no alto da cúpula, e o reflexo branco fixo
        g.fillStyle = `rgba(255, 255, 255, ${0.25 + 0.5 * pulse})`;
        g.beginPath();
        g.ellipse(topX - m.cap * 0.18, topY - m.cap * 0.55, m.cap * 0.42, m.cap * 0.2, -0.3, 0, TAU);
        g.fill();
        g.fillStyle = 'rgba(20, 90, 105, 0.35)';
        g.beginPath();
        g.arc(topX + m.cap * 0.35, topY - m.cap * 0.38, m.cap * 0.12, 0, TAU);
        g.arc(topX - m.cap * 0.45, topY - m.cap * 0.25, m.cap * 0.09, 0, TAU);
        g.fill();
    });
}

// Onde cada tipo pode nascer: em qualquer lugar, menos em volta da tocha (a luta fica limpa)
function placeItems(rand, kind, count, w, h) {
    const items = [];
    for (let i = 0, tries = 0; items.length < count && tries < count * 10; tries++, i++) {
        const x = rand() * w;
        const y = rand() * h;
        if (Math.hypot(x - w / 2, y - h / 2) < F.clearAroundCenter) continue;
        items.push({ kind, x, y, variant: Math.floor(rand() * 99), scale: 0.85 + rand() * 0.3, jitter: rand() * 0.1 });
    }
    return items;
}

function buildSway(w, h, rand, quality, env) {
    const density = (w * h) / 100000;
    const kinds = [
        { kind: 'fern', cfg: F.fern, cell: [48, 48], anchor: [0.5, 0.5], paint: paintFern, cycle: F.swayCycleSeconds },
        { kind: 'grass', cfg: F.grass, cell: [22, 24], anchor: [0.5, 0.92], paint: paintGrass, cycle: F.swayCycleSeconds },
        { kind: 'mushrooms', cfg: F.mushrooms, cell: [44, 48], anchor: [0.5, 0.78], paint: paintMushrooms, cycle: F.mushrooms.cycleSeconds }
    ];
    const sheets = {};
    const items = [];
    let bytes = 0;
    kinds.forEach(({ kind, cfg, cell, anchor, paint, cycle }, index) => {
        const count = Math.round(cfg.per100kPx[quality] * density);
        if (count <= 0) return;          // sem atlas para o que não aparece: é memória que não se gasta
        // O tamanho (cfg.size) entra no desenho e na célula: o atlas nasce nítido, sem esticar
        const sheet = buildSpriteSheet({
            cell: [cell[0] * cfg.size, cell[1] * cfg.size], anchor, frames: cfg.frames[quality], variants: cfg.variants, res: env.res,
            seed: F.seed + index * 977,
            paint: (g, r, phase) => {
                g.scale(cfg.size, cfg.size);
                paint(g, r, phase);
            }
        });
        sheets[kind] = sheet;
        bytes += sheet.bytes;
        placeItems(rand, kind, count, w, h).forEach(item => {
            item.variant %= cfg.variants;
            item.cycle = cycle;
            // Defasagem pela posição: as rajadas atravessam a tela da esquerda para a direita
            item.offset = (item.x * F.windWaveLength + item.y * F.windWaveLength * 0.4) / TAU + item.jitter;
            items.push(item);
        });
    });
    return { items, sheets, bytes };
}

function drawSway(ctx, t, built) {
    const { items, sheets } = built;
    for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const sheet = sheets[it.kind];
        drawSheetFrame(ctx, sheet, it.variant, frameAt(sheet, t, it.cycle, it.offset), it.x, it.y, it.scale);
    }
}

registerScenery({
    id: 'dark_forest_2', name: 'Floresta da Névoa', visual: F, paintGround, buildSway, drawSway
});
