import { DEMON_25D_VISUALS as S } from './demon25d_visual.js';
import { registerHuman, renderHuman25D } from '../human25d.js';

// --- DEMÔNIO SOLDADO 2.5D ---
// Demônio menor do castelo: pele vermelho-escura, chifres curvos, presas, asas pequenas de morcego, rabo com ponta de lança, garras e o peito em brasa. Postura agachada e agressiva.
// Uso: renderDemon25D(e), ou o modelo 'demon' em renderHero25D. Medidas e cores: demon25d_visual.js.
registerHuman('demon', S);

export function renderDemon25D(e) {
    renderHuman25D(e, 'demon', S);
}
