// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/fence/fence.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { FENCE_VISUALS } from './fence_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'fence', name: 'Cerca de madeira (horizontal)', kind: 'static', previewSize: 100, visual: FENCE_VISUALS,
    roll(r, p) {
        return { len: randomRange(r, p.length[0], p.length[1]), tilt: (r() - 0.5) * 0.08, broken: r() < 0.3 ? Math.floor(r() * 3) : -1 };
    },
    draw(g, x, y, a, p) {
        g.save();
        g.translate(x, y);
        g.rotate(a.tilt);
        const n = Math.max(2, Math.round(a.len / p.spacing));
        const step = a.len / (n - 1);
        g.fillStyle = 'rgba(0, 0, 0, 0.35)';
        g.fillRect(-a.len / 2, 4, a.len, 3);
        g.fillStyle = p.rail;
        g.fillRect(-a.len / 2, -2, a.len, 2.4);
        g.fillRect(-a.len / 2, -7, a.len, 2.4);
        for (let i = 0; i < n; i++) {
            if (i === a.broken) continue;
            const px = -a.len / 2 + i * step;
            g.fillStyle = p.post;
            g.fillRect(px - 1.8, -11, 3.6, 16);
            g.fillStyle = p.top;
            g.fillRect(px - 1.8, -11, 3.6, 2.2);
        }
        g.restore();
    }
});
