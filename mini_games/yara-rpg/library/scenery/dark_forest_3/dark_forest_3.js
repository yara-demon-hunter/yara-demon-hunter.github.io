// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/dark_forest_3/dark_forest_3.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { DARK_FOREST_3_VISUALS as F } from './dark_forest_3_visual.js';

// --- CENÁRIO: FLORESTA DA NÉVOA (dark_forest_3) ---
// Variante de dark_forest_2: chão e peças mantêm a identidade; a névoa abre mais espaço visual para a luta.
function paintBase(g, w, h) {
    const maxR = Math.max(w, h) * F.clearingRadiusRatio;
    g.fillStyle = F.ground[2];
    g.fillRect(0, 0, w, h);
    const floor = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, maxR);
    floor.addColorStop(0, F.ground[0]);
    floor.addColorStop(0.5, F.ground[1]);
    floor.addColorStop(1, F.ground[2]);
    g.fillStyle = floor;
    g.fillRect(0, 0, w, h);

    const L = F.portal;
    const pr = Math.min(w, h) * L.radiusRatio * 2;
    const pool = g.createRadialGradient(w * L.x, h * L.y, 0, w * L.x, h * L.y, pr);
    pool.addColorStop(0, L.color);
    pool.addColorStop(1, 'rgba(200, 240, 245, 0)');
    g.fillStyle = pool;
    g.fillRect(w * L.x - pr, h * L.y - pr, pr * 2, pr * 2);
}

registerScenery(composeScenery({ id: 'dark_forest_3', name: 'Floresta da Névoa — clara', visual: F, paintBase }));
