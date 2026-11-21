import { registerProp } from '../props.js';
import { RIPPLE_VISUALS } from './ripple_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'ripple', name: 'Ondulação na água', kind: 'animated', anim: { frames: [10, 6, 4], size: 1.4, cycleSeconds: 2.8 }, visual: RIPPLE_VISUALS,
    cell: [48, 26], anchor: [0.5, 0.5], variants: 2,
    paint(g, r, phase, p) {
        const base = 0.7 + r() * 0.5;
        for (let k = 0; k < p.rings; k++) {
            const t = (phase + k / p.rings) % 1;
            const rad = 3 + t * p.maxRadius * base;
            g.strokeStyle = p.ring;
            g.globalAlpha = (1 - t) * (1 - t);
            g.lineWidth = 1.1 - t * 0.5;
            g.beginPath();
            g.ellipse(0, 0, rad, rad * 0.42, 0, 0, TAU);
            g.stroke();
        }
        g.globalAlpha = 1;
    }
});
