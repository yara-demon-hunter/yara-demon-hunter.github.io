import { ROSE_VISUALS } from './rose_visual.js';

const S = ROSE_VISUALS.shape;
const TAU = Math.PI * 2;

// --- ROSA DE ARREMESSO (desenho procedural) ---
// Desenhada ao longo de +x: o cabo (caule com espinhos e uma folha) fica atrás e a flor na ponta, virada para onde voa.
// Origem no meio do caule (onde a mão segura). dark = a Rosa Negra. Usada em voo e na mão do herói; quem chama ajusta com ctx.scale.
export function drawRose(ctx, t, dark = false) {
    const C = (dark ? ROSE_VISUALS.dark : ROSE_VISUALS.rose).colors;
    const base = ctx.globalAlpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Caule
    ctx.strokeStyle = C.stemShade;
    ctx.lineWidth = S.stemHalf * 2 + 0.5;
    ctx.beginPath();
    ctx.moveTo(S.stemStart, 0);
    ctx.lineTo(S.stemEnd, 0);
    ctx.stroke();
    ctx.strokeStyle = C.stem;
    ctx.lineWidth = S.stemHalf * 2;
    ctx.stroke();

    // Espinhos, alternando de lado
    ctx.fillStyle = C.thorn;
    S.thorns.forEach((x, i) => {
        const side = i % 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(x - 0.5, 0);
        ctx.lineTo(x + 0.7, side * 1.9);
        ctx.lineTo(x + 0.6, 0);
        ctx.closePath();
        ctx.fill();
    });

    // Folha
    ctx.fillStyle = C.leaf;
    ctx.strokeStyle = C.stemShade;
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(S.leafX, 0);
    ctx.quadraticCurveTo(S.leafX + S.leafLength * 0.45, S.leafHalf * 2.2, S.leafX + S.leafLength, S.leafHalf * 1.2);
    ctx.quadraticCurveTo(S.leafX + S.leafLength * 0.7, S.leafHalf * 0.2, S.leafX, 0);
    ctx.fill();
    ctx.stroke();

    // Sépalas (as folhinhas debaixo da flor)
    ctx.fillStyle = C.sepal;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(S.headX - S.headRadius * 0.55, 0);
        ctx.quadraticCurveTo(S.headX - S.headRadius * 1.2, side * S.headRadius * 0.9, S.headX - S.headRadius * 0.1, side * S.headRadius * 0.85);
        ctx.closePath();
        ctx.fill();
    }

    // Flor: pétalas de fora (escuras), de dentro (cor cheia) e o miolo em espiral
    const r = S.headRadius;
    ctx.strokeStyle = C.petalShade;
    ctx.lineWidth = 0.28;
    for (let i = 0; i < S.petals; i++) {
        const a = (i / S.petals) * TAU + 0.3;
        ctx.fillStyle = C.petalShade;
        ctx.beginPath();
        ctx.arc(S.headX + Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.55, 0, TAU);
        ctx.fill();
    }
    for (let i = 0; i < S.petals - 1; i++) {
        const a = (i / (S.petals - 1)) * TAU;
        ctx.fillStyle = C.petal;
        ctx.beginPath();
        ctx.arc(S.headX + Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36, r * 0.46, 0, TAU);
        ctx.fill();
        ctx.stroke();
    }
    ctx.fillStyle = C.petalLight;
    ctx.beginPath();
    ctx.arc(S.headX - r * 0.18, -r * 0.2, r * 0.22, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = C.core;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.arc(S.headX + r * 0.05, r * 0.03, r * 0.2, 0.6, 4.6);
    ctx.stroke();
    ctx.globalAlpha = base;
}
