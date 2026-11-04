import { FX } from '../../../data_model/visuals/sprites.js';

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
