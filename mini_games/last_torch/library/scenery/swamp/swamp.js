// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/swamp/swamp.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { SWAMP_VISUALS as F } from './swamp_visual.js';

// --- CENÁRIO: PÂNTANO (swamp) ---
// Parte do mapa em 5 telas (floresta, travessia do rio, pântano, entrada da vila, castelo do Gudran), 5 ondas por tela.
// Este arquivo só desenha a BASE (o chão); o resto são PEÇAS da biblioteca, escolhidas na receita `props` do arquivo de dados.
// Nada fica por cima da ação. Ficha: art_reference/scenery.md.

// O chão: lama escura e poças de água parada espalhadas (nunca no centro, onde a luta acontece)
export function paintBase(g, w, h, rand, _env, V = F) {
    const maxR = Math.max(w, h) * V.clearingRadiusRatio;
    g.fillStyle = V.ground[2];
    g.fillRect(0, 0, w, h);
    const floor = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, maxR);
    floor.addColorStop(0, V.ground[0]);
    floor.addColorStop(0.5, V.ground[1]);
    floor.addColorStop(1, V.ground[2]);
    g.fillStyle = floor;
    g.fillRect(0, 0, w, h);

    // As lagoas agora são OBJETOS (peça `swamp_pool`): mova, gire, mude o tamanho e apague no editor. Este desenho antigo só roda enquanto o cenário não
    // tem nenhum objeto `swamp_pool` (layouts gravados antes disso); o sorteio continua rodando para o resto do cenário não mudar de lugar.
    const show = !(V.placed ?? []).some(o => o.prop === 'swamp_pool');
    const P = V.pools;
    const n = Math.round(P.count[0] + rand() * (P.count[1] - P.count[0]));
    const keep = Math.min(w, h) * P.keepClear;
    for (let i = 0, placed = 0; placed < n && i < n * 8; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const rx = P.radius[0] + rand() * (P.radius[1] - P.radius[0]);
        const ry = rx * (0.5 + rand() * 0.2);
        const tilt = (rand() - 0.5) * 0.5;
        const seedWeed = rand();
        if (Math.hypot(x - w / 2, y - h / 2) < keep + rx * 0.6) continue;
        placed++;
        if (!show) {
            for (let k = 0; k < rx * 0.5; k++) { rand(); rand(); rand(); rand(); }          // a lentilha não é desenhada, mas o sorteio dela é consumido igual
            continue;
        }
        g.fillStyle = P.mud;
        g.beginPath();
        g.ellipse(x, y, rx + 6, ry + 5, tilt, 0, Math.PI * 2);
        g.fill();
        const fill = g.createRadialGradient(x, y, 0, x, y, rx);
        fill.addColorStop(0, P.water[0]);
        fill.addColorStop(1, P.water[1]);
        g.fillStyle = fill;
        g.beginPath();
        g.ellipse(x, y, rx, ry, tilt, 0, Math.PI * 2);
        g.fill();
        // lentilha-d'água: pontinhos verdes na superfície
        g.fillStyle = P.weed;
        for (let k = 0; k < rx * 0.5; k++) {
            const a = rand() * Math.PI * 2;
            const d = Math.sqrt(rand()) * 0.9;
            g.globalAlpha = 0.4 + seedWeed * 0.4;
            g.beginPath();
            g.ellipse(x + Math.cos(a) * rx * d, y + Math.sin(a) * ry * d, 1.4 + rand() * 1.6, 0.9 + rand(), 0, 0, Math.PI * 2);
            g.fill();
        }
        g.globalAlpha = 1;
    }
    const L = V.portal;
    const pr = Math.min(w, h) * L.radiusRatio * 2;
    const pool = g.createRadialGradient(w * L.x, h * L.y, 0, w * L.x, h * L.y, pr);
    pool.addColorStop(0, L.color);
    pool.addColorStop(1, 'rgba(170, 220, 130, 0)');
    g.fillStyle = pool;
    g.fillRect(w * L.x - pr, h * L.y - pr, pr * 2, pr * 2);
}

registerScenery(composeScenery({ id: 'swamp', name: 'Pântano', visual: F, paintBase }));
