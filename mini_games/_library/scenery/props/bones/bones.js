import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { BONES_VISUALS } from './bones_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'bones', name: 'Ossos', kind: 'static', previewSize: 44, visual: BONES_VISUALS,
    roll(r, p) {
        return { len: randomRange(r, p.length[0], p.length[1]), angle: r() * TAU, skull: r() < 0.22, ribs: r() < 0.35, other: r() * TAU };
    },
    draw(g, x, y, a, p) {
        const bone = (angle, len) => {
            const dx = Math.cos(angle) * len / 2;
            const dy = Math.sin(angle) * len / 2;
            g.strokeStyle = p.shade;
            g.lineWidth = 2.6;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(x - dx + 1, y - dy + 1.4);
            g.lineTo(x + dx + 1, y + dy + 1.4);
            g.stroke();
            g.strokeStyle = p.bone;
            g.lineWidth = 1.7;
            g.beginPath();
            g.moveTo(x - dx, y - dy);
            g.lineTo(x + dx, y + dy);
            g.stroke();
            g.fillStyle = p.bone;
            [[-dx, -dy], [dx, dy]].forEach(([ox, oy]) => {
                g.beginPath();
                g.arc(x + ox - 0.8, y + oy, 1.6, 0, TAU);
                g.arc(x + ox + 0.8, y + oy, 1.6, 0, TAU);
                g.fill();
            });
        };
        bone(a.angle, a.len);
        bone(a.other, a.len * 0.75);
        if (a.ribs) {
            g.strokeStyle = p.bone;
            g.lineWidth = 1.2;
            for (let i = 0; i < 3; i++) {
                g.beginPath();
                g.arc(x + 9, y - 3 + i * 3.2, 4.2, -1.2, 1.2);
                g.stroke();
            }
        }
        if (a.skull) {
            g.fillStyle = p.shade;
            g.beginPath();
            g.ellipse(x - 8, y + 4, 4.6, 4.1, 0, 0, TAU);
            g.fill();
            g.fillStyle = p.bone;
            g.beginPath();
            g.ellipse(x - 8.4, y + 3.4, 4.3, 3.8, 0, 0, TAU);
            g.fill();
            g.fillStyle = '#10100c';
            g.beginPath();
            g.arc(x - 9.9, y + 3.2, 1.1, 0, TAU);
            g.arc(x - 6.9, y + 3.2, 1.1, 0, TAU);
            g.fill();
        }
    }
});
