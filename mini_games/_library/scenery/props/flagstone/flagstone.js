import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { FLAGSTONE_VISUALS } from './flagstone_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'flagstone', name: 'Laje de pedra', kind: 'static', previewSize: 60, visual: FLAGSTONE_VISUALS,
    roll(r, p) {
        return {
            w: randomRange(r, p.width[0], p.width[1]), h: randomRange(r, p.height[0], p.height[1]), angle: (r() - 0.5) * 0.12, shade: 0.7 + r() * 0.3,
            crack: Array.from({ length: 4 }, () => [r(), r()]), hasCrack: r() < 0.6
        };
    },
    draw(g, x, y, a, p) {
        g.save();
        g.translate(x, y);
        g.rotate(a.angle);
        g.fillStyle = 'rgba(0, 0, 0, 0.5)';
        g.fillRect(-a.w / 2 - 1, -a.h / 2 - 1, a.w + 2, a.h + 2);
        g.fillStyle = p.slab;
        g.globalAlpha = a.shade;
        g.fillRect(-a.w / 2, -a.h / 2, a.w, a.h);
        g.globalAlpha = 1;
        g.fillStyle = p.light;
        g.fillRect(-a.w / 2, -a.h / 2, a.w, 2);
        g.fillRect(-a.w / 2, -a.h / 2, 2, a.h);
        if (a.hasCrack) {
            g.strokeStyle = p.crack;
            g.lineWidth = 0.9;
            g.beginPath();
            g.moveTo(-a.w / 2 + a.crack[0][0] * a.w, -a.h / 2);
            g.lineTo(-a.w / 2 + a.crack[1][0] * a.w, 0);
            g.lineTo(-a.w / 2 + a.crack[2][0] * a.w, a.h * (a.crack[2][1] - 0.5));
            g.lineTo(-a.w / 2 + a.crack[3][0] * a.w, a.h / 2);
            g.stroke();
        }
        g.restore();
    }
});
