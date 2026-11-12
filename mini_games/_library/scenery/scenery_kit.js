import { drawGlow } from '../core/glow.js';
import { createRandom, randomRange } from '../core/random.js';

// --- KIT DOS CENÁRIOS: o que quase todo cenário reaproveita ---
// Funções puras, sem estado: recebem os dados visuais (`visual`) e devolvem canvases ou itens. Quem guarda o cache
// e decide a ordem é scenery.js. Um cenário novo escolhe só o que precisa daqui.

export function makeCanvas(width, height, options) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    if (options) canvas.getContext('2d', options);
    return canvas;
}

// Distância elíptica normalizada até o centro (0 = centro, 1 = borda da tela)
export function ellipticDistance(x, y, w, h) {
    const nx = (x - w / 2) / (w / 2);
    const ny = (y - h / 2) / (h / 2);
    return Math.hypot(nx, ny);
}

// --- VENTO ---
// 0 a 1, rajadas que viajam pela tela da esquerda para a direita.
// Lê de visual: windSpeed, windWaveLength, windBase.
export function windAt(visual, t, x, y) {
    const F = visual;
    const gust = 0.5 + 0.5 * Math.sin(t * F.windSpeed - x * F.windWaveLength + y * F.windWaveLength * 0.4);
    const flutter = 0.5 + 0.5 * Math.sin(t * F.windSpeed * 2.3 - x * F.windWaveLength * 2.1);
    return Math.min(1, F.windBase + (1 - F.windBase) * (gust * 0.75 + flutter * 0.25) * gust);
}

// --- BRILHO DA FONTE DE LUZ NO CHÃO ---
// Fica pintado no chão e a névoa o cobre conforme a luz encolhe. `source` vem do jogo:
// { glowColor: '255, 150, 60', glowAlpha, radiusRatio } (radiusRatio = fração do menor lado da tela).
export function bakeSourceGlow(g, w, h, source) {
    if (!source) return;
    const r = Math.min(w, h) * source.radiusRatio;
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r);
    grad.addColorStop(0, `rgba(${source.glowColor}, ${source.glowAlpha})`);
    grad.addColorStop(0.5, `rgba(${source.glowColor}, ${source.glowAlpha * 0.35})`);
    grad.addColorStop(1, `rgba(${source.glowColor}, 0)`);
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = grad;
    g.fillRect(w / 2 - r, h / 2 - r, r * 2, r * 2);
    g.globalCompositeOperation = 'source-over';
}

