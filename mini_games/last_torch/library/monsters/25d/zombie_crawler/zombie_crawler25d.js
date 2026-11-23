// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/zombie_crawler/zombie_crawler25d.js e rode o sync.
import { ZOMBIE_CRAWLER_25D_VISUALS as S } from './zombie_crawler25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { skeletonBody, renderSkeletonModel } from '../skeleton/skeleton25d.js';

// --- ZUMBI RASTEJANTE 2.5D ---
// Meio zumbi que se arrasta só com os braços: sem pernas nem bacia inteira, com a coluna à mostra arrastando atrás dele.
// Usa as peças do Esqueleto Rastejante (../skeleton/skeleton25d.js) com as opções noLegs/tailBones/fleshHead/fleshTorso.
// Uso: renderZombieCrawler25D(e), ou o modelo 'zombie_crawler' em renderHero25D. Medidas e cores: zombie_crawler25d_visual.js.
registerBody('zombie_crawler', skeletonBody(S));

export function renderZombieCrawler25D(e) {
    renderSkeletonModel(e, 'zombie_crawler', S);
}
