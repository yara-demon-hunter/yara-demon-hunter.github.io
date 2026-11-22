import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { IRON_FENCE_VISUALS } from './iron_fence_visual.js';

const TAU = Math.PI * 2;

// Cerca de ferro forjado em 2,5D: barras verticais com ponta de lança entre dois trilhos, e um pilar de pedra em cada ponta.
// Estática; encaixa de ponta com ponta (o comprimento é sorteado) e dá para girar no editor. Mesma ideia da `fence` de madeira.
registerProp({
    id: 'iron_fence', name: 'Cerca de ferro', kind: 'static', previewSize: 140, visual: IRON_FENCE_VISUALS,
    // O editor (tools/scenery_editor.html) mostra estes controles por objeto: chave do visual -> [mín., máx., passo, rótulo]
    ranges: { fixedLength: [0, 1200, 1, 'Comprimento (0 = sorteado)'], height: [16, 80, 1, 'Altura das barras'], spacing: [4, 16, 0.5, 'Espaço entre barras'] },
    extent: (p) => (p.fixedLength > 0 ? p.fixedLength : (p.length[0] + p.length[1]) / 2) + 20,       // maior dimensão (área de clique e sprite)
    roll(r, p) {
        return { len: randomRange(r, p.length[0], p.length[1]), tilt: (r() - 0.5) * 0.03, broken: r() < 0.25 ? 1 + Math.floor(r() * 8) : -1 };
    },
    draw(g, x, y, a, p) {
        const H = p.height;
        g.save();
        g.translate(x, y);
        g.rotate(a.tilt);
        const len = p.fixedLength > 0 ? p.fixedLength : a.len;
        const half = len / 2;
        g.fillStyle = 'rgba(0, 0, 0, 0.38)';
        g.fillRect(-half + 3, 1, len, 4);
        // trilhos
        g.fillStyle = p.iron;
        g.fillRect(-half, -H * 0.28, len, 2.6);
        g.fillRect(-half, -H * 0.78, len, 2.6);
        // barras com ponta de lança
        const n = Math.max(3, Math.round(len / p.spacing));
        for (let i = 0; i <= n; i++) {
            if (i === a.broken) continue;
            const bx = -half + (i / n) * len;
            const tall = i % 4 === 0 ? 6 : 0;
            g.fillStyle = p.iron;
            g.fillRect(bx - 1.1, -H - tall, 2.2, H + tall);
            g.fillStyle = p.light;
            g.fillRect(bx - 1.1, -H - tall, 0.7, H + tall);
            g.fillStyle = p.tip;
            g.beginPath(); g.moveTo(bx - 2.4, -H - tall); g.lineTo(bx, -H - tall - 6.5); g.lineTo(bx + 2.4, -H - tall); g.closePath(); g.fill();
        }
        // pilares de pedra nas pontas, com bola no alto
        [-half - 3, half + 3].forEach(px => {
            g.fillStyle = 'rgba(0, 0, 0, 0.3)'; g.fillRect(px - 4, -H - 4, 8, H + 6);
            g.fillStyle = p.post; g.fillRect(px - 4.5, -H - 6, 9, H + 6);
            g.fillStyle = 'rgba(225, 232, 255, 0.22)'; g.fillRect(px - 4.5, -H - 6, 2, H + 6);
            g.fillStyle = p.post; g.beginPath(); g.arc(px, -H - 9, 3.4, 0, TAU); g.fill();
        });
        g.restore();
    }
});
