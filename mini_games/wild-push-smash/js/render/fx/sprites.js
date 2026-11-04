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


// --- ESTILO QUADRINHO ---
// Explosão em estrela de pontas irregulares: contorno marrom, laranja por fora, amarelo e branco no miolo
let blast = null;
export function getBlastSprite() {
    if (!blast) {
        const C = FX.comic;
        const size = C.blastPixels;
        blast = makeCanvas(size, size, (g) => {
            const c = size / 2;
            const spikes = 14;
            const shape = (radius, inner, seed) => {
                g.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const long = i % 2 === 0;
                    const wobble = 0.82 + 0.18 * Math.sin(i * 2.7 + seed);
                    const r = radius * (long ? wobble : inner);
                    const a = (i / (spikes * 2)) * Math.PI * 2;
                    g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r);
                }
                g.closePath();
            };
            g.lineJoin = 'round';
            shape(c * 0.96, 0.55, 0);
            g.fillStyle = C.blast.outer; g.fill();
            g.lineWidth = size * 0.03; g.strokeStyle = C.outline; g.stroke();
            shape(c * 0.72, 0.6, 1.3); g.fillStyle = C.blast.mid; g.fill();
            shape(c * 0.48, 0.65, 2.1); g.fillStyle = C.blast.inner; g.fill();
            g.beginPath(); g.arc(c, c, c * 0.2, 0, Math.PI * 2); g.fillStyle = C.blast.core; g.fill();
        });
    }
    return blast;
}

// Palavra de impacto (BAM!, CRASH!...): letras amarelas com contorno grosso, sobre um selo de pontas
const words = new Map();
export function getWordSprite(word) {
    let sprite = words.get(word);
    if (!sprite) {
        const C = FX.comic;
        const h = C.wordPixels;
        const probe = document.createElement('canvas').getContext('2d');
        probe.font = C.wordFont;
        const textW = probe.measureText(word).width;
        const w = Math.ceil(textW + h * 0.7);
        sprite = makeCanvas(w, h, (g) => {
            const cx = w / 2, cy = h / 2;
            // selo de pontas atrás do texto
            const spikes = 12;
            g.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const long = i % 2 === 0;
                const a = (i / (spikes * 2)) * Math.PI * 2;
                const rx = (w / 2) * (long ? 0.98 : 0.8), ry = (h / 2) * (long ? 0.98 : 0.74);
                g.lineTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
            }
            g.closePath();
            const bg = g.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, C.badge[1]); bg.addColorStop(1, C.badge[0]);
            g.fillStyle = bg; g.fill();
            g.lineJoin = 'round'; g.lineWidth = h * 0.045; g.strokeStyle = C.outline; g.stroke();
            // letras
            g.font = C.wordFont;
            g.textAlign = 'center'; g.textBaseline = 'middle';
            g.lineWidth = h * 0.16; g.strokeStyle = C.outline;
            g.strokeText(word, cx, cy + h * 0.03);
            const fill = g.createLinearGradient(0, cy - h * 0.3, 0, cy + h * 0.3);
            C.wordGradient.forEach((col, i) => fill.addColorStop(i / (C.wordGradient.length - 1), col));
            g.fillStyle = fill;
            g.fillText(word, cx, cy + h * 0.03);
        });
        words.set(word, sprite);
    }
    return sprite;
}

// Pedra que voa: polígono marrom com contorno
const rocks = new Map();
export function getRockSprite(color) {
    let sprite = rocks.get(color);
    if (!sprite) {
        sprite = makeCanvas(32, 32, (g) => {
            g.translate(16, 16);
            g.beginPath();
            [[-11, -4], [-4, -12], [8, -9], [12, 2], [5, 11], [-8, 9]].forEach(([x, y]) => g.lineTo(x, y));
            g.closePath();
            g.fillStyle = color; g.fill();
            g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = FX.comic.outline; g.stroke();
            g.fillStyle = 'rgba(255,255,255,0.22)';
            g.fillRect(-6, -7, 7, 3);
        });
        rocks.set(color, sprite);
    }
    return sprite;
}
