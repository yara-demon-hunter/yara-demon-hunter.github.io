import { registerProp } from '../props.js';
import { WATER_CURRENT_VISUALS } from './water_current_visual.js';

// Correnteza: filetes claros e finos que deslizam pela água na direção do rio, aparecendo e sumindo. Animada (um atlas, 1 drawImage por peça);
// cada peça tem ritmo e ponto de partida próprios (`desync`), então o rio nunca pulsa todo junto.
registerProp({
    id: 'water_current', name: 'Correnteza', kind: 'animated', desync: true, anim: { frames: [20, 12, 8], size: 1.2, cycleSeconds: 6 }, visual: WATER_CURRENT_VISUALS,
    cell: [130, 26], anchor: [0.5, 0.5], variants: 3,
    paint(g, r, phase, p) {
        const W = 130;
        g.strokeStyle = p.color;
        g.lineCap = 'round';
        for (let k = 0; k < p.streaks; k++) {
            const y = (r() - 0.5) * 16;
            const len = p.length * (0.6 + r() * 0.8);
            const wob = 0.8 + r() * 1.6;
            const s = (phase + r()) % 1;                                                    // posição do filete ao longo do ciclo (emenda sozinha)
            const x = (s - 0.5) * W * p.dir - len / 2 * p.dir;                               // anda na direção da correnteza
            g.globalAlpha = Math.sin(s * Math.PI) ** 2;                                     // nasce e some sem aparecer de repente
            g.lineWidth = 0.9 + r() * 0.5;
            g.beginPath();
            g.moveTo(x, y);
            g.quadraticCurveTo(x + len / 2 * p.dir, y + Math.sin(s * 6 + k) * wob, x + len * p.dir, y);
            g.stroke();
        }
        g.globalAlpha = 1;
    }
});
