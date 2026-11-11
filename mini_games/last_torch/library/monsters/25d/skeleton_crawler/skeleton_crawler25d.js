// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/skeleton_crawler/skeleton_crawler25d.js e rode o sync.
import { SKELETON_CRAWLER_25D_VISUALS as SC } from './skeleton_crawler25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { skeletonBody, renderSkeletonModel } from '../skeleton/skeleton25d.js';

// --- ESQUELETO RASTEJANTE 2.5D ---
// Monstro à parte, com as mesmas peças de osso do Esqueleto (../skeleton/skeleton25d.js) numa postura rastejante: bacia
// e ombros baixos, tronco quase deitado, cabeça baixa à frente e as mãos indo ao chão uma de cada vez. É o clássico do
// Last Torch (o desenho de cima, topdown/skeleton) em 2.5D. Medidas: skeleton_crawler25d_visual.js (as cores vêm do
// Esqueleto). Uso: renderSkeletonCrawler25D(e), ou o modelo 'skeleton_crawler' em renderHero25D.
registerBody('skeleton_crawler', skeletonBody(SC));

export function renderSkeletonCrawler25D(e) {
    renderSkeletonModel(e, 'skeleton_crawler', SC);
}
