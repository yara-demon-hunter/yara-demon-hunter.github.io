// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/grass/grass.js e rode o sync.
import { taper } from '../../scenery_kit.js';
import { registerProp } from '../props.js';
import { GRASS_VISUALS } from './grass_visual.js';

const TAU = Math.PI * 2;

// Tufo de capim: lâminas que se curvam com a rajada. Animada (atlas).
registerProp({
    id: 'grass', name: 'Capim', kind: 'animated', visual: GRASS_VISUALS,
    cell: [22, 24], anchor: [0.5, 0.92], variants: 3,
    paint(g, r, phase, p) {
        const n = 7 + Math.floor(r() * 4);
        for (let i = 0; i < n; i++) {
            const x0 = (r() - 0.5) * 7;
            const h = 6 + r() * 7;
            const lean = (r() - 0.5) * 4;
            const bend = p.bend * Math.sin(phase * TAU + x0 * 0.3);
            taper(g, x0, 0, x0 + (lean + bend) * 0.3, -h * 0.6, x0 + lean + bend, -h, 0.75, 0.12, p.blade);
        }
    }
});
