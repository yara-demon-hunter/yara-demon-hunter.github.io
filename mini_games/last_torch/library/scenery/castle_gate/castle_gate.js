// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/castle_gate/castle_gate.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { CASTLE_GATE_VISUALS as F } from './castle_gate_visual.js';

// --- CENÁRIO: PORTÕES DO CASTELO DE GUDRAN (castle_gate) ---
// Parte do mapa em 5 telas (floresta, travessia do rio, pântano, entrada da vila, castelo do Gudran), 5 ondas por tela.
// Este arquivo só desenha a BASE (o chão); o resto são PEÇAS da biblioteca, escolhidas na receita `props` do arquivo de dados.
// Nada fica por cima da ação. Ficha: art_reference/scenery.md.

// O chão: lajes de pedra de tons variados, tapete vermelho com borda dourada e o portão em arco na borda de cima
export function paintBase(g, w, h, rand, _env, V = F) {
    const maxR = Math.max(w, h) * V.clearingRadiusRatio;
    g.fillStyle = V.ground[2];
    g.fillRect(0, 0, w, h);
    const T = V.floor;
    for (let y = 0, row = 0; y < h; y += T.tile * 0.62, row++) {
        for (let x = -(row % 2) * T.tile * 0.5; x < w; x += T.tile) {
            g.fillStyle = T.shades[Math.floor(rand() * T.shades.length)];
            g.fillRect(x + 1, y + 1, T.tile - 2, T.tile * 0.62 - 2);
        }
    }
    g.strokeStyle = T.mortar;
    g.lineWidth = 1.4;
    for (let y = 0, row = 0; y < h; y += T.tile * 0.62, row++) {
        g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
        for (let x = -(row % 2) * T.tile * 0.5; x < w; x += T.tile) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + T.tile * 0.62); g.stroke(); }
    }
    // escurece para as bordas (as lajes só aparecem bem no centro)
    const floor = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, maxR);
    floor.addColorStop(0, 'rgba(0, 0, 0, 0)');
    floor.addColorStop(0.6, 'rgba(6, 7, 12, 0.35)');
    floor.addColorStop(1, 'rgba(6, 7, 12, 0.85)');
    g.fillStyle = floor;
    g.fillRect(0, 0, w, h);

    // tapete do portão até embaixo
    const C = V.carpet;
    const cx = w / 2;
    const half = w * C.halfWidth;
    g.fillStyle = C.color;
    g.fillRect(cx - half, 0, half * 2, h);
    g.fillStyle = C.edge;
    g.fillRect(cx - half, 0, 2.4, h);
    g.fillRect(cx + half - 2.4, 0, 2.4, h);
    g.fillStyle = C.worn;
    for (let i = 0; i < h / 14; i++) {
        g.globalAlpha = 0.25 + rand() * 0.5;
        g.fillRect(cx - half + 3 + rand() * (half * 2 - 8), rand() * h, 3 + rand() * 12, 1.4 + rand() * 2);
    }
    g.globalAlpha = 1;

    // o portão em arco na borda de cima: pedra, vão escuro e grade
    const G = V.gate;
    const gw = w * G.halfWidth;
    const gh = h * G.height;
    g.fillStyle = G.light;
    g.fillRect(cx - gw - 14, 0, gw * 2 + 28, gh + 4);
    g.fillStyle = G.stone;
    g.fillRect(cx - gw - 10, 0, gw * 2 + 20, gh);
    g.fillStyle = G.arch;
    g.beginPath();
    g.moveTo(cx - gw, gh);
    g.lineTo(cx - gw, gh * 0.45);
    g.quadraticCurveTo(cx - gw, 0, cx, 0);
    g.quadraticCurveTo(cx + gw, 0, cx + gw, gh * 0.45);
    g.lineTo(cx + gw, gh);
    g.closePath();
    g.fill();
    g.strokeStyle = G.bars;
    g.lineWidth = 1.6;
    for (let x = cx - gw + 8; x < cx + gw; x += 12) { g.beginPath(); g.moveTo(x, 2); g.lineTo(x, gh); g.stroke(); }
    const L = V.portal;
    const pr = Math.min(w, h) * L.radiusRatio * 2;
    const pool = g.createRadialGradient(w * L.x, h * L.y, 0, w * L.x, h * L.y, pr);
    pool.addColorStop(0, L.color);
    pool.addColorStop(1, 'rgba(255, 150, 70, 0)');
    g.fillStyle = pool;
    g.fillRect(w * L.x - pr, h * L.y - pr, pr * 2, pr * 2);
}

registerScenery(composeScenery({ id: 'castle_gate', name: 'Portões do Castelo de Gudran', visual: F, paintBase }));
