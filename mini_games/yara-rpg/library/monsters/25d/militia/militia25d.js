// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/militia/militia25d.js e rode o sync.
import { MILITIA_25D_VISUALS as S } from './militia25d_visual.js';
import { registerHuman, renderHuman25D } from '../human25d.js';

// --- MILICIANO DA VILA 2.5D ---
// Camponês armado e acolchoado: gibão de couro e linho remendado, chapéu de ferro de aba larga, machado de lenhador e um escudo de madeira com a marca da vila pintada. Anda curvado e firme.
// Uso: renderMilitia25D(e), ou o modelo 'militia' em renderHero25D. Medidas e cores: militia25d_visual.js.
registerHuman('militia', S);

export function renderMilitia25D(e) {
    renderHuman25D(e, 'militia', S);
}
