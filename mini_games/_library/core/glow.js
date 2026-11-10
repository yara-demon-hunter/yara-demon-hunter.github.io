// --- BRILHO EM CACHE ---
// Um gradiente radial pré-desenhado por cor, em tamanho fixo, esticado com drawImage para qualquer raio.
// Muito mais barato que ctx.shadowBlur. O raio não entra na chave: o cache tem uma entrada por cor e
// não cresce durante a partida, mesmo com brilhos pulsando.
const SPRITE_SIZE = 48;
const sprites = new Map();

export function getGlowSprite(color) {
    let sprite = sprites.get(color);
    if (!sprite) {
        sprite = document.createElement('canvas');
        sprite.width = sprite.height = SPRITE_SIZE;
        const g = sprite.getContext('2d');
        const c = SPRITE_SIZE / 2;
        const grad = g.createRadialGradient(c, c, 0, c, c, c);
        grad.addColorStop(0, color);
        grad.addColorStop(0.35, color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
        sprites.set(color, sprite);
    }
    return sprite;
}

// Desenha o brilho centrado em (x, y) com a opacidade dada
export function drawGlow(ctx, color, x, y, radius, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(getGlowSprite(color), x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = 1;
}
