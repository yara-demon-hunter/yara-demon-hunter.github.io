// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/ripple/ripple.js e rode o sync.
import { registerProp } from '../props.js';
import { RIPPLE_VISUALS } from './ripple_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'ripple', name: 'Ondulação na água', kind: 'animated', desync: true, anim: { frames: [10, 6, 4], size: 1.4, cycleSeconds: 2.8 }, visual: RIPPLE_VISUALS,
    cell: [48, 26], anchor: [0.5, 0.5], variants: 2,
    paint(g, r, phase, p) {
        const base = 0.7 + r() * 0.5;
        // A gota só cai em parte do ciclo (`activeShare`); no resto a água fica parada. Com `desync` cada ondulação tem seu próprio ritmo.
        if (phase >= p.activeShare) return;
        const own = phase / p.activeShare;
        for (let k = 0; k < p.rings; k++) {
            const t = own - k * 0.3;                 // o segundo anel nasce um pouco depois do primeiro
            if (t < 0) continue;
            const rad = 3 + t * p.maxRadius * base;
            g.strokeStyle = p.ring;
            g.globalAlpha = (1 - t) * (1 - t);
            g.lineWidth = 1.1 - t * 0.5;
            g.beginPath();
            g.ellipse(0, 0, rad, rad * 0.42, 0, 0, TAU);
            g.stroke();
        }
        g.globalAlpha = 1;
    }
});
