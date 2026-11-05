// --- PALCO 2.5D: utilidades de desenho ---
// Brilho em cache, easing, ângulos e aleatório com semente. Usado pelos outros arquivos de js/stage/.
// Script clássico: tudo fica em window.YaraStage25D (sem módulos, como o resto do RPG).
(() => {
    const NS = window.YaraStage25D = window.YaraStage25D || {};

    // Um gradiente radial pré-desenhado por cor, esticado com drawImage para qualquer raio
    // (bem mais barato que shadowBlur ou um gradiente novo por quadro).
    const GLOW_SIZE = 48;
    const glows = new Map();

    function glowSprite(color) {
        let sprite = glows.get(color);
        if (!sprite) {
            sprite = document.createElement('canvas');
            sprite.width = sprite.height = GLOW_SIZE;
            const g = sprite.getContext('2d');
            const c = GLOW_SIZE / 2;
            const grad = g.createRadialGradient(c, c, 0, c, c, c);
            grad.addColorStop(0, color);
            grad.addColorStop(0.35, color);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            g.fillStyle = grad;
            g.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE);
            glows.set(color, sprite);
        }
        return sprite;
    }

    // Brilho centrado em (x, y). A opacidade multiplica a atual (o personagem pode estar sumindo).
    function drawGlow(ctx, color, x, y, radius, alpha = 1) {
        if (radius <= 0 || alpha <= 0) return;
        const base = ctx.globalAlpha;
        ctx.globalAlpha = base * alpha;
        ctx.drawImage(glowSprite(color), x - radius, y - radius, radius * 2, radius * 2);
        ctx.globalAlpha = base;
    }

    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easeInOut = (t) => t * t * (3 - 2 * t);
    // 0 → 1 → 0 dentro de [a, b]
    const bump = (p, a = 0, b = 1) => (p <= a || p >= b ? 0 : Math.sin(((p - a) / (b - a)) * Math.PI));

    // Interpola ângulos pelo caminho mais curto
    function lerpAngle(from, to, amount) {
        let diff = to - from;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return from + diff * amount;
    }

    // Número fixo em [0, 1) para uma célula (i, j) e uma semente: o cenário é sempre o mesmo no mesmo lugar
    function hash(i, j = 0, seed = 0) {
        let h = Math.imul(i | 0, 374761393) ^ Math.imul(j | 0, 668265263) ^ Math.imul(seed | 0, 2147483647);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    }

    NS.fx = { drawGlow, glowSprite, clamp, easeOutQuad, easeOutCubic, easeInOut, bump, lerpAngle, hash };
})();
