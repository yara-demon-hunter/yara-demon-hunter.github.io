// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/pebbles/pebbles.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { PEBBLES_VISUALS } from './pebbles_visual.js';

const TAU = Math.PI * 2;

// Pedrinha: uma elipse minúscula. Estática.
registerProp({
    id: 'pebbles', name: 'Pedrinha', kind: 'static', previewSize: 20, visual: PEBBLES_VISUALS,
    roll(r, p) {
        return { rx: randomRange(r, p.length[0], p.length[1]), ry: randomRange(r, p.width[0], p.width[1]), rotation: r() * Math.PI };
    },
    draw(g, x, y, a, p) {
        g.fillStyle = p.color;
        g.beginPath();
        g.ellipse(x, y, a.rx, a.ry, a.rotation, 0, TAU);
        g.fill();
    }
});
