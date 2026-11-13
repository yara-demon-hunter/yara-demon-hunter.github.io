// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/stump/stump.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { taper } from '../../scenery_kit.js';
import { registerProp } from '../props.js';
import { STUMP_VISUALS } from './stump_visual.js';

const TAU = Math.PI * 2;

// Toco visto de cima: o corte com os anéis, 3 raízes curtas e grossas e musgo. Estática.
// (Raízes pontudas pareciam espinhos de armadilha: ficam curtas, grossas e arredondadas.)
registerProp({
    id: 'stump', name: 'Toco', kind: 'static', previewSize: 70, visual: STUMP_VISUALS,
    roll(r, p) {
        return { radius: randomRange(r, p.radius[0], p.radius[1]), sides: [r(), r(), r()] };
    },
    draw(g, x, y, a, p) {
        const r0 = a.radius;
        g.fillStyle = 'rgba(0, 0, 0, 0.35)';
        g.beginPath();
        g.ellipse(x + 2.5, y + 3.5, r0 * 1.15, r0 * 1.05, 0, 0, TAU);
        g.fill();
        a.sides.forEach((s, k) => {
            const ang = (k / 3) * TAU + s;
            taper(g, x + Math.cos(ang) * r0 * 0.7, y + Math.sin(ang) * r0 * 0.7, x + Math.cos(ang + 0.3) * r0 * 1.3, y + Math.sin(ang + 0.3) * r0 * 1.3,
                x + Math.cos(ang + 0.12) * r0 * 1.42, y + Math.sin(ang + 0.12) * r0 * 1.42, r0 * 0.62, r0 * 0.3, p.bark);
        });
        g.fillStyle = p.bark;
        g.beginPath();
        g.arc(x, y, r0, 0, TAU);
        g.fill();
        g.fillStyle = p.top;
        g.beginPath();
        g.arc(x, y, r0 * 0.82, 0, TAU);
        g.fill();
        g.strokeStyle = p.ring;
        g.lineWidth = 0.9;
        g.globalAlpha = 0.9;
        [0.62, 0.36].forEach(k => {
            g.beginPath();
            g.arc(x, y, r0 * k, 0, TAU);
            g.stroke();
        });
        g.globalAlpha = 0.55;
        g.fillStyle = p.moss;
        g.beginPath();
        g.ellipse(x - r0 * 0.3, y + r0 * 0.25, r0 * 0.45, r0 * 0.3, 0.5, 0, TAU);
        g.fill();
        g.globalAlpha = 1;
    }
});
