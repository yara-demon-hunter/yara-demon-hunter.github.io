// --- BARRINHA DE VIDA NO MUNDO ---
// Desenhada em cima da tocha e do herói. B = { width, height, offsetY, back, fillLeft, fillRight, border }
// (x, y) é o centro do dono da barra; ratio vai de 0 a 1. Cor lisa: gradiente por quadro não compensa.
export function drawHpBar(ctx, B, x, y, ratio) {
    const left = x - B.width / 2;
    const top = y - B.offsetY;
    ctx.fillStyle = B.back;
    ctx.fillRect(left, top, B.width, B.height);
    ctx.fillStyle = B.fillRight;
    ctx.fillRect(left, top, B.width * ratio, B.height);
    ctx.strokeStyle = B.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(left, top, B.width, B.height);
}
