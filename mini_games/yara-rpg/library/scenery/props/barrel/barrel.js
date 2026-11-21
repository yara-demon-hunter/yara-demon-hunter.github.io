// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/barrel/barrel.js e rode o sync.
import { registerProp } from '../props.js';
import { BARREL_VISUALS } from './barrel_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'barrel', name: 'Barris e caixotes', kind: 'static', previewSize: 44, visual: BARREL_VISUALS,
    roll(r) {
        const n = 2 + Math.floor(r() * 2);
        return { items: Array.from({ length: n }, (_, i) => ({ x: i * 12 - 6 + (r() - 0.5) * 3, y: (r() - 0.5) * 6, crate: r() < 0.35, s: 0.85 + r() * 0.3 })) };
    },
    draw(g, x, y, a, p) {
        a.items.forEach(it => {
            const px = x + it.x;
            const py = y + it.y;
            g.fillStyle = 'rgba(0, 0, 0, 0.4)';
            g.beginPath(); g.ellipse(px + 2, py + 2, 8 * it.s, 3.4 * it.s, 0, 0, TAU); g.fill();
            if (it.crate) {
                g.fillStyle = p.crate; g.fillRect(px - 7 * it.s, py - 11 * it.s, 14 * it.s, 12 * it.s);
                g.strokeStyle = p.band; g.lineWidth = 1; g.strokeRect(px - 7 * it.s, py - 11 * it.s, 14 * it.s, 12 * it.s);
                g.beginPath(); g.moveTo(px - 7 * it.s, py - 11 * it.s); g.lineTo(px + 7 * it.s, py + 1 * it.s); g.stroke();
            } else {
                g.fillStyle = p.wood; g.fillRect(px - 6 * it.s, py - 12 * it.s, 12 * it.s, 12 * it.s);
                g.beginPath(); g.ellipse(px, py, 6 * it.s, 2.6 * it.s, 0, 0, TAU); g.fill();
                g.fillStyle = p.band; g.fillRect(px - 6 * it.s, py - 9 * it.s, 12 * it.s, 1.4); g.fillRect(px - 6 * it.s, py - 4 * it.s, 12 * it.s, 1.4);
                g.fillStyle = p.top; g.beginPath(); g.ellipse(px, py - 12 * it.s, 6 * it.s, 2.6 * it.s, 0, 0, TAU); g.fill();
            }
        });
    }
});
