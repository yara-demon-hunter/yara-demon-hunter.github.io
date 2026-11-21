// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/puddle/puddle.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { PUDDLE_VISUALS } from './puddle_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'puddle', name: 'Poça', kind: 'static', previewSize: 56, visual: PUDDLE_VISUALS,
    roll(r, p) {
        return { rx: randomRange(r, p.radius[0], p.radius[1]), ry: 0.45 + r() * 0.2, angle: (r() - 0.5) * 0.4, alpha: 0.7 + r() * 0.25 };
    },
    draw(g, x, y, a, p) {
        g.fillStyle = p.rim;
        g.beginPath();
        g.ellipse(x, y, a.rx + 1.6, a.rx * a.ry + 1.6, a.angle, 0, TAU);
        g.fill();
        g.fillStyle = p.water;
        g.globalAlpha = a.alpha;
        g.beginPath();
        g.ellipse(x, y, a.rx, a.rx * a.ry, a.angle, 0, TAU);
        g.fill();
        g.globalAlpha = 1;
        g.fillStyle = p.shine;
        g.beginPath();
        g.ellipse(x - a.rx * 0.28, y - a.rx * a.ry * 0.3, a.rx * 0.35, a.rx * a.ry * 0.14, a.angle, 0, TAU);
        g.fill();
    }
});
