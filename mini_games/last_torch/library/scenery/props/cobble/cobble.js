// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/cobble/cobble.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { COBBLE_VISUALS } from './cobble_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'cobble', name: 'Calçada', kind: 'static', previewSize: 44, visual: COBBLE_VISUALS,
    roll(r, p) {
        const n = Math.round(randomRange(r, p.count[0], p.count[1]));
        return { stones: Array.from({ length: n }, () => ({ x: (r() - 0.5) * p.spread * 2, y: (r() - 0.5) * p.spread * 1.5, rx: 4.5 + r() * 3, shade: r() })) };
    },
    draw(g, x, y, a, p) {
        a.stones.forEach(s => {
            g.fillStyle = p.dark;
            g.beginPath();
            g.ellipse(x + s.x, y + s.y + 1, s.rx + 1.2, s.rx * 0.78 + 1.2, 0, 0, TAU);
            g.fill();
            g.fillStyle = p.stone;
            g.globalAlpha = 0.65 + s.shade * 0.35;
            g.beginPath();
            g.ellipse(x + s.x, y + s.y, s.rx, s.rx * 0.78, 0, 0, TAU);
            g.fill();
            g.globalAlpha = 1;
            g.fillStyle = p.light;
            g.beginPath();
            g.ellipse(x + s.x - s.rx * 0.2, y + s.y - s.rx * 0.22, s.rx * 0.55, s.rx * 0.32, 0, 0, TAU);
            g.fill();
        });
    }
});
