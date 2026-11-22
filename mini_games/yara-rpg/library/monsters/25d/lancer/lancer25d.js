// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/lancer/lancer25d.js e rode o sync.
import { LANCER_25D_VISUALS as S } from './lancer25d_visual.js';
import { registerHuman, renderHuman25D } from '../human25d.js';

// --- LANCEIRO DO CASTELO 2.5D ---
// Guarda do castelo do Gudran: armadura de aço escuro, elmo fechado de pluma roxa, tabardo roxo com a faixa prateada e uma lança comprida com bandeirola. Mantém a lança apontada à frente.
// Uso: renderLancer25D(e), ou o modelo 'lancer' em renderHero25D. Medidas e cores: lancer25d_visual.js.
registerHuman('lancer', S);

export function renderLancer25D(e) {
    renderHuman25D(e, 'lancer', S);
}
