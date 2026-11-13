// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/bush/bush.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { BUSH_VISUALS } from './bush_visual.js';

const TAU = Math.PI * 2;

// Arbusto visto de cima: um monte de tufos redondos de folhas, do mais escuro (embaixo) ao mais claro (em cima), com
// sombra e uns pontinhos de luz. Só enfeite: não esconde, não bloqueia, não faz nada. Estática.
registerProp({
    id: 'bush', name: 'Arbusto', kind: 'static', previewSize: 70, visual: BUSH_VISUALS,
    roll(r, p) {
        const radius = randomRange(r, p.radius[0], p.radius[1]);
        const blobs = [];
        for (let i = 0; i < p.blobs; i++) {
            const a = r() * TAU;
            const d = Math.sqrt(r()) * radius * 0.55;
            blobs.push({ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.9, size: radius * (0.42 + r() * 0.22), tone: r() });
        }
        const sparks = [];
        for (let i = 0; i < 6; i++) sparks.push({ a: r() * TAU, d: r() * radius * 0.7, s: 0.8 + r() * 0.8 });
        return { radius, blobs, sparks };
    },
    draw(g, x, y, a, p) {
        g.fillStyle = p.shadow;
        g.beginPath();
        g.ellipse(x + 3, y + 4, a.radius * 1.12, a.radius * 0.98, 0, 0, TAU);
        g.fill();
        // Três passadas: escuro, meio e claro, cada uma por cima da anterior e um pouco menor e mais alta
        const passes = [[p.dark, 1, 0], [p.mid, 0.82, -1.2], [p.light, 0.52, -2.4]];
        for (const [color, scale, lift] of passes) {
            g.fillStyle = color;
            for (const b of a.blobs) {
                if (color === p.light && b.tone < 0.45) continue;
                g.beginPath();
                g.arc(x + b.x * scale, y + b.y * scale + lift, b.size * scale, 0, TAU);
                g.fill();
            }
        }
        g.fillStyle = p.spark;
        g.globalAlpha = 0.7;
        for (const s of a.sparks) {
            g.beginPath();
            g.arc(x + Math.cos(s.a) * s.d, y + Math.sin(s.a) * s.d * 0.9 - 2.4, s.s, 0, TAU);
            g.fill();
        }
        g.globalAlpha = 1;
    }
});
