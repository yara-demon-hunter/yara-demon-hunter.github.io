import { FOREST_VISUALS as F } from '../../data_model/visuals/scenery/forest_visual.js';
import { ctx, player, state } from '../core/state.js';
import { TORCH_VISUALS as T } from '../../data_model/visuals/scenery/torch_visual.js';
import { drawGlow } from './fx/glow.js';
import { createRandom, pick, randomRange } from './fx/random.js';
import { getWorldView, resetWorldView } from './fx/stamp.js';

// --- CENÁRIO: NOITE NA FLORESTA (desenho procedural, sem imagens) ---
// O chão é pré-desenhado em canvas fora da tela, com a grama e o brilho quente da tocha já nele, na
// resolução exata do canvas: copiar 1:1 é a forma mais barata de pintar a tela inteira. A névoa é
// desenhada numa tela bem pequena, poucas vezes por segundo, e só esticada nos outros quadros.

const cache = {
    key: '',
    ground: null,
    vignette: null,
    fogSprite: null,
    fogTile: null,
    fog: [],
    fireflies: [],
    fireflyTime: 0,
    swayGrass: [],
    fogCanvas: null,
    fogCtx: null,
    fogScaleX: 1,
    fogScaleY: 1,
    lightRadius: 0,
    lightTime: 0,
    currentLight: 0,
    fogDrawnAt: 0
};

function makeCanvas(width, height, options) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    if (options) canvas.getContext('2d', options);
    return canvas;
}

// Distância elíptica normalizada até o centro (0 = centro, 1 = borda da tela)
function ellipticDistance(x, y, w, h) {
    const nx = (x - w / 2) / (w / 2);
    const ny = (y - h / 2) / (h / 2);
    return Math.hypot(nx, ny);
}

function buildGround(w, h, rand, res) {
    const canvas = makeCanvas(w * res, h * res, { alpha: false });
    const g = canvas.getContext('2d', { alpha: false });
    g.scale(res, res);
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

    bakeGrass(g, w, h, rand);
    bakeTorchGlow(g, w, h);
    return canvas;
}

// Grama: quase toda parada, já pintada no chão; só alguns tufos balançam a cada quadro
function bakeGrass(g, w, h, rand) {
    const clumps = buildGrass(w, h, rand);
    g.lineWidth = 1.1;
    F.grassColors.forEach((color, ci) => {
        g.strokeStyle = color;
        g.beginPath();
        clumps.forEach(clump => {
            if (clump.color !== ci) return;
            clump.blades.forEach(blade => {
                const tipX = clump.x + blade.lean * clump.height;
                const tipY = clump.y - clump.height * blade.length;
                g.moveTo(clump.x + blade.offset, clump.y);
                g.quadraticCurveTo(clump.x + blade.offset, clump.y - clump.height * 0.55, tipX, tipY);
            });
        });
        g.stroke();
    });
}

// Brilho quente no chão: fica sempre pintado, e a névoa o cobre conforme a luz encolhe
function bakeTorchGlow(g, w, h) {
    const r = Math.min(w, h) * T.lightRadiusMaxRatio;
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r);
    grad.addColorStop(0, `rgba(${T.groundGlowColor}, ${T.groundGlowAlpha})`);
    grad.addColorStop(0.5, `rgba(${T.groundGlowColor}, ${T.groundGlowAlpha * 0.35})`);
    grad.addColorStop(1, `rgba(${T.groundGlowColor}, 0)`);
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = grad;
    g.fillRect(w / 2 - r, h / 2 - r, r * 2, r * 2);
    g.globalCompositeOperation = 'source-over';
}

// Vento: 0 a 1, rajadas que viajam pela tela da esquerda para a direita
function windAt(t, x, y) {
    const gust = 0.5 + 0.5 * Math.sin(t * F.windSpeed - x * F.windWaveLength + y * F.windWaveLength * 0.4);
    const flutter = 0.5 + 0.5 * Math.sin(t * F.windSpeed * 2.3 - x * F.windWaveLength * 2.1);
    return Math.min(1, F.windBase + (1 - F.windBase) * (gust * 0.75 + flutter * 0.25) * gust);
}

