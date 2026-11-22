import { registerProp } from '../props.js';
import { BRIDGE_VISUALS } from './bridge_visual.js';

const TAU = Math.PI * 2;
const PLANKS = 140;           // tábuas sorteadas (comprimento de sobra: 9 unidades por tábua)
const POSTS = 40;

// Ponte de madeira velha vista de cima. O centro dela fica no ponto (x, y); o comprimento corre de cima para baixo da tela (como a travessia
// de um rio na horizontal): para um rio na vertical, gire a ponte 90°. Estática: pintada no chão uma vez.
// Realismo: cada tábua tem comprimento, espessura, tom, leve giro e veios próprios, com pregos e as pontas escurecidas; algumas faltam (a água
// escura aparece por baixo, com as vigas), outras estão pela metade ou rachadas; musgo e manchas de umidade; mourões tortos ou faltando.
// A chance de quebrar (brokenChance) e a de mourão faltando (postMissing) se ajustam sem sortear de novo; R no editor sorteia outra ponte.
registerProp({
    id: 'bridge', name: 'Ponte de madeira', kind: 'static', previewSize: 40, visual: BRIDGE_VISUALS,
    ranges: {
        length: [60, 900, 1, 'Comprimento da ponte'], width: [30, 600, 1, 'Largura do tabuleiro'],
        brokenChance: [0, 0.7, 0.01, 'Tábuas quebradas (chance)'], postMissing: [0, 0.8, 0.01, 'Mourões faltando (chance)']
    },
    extent: (p) => Math.max(p.length, p.width) + 20,
    roll(r) {
        const planks = Array.from({ length: PLANKS }, () => ({
            shade: Math.floor(r() * 3), light: (r() - 0.5) * 0.3,                       // tom e claro/escuro
            th: 6.4 + r() * 1.8, dy: (r() - 0.5) * 1.6,                                  // espessura e leve desalinho
            in0: r() * 3.2, in1: r() * 3.2, dx: (r() - 0.5) * 2.4, rot: (r() - 0.5) * 0.012,   // pontas irregulares, desvio de lado e giro
            u: r(), kind: Math.floor(r() * 3), cut: 0.25 + r() * 0.5, crack: r(),      // quebra: sorteio, tipo (0 falta, 1 meia, 2 rachada), onde corta
            grain: [r(), r(), r()], moss: r()
        }));
        const posts = Array.from({ length: POSTS * 2 }, () => ({ u: r(), lean: (r() - 0.5) * 3, h: 6 + r() * 2.4 }));
        const stains = Array.from({ length: 10 }, () => ({ x: r(), y: r(), rx: 8 + r() * 18, ry: 4 + r() * 9 }));
        return { planks, posts, stains };
    },
    draw(g, x, y, a, p) {
        const L = p.length;
        const W = p.width;
        const x0 = x - W / 2;
        const y0 = y - L / 2;
        const N = Math.max(1, Math.floor((L - 4) / 9));
        const broken = (i, pl) => i > 1 && i < N - 2 && pl.u < p.brokenChance;       // as pontas da ponte ficam inteiras

        // sombra no chão e a água escura por baixo (aparece onde falta tábua)
        g.fillStyle = 'rgba(0, 0, 0, 0.38)';
        g.fillRect(x0 + 4, y0 + 7, W, L);
        g.fillStyle = p.water;
        g.fillRect(x0, y0, W, L);

        // as duas vigas de baixo, no sentido do comprimento (aparecem pelos buracos)
        [x0 + W * 0.16, x0 + W * 0.84 - 5].forEach(bx => {
            g.fillStyle = p.beam;
            g.fillRect(bx, y0, 5, L);
            g.fillStyle = 'rgba(255, 230, 190, 0.08)';
            g.fillRect(bx, y0, 1.2, L);
        });

        // as tábuas, de cima para baixo
        for (let i = 0; i < N; i++) {
            const pl = a.planks[i % PLANKS];
            const yy = y0 + 2 + i * 9 + pl.dy;
            const left = x0 + pl.in0;
            const w = W - pl.in0 - pl.in1;
            const kind = broken(i, pl) ? pl.kind : -1;
            if (kind === 0) {                                                        // falta a tábua: só um pedaço de prego/farpa nas vigas
                g.fillStyle = 'rgba(30, 20, 10, 0.7)';
                g.fillRect(x0 + W * 0.16 + 1, yy + 2, 3, 2);
                g.fillRect(x0 + W * 0.84 - 4, yy + 3, 3, 2);
                continue;
            }
            const full = kind === 1 ? w * pl.cut : kind === 2 ? w : w;               // pela metade: só até `cut`
            g.save();
            g.translate(left + full / 2 + pl.dx, yy + pl.th / 2);
            g.rotate(pl.rot);
            const base = p.plank[pl.shade % p.plank.length];
            const draw = (px, pw, dropY, tilt) => {
                g.save();
                g.translate(px, dropY);
                g.rotate(tilt);
                g.fillStyle = base;
                g.fillRect(-pw / 2, -pl.th / 2, pw, pl.th);
                g.fillStyle = pl.light > 0 ? `rgba(255, 235, 200, ${pl.light})` : `rgba(0, 0, 0, ${-pl.light})`;
                g.fillRect(-pw / 2, -pl.th / 2, pw, pl.th);
                // veios: três fios escuros ao longo da tábua, que se partem no meio
                g.strokeStyle = 'rgba(20, 12, 6, 0.3)';
                g.lineWidth = 0.6;
                for (let k = 0; k < 3; k++) {
                    const gy = (k - 1) * pl.th * 0.27 + (pl.grain[k] - 0.5) * 0.8;
                    const cut = (pl.grain[(k + 1) % 3] - 0.5) * pw * 0.5;
                    g.beginPath(); g.moveTo(-pw / 2 + 2, gy); g.lineTo(cut - 3, gy + (pl.grain[k] - 0.5) * 0.7);
                    g.moveTo(cut + 3, gy - (pl.grain[k] - 0.5) * 0.5); g.lineTo(pw / 2 - 2, gy); g.stroke();
                }
                // pontas escurecidas (madeira de topo), junta de baixo e fio de luz em cima
                g.fillStyle = 'rgba(15, 9, 4, 0.45)';
                g.fillRect(-pw / 2, -pl.th / 2, 2, pl.th);
                g.fillRect(pw / 2 - 2, -pl.th / 2, 2, pl.th);
                g.fillStyle = 'rgba(0, 0, 0, 0.38)';
                g.fillRect(-pw / 2, pl.th / 2 - 0.8, pw, 1);
                g.fillStyle = 'rgba(255, 232, 190, 0.1)';
                g.fillRect(-pw / 2, -pl.th / 2, pw, 0.9);
                // pregos nas duas pontas
                if (pw > 14) {
                    g.fillStyle = 'rgba(12, 8, 4, 0.85)';
                    g.beginPath(); g.arc(-pw / 2 + 4.5, 0, 0.95, 0, TAU); g.arc(pw / 2 - 4.5, 0, 0.95, 0, TAU); g.fill();
                    g.fillStyle = 'rgba(190, 170, 140, 0.45)';
                    g.beginPath(); g.arc(-pw / 2 + 4.2, -0.3, 0.35, 0, TAU); g.arc(pw / 2 - 4.8, -0.3, 0.35, 0, TAU); g.fill();
                }
                g.restore();
            };
            if (kind === 2) {                                                        // rachada: duas partes, a da direita afundada e torta
                const cut = full * (0.35 + pl.crack * 0.3);
                draw(-full / 2 + cut / 2, cut, 0, 0);
                draw(-full / 2 + cut + (full - cut) / 2, full - cut - 1.5, 1.6 + pl.crack * 1.4, 0.05 + pl.crack * 0.04);
                g.strokeStyle = 'rgba(8, 5, 2, 0.8)';
                g.lineWidth = 0.9;
                g.beginPath(); g.moveTo(-full / 2 + cut, -pl.th / 2); g.lineTo(-full / 2 + cut + 1, 0); g.lineTo(-full / 2 + cut - 0.6, pl.th / 2); g.stroke();
            } else if (kind === 1) {                                                 // pela metade: ponta partida, em dentes
                draw(0, full, 0, 0);
                g.fillStyle = p.water;
                g.beginPath();
                g.moveTo(full / 2, -pl.th / 2);
                for (let k = 0; k <= 4; k++) g.lineTo(full / 2 - 1 - (k % 2) * 2.4, -pl.th / 2 + (k / 4) * pl.th);
                g.lineTo(full / 2 + 1, pl.th / 2);
                g.closePath();
                g.fill();
            } else {
                draw(0, full, 0, 0);
            }
            // musgo na ponta da tábua (nas beiras, onde a umidade chega)
            if (pl.moss > 0.72) {
                g.fillStyle = p.moss;
                g.beginPath(); g.ellipse(-full / 2 + 2, 0, 2.4 + pl.moss * 3, pl.th * 0.45, 0, 0, TAU); g.fill();
            }
            if (pl.moss < 0.2) {
                g.fillStyle = p.moss;
                g.beginPath(); g.ellipse(full / 2 - 2, 0, 2 + (1 - pl.moss) * 2.4, pl.th * 0.4, 0, 0, TAU); g.fill();
            }
            g.restore();
        }

        // manchas de umidade por cima de tudo
        g.fillStyle = p.stain;
        a.stains.forEach(s => {
            g.beginPath(); g.ellipse(x0 + s.x * W, y0 + s.y * L, s.rx, s.ry, 0, 0, TAU); g.fill();
        });

        // o corrimão: uma viga em cada lado, em trechos (alguns se perderam) e mourões tortos, alguns faltando
        const posts = Math.max(2, Math.round(L / 41));
        [-1, 1].forEach((side, si) => {
            const rx = side < 0 ? x0 - 7 : x0 + W + 1;
            for (let k = 0; k < posts; k++) {
                const pa = a.posts[(si * POSTS + k) % (POSTS * 2)];
                const ya = y0 + (k / posts) * L;
                const yb = y0 + ((k + 1) / posts) * L;
                if (pa.u > 0.12 + p.postMissing * 0.5) {                              // trecho da viga (alguns faltam)
                    g.fillStyle = p.rail;
                    g.fillRect(rx + 1.5, ya + 3, 3, Math.max(0, yb - ya - 4));
                    g.fillStyle = 'rgba(255, 230, 190, 0.08)';
                    g.fillRect(rx + 1.5, ya + 3, 0.9, Math.max(0, yb - ya - 4));
                }
            }
            for (let k = 0; k <= posts; k++) {
                const pa = a.posts[(si * POSTS + k) % (POSTS * 2)];
                if (pa.u < p.postMissing) continue;                                   // mourão que caiu
                const yy = y0 + (k / posts) * L;
                g.fillStyle = 'rgba(0, 0, 0, 0.3)';
                g.fillRect(rx + 1.5, yy - 1, 6, 7);
                g.fillStyle = p.rail;
                g.save();
                g.translate(rx + 3, yy + 0.5);
                g.rotate(pa.lean * 0.04);
                g.fillRect(-3, -3.5, 6, pa.h + 0.5);
                g.fillStyle = 'rgba(255, 230, 190, 0.1)';
                g.fillRect(-3, -3.5, 6, 1.1);
                g.restore();
            }
        });
    }
});
