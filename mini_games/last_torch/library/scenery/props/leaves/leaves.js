// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/leaves/leaves.js e rode o sync.
import { pick, randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { LEAVES_VISUALS } from './leaves_visual.js';

const TAU = Math.PI * 2;

// Folha caída: uma elipse pequena girada. Estática.
registerProp({
    id: 'leaves', name: 'Folha caída', kind: 'static', previewSize: 30, visual: LEAVES_VISUALS,
    roll(r, p) {
        return { rotation: r() * Math.PI, color: pick(r, p.colors), rx: randomRange(r, p.length[0], p.length[1]), ry: randomRange(r, p.width[0], p.width[1]) };
    },
    draw(g, x, y, a) {
        g.save();
        g.translate(x, y);
        g.rotate(a.rotation);
        g.fillStyle = a.color;
        g.beginPath();
        g.ellipse(0, 0, a.rx, a.ry, 0, 0, TAU);
        g.fill();
        g.restore();
    }
});
