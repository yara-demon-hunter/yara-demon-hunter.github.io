// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/reed/reed.js e rode o sync.
import { taper } from '../../scenery_kit.js';
import { registerProp } from '../props.js';
import { REED_VISUALS } from './reed_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'reed', name: 'Junco', kind: 'animated', anim: { frames: [8, 6, 4], size: 1.5, cycleSeconds: 3.2 }, visual: REED_VISUALS,
    cell: [40, 54], anchor: [0.5, 0.92], variants: 3,
    paint(g, r, phase, p) {
        const n = 6 + Math.floor(r() * 4);
        for (let i = 0; i < n; i++) {
            const baseX = (r() - 0.5) * 10;
            const lean = (r() - 0.5) * 0.5;
            const len = 20 + r() * 16;
            const hasHead = r() < 0.4;
            const swing = lean + p.sway * Math.sin(phase * TAU + i * 0.8);
            const tx = baseX + Math.sin(swing) * len;
            const ty = -Math.cos(swing) * len;
            taper(g, baseX, 0, baseX + Math.sin(lean * 0.4) * len * 0.5, -len * 0.5, tx, ty, 1.5, 0.3, i % 2 ? p.blade : p.blade2);
            if (hasHead) {
                g.fillStyle = p.head;
                g.beginPath();
                g.ellipse(tx, ty + 2.5, 1.7, 4.4, swing, 0, TAU);
                g.fill();
            }
        }
    }
});
