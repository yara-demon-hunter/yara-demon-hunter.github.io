import { registerProp } from '../props.js';
import { WELL_VISUALS } from './well_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'well', name: 'Poço', kind: 'static', previewSize: 50, visual: WELL_VISUALS,
    roll(r) { return { flip: r() < 0.5 ? -1 : 1 }; },
    draw(g, x, y, a, p) {
        g.fillStyle = 'rgba(0, 0, 0, 0.4)';
        g.beginPath(); g.ellipse(x + 3, y + 3, 15, 6, 0, 0, TAU); g.fill();
        g.fillStyle = p.stoneDark;
        g.beginPath(); g.ellipse(x, y, 13, 6.4, 0, 0, TAU); g.fill();
        g.fillRect(x - 13, y - 9, 26, 9);
        g.fillStyle = p.stone;
        g.beginPath(); g.ellipse(x, y - 9, 13, 6.4, 0, 0, TAU); g.fill();
        g.fillStyle = p.water;
        g.beginPath(); g.ellipse(x, y - 9, 9.5, 4.4, 0, 0, TAU); g.fill();
        g.fillStyle = p.wood;
        g.fillRect(x - 12, y - 30, 2.6, 22); g.fillRect(x + 9.4, y - 30, 2.6, 22);
        g.fillRect(x - 13, y - 31, 26, 2.4);
        g.fillStyle = p.roof;
        g.beginPath(); g.moveTo(x - 16, y - 30); g.lineTo(x, y - 39); g.lineTo(x + 16, y - 30); g.closePath(); g.fill();
    }
});
