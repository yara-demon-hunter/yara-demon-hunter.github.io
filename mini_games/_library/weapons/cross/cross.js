import { CROSS_VISUALS } from './cross_visual.js';

const C = CROSS_VISUALS.colors;
const S = CROSS_VISUALS.shape;

// --- CRUCIFIXO DE ARREMESSO (desenho procedural) ---
// Cruz de prata desenhada ao longo de +x: a haste longa atrás, a travessa perto da frente e uma pequena gema dourada no
// cruzamento. Origem no cruzamento. Usada em voo (gira: THROWN_WEAPONS.cross.spin) e na mão do herói; quem chama ajusta com ctx.scale.
export function drawCross(ctx, t) {
    const w = S.thick;
    const bar = (x0, y0, x1, y1) => {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    };
    ctx.lineCap = 'round';
    // Contorno, prata e um fio de luz em cima de cada barra
    for (const [color, width] of [[C.outline, w * 2 + 0.7], [C.silverShade, w * 2], [C.silver, w * 1.35]]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        bar(S.back, 0, S.front, 0);
        bar(S.armX, -S.armHalf, S.armX, S.armHalf);
    }
    ctx.strokeStyle = C.silverLight;
    ctx.lineWidth = w * 0.45;
    bar(S.back + 0.8, -w * 0.35, S.front - 0.6, -w * 0.35);
    bar(S.armX - w * 0.35, -S.armHalf + 0.6, S.armX - w * 0.35, S.armHalf - 0.6);
    // Gema no cruzamento, pulsando de leve
    ctx.fillStyle = C.gem;
    ctx.beginPath();
    ctx.arc(S.armX, 0, w * (0.75 + 0.12 * Math.sin((t ?? 0) * 6)), 0, Math.PI * 2);
    ctx.fill();
}
