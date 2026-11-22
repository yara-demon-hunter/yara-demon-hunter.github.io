// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/iron_gate/iron_gate.js e rode o sync.
import { registerProp } from '../props.js';
import { IRON_GATE_VISUALS } from './iron_gate_visual.js';

const TAU = Math.PI * 2;

// Portão de ferro de duas folhas, em 2,5D: dois pilares de pedra com bola no alto, as folhas com barras que sobem em arco para o
// centro (pontas de lança), três trilhos e um aro dourado no meio. A base (o "pé") fica no meio do vão. Estática, ~140 de largura.
// Combina com a `iron_fence` (cerca de ferro) para fechar a entrada de um cemitério ou castelo.
registerProp({
    id: 'iron_gate', name: 'Portão de ferro', kind: 'static', previewSize: 150, visual: IRON_GATE_VISUALS,
    ranges: { gap: [40, 1000, 1, 'Comprimento do portão (vão)'], height: [36, 160, 1, 'Altura dos pilares'], arch: [0, 50, 1, 'Arco das barras'], ajar: [0, 1, 0.05, 'Folha entreaberta'] },
    extent: (p) => p.gap + 40,
    roll() { return {}; },
    draw(g, x, y, a, p) {
        const half = p.gap / 2;
        const H = p.height;
        g.save();
        g.translate(x, y);
        g.fillStyle = 'rgba(0, 0, 0, 0.4)';
        g.fillRect(-half - 12, 1, p.gap + 30, 5);
        // folhas: barras de cada lado, mais altas perto do centro (arco)
        const leaf = (dir, squeeze) => {
            const n = Math.round(half / 7);
            for (let i = 0; i < n; i++) {
                const t = (i + 0.5) / n;                              // 0 = junto do pilar, 1 = no centro
                const bx = dir * (half - t * half * squeeze);
                const top = H * 0.78 + p.arch * Math.pow(t, 1.5);
                g.fillStyle = p.iron;
                g.fillRect(bx - 1.2, -top, 2.4, top);
                g.fillStyle = p.light;
                g.fillRect(bx - 1.2, -top, 0.7, top);
                g.fillStyle = p.tip;
                g.beginPath(); g.moveTo(bx - 2.6, -top); g.lineTo(bx, -top - 7); g.lineTo(bx + 2.6, -top); g.closePath(); g.fill();
            }
            g.fillStyle = p.iron;
            const x0 = dir * half;
            const x1 = dir * half * (1 - squeeze);
            [0.18, 0.5, 0.78].forEach(f => g.fillRect(Math.min(x0, x1), -H * f, Math.abs(x1 - x0), 2.6));
        };
        leaf(-1, 1);
        leaf(1, 1 - 0.6 * p.ajar);
        // aro dourado no meio
        g.strokeStyle = p.ornament; g.lineWidth = 2;
        g.beginPath(); g.arc(0, -H * 0.5, 5.5, 0, TAU); g.stroke();
        g.fillStyle = p.ornament; g.beginPath(); g.arc(0, -H * 0.5, 1.8, 0, TAU); g.fill();
        // pilares de pedra com capitel e bola
        [-half - 8, half + 8].forEach(px => {
            g.fillStyle = 'rgba(0, 0, 0, 0.32)'; g.fillRect(px - 6, -H - 4, 14, H + 6);
            g.fillStyle = p.stone; g.fillRect(px - 7, -H - 6, 14, H + 6);
            g.strokeStyle = p.stoneDark; g.lineWidth = 0.8;
            for (let yy = -H + 8; yy < 0; yy += 10) { g.beginPath(); g.moveTo(px - 7, yy); g.lineTo(px + 7, yy); g.stroke(); }
            g.fillStyle = p.stoneLight; g.fillRect(px - 7, -H - 6, 2.4, H + 6);
            g.fillStyle = p.stoneDark; g.fillRect(px - 9, -H - 10, 18, 5);
            g.fillStyle = p.stone; g.beginPath(); g.arc(px, -H - 14, 5, 0, TAU); g.fill();
            g.fillStyle = p.stoneLight; g.beginPath(); g.arc(px - 1.6, -H - 15.5, 1.8, 0, TAU); g.fill();
        });
        g.restore();
    }
});
