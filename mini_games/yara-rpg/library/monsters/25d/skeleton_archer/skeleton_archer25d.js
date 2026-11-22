// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/skeleton_archer/skeleton_archer25d.js e rode o sync.
import { SKELETON_ARCHER_25D_VISUALS as S } from './skeleton_archer25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { skeletonBody, renderSkeletonModel } from '../skeleton/skeleton25d.js';

// --- ESQUELETO ARQUEIRO 2.5D ---
// Esqueleto atirador: capuz rasgado cinza-arroxeado, arco de madeira velha na mão esquerda com a flecha encaixada, aljava com penas vermelhas nas costas. Fica de arco armado, pronto para soltar.
// Uso: renderSkeletonArcher25D(e), ou o modelo 'skeleton_archer' em renderHero25D. Medidas e cores: skeleton_archer25d_visual.js.
registerBody('skeleton_archer', skeletonBody(S));

export function renderSkeletonArcher25D(e) {
    renderSkeletonModel(e, 'skeleton_archer', S);
}
