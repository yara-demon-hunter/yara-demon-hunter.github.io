import { GUARDIAN_ANGEL_VISUALS as O } from './guardian_angel_visual.js';
import { drawGlow } from '../../core/glow.js';

// A bola de luz que o cajado do anjo guardião lança (centro em x, y, em pixels do mundo)
export function drawGuardianOrb(g, x, y) {
    const C = O.colors;
    drawGlow(g, C.shotGlow, x, y, 12, 0.55);
    drawGlow(g, C.orbGlow, x, y, 7, 0.85);
    g.globalAlpha = 0.95;
    g.fillStyle = C.shot;
    g.beginPath();
    g.arc(x, y, 3, 0, Math.PI * 2);
    g.fill();
}
