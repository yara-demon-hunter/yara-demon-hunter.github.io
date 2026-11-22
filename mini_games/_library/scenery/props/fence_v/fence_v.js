import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { FENCE_V_VISUALS } from './fence_v_visual.js';

// Cerca de madeira no sentido vertical da tela (o par da `fence`, que é horizontal), em 2,5D: os mourões aparecem de frente, em fila de
// cima para baixo, e os dois trilhos viram vigas finas que sobem entre eles. Estática. Dá para girar no editor.
registerProp({
    id: 'fence_v', name: 'Cerca de madeira (vertical)', kind: 'static', previewSize: 100, visual: FENCE_V_VISUALS,
    ranges: { fixedLength: [0, 1200, 1, 'Comprimento (0 = sorteado)'] },
    extent: (p) => (p.fixedLength > 0 ? p.fixedLength : (p.length[0] + p.length[1]) / 2) + 20,       // maior dimensão (área de clique e sprite)
    roll(r, p) {
        return { len: randomRange(r, p.length[0], p.length[1]), tilt: (r() - 0.5) * 0.08, broken: r() < 0.3 ? Math.floor(r() * 3) : -1 };
    },
    draw(g, x, y, a, p) {
        const len = p.fixedLength > 0 ? p.fixedLength : a.len;       // fixedLength: comprimento EXATO (alonga ou encurta a cerca no editor, sem mudar a altura)
        g.save();
        g.translate(x, y);
        g.rotate(a.tilt);
        const n = Math.max(2, Math.round(len / p.spacing));
        const step = len / (n - 1);
        const top = -len / 2;
        // sombra no chão, ao longo da fila
        g.fillStyle = 'rgba(0, 0, 0, 0.35)';
        g.fillRect(-2, top + 4, 8, len + 4);
        // trilhos: duas vigas finas, uma mais alta (atrás) e outra mais baixa, ligando os mourões
        g.fillStyle = p.rail;
        g.fillRect(-4.2, top - 9, 2.8, len);
        g.fillRect(1.4, top - 3, 2.8, len);
        // mourões de cima para baixo: os de baixo (mais perto) por último
        for (let i = 0; i < n; i++) {
            if (i === a.broken) continue;
            const py = top + i * step;
            g.fillStyle = p.post;
            g.fillRect(-2.8, py - 11, 5.6, 14);
            g.fillStyle = 'rgba(0, 0, 0, 0.3)';
            g.fillRect(-2.8, py + 3, 5.6, 2);
            g.fillStyle = p.post;
            g.fillStyle = p.top;
            g.fillRect(-3.4, py - 13, 6.8, 3);
        }
        g.restore();
    }
});
