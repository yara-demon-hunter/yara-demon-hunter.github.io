import { DROWNED_25D_VISUALS as S } from './drowned25d_visual.js';
import { registerHuman, renderHuman25D } from '../human25d.js';

// --- AFOGADO 2.5D ---
// Morto do rio: pele azul-acinzentada e inchada, cabelo de algas pingando, peito marcado, boca aberta e olhos de brilho ciano, com garras pálidas. Anda arrastado, de braços moles.
// Uso: renderDrowned25D(e), ou o modelo 'drowned' em renderHero25D. Medidas e cores: drowned25d_visual.js.
registerHuman('drowned', S);

export function renderDrowned25D(e) {
    renderHuman25D(e, 'drowned', S);
}
