// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/grave_king/grave_king25d.js e rode o sync.
import { GRAVE_KING_25D_VISUALS as S } from './grave_king25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { skeletonBody, renderSkeletonModel } from '../skeleton/skeleton25d.js';

// --- REI DO CEMITÉRIO 2.5D (chefe) ---
// Esqueleto zumbi de guerra: o corpo do Esqueleto Guerreiro, maior, com carne podre ainda grudada (fleshHead/fleshTorso), espada longa e escudo.
// Uso: renderGraveKing25D(e), ou o modelo 'grave_king' em renderHero25D. Medidas e cores: grave_king25d_visual.js.
registerBody('grave_king', skeletonBody(S));

export function renderGraveKing25D(e) {
    renderSkeletonModel(e, 'grave_king', S);
}