// Textura de névoa que se repete sem emenda (os puffs "dão a volta" no tile)
function buildFogTile(rand) {
    const size = F.fogTilePixels;
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
    const size = 64;
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
    // Degradê suave: uma tela minúscula esticada fica igual
    const canvas = makeCanvas(w * F.vignetteResolution, h * F.vignetteResolution);
    const g = canvas.getContext('2d');
    g.scale(canvas.width / w, canvas.height / h);      // o tamanho foi arredondado: preenche até a borda
    const r = Math.hypot(w, h) / 2;
    // Noite fria e vinheta numa única camada pré-desenhada
    g.fillStyle = F.nightTint;
    g.fillRect(0, 0, w, h);
    const grad = g.createRadialGradient(w / 2, h / 2, r * F.vignetteInnerRatio, w / 2, h / 2, r);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, F.vignetteColor);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    return canvas;
}

function ensureCache() {
    const { width: w, height: h, quality } = state;
    const res = state.view.scale * state.view.pixelRatio;
    const key = `${w}x${h}|${res.toFixed(4)}|${quality}`;
    if (cache.key === key) return;
    cache.key = key;

    const rand = createRandom(F.seed);
    cache.ground = buildGround(w, h, rand, res);
    const { sprite, fog } = buildFog(w, h, rand);
    cache.fogSprite = sprite;
    cache.fog = fog;
    cache.fogTile = buildFogTile(rand);
    cache.fireflies = Array.from({ length: F.fireflies[quality] }, () => ({
        x: rand() * w,
        y: rand() * h,
        heading: rand() * Math.PI * 2,
        phase: rand() * Math.PI * 2,
        blink: randomRange(rand, 0.6, 1.6)
    }));
    cache.swayGrass = buildGrass(w, h, rand).slice(0, F.swayingClumps[quality]);
    cache.fogCanvas = makeCanvas(w * F.fogResolution, h * F.fogResolution);
    cache.fogScaleX = cache.fogCanvas.width / w;
    cache.fogScaleY = cache.fogCanvas.height / h;
    cache.fogCtx = cache.fogCanvas.getContext('2d');
    cache.vignette = buildVignette(w, h);
    cache.lightRadius = 0;
    cache.fogDrawnAt = 0;
}

// Pré-monta o cenário antes da partida começar
export function prepareForest() {
    ensureCache();
}

// Camada 1: chão da floresta e clareira. Sem zoom é uma cópia exata, pixel a pixel
export function renderForestGround() {
    ensureCache();
    if (state.zoomPunch > 0) {
        ctx.drawImage(cache.ground, 0, 0, state.width, state.height);
        return;
    }
    const view = getWorldView();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cache.ground, Math.round(view.x), Math.round(view.y));
    ctx.imageSmoothingEnabled = true;
    resetWorldView();
}

// Tufos que se curvam com o vento (um único traçado)
export function renderForestGrass() {
    const clumps = cache.swayGrass;
    if (clumps.length === 0) return;
    const t = performance.now() / 1000;
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = F.grassColors[0];
    ctx.beginPath();
    for (const clump of clumps) {
        const wind = windAt(t, clump.x, clump.y);
        const sway = (wind * F.grassBend + Math.sin(t * 2.4 + clump.phase) * 0.8) * clump.height / F.grassMaxHeight;
        for (const blade of clump.blades) {
            const tipX = clump.x + blade.lean * clump.height + sway * blade.stiffness;
            const tipY = clump.y - clump.height * blade.length;
            ctx.moveTo(clump.x + blade.offset, clump.y);
            ctx.quadraticCurveTo(clump.x + blade.offset + sway * 0.2, clump.y - clump.height * 0.55, tipX, tipY);
        }
    }
    ctx.stroke();
}

// Raio da luz da tocha: acompanha a vida do núcleo, com transição suave e leve tremida
function updateTorchLight(now) {
    const hpRatio = Math.max(0, Math.min(1, state.coreHp / state.coreHpMax));
    const minSide = Math.min(state.width, state.height);
    const target = minSide * (T.lightRadiusMinRatio
        + (T.lightRadiusMaxRatio - T.lightRadiusMinRatio) * Math.pow(hpRatio, T.lightShrinkCurve));

    const dt = Math.min(0.2, cache.lightTime ? now - cache.lightTime : 0);
    cache.lightTime = now;
    cache.lightRadius = cache.lightRadius
        ? cache.lightRadius + (target - cache.lightRadius) * Math.min(1, dt * T.lightSmoothing)
        : target;

    const flicker = 1 + Math.sin(now * 11) * T.lightFlicker * 0.5 + Math.sin(now * 23.7) * T.lightFlicker * 0.5;
    cache.currentLight = cache.lightRadius * flicker;
}

// Raio de luz atual da tocha (atualizado junto com a névoa)
export function getCurrentLightRadius() {
    return cache.currentLight;
}

