import { SWORD_RAIN_VISUALS } from './sword_rain_visual.js';

const C = SWORD_RAIN_VISUALS.colors;
const S = SWORD_RAIN_VISUALS.shape;
const TAU = Math.PI * 2;

// --- ESPADA QUE CAI (Sword Rain, Fúria do Demon Hunter) ---
// Espada reta de lâmina larga, ponta para baixo, pronta para virar sprite: a ponta fica em (0, 0) e o cabo sobe (y negativo).
// Largura da arte: ~2 * (guardWidth) = 16; altura: ~ bladeLength + gripLength + 6 = 50. Quem chama ajusta com scale.
export const SWORD_RAIN_BOUNDS = { width: 20, height: 52 };

export function drawFallingSword(g) {
    const L = S.bladeLength;
    const h = S.bladeHalf;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    // Lâmina: metade da esquerda clara, da direita na sombra
    for (const side of [-1, 1]) {
        g.fillStyle = side < 0 ? C.bladeLight : C.bladeShade;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(side * h, -S.shoulder);
        g.lineTo(side * h, -L);
        g.lineTo(0, -L);
        g.closePath();
        g.fill();
    }
    // Fio brilhante em volta e nervura no meio
    g.strokeStyle = C.edge;
    g.lineWidth = 0.7;
    g.beginPath();
    g.moveTo(-h, -L);
    g.lineTo(-h, -S.shoulder);
    g.lineTo(0, 0);
    g.lineTo(h, -S.shoulder);
    g.lineTo(h, -L);
    g.stroke();
    g.strokeStyle = C.ridge;
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(0, -1.5);
    g.lineTo(0, -L + 3);
    g.stroke();
    // Guarda, cabo e pomo
    g.fillStyle = C.guard;
    g.strokeStyle = C.guardShade;
    g.lineWidth = 0.5;
    g.beginPath();
    g.rect(-S.guardWidth, -L - S.guardThick, S.guardWidth * 2, S.guardThick);
    g.fill();
    g.stroke();
    g.fillStyle = C.grip;
    g.fillRect(-1.3, -L - S.guardThick - S.gripLength, 2.6, S.gripLength);
    g.fillStyle = C.pommel;
    g.beginPath();
    g.arc(0, -L - S.guardThick - S.gripLength - S.pommelRadius * 0.6, S.pommelRadius, 0, TAU);
    g.fill();
}
