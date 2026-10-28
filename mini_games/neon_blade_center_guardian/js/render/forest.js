import { FOREST_VISUALS as F } from '../../data_model/visuals.js';
import { ctx, state } from '../core/state.js';
import { createRandom, pick, randomRange } from './fx/random.js';

// --- CENÁRIO: FLORESTA SOMBRIA (desenho procedural, sem imagens) ---
// O chão e as copas são pré-desenhados em canvas fora da tela e refeitos só
// quando a tela muda de tamanho. A cada quadro só a névoa e o balanço das
// copas são calculados.

const cache = {
    width: 0,
    height: 0,
    ground: null,
    vignette: null,
    treeSprites: [],
    trees: [],
    fogSprite: null,
    fogTile: null,
    fog: [],
    fireflies: [],
    fireflyTime: 0,
    grass: []
};

function makeCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    return canvas;
}

// Distância elíptica normalizada até o centro (0 = centro, 1 = borda da tela)
function ellipticDistance(x, y, w, h) {
    const nx = (x - w / 2) / (w / 2);
    const ny = (y - h / 2) / (h / 2);
    return Math.hypot(nx, ny);
}

function buildGround(w, h, rand) {
    const canvas = makeCanvas(w, h);
    const g = canvas.getContext('2d');
    const density = (w * h) / 100000;

    g.fillStyle = F.groundColor;
    g.fillRect(0, 0, w, h);

    // Clareira e luz da lua no centro
    const maxR = Math.max(w, h) * F.clearingRadiusRatio;
    const clearing = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, maxR);
    clearing.addColorStop(0, F.clearingColor);
    clearing.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = clearing;
    g.fillRect(0, 0, w, h);

    const moon = g.createRadialGradient(w * 0.45, h * 0.42, 0, w * 0.45, h * 0.42, maxR * 0.6);
    moon.addColorStop(0, F.moonlightColor);
    moon.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = moon;
    g.fillRect(0, 0, w, h);

    // Manchas de musgo
    for (let i = 0; i < F.mossPatchesPer100kPx * density; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const r = randomRange(rand, 30, 110);
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, pick(rand, F.mossColors));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Folhas caídas
    for (let i = 0; i < F.leavesPer100kPx * density; i++) {
        g.save();
        g.translate(rand() * w, rand() * h);
        g.rotate(rand() * Math.PI);
        g.fillStyle = pick(rand, F.leafColors);
        g.beginPath();
        g.ellipse(0, 0, randomRange(rand, 1.5, 3), randomRange(rand, 0.8, 1.4), 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
    }

    // Pedras
    g.fillStyle = F.stoneColor;
    for (let i = 0; i < F.stonesPer100kPx * density; i++) {
        g.beginPath();
        g.ellipse(rand() * w, rand() * h, randomRange(rand, 2, 6), randomRange(rand, 1.5, 4), rand() * Math.PI, 0, Math.PI * 2);
        g.fill();
    }

    // Tufos de grama (traços curtos em leque)
    g.strokeStyle = F.grassColor;
    g.lineWidth = 1;
    for (let i = 0; i < F.grassTuftsPer100kPx * density; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const blades = 2 + Math.floor(rand() * 3);
        for (let b = 0; b < blades; b++) {
            const a = -Math.PI / 2 + randomRange(rand, -0.7, 0.7);
            const len = randomRange(rand, 2, 5);
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
            g.stroke();
        }
    }

    return canvas;
}

// Vento: 0 a 1, rajadas que viajam pela tela da esquerda para a direita
function windAt(t, x, y) {
    const gust = 0.5 + 0.5 * Math.sin(t * F.windSpeed - x * F.windWaveLength + y * F.windWaveLength * 0.4);
    const flutter = 0.5 + 0.5 * Math.sin(t * F.windSpeed * 2.3 - x * F.windWaveLength * 2.1);
    return Math.min(1, F.windBase + (1 - F.windBase) * (gust * 0.75 + flutter * 0.25) * gust);
}