// Vaga-lumes vagando e piscando
export function renderFireflies() {
    const t = performance.now() / 1000;
    const dt = Math.min(0.05, cache.fireflyTime ? t - cache.fireflyTime : 0);
    cache.fireflyTime = t;
    const { width: w, height: h } = state;

    if (cache.fireflies.length === 0) return;
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
        drawGlow(ctx, F.fireflyGlow, f.x, f.y, F.fireflyGlowRadius, glow);
    });
    ctx.restore();
}

// Desenha o tile de névoa repetido, deslocado pelo tempo (rolagem contínua)
function drawFogLayer(g, layer, t, w, h, density) {
    const size = F.fogTileSize * layer.scale;
    const ox = (((t * layer.speedX) % size) + size) % size;
    const oy = (((t * layer.speedY) % size) + size) % size;
    g.globalAlpha = Math.min(0.85, layer.alpha * density);
    for (let y = oy - size; y < h; y += size) {
        for (let x = ox - size; x < w; x += size) {
            g.drawImage(cache.fogTile, x, y, size, size);
        }
    }
}

// A "sombra" da noite: névoa rolando + noite fria + vinheta, numa tela pequena.
// A luz da tocha e a do herói apagam círculos dessa sombra. Quanto menos vida o núcleo tem, mais
// densa a névoa e menor o círculo de luz.
function drawFog(now) {
    const { width: w, height: h, coreX, coreY } = state;
    const t = now / 1000;
    updateTorchLight(t);

    const g = cache.fogCtx;
    const res = cache.fogScaleX;
    const hpRatio = Math.max(0, Math.min(1, state.coreHp / state.coreHpMax));
    const density = (1 + (1 - hpRatio) * F.fogDensityBoostAtZeroHp) * (1 - Math.min(1, state.dawn * 1.6));

    g.setTransform(res, 0, 0, cache.fogScaleY, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, w, h);
    for (const layer of F.fogLayers) drawFogLayer(g, layer, t, w, h, density);
    for (const blob of cache.fog) {
        // Deriva lenta para a direita, dando a volta na tela, com ondulação
        const span = w + blob.radius * blob.stretch * 2;
        const x = ((blob.x + t * blob.speed) % span) - blob.radius * blob.stretch;
        const y = blob.y + Math.sin(t * 0.2 + blob.phase) * F.fogWobble;
        const edge = Math.min(1, ellipticDistance(x, y, w, h));
        const breathe = 0.75 + 0.25 * Math.sin(t * 0.3 + blob.phase);

        g.globalAlpha = Math.min(0.85, (F.fogAlphaCenter + (F.fogAlphaEdge - F.fogAlphaCenter) * edge) * breathe * density);
        const rw = blob.radius * blob.stretch;
        const rh = blob.radius;
        g.drawImage(cache.fogSprite, x - rw, y - rh, rw * 2, rh * 2);
    }

    // Noite fria + vinheta por cima da névoa
    g.globalAlpha = 1 - Math.min(1, state.dawn * 1.4);
    g.drawImage(cache.vignette, 0, 0, w, h);
    g.globalAlpha = 1;

    // Luz da tocha: apaga a sombra num círculo com borda suave
    g.setTransform(1, 0, 0, 1, 0, 0);
    const lightR = cache.currentLight * res;
    const solid = 1 - T.lightEdgeSoftness;
    const hole = g.createRadialGradient(coreX * res, coreY * res, 0, coreX * res, coreY * res, lightR);
    hole.addColorStop(0, 'rgba(0, 0, 0, 1)');
    hole.addColorStop(Math.max(0.01, solid), 'rgba(0, 0, 0, 1)');
    hole.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = hole;
    g.fillRect(coreX * res - lightR, coreY * res - lightR, lightR * 2, lightR * 2);

    // Luz do herói: uma área menor em volta dele, para a luta nunca sumir na névoa
    const heroX = player.x * res;
    const heroY = player.y * res;
    const heroR = T.heroLightRadius * res;
    const heroHole = g.createRadialGradient(heroX, heroY, heroR * T.heroLightSolid, heroX, heroY, heroR);
    heroHole.addColorStop(0, `rgba(0, 0, 0, ${T.heroLightStrength})`);
    heroHole.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = heroHole;
    g.fillRect(heroX - heroR, heroY - heroR, heroR * 2, heroR * 2);
    g.globalCompositeOperation = 'source-over';
}

export function renderFogAndVignette() {
    const now = performance.now();
    if (now - cache.fogDrawnAt >= F.fogFrameMs[state.quality]) {
        cache.fogDrawnAt = now;
        drawFog(now);
    }
    ctx.drawImage(cache.fogCanvas, 0, 0, state.width, state.height);
}
