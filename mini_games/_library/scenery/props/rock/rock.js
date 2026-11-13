import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { ROCK_VISUALS } from './rock_visual.js';

const TAU = Math.PI * 2;

// Pedra com o topo pegando luz e um pouco de musgo: um polígono de 9 pontos irregulares. Estática.
registerProp({
    id: 'rock', name: 'Pedra', kind: 'static', previewSize: 60, visual: ROCK_VISUALS,
    roll(r, p) {
        return {
            radius: randomRange(r, p.radius[0], p.radius[1]),
            radii: Array.from({ length: 9 }, () => 0.8 + r() * 0.4),
            mossAt: [Math.floor(r() * 9), Math.floor(r() * 9)]
        };
    },
    draw(g, x, y, a, p) {
        const R = a.radius;
        const outline = (scale, ox, oy) => {
            g.beginPath();
            a.radii.forEach((rr, k) => {
                const ang = (k / 9) * TAU;
                const px = x + ox + Math.cos(ang) * R * rr * scale;
                const py = y + oy + Math.sin(ang) * R * rr * 0.85 * scale;
                if (k) g.lineTo(px, py); else g.moveTo(px, py);
            });
            g.closePath();
        };
        g.fillStyle = 'rgba(0, 0, 0, 0.38)';
        g.beginPath();
        g.ellipse(x + 3, y + R * 0.55, R * 1.1, R * 0.5, 0, 0, TAU);
        g.fill();
        g.fillStyle = p.rock;
        outline(1, 0, 0);
        g.fill();
        g.fillStyle = p.light;
        g.globalAlpha = 0.5;
        outline(0.62, -R * 0.18, -R * 0.22);
        g.fill();
        g.fillStyle = p.moss;
        g.globalAlpha = 0.6;
        a.mossAt.forEach(k => {
            const ang = (k / 9) * TAU;
            g.beginPath();
            g.ellipse(x + Math.cos(ang) * R * 0.6, y + Math.sin(ang) * R * 0.5, R * 0.3, R * 0.17, ang, 0, TAU);
            g.fill();
        });
        g.globalAlpha = 1;
    }
});
