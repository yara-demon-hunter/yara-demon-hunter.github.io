// --- BRILHO EM CACHE ---
// Um gradiente radial pré-desenhado por cor/raio, reaproveitado com drawImage.
// Muito mais barato que ctx.shadowBlur, que é recalculado a cada desenho.
const sprites = new Map();

export function getGlowSprite(color, radius) {
    const key = `${color}|${Math.round(radius)}`;
    let sprite = sprites.get(key);
    if (!sprite) {
        const size = Math.ceil(radius * 2);
        sprite = document.createElement('canvas');
        sprite.width = sprite.height = size;
        const g = sprite.getContext('2d');
        const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, color);
        grad.addColorStop(0.35, color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
        sprites.set(key, sprite);
    }
    return sprite;
}

// Desenha o brilho centrado em (x, y) com a opacidade dada
export function drawGlow(ctx, color, x, y, radius, alpha = 1) {
    const sprite = getGlowSprite(color, radius);
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = 1;
}
