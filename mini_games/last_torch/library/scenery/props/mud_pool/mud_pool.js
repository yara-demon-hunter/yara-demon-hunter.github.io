// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/mud_pool/mud_pool.js e rode o sync.
import { taper } from '../../scenery_kit.js';
import { registerProp } from '../props.js';
import { MUD_POOL_VISUALS, RUST_POOL_VISUALS, TAR_POOL_VISUALS, TOXIC_POOL_VISUALS } from './mud_pool_visual.js';

const TAU = Math.PI * 2;
const N = 18;

// Poça de lodo: uma poça viscosa e estilosa. Borda irregular de lama seca e rachada, lodo escuro com brilho esverdeado de fungo, reflexo úmido
// e capim na beirada. É a poça que deixa o herói LENTO (ponha uma área 🐌 Lento em cima, no modo Áreas). Estática: pintada no chão uma vez;
// as bolhas estouram numa peça animada à parte (`mud_bubbles`). Tamanho por objeto em 📏 Medidas; gira como qualquer peça estática.
// Uma só rotina de desenho, várias poças: cada variante só troca os valores do visual (cores, borda, capim, folhas). Todas servem para a área 🐌 Lento.
function registerMud(id, name, visual) {
registerProp({
    id, name, kind: 'static', previewSize: 60, visual,
    ranges: { rx: [20, 200, 1, 'Raio horizontal'], ry: [12, 140, 1, 'Raio vertical'] },
    extent: (p) => Math.max(p.rx, p.ry) * 2.4 + 20,
    roll(r, p) {
        return {
            wob: Array.from({ length: N }, () => 1 + (r() - 0.5) * 0.28 * p.wobble),                                 // a borda irregular
            tufts: Array.from({ length: p.tufts }, () => ({ a: r() * TAU, len: 7 + r() * 9, lean: (r() - 0.5) * 0.8 })),
            pads: Array.from({ length: p.pads }, () => ({ a: r() * TAU, d: 0.25 + r() * 0.45, s: 5 + r() * 4 })),
            cracks: Array.from({ length: 6 }, () => ({ a: r() * TAU, len: 0.12 + r() * 0.18 }))
        };
    },
    draw(g, x, y, a, p) {
        const blob = (k, wobAmt = 1) => {                                  // contorno suave passando pelos pontos irregulares
            const pts = a.wob.map((w, i) => {
                const ang = (i / N) * TAU;
                const f = k * (1 + (w - 1) * wobAmt);
                return [x + Math.cos(ang) * p.rx * f, y + Math.sin(ang) * p.ry * f];
            });
            g.beginPath();
            g.moveTo((pts[N - 1][0] + pts[0][0]) / 2, (pts[N - 1][1] + pts[0][1]) / 2);
            for (let i = 0; i < N; i++) {
                const c = pts[i];
                const n = pts[(i + 1) % N];
                g.quadraticCurveTo(c[0], c[1], (c[0] + n[0]) / 2, (c[1] + n[1]) / 2);
            }
            g.closePath();
        };
        // rachaduras da lama seca em volta
        g.strokeStyle = p.rim;
        g.lineWidth = 1;
        a.cracks.forEach(c => {
            const sx = x + Math.cos(c.a) * p.rx * 1.12;
            const sy = y + Math.sin(c.a) * p.ry * 1.12;
            g.beginPath();
            g.moveTo(sx, sy);
            g.lineTo(sx + Math.cos(c.a + 0.2) * p.rx * c.len, sy + Math.sin(c.a + 0.2) * p.ry * c.len);
            g.stroke();
        });
        // sombra de lama, depois a borda grossa
        g.fillStyle = p.rim;
        blob(1.18, 1.3); g.fill();
        g.fillStyle = p.lip;
        blob(1.08); g.fill();
        g.strokeStyle = p.lipLight;
        g.lineWidth = 1.4;
        g.save();
        g.beginPath(); g.rect(x - p.rx * 1.3, y - p.ry * 1.3, p.rx * 2.6, p.ry * 1.25); g.clip();        // o brilho só no alto
        blob(1.08); g.stroke();
        g.restore();
        // o lodo: do fundo escuro (centro) à borda
        const fill = g.createRadialGradient(x, y, 0, x, y, Math.max(p.rx, p.ry));
        fill.addColorStop(0, p.deep);
        fill.addColorStop(1, p.mid);
        g.fillStyle = fill;
        blob(0.88); g.fill();
        // brilho de fungo, mais forte perto da borda de baixo
        const glow = g.createRadialGradient(x, y + p.ry * 0.2, p.rx * 0.1, x, y + p.ry * 0.2, p.rx * 0.9);
        glow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        glow.addColorStop(1, p.glow);
        g.fillStyle = glow;
        blob(0.88); g.fill();
        // reflexo úmido: dois arcos claros no lado de cima
        g.strokeStyle = p.sheen;
        g.lineCap = 'round';
        g.lineWidth = 1.6;
        g.beginPath(); g.ellipse(x - p.rx * 0.15, y - p.ry * 0.25, p.rx * 0.55, p.ry * 0.38, -0.08, Math.PI * 1.1, Math.PI * 1.65); g.stroke();
        g.lineWidth = 1;
        g.beginPath(); g.ellipse(x + p.rx * 0.2, y - p.ry * 0.05, p.rx * 0.32, p.ry * 0.2, 0.1, Math.PI * 1.15, Math.PI * 1.6); g.stroke();
        // folhas flutuando e capim na beirada
        g.fillStyle = p.weed;
        a.pads.forEach(d => {
            g.globalAlpha = 0.8;
            g.beginPath(); g.ellipse(x + Math.cos(d.a) * p.rx * d.d, y + Math.sin(d.a) * p.ry * d.d, d.s, d.s * 0.45, d.a, 0, TAU); g.fill();
        });
        g.globalAlpha = 1;
        a.tufts.forEach(t => {
            const bx = x + Math.cos(t.a) * p.rx * 1.06;
            const by = y + Math.sin(t.a) * p.ry * 1.06;
            taper(g, bx, by, bx + t.lean * 4, by - t.len * 0.5, bx + t.lean * t.len, by - t.len, 1.6, 0.3, p.weed);
        });
    }
});
}

registerMud('mud_pool', 'Poça de lodo', MUD_POOL_VISUALS);
registerMud('tar_pool', 'Poça de piche', TAR_POOL_VISUALS);
registerMud('toxic_pool', 'Poça tóxica', TOXIC_POOL_VISUALS);
registerMud('rust_pool', 'Poça de ferrugem', RUST_POOL_VISUALS);
