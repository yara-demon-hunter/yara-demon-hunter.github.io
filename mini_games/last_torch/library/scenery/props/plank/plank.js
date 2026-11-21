// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/plank/plank.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { PLANK_VISUALS } from './plank_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'plank', name: 'Tábua', kind: 'static', previewSize: 56, visual: PLANK_VISUALS,
    roll(r, p) {
        return { len: randomRange(r, p.length[0], p.length[1]), angle: (r() - 0.5) * 0.5, shade: 0.7 + r() * 0.3, grain: [r(), r(), r()] };
    },
    draw(g, x, y, a, p) {
        g.save();
        g.translate(x, y);
        g.rotate(a.angle);
        g.fillStyle = 'rgba(0, 0, 0, 0.35)';
        g.fillRect(-a.len / 2 + 1.5, -p.width / 2 + 2, a.len, p.width);
        g.fillStyle = p.edge;
        g.fillRect(-a.len / 2, -p.width / 2, a.len, p.width);
        g.fillStyle = p.wood;
        g.globalAlpha = a.shade;
        g.fillRect(-a.len / 2 + 0.8, -p.width / 2 + 0.8, a.len - 1.6, p.width - 1.6);
        g.globalAlpha = 1;
        g.strokeStyle = p.grain;
        g.lineWidth = 0.6;
        a.grain.forEach((v, i) => {
            g.beginPath();
            g.moveTo(-a.len / 2 + 2, -p.width / 2 + 1.6 + i * 1.7);
            g.lineTo(a.len / 2 - 2 - v * 8, -p.width / 2 + 1.6 + i * 1.7 + (v - 0.5));
            g.stroke();
        });
        g.restore();
    }
});
