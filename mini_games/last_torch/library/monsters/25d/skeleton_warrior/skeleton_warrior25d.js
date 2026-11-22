// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/skeleton_warrior/skeleton_warrior25d.js e rode o sync.
import { SKELETON_WARRIOR_25D_VISUALS as S } from './skeleton_warrior25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { skeletonBody, renderSkeletonModel } from '../skeleton/skeleton25d.js';

// --- ESQUELETO GUERREIRO 2.5D ---
// Esqueleto armado do cemitério: capacete e peitoral enferrujados, espada gasta na mão direita e um escudo de madeira rachado na esquerda. Mesmo corpo do Esqueleto, com as peças de guerra por cima.
// Uso: renderSkeletonWarrior25D(e), ou o modelo 'skeleton_warrior' em renderHero25D. Medidas e cores: skeleton_warrior25d_visual.js.
registerBody('skeleton_warrior', skeletonBody(S));

export function renderSkeletonWarrior25D(e) {
    renderSkeletonModel(e, 'skeleton_warrior', S);
}
