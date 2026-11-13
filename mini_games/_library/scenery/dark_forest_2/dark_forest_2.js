import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { DARK_FOREST_2_VISUALS as F } from './dark_forest_2_visual.js';

// --- CENÁRIO: FLORESTA DA NÉVOA (dark_forest_2) ---
// A primeira fase do yara-rpg vista de cima. Este arquivo só desenha a BASE (o chão e o lago de luz do portal): tudo o que
// decora o chão (musgo, folhas, pedras, tocos, raízes, samambaias, capim, cogumelos) é uma PEÇA da biblioteca
// (scenery/props/) escolhida na receita `props` do arquivo de dados. Trocar, tirar ou recolorir uma peça é mexer na receita.
// Nada fica por cima da ação: o jogador sempre vê o que enfrenta.
// Ficha de como foi criado: art_reference/scenery.md.

// O chão, pintado uma vez: terra mais clara no centro e o lago de luz fria do portal, fora do centro
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

registerScenery(composeScenery({ id: 'dark_forest_2', name: 'Floresta da Névoa', visual: F, paintBase }));
