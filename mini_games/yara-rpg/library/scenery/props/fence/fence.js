// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/fence/fence.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { FENCE_VISUALS } from './fence_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'fence', name: 'Cerca de madeira (horizontal)', kind: 'static', previewSize: 100, visual: FENCE_VISUALS,
    ranges: { fixedLength: [0, 1200, 1, 'Comprimento (0 = sorteado)'] },
    extent: (p) => (p.fixedLength > 0 ? p.fixedLength : (p.length[0] + p.length[1]) / 2) + 20,       // maior dimensão (área de clique e sprite)
    roll(r, p) {
        return { len: randomRange(r, p.length[0], p.length[1]), tilt: (r() - 0.5) * 0.08, broken: r() < 0.3 ? Math.floor(r() * 3) : -1 };
    },
    draw(g, x, y, a, p) {
        const len = p.fixedLength > 0 ? p.fixedLength : a.len;       // fixedLength: comprimento EXATO (alonga ou encurta a cerca no editor, sem mudar a altura)
        g.save();
        g.translate(x, y);
        g.rotate(a.tilt);
        const n = Math.max(2, Math.round(len / p.spacing));
        const step = len / (n - 1);
        g.fillStyle = 'rgba(0, 0, 0, 0.35)';
        g.fillRect(-len / 2, 4, len, 3);
        g.fillStyle = p.rail;
        g.fillRect(-len / 2, -2, len, 2.4);
        g.fillRect(-len / 2, -7, len, 2.4);
        for (let i = 0; i < n; i++) {
            if (i === a.broken) continue;
            const px = -len / 2 + i * step;
            g.fillStyle = p.post;
            g.fillRect(px - 1.8, -11, 3.6, 16);
            g.fillStyle = p.top;
            g.fillRect(px - 1.8, -11, 3.6, 2.2);
        }
        g.restore();
    }
});
