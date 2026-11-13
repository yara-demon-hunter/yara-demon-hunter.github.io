// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/moss/moss.js e rode o sync.
import { pick, randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { MOSS_VISUALS } from './moss_visual.js';

// Mancha de musgo: um círculo com degradê que some nas bordas. Estática (pintada no chão uma vez).
registerProp({
    id: 'moss', name: 'Musgo', kind: 'static', previewSize: 240, visual: MOSS_VISUALS,
    roll(r, p) {
        return { radius: randomRange(r, p.radius[0], p.radius[1]), color: pick(r, p.colors) };
    },
    draw(g, x, y, a) {
        const grad = g.createRadialGradient(x, y, 0, x, y, a.radius);
        grad.addColorStop(0, a.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = grad;
        g.fillRect(x - a.radius, y - a.radius, a.radius * 2, a.radius * 2);
    }
});
