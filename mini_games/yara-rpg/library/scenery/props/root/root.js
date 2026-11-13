// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/root/root.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { taper } from '../../scenery_kit.js';
import { registerProp } from '../props.js';
import { ROOT_VISUALS } from './root_visual.js';

const TAU = Math.PI * 2;

// Raiz atravessando o chão: um traço grosso que afina, com um fio de luz por cima. Estática.
registerProp({
    id: 'root', name: 'Raiz', kind: 'static', previewSize: 70, visual: ROOT_VISUALS,
    roll(r, p) {
        return { angle: r() * TAU, length: randomRange(r, p.length[0], p.length[1]), bend: (r() - 0.5) * 1.2, width: randomRange(r, p.width[0], p.width[1]) };
    },
    draw(g, x, y, a, p) {
        const ex = x + Math.cos(a.angle + a.bend * 0.5) * a.length;
        const ey = y + Math.sin(a.angle + a.bend * 0.5) * a.length;
        const cx = x + Math.cos(a.angle - a.bend) * a.length * 0.5;
        const cy = y + Math.sin(a.angle - a.bend) * a.length * 0.5;
        taper(g, x, y, cx, cy, ex, ey, a.width, 0.6, p.color);
        g.globalAlpha = 0.5;
        taper(g, x - 0.9, y - 1.1, cx - 0.9, cy - 1.1, ex - 0.5, ey - 0.7, a.width * 0.35, 0.2, p.light);
        g.globalAlpha = 1;
    }
});
