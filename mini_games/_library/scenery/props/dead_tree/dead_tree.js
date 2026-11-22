import { randomRange } from '../../../core/random.js';
import { taper } from '../../scenery_kit.js';
import { registerProp } from '../props.js';
import { DEAD_TREE_VISUALS } from './dead_tree_visual.js';

const TAU = Math.PI * 2;

// Árvore morta vista de cima e de frente (2,5D): o pé no ponto (x, y), o tronco sobe. Raízes que saem do chão, tronco retorcido e rachado
// (com nós, às vezes oco ou com o topo partido), musgo na base, galhos secos que se abrem com ramos finos e pontas quebradas.
// Estática: pintada no chão uma vez. Cada uma sai diferente (R no editor sorteia outra); a altura se ajusta por objeto (📏 Medidas).
registerProp({
    id: 'dead_tree', name: 'Árvore morta', kind: 'static', occludes: true, previewSize: 120, visual: DEAD_TREE_VISUALS,
    ranges: { fixedHeight: [0, 420, 1, 'Altura (0 = sorteada)'] },
    extent: (p) => (p.fixedHeight > 0 ? p.fixedHeight : (p.height[0] + p.height[1]) / 2) * 1.1,
    roll(r, p) {
        const H = randomRange(r, p.height[0], p.height[1]);
        return {
            H, lean: (r() - 0.5) * 0.3, curve: (r() - 0.5) * 0.45, w0: 11 + r() * 6,
            snapped: r() < 0.35, hollow: r() < 0.4, mossAmt: r(),
            roots: Array.from({ length: 6 }, (_, i) => ({ ang: (i / 5) * Math.PI * 0.9 + 0.1 + (r() - 0.5) * 0.3, len: 9 + r() * 15, w: 3 + r() * 2.4, side: i < 3 ? -1 : 1 })),
            branches: Array.from({ length: 5 + Math.floor(r() * 5) }, () => ({
                t: 0.28 + r() * 0.66, side: r() < 0.5 ? -1 : 1, ang: 0.45 + r() * 0.95, len: 0.28 + r() * 0.34, bend: (r() - 0.5) * 0.9, broken: r() < 0.28,
                twigs: Array.from({ length: 2 + Math.floor(r() * 2) }, () => ({ u: 0.3 + r() * 0.55, ang: (r() - 0.5) * 1.5, len: 0.25 + r() * 0.3 }))
            })),
            knots: Array.from({ length: 4 }, () => ({ t: 0.08 + r() * 0.8, side: (r() - 0.5) * 0.7, s: 1.4 + r() * 1.8 })),
            cracks: Array.from({ length: 5 }, () => ({ t: 0.05 + r() * 0.7, side: (r() - 0.5) * 0.8, len: 0.08 + r() * 0.2 }))
        };
    },
    draw(g, x, y, a, p) {
        const S = p.fixedHeight > 0 ? p.fixedHeight / a.H : 1;
        const H = a.H;
        g.save();
        g.translate(x, y);
        g.scale(S, S);
        const off = (t) => a.lean * H * t + a.curve * H * Math.sin(t * Math.PI) * 0.5;           // desvio do tronco para o lado em cada altura
        const wid = (t) => a.w0 * (1 - 0.5 * t) * (1 + 0.4 * (1 - t) ** 4);                       // largura: afina para cima e alarga na base
        const top = a.snapped ? 0.86 : 1;                                                        // topo partido: o tronco para antes

        // sombra no chão
        g.fillStyle = 'rgba(0, 0, 0, 0.18)';
        g.beginPath(); g.ellipse(H * 0.03, 1.5, Math.max(9, H * 0.1), Math.max(3, H * 0.028), 0, 0, TAU); g.fill();
        // raízes
        a.roots.forEach(rt => {
            const ex = Math.cos(rt.ang) * rt.len * (rt.side < 0 ? -1 : 1) * 1.3 + (rt.side < 0 ? -2 : 2);
            const ey = 1 + Math.sin(rt.ang) * rt.len * 0.28;
            taper(g, 0, -3, ex * 0.5, -2, ex, ey, rt.w, 0.5, p.barkDark);
        });

        // o tronco
        const steps = 12;
        const trunk = new Path2D();
        for (let i = 0; i <= steps; i++) { const t = (i / steps) * top; const px = off(t) - wid(t) / 2; i ? trunk.lineTo(px, -H * t) : trunk.moveTo(px, -H * t); }
        if (a.snapped) {                                                                          // ponta partida em dentes
            const t = top;
            trunk.lineTo(off(t) - wid(t) * 0.18, -H * t - 7);
            trunk.lineTo(off(t) + wid(t) * 0.02, -H * t + 1.5);
            trunk.lineTo(off(t) + wid(t) * 0.3, -H * t - 9);
        }
        for (let i = steps; i >= 0; i--) { const t = (i / steps) * top; trunk.lineTo(off(t) + wid(t) / 2, -H * t); }
        trunk.closePath();
        g.fillStyle = p.bark;
        g.fill(trunk);
        g.save();
        g.clip(trunk);
        g.fillStyle = p.barkLight; g.globalAlpha = 0.34; g.fillRect(-30 + off(0.4) - wid(0.4) / 2, -H, wid(0.4) * 0.42 + 30 - 30, H + 4);   // o lado esquerdo pega luz
        g.fillStyle = p.barkDark; g.globalAlpha = 0.42; g.fillRect(off(0.4) + wid(0.4) * 0.12, -H - 10, 40, H + 14);                   // o direito fica na sombra
        g.globalAlpha = 1;
        // veios da casca: linhas que seguem o tronco
        g.strokeStyle = p.barkDark; g.lineWidth = 0.8; g.globalAlpha = 0.6;
        for (let k = 0; k < 5; k++) {
            const u = (k + 0.5) / 5 - 0.5;
            g.beginPath();
            for (let i = 0; i <= steps; i++) { const t = (i / steps) * top; const px = off(t) + u * wid(t) * 0.9 + Math.sin(t * 9 + k * 1.7) * 0.7; i ? g.lineTo(px, -H * t) : g.moveTo(px, -H * t); }
            g.stroke();
        }
        g.globalAlpha = 1;
        g.restore();
        // rachaduras fundas, nós e o oco
        g.strokeStyle = p.barkDark; g.lineWidth = 1.1;
        a.cracks.forEach(c => {
            const px = off(c.t) + c.side * wid(c.t) * 0.5;
            g.beginPath(); g.moveTo(px, -H * c.t); g.lineTo(px + c.side * 1.2, -H * (c.t + c.len * 0.5)); g.lineTo(px - c.side * 0.8, -H * (c.t + c.len)); g.stroke();
        });
        a.knots.forEach(k => {
            const px = off(k.t) + k.side * wid(k.t) * 0.4;
            g.fillStyle = p.barkDark; g.beginPath(); g.ellipse(px, -H * k.t, k.s, k.s * 1.35, 0, 0, TAU); g.fill();
            g.strokeStyle = p.barkLight; g.globalAlpha = 0.35; g.lineWidth = 0.7; g.beginPath(); g.ellipse(px, -H * k.t, k.s + 1.1, k.s * 1.35 + 1.1, 0, 0, TAU); g.stroke(); g.globalAlpha = 1;
        });
        if (a.hollow) {
            const t = 0.2;
            g.fillStyle = '#0d0a07';
            g.beginPath(); g.ellipse(off(t) - wid(t) * 0.1, -H * t, wid(t) * 0.26, wid(t) * 0.46, 0.05, 0, TAU); g.fill();
            g.strokeStyle = p.barkLight; g.globalAlpha = 0.4; g.lineWidth = 0.9; g.beginPath(); g.ellipse(off(t) - wid(t) * 0.1, -H * t, wid(t) * 0.29, wid(t) * 0.5, 0.05, Math.PI * 0.9, Math.PI * 1.9); g.stroke(); g.globalAlpha = 1;
        }
        // musgo na base
        g.fillStyle = p.moss; g.globalAlpha = 0.4 + a.mossAmt * 0.5;
        g.beginPath(); g.ellipse(-wid(0) * 0.2, -3.5, wid(0) * 0.5, 4.5 + a.mossAmt * 4, 0, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(wid(0) * 0.28, -2, wid(0) * 0.26, 3, 0, 0, TAU); g.fill();
        g.globalAlpha = 1;
        // o topo partido: a madeira clara do corte
        if (a.snapped) {
            g.fillStyle = p.wood;
            g.beginPath(); const t = top; g.moveTo(off(t) - wid(t) * 0.45, -H * t); g.lineTo(off(t) - wid(t) * 0.18, -H * t - 7); g.lineTo(off(t) + wid(t) * 0.02, -H * t + 1.5); g.lineTo(off(t) + wid(t) * 0.3, -H * t - 9); g.lineTo(off(t) + wid(t) * 0.45, -H * t); g.closePath(); g.fill();
        }

        // galhos secos: curvas que afinam, com ramos finos; alguns terminam quebrados (ponta de madeira clara)
        a.branches.forEach(b => {
            if (a.snapped && b.t > top) return;
            const sx = off(b.t);
            const sy = -H * b.t;
            const len = H * b.len;
            const ang = b.side * b.ang;
            const ex = sx + Math.sin(ang) * len;
            const ey = sy - Math.cos(ang) * len;
            const cx = (sx + ex) / 2 + Math.cos(ang) * b.bend * len * 0.35;
            const cy = (sy + ey) / 2 + Math.sin(ang) * b.bend * len * 0.35;
            const w0 = Math.max(1.4, wid(b.t) * 0.34);
            taper(g, sx, sy, cx, cy, ex, ey, w0, b.broken ? w0 * 0.55 : 0.5, p.bark);
            g.strokeStyle = p.barkLight; g.globalAlpha = 0.25; g.lineWidth = 0.6;
            g.beginPath(); g.moveTo(sx - b.side * 0.8, sy); g.quadraticCurveTo(cx - b.side * 0.8, cy, ex, ey); g.stroke(); g.globalAlpha = 1;
            b.twigs.forEach(tw => {
                const u = tw.u;
                const px = (1 - u) * (1 - u) * sx + 2 * u * (1 - u) * cx + u * u * ex;
                const py = (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * cy + u * u * ey;
                const ta = ang + tw.ang + b.side * 0.35;
                const tl = len * tw.len;
                taper(g, px, py, px + Math.sin(ta) * tl * 0.5, py - Math.cos(ta) * tl * 0.5 + 1, px + Math.sin(ta) * tl, py - Math.cos(ta) * tl, Math.max(0.8, w0 * 0.42), 0.35, p.bark);
            });
            if (b.broken) {
                g.fillStyle = p.wood;
                g.beginPath(); g.ellipse(ex, ey, Math.max(1.1, w0 * 0.34), Math.max(0.8, w0 * 0.22), ang, 0, TAU); g.fill();
            }
        });
        g.restore();
    }
});
