// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/mud_bubbles/mud_bubbles.js e rode o sync.
import { registerProp } from '../props.js';
import { MUD_BUBBLES_VISUALS } from './mud_bubbles_visual.js';

const TAU = Math.PI * 2;

// Bolhas de lodo: sobem, crescem e estouram numa pequena onda. Vão por cima de uma `mud_pool`. Cada peça tem ritmo próprio (`desync`),
// então as poças nunca borbulham todas juntas. Animada: um atlas pequeno, 1 drawImage por peça.
registerProp({
    id: 'mud_bubbles', name: 'Bolhas de lodo', kind: 'animated', desync: true, anim: { frames: [16, 10, 7], size: 1.3, cycleSeconds: 4 }, visual: MUD_BUBBLES_VISUALS,
    cell: [70, 44], anchor: [0.5, 0.5], variants: 3,
    paint(g, r, phase, p) {
        for (let k = 0; k < p.bubbles; k++) {
            const bx = (r() - 0.5) * 44;
            const by = (r() - 0.5) * 20;
            const start = r();
            const t = (phase + start) % 1;                                  // 0 a 1: nasce pequena, cresce, estoura e descansa
            if (t > 0.7) {
                const pop = (t - 0.7) / 0.3;                                 // a onda do estouro
                g.strokeStyle = p.bubble;
                g.globalAlpha = (1 - pop) * 0.7;
                g.lineWidth = 0.9;
                g.beginPath(); g.ellipse(bx, by, 2 + pop * 8, (2 + pop * 8) * 0.45, 0, 0, TAU); g.stroke();
                continue;
            }
            const grow = t / 0.7;
            const s = 0.8 + grow * p.maxSize;
            g.globalAlpha = 0.35 + grow * 0.55;
            g.strokeStyle = p.bubble;
            g.lineWidth = 1;
            g.beginPath(); g.ellipse(bx, by - grow * 2, s, s * 0.85, 0, 0, TAU); g.stroke();
            g.fillStyle = p.shine;
            g.beginPath(); g.ellipse(bx - s * 0.3, by - grow * 2 - s * 0.3, Math.max(0.5, s * 0.22), Math.max(0.4, s * 0.16), 0, 0, TAU); g.fill();
        }
        g.globalAlpha = 1;
    }
});
