import { registerProp } from '../props.js';
import { CART_VISUALS } from './cart_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'cart', name: 'Carroça', kind: 'static', previewSize: 60, visual: CART_VISUALS,
    roll(r) { return { angle: (r() - 0.5) * 0.5, loaded: r() < 0.6 }; },
    draw(g, x, y, a, p) {
        g.save();
        g.translate(x, y);
        g.rotate(a.angle);
        g.fillStyle = 'rgba(0, 0, 0, 0.4)';
        g.beginPath(); g.ellipse(3, 5, 26, 7, 0, 0, TAU); g.fill();
        g.fillStyle = p.wheel;
        [-14, 14].forEach(wx => { g.beginPath(); g.ellipse(wx, 3, 3.2, 8, 0, 0, TAU); g.fill(); });
        g.fillStyle = p.woodDark;
        g.fillRect(-22, -12, 44, 16);
        g.fillStyle = p.wood;
        g.fillRect(-21, -11, 42, 14);
        if (a.loaded) {
            g.fillStyle = p.hay;
            g.beginPath(); g.ellipse(0, -11, 19, 6, 0, Math.PI, TAU); g.fill();
        }
        g.strokeStyle = p.woodDark;
        g.lineWidth = 1;
        for (let k = -14; k <= 14; k += 7) { g.beginPath(); g.moveTo(k, -11); g.lineTo(k, 3); g.stroke(); }
        g.fillStyle = p.woodDark;
        g.fillRect(22, -3, 16, 2.4);
        g.restore();
    }
});
