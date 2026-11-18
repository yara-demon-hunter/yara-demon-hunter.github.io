// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/oak/ancient_tree25d_visual.js e rode o sync.
import { CREATURE_DEFAULTS, BASE_COLORS } from '../../monsters/25d/creature25d.js';

// --- DADOS VISUAIS: Árvore Ancestral (buddy Treant) em sprites 3D ---
// O buddy Treant agora é a Árvore Ancestral do Laboratório (tools/lab/arvore_foto.js), a mesma da forma Ancient Grove do carvalho: atlas
// ancient_tree_atlas.webp, 5 ângulos x (12 quadros de andar + 8 de ataque). O Treant INIMIGO continua sendo o boneco robusto (treant/).
export const ANCIENT_TREE_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: { ...BASE_COLORS, aura: 'rgba(74, 222, 128, 0.55)' },
    strideSpeed: 6,
    spriteUnits: 46,           // lado do quadro em unidades do boneco (Ateliê)
    spriteScale: 0.05,         // jogo: escala do sprite por raio do monstro (1 = tamanho do desenho no atlas, que tem ~118 de altura)
    spriteFeet: 1.1,           // jogo: onde ficam os pés, em raios abaixo do centro
    shadowRadius: 0.9,         // jogo: raio da sombra, em raios do monstro
    pixelsPerCycle: 14,        // jogo: px andados por ciclo de passos
    auraRadius: 22,
    auraAlpha: 0.2,
    focusZ: 18,
    focusA: 14,
    scalePerRadius: 0.18,
    center: 18
};
