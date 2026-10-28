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
    fireflyTime: 0
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

// Copa de árvore vista de cima: aglomerado de "bolhas" de folhagem
function buildTreeSprite(rand, radius) {
    const pad = 12;
    const size = (radius + pad) * 2;
    const canvas = makeCanvas(size, size);
    const g = canvas.getContext('2d');
    const c = size / 2;

    // Sombra projetada no chão
    g.fillStyle = F.canopyShadow;
    g.beginPath();
    g.arc(c + radius * 0.18, c + radius * 0.22, radius * 0.95, 0, Math.PI * 2);
    g.fill();

    // Bolhas de folhagem (de fora para dentro, de escuro para claro)
    const lobes = 7 + Math.floor(rand() * 5);
    for (let layer = 0; layer < F.canopyColors.length; layer++) {
        const layerRadius = radius * (1 - layer * 0.2);
        g.fillStyle = F.canopyColors[layer];
        for (let i = 0; i < lobes; i++) {
            const a = (i / lobes) * Math.PI * 2 + rand() * 0.5;
            const dist = layerRadius * randomRange(rand, 0.35, 0.6);
            const r = layerRadius * randomRange(rand, 0.4, 0.55);
            g.beginPath();
            g.arc(c + Math.cos(a) * dist, c + Math.sin(a) * dist, r, 0, Math.PI * 2);
            g.fill();
        }
    }

    // Luz da lua batendo de um lado (cima-esquerda)
    const light = g.createRadialGradient(c - radius * 0.4, c - radius * 0.4, 0, c - radius * 0.4, c - radius * 0.4, radius);
    light.addColorStop(0, F.canopyHighlight);
    light.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = light;
    g.fillRect(0, 0, size, size);

    return canvas;
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
    trees.sort((a, b) => a.sprite.width - b.sprite.width);
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
    cache.vignette = buildVignette(w, h);
}

// Camada 1: chão da floresta e clareira
export function renderForestGround() {
    ensureCache();
    ctx.drawImage(cache.ground, 0, 0, state.width, state.height);
}

// Camada por cima dos monstros: eles saem de baixo das copas
export function renderTreeCanopies() {
    const t = performance.now() / 1000;
    ctx.save();
    ctx.globalAlpha = F.canopyAlpha;
    cache.trees.forEach(tree => {
        const sway = Math.sin(t * F.swaySpeed + tree.phase) * F.swayAmount;
        const half = tree.sprite.width / 2;
        ctx.drawImage(tree.sprite, tree.x - half + sway, tree.y - half + sway * 0.5);
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
    ctx.drawImage(cache.vignette, 0, 0, w, h);
    ctx.restore();
}