// --- NÉVOA ---
// Textura que se repete sem emenda (os puffs "dão a volta" no tile).
// Lê de visual: fogTilePixels, fogTilePuffs, fogColor.
export function buildFogTile(visual, rand) {
    const F = visual;
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

// Manchas soltas de névoa que derivam: um sprite redondo e a lista de manchas.
// Lê de visual: fogColor, fogBlobs, fogMinRadius, fogMaxRadius, fogDriftSpeed.
export function buildFogBlobs(visual, w, h, rand) {
    const F = visual;
    const size = 64;
    const sprite = makeCanvas(size, size);
    const g = sprite.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `rgba(${F.fogColor}, 1)`);
    grad.addColorStop(0.5, `rgba(${F.fogColor}, 0.45)`);
    grad.addColorStop(1, `rgba(${F.fogColor}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);

    const blobs = [];
    for (let i = 0; i < F.fogBlobs; i++) {
        blobs.push({
            x: rand() * w,
            y: rand() * h,
            radius: randomRange(rand, F.fogMinRadius, F.fogMaxRadius),
            speed: F.fogDriftSpeed * randomRange(rand, 0.5, 1.5),
            phase: rand() * Math.PI * 2,
            stretch: randomRange(rand, 1.3, 2.2)
        });
    }
    return { sprite, blobs };
}

// Desenha o tile de névoa repetido, deslocado pelo tempo (rolagem contínua)
export function drawFogLayer(visual, g, tile, layer, t, w, h, density) {
    const size = visual.fogTileSize * layer.scale;
    const ox = (((t * layer.speedX) % size) + size) % size;
    const oy = (((t * layer.speedY) % size) + size) % size;
    g.globalAlpha = Math.min(0.85, layer.alpha * density);
    for (let y = oy - size; y < h; y += size) {
        for (let x = ox - size; x < w; x += size) {
            g.drawImage(tile, x, y, size, size);
        }
    }
}

// Quão densa a névoa está: `danger` (0 a 1) é o quanto a fonte de luz está ameaçada, `dawn` (0 a 1) o amanhecer.
// Lê de visual: fogDensityBoostAtZeroHp.
export function fogDensity(visual, danger, dawn) {
    return (1 + danger * visual.fogDensityBoostAtZeroHp) * (1 - Math.min(1, dawn * 1.6));
}

// --- VINHETA ---
// Tom da noite e vinheta numa única camada, em tela minúscula (um degradê esticado fica igual).
// Lê de visual: vignetteResolution, nightTint, vignetteInnerRatio, vignetteColor.
export function buildVignette(visual, w, h) {
    const F = visual;
    const canvas = makeCanvas(w * F.vignetteResolution, h * F.vignetteResolution);
    const g = canvas.getContext('2d');
    g.scale(canvas.width / w, canvas.height / h);      // o tamanho foi arredondado: preenche até a borda
    const r = Math.hypot(w, h) / 2;
    g.fillStyle = F.nightTint;
    g.fillRect(0, 0, w, h);
    const grad = g.createRadialGradient(w / 2, h / 2, r * F.vignetteInnerRatio, w / 2, h / 2, r);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, F.vignetteColor);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    return canvas;
}

// --- LUZES ---
// Cada luz apaga um círculo da camada de sombra (névoa + tom + vinheta), com borda suave:
// { x, y, radius, solid, strength, shape } em unidades do mundo.
//   solid     fração do raio totalmente iluminada (o resto, até a borda, é o degradê)
//   strength  1 apaga a sombra por inteiro no centro; menos que isso deixa um pouco dela
//   shape     'plateau' (padrão): forte do centro até `solid`, depois o degradê. Para a fonte principal.
//             'ring': o degradê começa em `solid` e vai até a borda; é o mesmo desenho por outra conta. Para luzes
//             pequenas e fracas (a do herói). As duas ficam iguais a olho nu, mas o arredondamento do
//             navegador difere em 1 de 255 em alguns pixels: cada uma guarda a forma com que foi aprovada.
export function cutLight(g, res, light) {
    const x = light.x * res;
    const y = light.y * res;
    const r = light.radius * res;
    let hole;
    if (light.shape === 'ring') {
        hole = g.createRadialGradient(x, y, r * light.solid, x, y, r);
        hole.addColorStop(0, `rgba(0, 0, 0, ${light.strength})`);
        hole.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
        hole = g.createRadialGradient(x, y, 0, x, y, r);
        hole.addColorStop(0, `rgba(0, 0, 0, ${light.strength})`);
        hole.addColorStop(Math.max(0.01, light.solid), `rgba(0, 0, 0, ${light.strength})`);
        hole.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    g.fillStyle = hole;
    g.fillRect(x - r, y - r, r * 2, r * 2);
}

// --- VAGA-LUMES (ou brasas, ou poeira: qualquer ponto de luz que vaga e pisca) ---
// Lê de visual: fireflies [por nível de detalhe], fireflySpeed, fireflyGlow, fireflyGlowRadius.
export function buildFireflies(visual, w, h, rand, quality) {
    return Array.from({ length: visual.fireflies[quality] }, () => ({
        x: rand() * w,
        y: rand() * h,
        heading: rand() * Math.PI * 2,
        phase: rand() * Math.PI * 2,
        blink: randomRange(rand, 0.6, 1.6)
    }));
}

export function drawFireflies(visual, ctx, fireflies, t, dt, w, h) {
    if (fireflies.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    fireflies.forEach(f => {
        f.heading += Math.sin(t * 0.7 + f.phase) * 0.05;
        f.x += Math.cos(f.heading) * visual.fireflySpeed * dt;
        f.y += Math.sin(f.heading) * visual.fireflySpeed * dt;
        if (f.x < -10) f.x = w + 10; else if (f.x > w + 10) f.x = -10;
        if (f.y < -10) f.y = h + 10; else if (f.y > h + 10) f.y = -10;

        const glow = Math.max(0, Math.sin(t * f.blink * Math.PI + f.phase));
        if (glow <= 0.05) return;
        drawGlow(ctx, visual.fireflyGlow, f.x, f.y, visual.fireflyGlowRadius, glow);
    });
    ctx.restore();
}

// --- ATLAS DE ANIMAÇÃO (movimento sem gastar memória) ---
// Mesma técnica dos monstros do Last Torch: o desenho animado roda UMA vez por quadro de animação, na hora de montar o
// cenário, e cada quadro vai para um atlas pequeno. Em cena, cada coisa que balança é só um drawImage de um recorte
// do atlas: nada de traçar curvas a cada quadro, e o atlas inteiro ocupa poucas centenas de KB.
//
//   sheet = buildSpriteSheet({ cell: [largura, altura], anchor: [0.5, 0.5], frames, variants, res, seed,
//                              paint(g, r, phase, variant) })
//   cell      tamanho de uma célula em unidades do mundo; anchor = onde fica o "pé" da peça dentro dela (0 a 1)
//   frames    quantos quadros tem UM ciclo (o último volta ao primeiro: o ciclo é sem emenda)
//   variants  quantos desenhos diferentes (cada um é uma linha do atlas)
//   res       pixels por unidade do mundo (env.res): o atlas nasce na resolução em que será mostrado
//   paint     desenha UM quadro. g já está em unidades do mundo com a origem no pé da peça. phase vai de 0 a 1 (0 = início
//             do ciclo; use Math.sin(phase * Math.PI * 2) para balançar). r é um sorteio que recomeça igual em TODO
//             quadro da mesma variante: use-o para a forma (quantas folhas, que tamanho) e a forma não pula entre quadros.
export function buildSpriteSheet({ cell, anchor = [0.5, 0.5], frames, variants, res, seed, paint }) {
    const cw = Math.max(1, Math.ceil(cell[0] * res));
    const ch = Math.max(1, Math.ceil(cell[1] * res));
    const canvas = makeCanvas(cw * frames, ch * variants);
    const g = canvas.getContext('2d');
    for (let v = 0; v < variants; v++) {
        for (let f = 0; f < frames; f++) {
            g.setTransform(res, 0, 0, res, f * cw + anchor[0] * cell[0] * res, v * ch + anchor[1] * cell[1] * res);
            g.save();
            g.beginPath();
            g.rect(-anchor[0] * cell[0], -anchor[1] * cell[1], cell[0], cell[1]);
            g.clip();
            paint(g, createRandom(seed + v * 131), f / frames, v);
            g.restore();
        }
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    return { canvas, cw, ch, cell, anchor, frames, variants, bytes: canvas.width * canvas.height * 4 };
}

// Mostra um quadro do atlas com o pé em (x, y) do mundo, no tamanho `scale` (1 = tamanho da célula)
export function drawSheetFrame(ctx, sheet, variant, frame, x, y, scale = 1) {
    const w = sheet.cell[0] * scale;
    const h = sheet.cell[1] * scale;
    ctx.drawImage(sheet.canvas, frame * sheet.cw, variant * sheet.ch, sheet.cw, sheet.ch,
        x - sheet.anchor[0] * w, y - sheet.anchor[1] * h, w, h);
}

// Qual quadro mostrar: `cycleSeconds` é a duração do ciclo; `offset` (0 a 1) defasa uma peça das vizinhas
export function frameAt(sheet, t, cycleSeconds, offset) {
    const p = t / cycleSeconds - offset;
    return Math.floor((p - Math.floor(p)) * sheet.frames) % sheet.frames;
}

// Traço que afina: curva de (x0, y0) a (x1, y1) puxada por (cx, cy), largura w0 → w1
export function taper(g, x0, y0, cx, cy, x1, y1, w0, w1, color) {
    const n = 8;
    g.strokeStyle = color;
    g.lineCap = 'round';
    let px = x0;
    let py = y0;
    for (let i = 1; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
        const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
        g.lineWidth = w0 + (w1 - w0) * (t - 0.5 / n);
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(x, y);
        g.stroke();
        px = x;
        py = y;
    }
}
