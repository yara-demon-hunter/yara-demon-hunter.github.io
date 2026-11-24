import { GRAVE_KING_25D_VISUALS as S } from './grave_king25d_visual.js';
import { registerHuman, renderHuman25D } from '../human25d.js';

// --- REI DO CEMITÉRIO 2.5D (chefe) ---
// Cavaleiro morto-vivo de armadura negra e bronze, elmo de espinhos com a caveira à mostra, mãos de esqueleto, capa rasgada e espadão arrastando
// (ver art_reference/character.md). Montado pelo corpo de gente (../human25d.js). Medidas e cores: grave_king25d_visual.js.
// Uso: renderGraveKing25D(e), ou o modelo 'grave_king' em renderHero25D.
registerHuman('grave_king', S);

export function renderGraveKing25D(e) {
    renderHuman25D(e, 'grave_king', S);
}
