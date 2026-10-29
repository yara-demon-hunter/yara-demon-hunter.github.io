import { KNIFE_VISUALS as K } from '../../data_model/visuals/effects/knife_visual.js';

const C = K.colors;
const S = K.shape;

// --- ADAGA (desenho procedural) ---
// Desenhada ao longo de +x com a origem no meio do cabo (onde a mão segura).
// Usada em voo (js/render/entities.js) e na mão do herói (js/render/player25d.js); quem chama ajusta com ctx.scale.
export function drawDagger(ctx, t) {
    const base = ctx.globalAlpha;
    ctx.lineCap = 'round';

    // Pomo com gema
    ctx.fillStyle = C.guard;
    ctx.beginPath();
    ctx.arc(S.pommelX, 0, S.pommelRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.gem;
    ctx.beginPath();
    ctx.arc(S.pommelX, 0, S.pommelRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Cabo de couro com tiras enroladas
    ctx.fillStyle = C.grip;
    ctx.fillRect(S.gripStart, -S.gripHalf, S.gripEnd - S.gripStart, S.gripHalf * 2);
    ctx.strokeStyle = C.wrap;
    ctx.lineWidth = 0.6;
    const step = (S.gripEnd - S.gripStart) / S.wraps;
    for (let i = 0; i < S.wraps; i++) {
        const x = S.gripStart + (i + 0.5) * step;
        ctx.beginPath();
        ctx.moveTo(x - 0.5, -S.gripHalf);
        ctx.lineTo(x + 0.5, S.gripHalf);
        ctx.stroke();
    }

    // Guarda curvada, com as pontas voltadas para a lâmina
    ctx.strokeStyle = C.guardShade;
    ctx.lineWidth = S.guardThickness + 0.5;
    ctx.beginPath();
    ctx.moveTo(S.guardX + S.guardCurl, -S.guardHalf);
    ctx.quadraticCurveTo(S.guardX - 0.6, 0, S.guardX + S.guardCurl, S.guardHalf);
    ctx.stroke();
    ctx.strokeStyle = C.guard;
    ctx.lineWidth = S.guardThickness;
    ctx.stroke();

    // Lâmina: metade de cima clara, metade de baixo na sombra
    const b0 = S.bladeStart;
    const tip = S.bladeEnd;
    const ctrl = S.bladeMaxHalf * 1.15;
    for (const side of [-1, 1]) {
        ctx.fillStyle = side < 0 ? C.bladeLight : C.bladeShade;
        ctx.beginPath();
        ctx.moveTo(b0, 0);
        ctx.lineTo(b0, side * S.bladeBaseHalf);
        ctx.quadraticCurveTo(S.bladeMaxX, side * ctrl, tip, 0);
        ctx.closePath();
        ctx.fill();
    }

    // Fio brilhante em volta e nervura central
    ctx.strokeStyle = C.edge;
    ctx.lineWidth = 0.35;
    ctx.beginPath();
    ctx.moveTo(b0, -S.bladeBaseHalf);
    ctx.quadraticCurveTo(S.bladeMaxX, -ctrl, tip, 0);
    ctx.quadraticCurveTo(S.bladeMaxX, ctrl, b0, S.bladeBaseHalf);
    ctx.stroke();
    ctx.strokeStyle = C.ridge;
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(b0 + 0.4, 0);
    ctx.lineTo(tip - 2, 0);
    ctx.stroke();

    // Runas que acendem em onda perto da base
    ctx.fillStyle = C.runes;
    for (let i = 0; i < S.runeCount; i++) {
        ctx.globalAlpha = base * (0.35 + 0.65 * Math.max(0, Math.sin(t * 7 - i * 1.4)));
        ctx.fillRect(b0 + 1.2 + i * 1.6, -S.bladeBaseHalf * 0.6, 0.8, 0.5);
    }
    ctx.globalAlpha = base;
}
