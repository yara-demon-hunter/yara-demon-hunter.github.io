// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/melee25d.js e rode o sync.
import { norm } from '../../characters/hunter/kit25d.js';

// --- GOLPE CORPO A CORPO DOS MONSTROS COM ARMA (espada, machado, lança) ---
// O jogo informa o andamento do ataque em meleeState.p (0 a 1): 0 a 0,45 prepara (ergue a arma), 0,45 a 0,65 golpeia (varre ou estoca, rápido),
// 0,65 a 1 recolhe. 0 = parado/andando (a pose de sempre). Quem desenha (human25d.js, skeleton25d.js) pede meleePose(kind, p) e soma ao repouso.
export const meleeState = { p: 0 };

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// t: -1 = arma erguida/recuada, +1 = fim do golpe
function swingT(p) {
    if (p < 0.45) return -clamp01(p / 0.45);
    if (p < 0.65) return -1 + 2 * clamp01((p - 0.45) / 0.2);
    return 1 - clamp01((p - 0.65) / 0.35);
}

// offset: quanto a mão se desloca do repouso [a, b, z]; dir: a direção da arma (null = a de repouso)
export function meleePose(kind, p) {
    const t = swingT(p);
    if (kind === 'spear') return { offset: [t < 0 ? t * 2.4 : t * 4.4, 0, t > 0 ? -t * 0.5 : 0], dir: null };
    const el = t < 0 ? 0.38 + -t * 1.05 : 0.38 - t * 0.8;
    const az = t < 0 ? 0.1 + -t * 0.9 : 0.1 - t * 1.05;
    return {
        offset: [t < 0 ? t * 1.2 : t * 2.2, 0, t < 0 ? -t * 2.2 : -t * 1.0],
        dir: norm([Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)])
    };
}
