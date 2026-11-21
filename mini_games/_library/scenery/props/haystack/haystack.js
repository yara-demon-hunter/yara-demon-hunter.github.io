import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { HAYSTACK_VISUALS } from './haystack_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'haystack', name: 'Palheiro', kind: 'static', previewSize: 50, visual: HAYSTACK_VISUALS,
    roll(r, p) { return { rad: randomRange(r, p.radius[0], p.radius[1]), strokes: Array.from({ length: 9 }, () => [r(), r()]) }; },
    draw(g, x, y, a, p) {
        const R = a.rad;
        g.fillStyle = 'rgba(0, 0, 0, 0.4)';
        g.beginPath(); g.ellipse(x + 3, y + 2, R * 1.05, R * 0.4, 0, 0, TAU); g.fill();
        g.fillStyle = p.strawDark;
        g.beginPath(); g.moveTo(x - R, y); g.quadraticCurveTo(x - R * 0.9, y - R * 1.4, x, y - R * 1.5); g.quadraticCurveTo(x + R * 0.9, y - R * 1.4, x + R, y); g.closePath(); g.fill();
        g.fillStyle = p.straw;
        g.beginPath(); g.moveTo(x - R * 0.8, y - 1); g.quadraticCurveTo(x - R * 0.7, y - R * 1.3, x - R * 0.1, y - R * 1.45); g.quadraticCurveTo(x + R * 0.5, y - R * 1.1, x + R * 0.4, y - 1); g.closePath(); g.fill();
        g.strokeStyle = p.strawDark;
        g.lineWidth = 0.7;
        a.strokes.forEach(([u, v]) => {
            g.beginPath(); g.moveTo(x - R * 0.7 + u * R * 1.2, y - 2 - v * R * 0.4); g.lineTo(x - R * 0.6 + u * R * 1.2, y - R * (0.6 + v * 0.7)); g.stroke();
        });
    }
});
