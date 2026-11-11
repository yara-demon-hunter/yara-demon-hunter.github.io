// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/topdown/bone_colossus/bone_colossus_visual.js e rode o sync.
// --- DADOS VISUAIS: Colosso de Ossos. ---
// O corpo é o do esqueleto (../skeleton/skeleton.js) em tamanho gigante, com ossos mais escuros e a alma em brasa,
// e o montante pesado na mão direita.
// Só afeta o desenho; colisão, velocidade e tremor dos passos ficam no jogo (no Last Torch, MONSTER_MODELS.BONE_COLOSSUS).
import { SKELETON_VISUALS } from '../skeleton/skeleton_visual.js';

export const BONE_COLOSSUS_VISUALS = {
    scale: SKELETON_VISUALS.scale,
    // Paleta do corpo (as chaves são as do esqueleto)
    colors: {
        ...SKELETON_VISUALS.colors,
        bone: '#cfc4a6',
        boneShade: '#8f8467',
        boneDark: '#3f382b',
        soul: '#fb923c',
        soulCore: '#fff7ed',
        soulGlow: 'rgba(249, 115, 22, 0.45)',
        aura: '#f97316',
        rag: '#2a1d16',
        ragEdge: '#4a3326'
    },
    sword: {
        steel: '#5b6272',
        steelDark: '#2b303b',
        edge: '#aeb6c4',
        grip: '#3b2a1c',
        gold: '#a1792f',
        length: 1.5,            // em múltiplos do raio desenhado
        width: 0.2
    },
    // Braço direito em cada momento do golpe: reach leva a mão à frente, spread para fora (em raios)
    // e angle é a direção da lâmina (0 = reto à frente, positivo = para a direita)
    poses: {
        rest: { reach: 0, spread: 0, angle: 0.35 },
        back: { reach: -0.55, spread: 0.25, angle: 1.05 },
        hit: { reach: 0.5, spread: -0.24, angle: -0.08 }
    },
    // Duração de cada fase do golpe na tocha, em segundos: recua (windup), bate (strike) e volta (recover).
    // A lógica do jogo usa estes mesmos tempos (no Last Torch, MONSTER_MODELS.BONE_COLOSSUS.torchSlam), para o dano
    // cair no instante em que a espada encosta na tocha. Mudou aqui, muda nos dois.
    slam: { windupSeconds: 1.1, strikeSeconds: 0.16, recoverSeconds: 0.7 },
    auraRadius: 1.9,
    auraAlpha: 0.2,
    shadowAlpha: 0.4,
    healthBarOffset: 18
};
