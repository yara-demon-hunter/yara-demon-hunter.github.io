// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/plate_knight/plate_knight25d.js e rode o sync.
import { PLATE_KNIGHT_25D_VISUALS as S } from './plate_knight25d_visual.js';
import { registerHuman, renderHuman25D } from '../human25d.js';

// --- CAVALEIRO DE PLACAS 2.5D ---
// Cavaleiro em armadura completa de aço polido: elmo fechado com fenda e brilho vermelho, pluma vermelha, ombreiras, tabardo branco com a cruz vermelha da vila, espada e escudo de aço. Lento e pesado.
// Uso: renderPlateKnight25D(e), ou o modelo 'plate_knight' em renderHero25D. Medidas e cores: plate_knight25d_visual.js.
registerHuman('plate_knight', S);

export function renderPlateKnight25D(e) {
    renderHuman25D(e, 'plate_knight', S);
}
