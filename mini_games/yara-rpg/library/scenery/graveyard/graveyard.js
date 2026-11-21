// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/graveyard/graveyard.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { GRAVEYARD_VISUALS as F } from './graveyard_visual.js';

// --- CENÁRIO: CEMITÉRIO (graveyard) ---
// Tela extra do mapa. Este arquivo só desenha a BASE: capim cinzento, a trilha de cascalho e o portão de ferro entre dois pilares na
// borda de cima (fora da ação). Lápides, ossos, fogos-fátuos etc. são PEÇAS da receita `props`. Ficha: art_reference/scenery.md.

// O chão: capim escuro, trilha de cascalho do portão até a borda de baixo e o portão de ferro
export function paintBase(g, w, h, rand, _env, V = F) {
    const maxR = Math.max(w, h) * V.clearingRadiusRatio;
    g.fillStyle = V.ground[2];
    g.fillRect(0, 0, w, h);
    const floor = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, maxR);
    floor.addColorStop(0, V.ground[0]);
    floor.addColorStop(0.55, V.ground[1]);
    floor.addColorStop(1, V.ground[2]);
    g.fillStyle = floor;
    g.fillRect(0, 0, w, h);

    // trilha de cascalho serpenteando na vertical
    const P = V.path;
    const half = w * P.halfWidth;
    const cx = (y) => w / 2 + Math.sin(y * 0.012 + 0.6) * 9 + Math.sin(y * 0.031) * 3;
    g.fillStyle = P.edge;
    g.beginPath();
    g.moveTo(cx(0) - half - 4, 0);
    for (let y = 0; y <= h; y += 8) g.lineTo(cx(y) - half - 4, y);
    for (let y = h; y >= 0; y -= 8) g.lineTo(cx(y) + half + 4, y);
    g.closePath();
    g.fill();
    g.fillStyle = P.gravel[1];
    g.beginPath();
    g.moveTo(cx(0) - half, 0);
    for (let y = 0; y <= h; y += 8) g.lineTo(cx(y) - half, y);
    for (let y = h; y >= 0; y -= 8) g.lineTo(cx(y) + half, y);
    g.closePath();
    g.fill();
    for (let i = 0; i < w * h / 260; i++) {
        const y = rand() * h;
        const x = cx(y) + (rand() - 0.5) * half * 2;
        g.fillStyle = P.gravel[rand() < 0.5 ? 0 : 1];
        g.globalAlpha = 0.4 + rand() * 0.5;
        g.beginPath();
        g.ellipse(x, y, 1 + rand() * 1.8, 0.8 + rand() * 1.2, 0, 0, Math.PI * 2);
        g.fill();
    }
    g.globalAlpha = 1;

    // o portão de ferro entre dois pilares, na borda de cima
    const G = V.gate;
    const gw = w * G.halfWidth;
    const gh = h * G.height;
    const mid = w / 2;
    g.fillStyle = 'rgba(0, 0, 0, 0.45)';
    g.fillRect(mid - gw - 12, 6, gw * 2 + 24, gh);
    g.strokeStyle = G.bars;
    g.lineWidth = 2.4;
    for (let x = mid - gw; x <= mid + gw; x += 9) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, gh * 0.9); g.stroke(); }
    g.beginPath(); g.moveTo(mid - gw, gh * 0.3); g.lineTo(mid + gw, gh * 0.3); g.moveTo(mid - gw, gh * 0.75); g.lineTo(mid + gw, gh * 0.75); g.stroke();
    g.strokeStyle = G.barLight;
    g.lineWidth = 0.8;
    for (let x = mid - gw + 1; x <= mid + gw; x += 9) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, gh * 0.9); g.stroke(); }
    [mid - gw - 12, mid + gw].forEach(px => {
        g.fillStyle = G.pillar;
        g.fillRect(px, 0, 12, gh);
        g.fillStyle = G.pillarLight;
        g.fillRect(px, 0, 2.4, gh);
        g.fillStyle = G.pillarLight;
        g.fillRect(px - 2, gh - 6, 16, 6);
    });
    const L = V.portal;
    const pr = Math.min(w, h) * L.radiusRatio * 2;
    const pool = g.createRadialGradient(w * L.x, h * L.y, 0, w * L.x, h * L.y, pr);
    pool.addColorStop(0, L.color);
    pool.addColorStop(1, 'rgba(190, 210, 255, 0)');
    g.fillStyle = pool;
    g.fillRect(w * L.x - pr, h * L.y - pr, pr * 2, pr * 2);
}

registerScenery(composeScenery({ id: 'graveyard', name: 'Cemitério', visual: F, paintBase }));
