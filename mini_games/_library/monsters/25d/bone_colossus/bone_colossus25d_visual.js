import { BONE_COLOSSUS_VISUALS } from '../../topdown/bone_colossus/bone_colossus_visual.js';
import { SKELETON_25D_VISUALS } from '../skeleton/skeleton25d_visual.js';

// --- DADOS VISUAIS: Colosso de Ossos 2.5D (bone_colossus25d.js) ---
// Como no desenho de cima: é o Esqueleto (../skeleton/) gigante, com ossos mais escuros, a alma em brasa laranja e o
// montante pesado na mão direita. As cores são as de topdown/bone_colossus/bone_colossus_visual.js; o tamanho gigante
// vem do raio do monstro no jogo. Herda as medidas do Esqueleto 2.5D e muda só o que é dele.
const C = BONE_COLOSSUS_VISUALS.colors;
const SW = BONE_COLOSSUS_VISUALS.sword;

export const BONE_COLOSSUS_25D_VISUALS = {
    ...SKELETON_25D_VISUALS,
    colors: {
        ...SKELETON_25D_VISUALS.colors, ...C, outline: C.boneDark, cape: C.rag, capeFold: C.ragEdge, capeEdge: C.ragEdge,
        swordSteel: SW.steel, swordDark: SW.steelDark, swordEdge: SW.edge, swordGrip: SW.grip, swordGold: SW.gold
    },
    // Passos lentos e pesados; ossos mais grossos
    strideSpeed: 5,
    boneWidth: 1.25,
    jointRadius: 0.95,
    skullRadius: 2.7,
    ribThickness: 0.7,
    soulGlowRadius: 7,

    // Montante na mão direita
    bladeLength: 17,
    bladeWidth: 1.9,
    // Golpe na tocha (o jogo informa a fase; no tuner: 0 = repouso, 0,5 = recuado, 1 = batendo)
    previewSlam: 0,

    auraRadius: 17,
    auraAlpha: BONE_COLOSSUS_VISUALS.auraAlpha,
    focusZ: 20,
    focusA: 1,
    scalePerRadius: 0.15,
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão do monstro
    center: 12
};
