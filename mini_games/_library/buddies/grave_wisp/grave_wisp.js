import { GRAVE_WISP_VISUALS as W } from './grave_wisp_visual.js';
import { drawGlow } from '../../core/glow.js';

const TAU = Math.PI * 2;

// --- CAVEIRA VOADORA (Grave Wisp, buddy) ---
// Caveira em chamas que acompanha o herói: brilho roxo, três línguas de fogo subindo e a caveira (crânio, mandíbula e dentes,
// olhos roxos). Desenhada ao vivo (é pequena). x, y: o centro; t: tempo em segundos; flash: 0 normal, > 0 acabou de atirar
// (a chama cresce).
export function drawGraveWisp(g, x, y, t, flash = 0) {
    const fire = flash > 0 ? 1.5 : 1;
    g.save();
    g.globalCompositeOperation = 'lighter';
    drawGlow(g, W.flame, x, y - 4, 15 * fire, 0.75);
    for (let i = 0; i < 3; i++) {
        const up = (t * 1.9 + i / 3) % 1;
        drawGlow(g, W.flameCore, x + Math.sin(t * 7 + i * 2) * 3, y - 6 - up * 12, 6 * (1 - up) + 1, 0.9 * (1 - up));
    }
    g.restore();
    g.fillStyle = W.bone;
    g.beginPath();
    g.arc(x, y - 1, 5.6, 0, TAU);
    g.fill();
    g.fillRect(x - 3, y + 2.5, 6, 3.2);
    g.fillStyle = W.boneShade;
    g.fillRect(x - 1.6, y + 4, 0.8, 1.7);
    g.fillRect(x + 0.8, y + 4, 0.8, 1.7);
    g.fillStyle = W.eye;
    g.beginPath();
    g.arc(x - 2.1, y - 1, 1.4, 0, TAU);
    g.arc(x + 2.1, y - 1, 1.4, 0, TAU);
    g.fill();
}
