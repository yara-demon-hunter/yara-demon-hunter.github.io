import { registerProp } from '../props.js';
import { SWAMP_POOL_VISUALS } from './swamp_pool_visual.js';

const TAU = Math.PI * 2;
const WEEDS = 160;

// Lagoa de água parada de pântano: uma elipse de água escura com a lama em volta e pontinhos de lentilha-d'água. O centro fica no ponto
// (x, y). Estática: pintada no chão uma vez. O tamanho (raio horizontal e vertical) se ajusta por objeto no editor (📏 Medidas) e ela gira
// como qualquer peça estática (Q/E). É a versão-objeto das lagoas que eram desenhadas fixas no chão do cenário `swamp`.
registerProp({
    id: 'swamp_pool', name: 'Lagoa de pântano', kind: 'static', previewSize: 60, visual: SWAMP_POOL_VISUALS,
    ranges: { rx: [12, 320, 1, 'Raio horizontal'], ry: [8, 240, 1, 'Raio vertical'] },
    extent: (p) => Math.max(p.rx, p.ry) * 2 + 20,
    roll(r) {
        return {
            alpha: 0.4 + r() * 0.4,                                                                           // quão densa é a lentilha
            weeds: Array.from({ length: WEEDS }, () => ({ a: r() * TAU, d: Math.sqrt(r()) * 0.9, w: 1.4 + r() * 1.6, h: 0.9 + r() }))
        };
    },
    draw(g, x, y, a, p) {
        g.fillStyle = p.mud;
        g.beginPath();
        g.ellipse(x, y, p.rx + 6, p.ry + 5, 0, 0, TAU);
        g.fill();
        const fill = g.createRadialGradient(x, y, 0, x, y, p.rx);
        fill.addColorStop(0, p.water[0]);
        fill.addColorStop(1, p.water[1]);
        g.fillStyle = fill;
        g.beginPath();
        g.ellipse(x, y, p.rx, p.ry, 0, 0, TAU);
        g.fill();
        g.fillStyle = p.weed;
        g.globalAlpha = a.alpha;
        const n = Math.min(WEEDS, Math.floor(p.rx * 0.5));
        for (let k = 0; k < n; k++) {
            const w = a.weeds[k];
            g.beginPath();
            g.ellipse(x + Math.cos(w.a) * p.rx * w.d, y + Math.sin(w.a) * p.ry * w.d, w.w, w.h, 0, 0, TAU);
            g.fill();
        }
        g.globalAlpha = 1;
    }
});
