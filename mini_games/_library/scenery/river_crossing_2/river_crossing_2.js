import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { RIVER_CROSSING_2_VISUALS as F } from './river_crossing_2_visual.js';

// --- O chão deste cenário (era o de `river_crossing`, que foi removido) ---
// --- CENÁRIO: TRAVESSIA DO RIO (river_crossing) ---
// Parte do mapa em 5 telas (floresta, travessia do rio, pântano, entrada da vila, castelo do Gudran), 5 ondas por tela.
// Este arquivo só desenha a BASE (o chão); o resto são PEÇAS da biblioteca, escolhidas na receita `props` do arquivo de dados.
// Nada fica por cima da ação. Ficha: art_reference/scenery.md.

const wave = (x, a, b) => Math.sin(x * 0.011 + a) * 7 + Math.sin(x * 0.027 + b) * 3.5;

// O chão: margens de musgo, o rio raso com a lama das beiras e a ponte de tábuas
function paintBase(g, w, h, rand, _env, V = F) {
    const maxR = Math.max(w, h) * V.clearingRadiusRatio;
    g.fillStyle = V.ground[2];
    g.fillRect(0, 0, w, h);
    const floor = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, maxR);
    floor.addColorStop(0, V.ground[0]);
    floor.addColorStop(0.55, V.ground[1]);
    floor.addColorStop(1, V.ground[2]);
    g.fillStyle = floor;
    g.fillRect(0, 0, w, h);

    const R = V.river;
    const top = (x) => h * R.from + wave(x, 0.3, 1.7);
    const bottom = (x) => h * R.to + wave(x, 2.1, 0.6);
    // lama das beiras (um pouco maior que a água)
    g.fillStyle = R.mud;
    g.beginPath();
    g.moveTo(0, top(0) - 7);
    for (let x = 0; x <= w; x += 8) g.lineTo(x, top(x) - 7);
    for (let x = w; x >= 0; x -= 8) g.lineTo(x, bottom(x) + 7);
    g.closePath();
    g.fill();
    // a água: mais clara no meio, escura nas beiras
    const water = g.createLinearGradient(0, h * R.from, 0, h * R.to);
    water.addColorStop(0, R.water[2]);
    water.addColorStop(0.5, R.water[0]);
    water.addColorStop(1, R.water[2]);
    g.fillStyle = water;
    g.beginPath();
    g.moveTo(0, top(0));
    for (let x = 0; x <= w; x += 8) g.lineTo(x, top(x));
    for (let x = w; x >= 0; x -= 8) g.lineTo(x, bottom(x));
    g.closePath();
    g.fill();
    // correnteza: riscos claros e finos na direção do rio
    g.strokeStyle = R.foam;
    g.lineCap = 'round';
    for (let i = 0; i < w * h / 4200; i++) {
        const x = rand() * w;
        const y = h * (R.from + 0.02) + rand() * h * (R.to - R.from - 0.04);
        const len = 10 + rand() * 26;
        g.globalAlpha = 0.25 + rand() * 0.5;
        g.lineWidth = 0.7 + rand() * 0.6;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + len, y + (rand() - 0.5) * 2);
        g.stroke();
    }
    g.globalAlpha = 1;
    // espuma nas duas margens
    g.strokeStyle = R.foam;
    g.lineWidth = 1.6;
    [top, bottom].forEach(edge => {
        g.beginPath();
        for (let x = 0; x <= w; x += 6) { const y = edge(x) + Math.sin(x * 0.09) * 0.8; if (x) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke();
    });

    // A ponte antiga, desenhada no chão: agora existe a peça `bridge` (objeto que se põe quantas vezes quiser). Este desenho só roda enquanto o
    // cenário não tem nenhum objeto `bridge` (layouts gravados antes disso); o sorteio das tábuas continua rodando para o resto não mudar de lugar.
    const B = V.bridge;
    const show = !(V.placed ?? []).some(o => o.prop === 'bridge');
    const x0 = w * (0.5 - B.halfWidth);
    const x1 = w * (0.5 + B.halfWidth);
    const y0 = h * (R.from - B.margin) - 4;
    const y1 = h * (R.to + B.margin) + 4;
    if (show) {
        g.fillStyle = 'rgba(0, 0, 0, 0.4)';
        g.fillRect(x0 + 4, y0 + 6, x1 - x0, y1 - y0);
        g.fillStyle = B.rail;
        g.fillRect(x0 - 5, y0, x1 - x0 + 10, y1 - y0);
    }
    for (let y = y0 + 1; y < y1 - 3; y += 9) {
        const pick = B.plank[Math.floor(rand() * B.plank.length)];
        if (!show) continue;
        g.fillStyle = pick;
        g.fillRect(x0, y, x1 - x0, 7.5);
        g.fillStyle = 'rgba(0, 0, 0, 0.35)';
        g.fillRect(x0, y + 7.5, x1 - x0, 1);
        g.fillStyle = 'rgba(255, 230, 190, 0.1)';
        g.fillRect(x0, y, x1 - x0, 1);
    }
    if (show) {
        g.fillStyle = B.rail;
        for (let y = y0; y <= y1; y += (y1 - y0) / 7) {
            g.fillRect(x0 - 7, y - 3, 6, 7);
            g.fillRect(x1 + 1, y - 3, 6, 7);
        }
    }
}


// --- CENÁRIO: TRAVESSIA DO RIO GELADO (river_crossing_2) ---
// Variante 2 de `river_crossing`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'river_crossing_2', name: 'Travessia do Rio Gelado', visual: F, paintBase }));