// Árvore vista de cima, em duas camadas para o vento mexer cada uma de um jeito:
// base = sombra + galhos escuros; crown = folhagem detalhada (folhinhas, vãos, luz da lua)
function buildTreeSprite(rand, radius) {
    const pad = 14;
    const size = Math.ceil((radius + pad) * 2);
    const c = size / 2;
    const base = makeCanvas(size, size);
    const crown = makeCanvas(size, size);
    const b = base.getContext('2d');
    const g = crown.getContext('2d');

    // BASE: sombra no chão
    b.fillStyle = F.canopyShadow;
    b.beginPath();
    b.arc(c + radius * 0.18, c + radius * 0.22, radius * 0.95, 0, Math.PI * 2);
    b.fill();

    // BASE: camadas escuras de folhagem
    const lobes = 8 + Math.floor(rand() * 5);
    for (let layer = 0; layer < 2; layer++) {
        const layerRadius = radius * (1 - layer * 0.12);
        b.fillStyle = F.canopyColors[layer];
        for (let i = 0; i < lobes; i++) {
            const a = (i / lobes) * Math.PI * 2 + rand() * 0.5;
            const dist = layerRadius * randomRange(rand, 0.4, 0.62);
            const r = layerRadius * randomRange(rand, 0.42, 0.56);
            b.beginPath();
            b.arc(c + Math.cos(a) * dist, c + Math.sin(a) * dist, r, 0, Math.PI * 2);
            b.fill();
        }
    }

    // BASE: galhos grossos saindo do tronco, com ramificações (aparecem pelos vãos)
    b.strokeStyle = F.branchColor;
    b.lineCap = 'round';
    const branches = 5 + Math.floor(rand() * 3);
    for (let i = 0; i < branches; i++) {
        const a = (i / branches) * Math.PI * 2 + rand() * 0.6;
        const len = radius * randomRange(rand, 0.65, 0.92);
        const ex = c + Math.cos(a) * len;
        const ey = c + Math.sin(a) * len;
        b.lineWidth = Math.max(1.5, radius * 0.07);
        b.beginPath();
        b.moveTo(c, c);
        b.lineTo(ex, ey);
        b.stroke();
        for (const t of [0.55, 0.8]) {
            const bx = c + Math.cos(a) * len * t;
            const by = c + Math.sin(a) * len * t;
            const sa = a + (rand() < 0.5 ? -1 : 1) * randomRange(rand, 0.5, 0.9);
            b.lineWidth = Math.max(1, radius * 0.035);
            b.beginPath();
            b.moveTo(bx, by);
            b.lineTo(bx + Math.cos(sa) * len * 0.28, by + Math.sin(sa) * len * 0.28);
            b.stroke();
        }
    }

    // CROWN: massas de folhagem (mais claras, menores => deixam vãos para ver os galhos)
    for (let layer = 2; layer < F.canopyColors.length; layer++) {
        const layerRadius = radius * (0.96 - (layer - 2) * 0.2);
        g.fillStyle = F.canopyColors[layer];
        for (let i = 0; i < lobes; i++) {
            const a = (i / lobes) * Math.PI * 2 + rand() * 0.6;
            const dist = layerRadius * randomRange(rand, 0.4, 0.68);
            const r = layerRadius * randomRange(rand, 0.28, 0.42);
            g.beginPath();
            g.arc(c + Math.cos(a) * dist, c + Math.sin(a) * dist, r, 0, Math.PI * 2);
            g.fill();
        }
    }

    // CROWN: folhinhas individuais para dar textura
    const leaves = Math.floor(radius * F.leafDensity * 6);
    for (let i = 0; i < leaves; i++) {
        const a = rand() * Math.PI * 2;
        const d = Math.sqrt(rand()) * radius * 0.92;
        g.save();
        g.translate(c + Math.cos(a) * d, c + Math.sin(a) * d);
        g.rotate(rand() * Math.PI);
        g.fillStyle = pick(rand, F.leafTones);
        g.beginPath();
        g.ellipse(0, 0, randomRange(rand, 2.2, 4.2), randomRange(rand, 1, 1.8), 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
    }

    // CROWN: vãos escuros entre as folhas (profundidade)
    g.fillStyle = F.leafGapColor;
    for (let i = 0; i < radius * 0.35; i++) {
        const a = rand() * Math.PI * 2;
        const d = rand() * radius * 0.8;
        g.beginPath();
        g.arc(c + Math.cos(a) * d, c + Math.sin(a) * d, randomRange(rand, 1.5, 3.5), 0, Math.PI * 2);
        g.fill();
    }

    // CROWN: luz fria da lua (cima-esquerda) + brilho no contorno
    g.globalCompositeOperation = 'source-atop';
    const lx = c - radius * 0.4;
    const light = g.createRadialGradient(lx, lx, 0, lx, lx, radius);
    light.addColorStop(0, F.canopyHighlight);
    light.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = light;
    g.fillRect(0, 0, size, size);
    g.strokeStyle = F.canopyRimLight;
    g.lineWidth = 1.4;
    g.beginPath();
    g.arc(c, c, radius * 0.9, Math.PI * 1.05, Math.PI * 1.65);
    g.stroke();

    return { base, crown, size };
}

function buildTrees(w, h, rand) {
    const sprites = [];
    for (let i = 0; i < F.treeVariants; i++) {
        const radius = F.treeMinRadius + (F.treeMaxRadius - F.treeMinRadius) * (i / Math.max(1, F.treeVariants - 1));
        sprites.push(buildTreeSprite(rand, radius));
    }

    // Faixa colada às bordas: o centro da tela fica livre
    const band = Math.max(F.treeEdgeBandMin, Math.min(F.treeEdgeBandMax, Math.min(w, h) * F.treeEdgeBandRatio));
    const trees = [];
    const step = F.treeSpacing;
    for (let y = -F.treeOverflow; y < h + F.treeOverflow; y += step) {
        for (let x = -F.treeOverflow; x < w + F.treeOverflow; x += step) {
            const tx = x + randomRange(rand, -step * 0.45, step * 0.45);
            const ty = y + randomRange(rand, -step * 0.45, step * 0.45);
            // Distância até a borda mais próxima (negativa = fora da tela)
            const edgeDist = Math.min(tx, ty, w - tx, h - ty);
            if (edgeDist > band + rand() * F.treeEdgeJitter) continue;

            // Mais para fora => árvores maiores; dentro da tela => menores, para não invadir
            const outer = Math.min(1, Math.max(0, 1 - edgeDist / band));
            const variant = Math.min(F.treeVariants - 1, Math.floor((outer * 0.75 + rand() * 0.25) * F.treeVariants));
            trees.push({ x: tx, y: ty, sprite: sprites[variant], phase: rand() * Math.PI * 2 });
        }
    }
    // Menores primeiro, maiores por cima
    trees.sort((a, b) => a.sprite.size - b.sprite.size);
    return { sprites, trees };
}

// Textura de névoa que se repete sem emenda (os puffs "dão a volta" no tile)
function buildFogTile(rand) {
    const size = F.fogTileSize;
    const tile = makeCanvas(size, size);
    const g = tile.getContext('2d');
    for (let i = 0; i < F.fogTilePuffs; i++) {
        const x = rand() * size;
        const y = rand() * size;
        const r = randomRange(rand, size * 0.06, size * 0.2);
        const a = randomRange(rand, 0.15, 0.45);
        for (const ox of [-size, 0, size]) {
            for (const oy of [-size, 0, size]) {
                const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
                grad.addColorStop(0, `rgba(${F.fogColor}, ${a})`);
                grad.addColorStop(1, `rgba(${F.fogColor}, 0)`);
                g.fillStyle = grad;
                g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
            }
        }
    }
    return tile;
}

function buildFog(w, h, rand) {
    const size = 256;
    const sprite = makeCanvas(size, size);
    const g = sprite.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `rgba(${F.fogColor}, 1)`);
    grad.addColorStop(0.5, `rgba(${F.fogColor}, 0.45)`);
    grad.addColorStop(1, `rgba(${F.fogColor}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);

    const fog = [];
    for (let i = 0; i < F.fogBlobs; i++) {
        fog.push({
            x: rand() * w,
            y: rand() * h,
            radius: randomRange(rand, F.fogMinRadius, F.fogMaxRadius),
            speed: F.fogDriftSpeed * randomRange(rand, 0.5, 1.5),
            phase: rand() * Math.PI * 2,
            stretch: randomRange(rand, 1.3, 2.2)
        });
    }
    return { sprite, fog };
}

function buildGrass(w, h, rand) {
    const count = Math.floor(F.grassClumpsPer100kPx * (w * h) / 100000);
    return Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * h,
        height: randomRange(rand, F.grassMinHeight, F.grassMaxHeight),
        phase: rand() * Math.PI * 2,
        color: Math.floor(rand() * F.grassColors.length),
        blades: Array.from({ length: F.grassBladesPerClump }, () => ({
            offset: randomRange(rand, -2.5, 2.5),
            lean: randomRange(rand, -0.35, 0.35),
            length: randomRange(rand, 0.65, 1),
            stiffness: randomRange(rand, 0.6, 1.2)
        }))
    }));
}

function buildVignette(w, h) {
    const canvas = makeCanvas(w, h);
    const g = canvas.getContext('2d');
    const r = Math.hypot(w, h) / 2;
    const grad = g.createRadialGradient(w / 2, h / 2, r * F.vignetteInnerRatio, w / 2, h / 2, r);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, F.vignetteColor);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    return canvas;
}

function ensureCache() {
    const { width: w, height: h } = state;
    if (cache.width === w && cache.height === h && cache.ground) return;
    cache.width = w;
    cache.height = h;

    const rand = createRandom(F.seed);
    cache.ground = buildGround(w, h, rand);
    const { sprites, trees } = buildTrees(w, h, rand);
    cache.treeSprites = sprites;
    cache.trees = trees;
    const { sprite, fog } = buildFog(w, h, rand);
    cache.fogSprite = sprite;
    cache.fog = fog;
    cache.fogTile = buildFogTile(rand);
    cache.fireflies = Array.from({ length: F.fireflies }, () => ({
        x: rand() * w,
        y: rand() * h,
        heading: rand() * Math.PI * 2,
        phase: rand() * Math.PI * 2,
        blink: randomRange(rand, 0.6, 1.6)
    }));
    cache.grass = buildGrass(w, h, rand);
    cache.vignette = buildVignette(w, h);
}

// Camada 1: chão da floresta e clareira
export function renderForestGround() {
    ensureCache();
    ctx.drawImage(cache.ground, 0, 0, state.width, state.height);
}

// Grama animada: tufos que se curvam com o vento (um único traçado por cor)
export function renderForestGrass() {
    ensureCache();
    const t = performance.now() / 1000;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.1;
    F.grassColors.forEach((color, ci) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        cache.grass.forEach(clump => {
            if (clump.color !== ci) return;
            const wind = windAt(t, clump.x, clump.y);
            const sway = (wind * F.grassBend + Math.sin(t * 2.4 + clump.phase) * 0.8) * clump.height / F.grassMaxHeight;
            clump.blades.forEach(blade => {
                const tipX = clump.x + blade.lean * clump.height + sway * blade.stiffness;
                const tipY = clump.y - clump.height * blade.length;
                ctx.moveTo(clump.x + blade.offset, clump.y);
                ctx.quadraticCurveTo(clump.x + blade.offset + sway * 0.2, clump.y - clump.height * 0.55, tipX, tipY);
            });
        });
        ctx.stroke();
    });
    ctx.restore();
}

// Camada por cima dos monstros: eles saem de baixo das copas
export function renderTreeCanopies() {
    const t = performance.now() / 1000;
    ctx.save();
    ctx.globalAlpha = F.canopyAlpha;
    cache.trees.forEach(tree => {
        const wind = windAt(t, tree.x, tree.y);
        const flutter = Math.sin(t * 5 + tree.phase) * F.swayFlutter * wind;
        const slow = Math.sin(t * 0.7 + tree.phase) * 0.35;
        const push = wind + slow * 0.4;
        const half = tree.sprite.size / 2;

        // Base: balanço leve
        ctx.drawImage(tree.sprite.base, tree.x - half + push * F.baseSwayAmount, tree.y - half + push * F.baseSwayAmount * 0.4);

        // Folhagem: empurrada e inclinada pela rajada, com tremor rápido
        ctx.save();
        ctx.translate(tree.x + push * F.crownSwayAmount + flutter, tree.y + push * F.crownSwayAmount * 0.4 + flutter * 0.5);
        ctx.rotate(push * F.crownTiltAmount);
        ctx.drawImage(tree.sprite.crown, -half, -half);
        ctx.restore();
    });
    ctx.restore();
}

// Vaga-lumes vagando e piscando (mais perto das árvores)
export function renderFireflies() {
    const t = performance.now() / 1000;
    const dt = Math.min(0.05, cache.fireflyTime ? t - cache.fireflyTime : 0);
    cache.fireflyTime = t;
    const { width: w, height: h } = state;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    cache.fireflies.forEach(f => {
        f.heading += Math.sin(t * 0.7 + f.phase) * 0.05;
        f.x += Math.cos(f.heading) * F.fireflySpeed * dt;
        f.y += Math.sin(f.heading) * F.fireflySpeed * dt;
        if (f.x < -10) f.x = w + 10; else if (f.x > w + 10) f.x = -10;
        if (f.y < -10) f.y = h + 10; else if (f.y > h + 10) f.y = -10;

        const glow = Math.max(0, Math.sin(t * f.blink * Math.PI + f.phase));
        if (glow <= 0.05) return;
        const halo = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, F.fireflyGlowRadius);
        halo.addColorStop(0, `rgba(${F.fireflyColor}, ${0.55 * glow})`);
        halo.addColorStop(1, `rgba(${F.fireflyColor}, 0)`);
        ctx.fillStyle = halo;
        ctx.fillRect(f.x - F.fireflyGlowRadius, f.y - F.fireflyGlowRadius, F.fireflyGlowRadius * 2, F.fireflyGlowRadius * 2);
        ctx.fillStyle = `rgba(${F.fireflyColor}, ${glow})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, F.fireflyRadius, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

// Desenha o tile de névoa repetido, deslocado pelo tempo (rolagem contínua)
function drawFogLayer(layer, t, w, h) {
    const size = F.fogTileSize * layer.scale;
    const ox = (((t * layer.speedX) % size) + size) % size;
    const oy = (((t * layer.speedY) % size) + size) % size;
    ctx.globalAlpha = layer.alpha;
    for (let y = oy - size; y < h; y += size) {
        for (let x = ox - size; x < w; x += size) {
            ctx.drawImage(cache.fogTile, x, y, size, size);
        }
    }
}

// Camada final: névoa rolando (duas camadas) + manchas à deriva (mais densas nas bordas) e vinheta escura
export function renderFogAndVignette() {
    const { width: w, height: h } = state;
    const t = performance.now() / 1000;

    ctx.save();
    F.fogLayers.forEach(layer => drawFogLayer(layer, t, w, h));
    cache.fog.forEach(blob => {
        // Deriva lenta para a direita, dando a volta na tela, com ondulação
        const span = w + blob.radius * blob.stretch * 2;
        const x = ((blob.x + t * blob.speed) % span) - blob.radius * blob.stretch;
        const y = blob.y + Math.sin(t * 0.2 + blob.phase) * F.fogWobble;
        const edge = Math.min(1, ellipticDistance(x, y, w, h));
        const breathe = 0.75 + 0.25 * Math.sin(t * 0.3 + blob.phase);

        ctx.globalAlpha = (F.fogAlphaCenter + (F.fogAlphaEdge - F.fogAlphaCenter) * edge) * breathe;
        const rw = blob.radius * blob.stretch;
        const rh = blob.radius;
        ctx.drawImage(cache.fogSprite, x - rw, y - rh, rw * 2, rh * 2);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = F.nightTint;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(cache.vignette, 0, 0, w, h);
    ctx.restore();
}
