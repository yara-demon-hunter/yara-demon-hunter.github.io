// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/village_gate_3/village_gate_3.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { VILLAGE_GATE_3_VISUALS as F } from './village_gate_3_visual.js';

// --- O chão deste cenário (era o de `village_gate`, que foi removido) ---
// --- CENÁRIO: ENTRADA DA VILA (village_gate) ---
// Parte do mapa em 5 telas (floresta, travessia do rio, pântano, entrada da vila, castelo do Gudran), 5 ondas por tela.
// Este arquivo só desenha a BASE (o chão); o resto são PEÇAS da biblioteca, escolhidas na receita `props` do arquivo de dados.
// Nada fica por cima da ação. Ficha: art_reference/scenery.md.

// Telhados das bordas de cima e de baixo: DESLIGADOS (roofs.hidden no visual) a pedido do usuário. O sorteio continua rodando para que
// o resto do cenário não mude de lugar; tirar `hidden` traz os telhados de volta.
function paintRoofs(g, w, h, rand, top, V) {
    const Z = V.roofs;
    const base = top ? 0 : h * (1 - Z.rows);
    let x = -10;
    while (x < w) {
        const rw = 70 + rand() * 80;
        const rh = h * Z.rows * (0.7 + rand() * 0.45);
        const y = top ? -4 : h - rh + 4;
        if (!Z.hidden) {
        g.fillStyle = 'rgba(0, 0, 0, 0.45)';
        g.fillRect(x + 5, y + 6 + (top ? 0 : -4), rw, rh);
        }
        const color = Z.colors[Math.floor(rand() * Z.colors.length)];
        if (!Z.hidden) {
        g.fillStyle = color;
        g.fillRect(x, y, rw, rh);
        g.strokeStyle = Z.tile;
        g.lineWidth = 1;
        for (let ty = y + 6; ty < y + rh; ty += 6) { g.beginPath(); g.moveTo(x, ty); g.lineTo(x + rw, ty); g.stroke(); }
        g.fillStyle = Z.light;
        g.fillRect(x + rw / 2 - 1.5, y, 3, rh);
        }
        x += rw + 8 + rand() * 40;
    }
    return base;
}

// O chão: capim escuro, a estrada de terra com sulcos de carroça e os telhados ao longe
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

    const R = V.road;
    const top = (x) => h * R.from + Math.sin(x * 0.008 + 0.4) * 9 + Math.sin(x * 0.021) * 3;
    const bottom = (x) => h * R.to + Math.sin(x * 0.007 + 2) * 9 + Math.sin(x * 0.019 + 1) * 3;
    const dirt = g.createLinearGradient(0, h * R.from, 0, h * R.to);
    dirt.addColorStop(0, R.dirt[1]);
    dirt.addColorStop(0.5, R.dirt[0]);
    dirt.addColorStop(1, R.dirt[1]);
    g.fillStyle = dirt;
    g.beginPath();
    g.moveTo(0, top(0));
    for (let x = 0; x <= w; x += 8) g.lineTo(x, top(x));
    for (let x = w; x >= 0; x -= 8) g.lineTo(x, bottom(x));
    g.closePath();
    g.fill();
    // sulcos das carroças
    g.strokeStyle = R.rut;
    g.lineWidth = 2.2;
    [0.38, 0.7].forEach(f => {
        g.beginPath();
        for (let x = 0; x <= w; x += 8) { const y = top(x) + (bottom(x) - top(x)) * f; if (x) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke();
    });
    // sujeira nas bordas da estrada: terra jogada para o capim
    g.fillStyle = R.dirt[1];
    for (let i = 0; i < w / 5; i++) {
        const x = rand() * w;
        const up = rand() < 0.5;
        const y = (up ? top(x) : bottom(x)) + (rand() - 0.5) * 8 + (up ? -3 : 3);
        g.globalAlpha = 0.4 + rand() * 0.4;
        g.beginPath();
        g.ellipse(x, y, 2 + rand() * 4, 1.2 + rand() * 2, 0, 0, Math.PI * 2);
        g.fill();
    }
    g.globalAlpha = 1;
    paintRoofs(g, w, h, rand, true, V);
    paintRoofs(g, w, h, rand, false, V);
    const L = V.portal;
    const pr = Math.min(w, h) * L.radiusRatio * 2;
    const pool = g.createRadialGradient(w * L.x, h * L.y, 0, w * L.x, h * L.y, pr);
    pool.addColorStop(0, L.color);
    pool.addColorStop(1, 'rgba(255, 190, 110, 0)');
    g.fillStyle = pool;
    g.fillRect(w * L.x - pr, h * L.y - pr, pr * 2, pr * 2);
}


// --- CENÁRIO: ENTRADA DA VILA SOB A CHUVA (village_gate_3) ---
// Variante 3 de `village_gate`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'village_gate_3', name: 'Entrada da Vila sob a Chuva', visual: F, paintBase }));
