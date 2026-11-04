import { BLOB_SPRITE, COIN_SPRITE, FX, ITEM_SPRITE } from '../../../data_model/visuals/sprites.js';
import { ITEMS } from '../../../data_model/match.js';

// --- SPRITES PEQUENOS ---
// Tudo que aparece várias vezes por quadro é desenhado uma vez e depois carimbado.
export function makeCanvas(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    if (draw) draw(canvas.getContext('2d'));
    return canvas;
}

// --- BRILHO EM CACHE ---
// Um gradiente radial por cor, esticado com drawImage para qualquer raio (bem mais barato que shadowBlur).
const glows = new Map();

export function getGlowSprite(color) {
    let sprite = glows.get(color);
    if (!sprite) {
        const size = FX.glowSize;
        sprite = makeCanvas(size, size, (g) => {
            const c = size / 2;
            const grad = g.createRadialGradient(c, c, 0, c, c, c);
            grad.addColorStop(0, color);
            grad.addColorStop(0.35, color);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            g.fillStyle = grad;
            g.fillRect(0, 0, size, size);
        });
        glows.set(color, sprite);
    }
    return sprite;
}

export function drawGlow(ctx, color, x, y, radius, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(getGlowSprite(color), x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = 1;
}

// Estrela de 4 pontas (impactos, tontura, brilho de moeda)
const stars = new Map();
export function getStarSprite(color) {
    let sprite = stars.get(color);
    if (!sprite) {
        const size = FX.starPixels;
        sprite = makeCanvas(size, size, (g) => {
            const c = size / 2;
            g.translate(c, c);
            g.fillStyle = color;
            g.beginPath();
            for (let i = 0; i < 8; i++) {
                const r = i % 2 === 0 ? c * 0.95 : c * 0.28;
                const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
                g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            g.closePath();
            g.fill();
            g.fillStyle = '#ffffff';
            g.beginPath();
            g.arc(0, 0, c * 0.22, 0, Math.PI * 2);
            g.fill();
        });
        stars.set(color, sprite);
    }
    return sprite;
}

// Nuvem de poeira: círculo macio branco
let dust = null;
export function getDustSprite() {
    if (!dust) {
        const size = FX.dustPixels;
        dust = makeCanvas(size, size, (g) => {
            const c = size / 2;
            const grad = g.createRadialGradient(c, c, 0, c, c, c);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.35)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            g.fillStyle = grad;
            g.fillRect(0, 0, size, size);
        });
    }
    return dust;
}

// Sombra no chão: elipse macia
let shadow = null;
export function getShadowSprite() {
    if (!shadow) {
        shadow = makeCanvas(64, 32, (g) => {
            g.translate(32, 16);
            g.scale(1, 0.5);
            const grad = g.createRadialGradient(0, 0, 0, 0, 0, 32);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            g.fillStyle = grad;
            g.beginPath();
            g.arc(0, 0, 32, 0, Math.PI * 2);
            g.fill();
        });
    }
    return shadow;
}

// Moeda girando: do rosto de frente até de lado
let coins = null;
export function getCoinAtlas() {
    if (coins) return coins;
    const C = COIN_SPRITE;
    const cell = Math.ceil(C.sizeInRadii * 9 * C.pixelsPerUnit);
    const r = cell * 0.5 / C.sizeInRadii;
    const canvas = makeCanvas(cell * C.frames, cell, (g) => {
        for (let f = 0; f < C.frames; f++) {
            const spin = Math.abs(Math.cos((f / C.frames) * Math.PI));
            const cx = (f + 0.5) * cell;
            const cy = cell / 2;
            g.globalAlpha = 0.5;
            g.drawImage(getGlowSprite(C.glow), f * cell, 0, cell, cell);
            g.globalAlpha = 1;
            g.fillStyle = C.edge;
            g.beginPath();
            g.ellipse(cx, cy, Math.max(2, r * spin), r, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = C.face;
            g.beginPath();
            g.ellipse(cx, cy, Math.max(1.4, r * spin * 0.72), r * 0.72, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = C.shine;
            g.beginPath();
            g.ellipse(cx - r * spin * 0.25, cy - r * 0.3, Math.max(0.8, r * spin * 0.16), r * 0.2, 0, 0, Math.PI * 2);
            g.fill();
        }
    });
    coins = { canvas, cell, frames: C.frames };
    return coins;
}

// Itens que caem: orbe colorido com o ícone (o emoji é desenhado uma vez só)
const items = new Map();
export function getItemSprite(type) {
    let sprite = items.get(type);
    if (!sprite) {
        const S = ITEM_SPRITE;
        const cell = Math.ceil(S.sizeInRadii * 14 * S.pixelsPerUnit);
        const r = cell * 0.5 / S.sizeInRadii;
        const color = ITEMS[type].color;
        sprite = makeCanvas(cell, cell, (g) => {
            g.globalAlpha = 0.6;
            g.drawImage(getGlowSprite(color), 0, 0, cell, cell);
            g.globalAlpha = 1;
            g.translate(cell / 2, cell / 2);
            g.fillStyle = color;
            g.beginPath();
            g.arc(0, 0, r, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = S.shade;
            g.beginPath();
            g.arc(0, r * 0.25, r * 0.92, 0, Math.PI);
            g.fill();
            g.lineWidth = r * 0.14;
            g.strokeStyle = S.rim;
            g.beginPath();
            g.arc(0, 0, r, 0, Math.PI * 2);
            g.stroke();
            g.font = `${Math.round(r * 1.1)}px Arial`;
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(ITEMS[type].icon, 0, r * 0.06);
        });
        sprite = { canvas: sprite, cell };
        items.set(type, sprite);
    }
    return sprite;
}

// Massa no chão: gelatina com brilho
const blobs = new Map();
export function getBlobSprite(color) {
    let sprite = blobs.get(color);
    if (!sprite) {
        const size = Math.ceil(2.4 * 16 * BLOB_SPRITE.pixelsPerUnit);
        sprite = makeCanvas(size, size, (g) => {
            const c = size / 2;
            const r = size / 2 / 1.2;
            g.translate(c, c);
            g.fillStyle = color;
            g.beginPath();
            g.arc(0, 0, r, 0, Math.PI * 2);
            g.fill();
            g.lineWidth = r * 0.14;
            g.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            g.stroke();
            g.fillStyle = 'rgba(255, 255, 255, 0.55)';
            g.beginPath();
            g.ellipse(-r * 0.3, -r * 0.35, r * 0.28, r * 0.16, -0.5, 0, Math.PI * 2);
            g.fill();
        });
        blobs.set(color, sprite);
    }
    return sprite;
}
