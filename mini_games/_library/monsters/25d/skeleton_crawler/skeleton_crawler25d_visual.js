import { SKELETON_25D_VISUALS } from '../skeleton/skeleton25d_visual.js';

// --- DADOS VISUAIS: Esqueleto Rastejante 2.5D (skeleton_crawler25d.js) ---
// O clássico do Last Torch (o desenho de cima: corpo baixo, braços à frente) em pé de igualdade com o outro: mesmas
// peças e cores, mas rastejando. Bacia e ombros baixos, tronco quase deitado, cabeça baixa à frente e as mãos indo ao
// chão uma de cada vez, puxando o corpo.
export const SKELETON_CRAWLER_25D_VISUALS = {
    ...SKELETON_25D_VISUALS,
    strideSpeed: 7,
    ribPairs: 4,
    // Postura rastejante (valem só para este monstro)
    crawl: true,
    crawlHipZ: 6.2,            // altura da bacia
    crawlShoulderZ: 7.4,       // altura dos ombros
    crawlLean: 8.5,            // quanto os ombros vão à frente da bacia
    crawlHeadForward: 3.2,     // cabeça à frente dos ombros
    crawlHeadZ: 8.6,           // altura da cabeça
    crawlHandReach: 4.5,       // mãos no chão, à frente dos ombros
    crawlHandSpread: 4.2,
    crawlHandLift: 2.2,        // quanto a mão sobe ao dar o passo
    crawlBob: 0.5,             // sobe e desce a cada puxada
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão do monstro
    center: 5
};
