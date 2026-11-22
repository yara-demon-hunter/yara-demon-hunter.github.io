import { ARMORED_ZOMBIE_25D_VISUALS as S } from './armored_zombie25d_visual.js';
import { registerHuman, renderHuman25D } from '../human25d.js';

// --- ZUMBI DE ARMADURA 2.5D ---
// Soldado medieval morto-vivo: armadura de placas enferrujada, chapéu de ferro, rosto verde apodrecido, braços esticados em manoplas e uma perna que arrasta.
// Uso: renderArmoredZombie25D(e), ou o modelo 'armored_zombie' em renderHero25D. Medidas e cores: armored_zombie25d_visual.js.
registerHuman('armored_zombie', S);

export function renderArmoredZombie25D(e) {
    renderHuman25D(e, 'armored_zombie', S);
}
