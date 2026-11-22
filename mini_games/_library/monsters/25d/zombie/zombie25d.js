import { ZOMBIE_25D_VISUALS as S } from './zombie25d_visual.js';
import { registerHuman, renderHuman25D } from '../human25d.js';

// --- ZUMBI 2.5D ---
// Morto-vivo do cemitério: pele verde-acinzentada, camisa rasgada, braços esticados à frente com garras, corpo curvado, boca aberta.
// Uso: renderZombie25D(e), ou o modelo 'zombie' em renderHero25D. Medidas e cores: zombie25d_visual.js.
registerHuman('zombie', S);

export function renderZombie25D(e) {
    renderHuman25D(e, 'zombie', S);
}
