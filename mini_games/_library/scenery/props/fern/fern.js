import { taper } from '../../scenery_kit.js';
import { registerProp } from '../props.js';
import { FERN_VISUALS } from './fern_visual.js';

const TAU = Math.PI * 2;

// Samambaia vista de cima: folhas que saem do centro e arqueiam, cada uma balançando em fase própria.
// Animada (atlas): phase de 0 a 1 é um ciclo de balanço.
registerProp({
    id: 'fern', name: 'Samambaia', kind: 'animated', visual: FERN_VISUALS,
    cell: [48, 48], anchor: [0.5, 0.5], variants: 3,
    paint(g, r, phase, p) {
        const n = 9 + Math.floor(r() * 4);
        g.fillStyle = p.heart;
        g.beginPath();
        g.arc(0, 0, 2.2, 0, TAU);
        g.fill();
        for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU + (r() - 0.5) * 0.35 + p.sway * Math.sin(phase * TAU + i * 0.9);
            const len = 11 + r() * 7;
            const bend = (r() - 0.5) * 0.8;
            const ex = Math.cos(a + bend * 0.3) * len;
            const ey = Math.sin(a + bend * 0.3) * len;
            const cx = Math.cos(a - bend * 0.4) * len * 0.5;
            const cy = Math.sin(a - bend * 0.4) * len * 0.5;
            taper(g, 0, 0, cx, cy, ex, ey, 0.95, 0.2, p.frond);
            g.strokeStyle = p.frond;
            g.lineWidth = 0.55;
            for (let k = 1; k < 9; k++) {
                const t = k / 9;
                const u = 1 - t;
                const x = 2 * u * t * cx + t * t * ex;
                const y = 2 * u * t * cy + t * t * ey;
                const tx = 2 * u * cx + 2 * t * (ex - cx);
                const ty = 2 * u * cy + 2 * t * (ey - cy);
                const tl = Math.hypot(tx, ty) || 1;
                const l = (1 - t) * 3.4 + 0.8;
                g.beginPath();
                g.moveTo(x - (ty / tl) * l + (tx / tl) * l * 0.55, y + (tx / tl) * l + (ty / tl) * l * 0.55);
                g.lineTo(x, y);
                g.lineTo(x + (ty / tl) * l + (tx / tl) * l * 0.55, y - (tx / tl) * l + (ty / tl) * l * 0.55);
                g.stroke();
            }
        }
    }
});
