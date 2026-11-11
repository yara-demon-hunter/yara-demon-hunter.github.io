// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/skeleton/skeleton25d_visual.js e rode o sync.
import { SKELETON_VISUALS } from '../../topdown/skeleton/skeleton_visual.js';
import { HERO_VISUALS } from '../../../characters/hunter/hero_visual.js';

// --- DADOS VISUAIS: Esqueleto 2.5D (skeleton25d.js) ---
// O mesmo Esqueleto de topdown/skeleton/skeleton.js (crânio rachado de olhos verdes, alma verde nas costelas, trapo na bacia, braços
// esticados à frente), montado no boneco 2.5D dos heróis: serve para qualquer câmera (de cima no Last Torch, de lado no
// palco do yara-rpg). As cores são as de topdown/skeleton/skeleton_visual.js: mudar lá muda os desenhos.
// Medidas em unidades do boneco (o herói tem ~25 de altura). Só afeta o desenho; vida, dano e velocidade ficam no jogo.
const C = SKELETON_VISUALS.colors;

export const SKELETON_25D_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        ...C,
        outline: C.boneDark,
        // A capa padrão não é usada (o trapo fica no lugar); estas só servem de reserva
        cape: C.rag,
        capeFold: C.ragEdge,
        capeEdge: C.ragEdge
    },

    // Lâmina: o esqueleto não tem arma (as garras são as mãos)
    bladeLength: 6,
    bladeWidth: 1,
    glowScale: 0,
    // Passada dura e um pouco mais lenta que a de um herói
    strideSpeed: 8.5,
    bodyScale: 1,

    // Ossos
    boneWidth: 0.95,           // braços e pernas
    jointRadius: 0.75,         // joelhos e cotovelos
    footLength: 2.4,

    // Bacia e coluna
    pelvisWidth: 2.6,
    pelvisDepth: 1.6,
    vertebrae: 6,
    vertebraRadius: 0.55,

    // Caixa torácica: pares de costelas descendo do peito, mais estreitas embaixo
    ribPairs: 4,
    ribTop: 1.2,               // abaixo dos ombros (ao longo da coluna)
    ribGap: 1.35,
    ribWidth: 4.2,             // meia-largura da costela de cima
    ribDepth: 2.5,             // meia-profundidade
    ribThickness: 0.55,

    // Alma: chama verde dentro do peito (soulAt: da bacia, 0, aos ombros, 1)
    soulAt: 0.46,
    soulRadius: 1.1,
    soulGlowRadius: 5.5,
    soulPulseHz: 1.8,

    // Crânio
    skullRadius: 2.5,
    jawOpenMax: 0.45,
    chatterHz: 5.4,
    twitchHz: 0.35,
    twitchAmount: 1.2,         // tranco de cabeça para o lado (unidades)
    eyeGlowRadius: 2.2,

    // Braços esticados à frente (mão: frente, lado e altura em relação ao ombro)
    armReach: 7.5,
    armSpread: 0.6,
    armDrop: 2.2,
    armSwing: 1.2,
    clawLength: 1.5,

    // Trapo preso à bacia
    ragStrips: 3,
    ragLength: 5.5,
    ragWidth: 0.85,

    // Brilho verde em volta (aura) e quanto tempo os ossos piscam em branco ao levar dano
    auraRadius: 14.4,
    auraAlpha: 0.1,
    hurtFlashSeconds: 0.12,

    // Tamanho no Last Torch: px por unidade = raio do monstro × isto (o desenho de cima usa raio × 1,35)
    scalePerRadius: 0.15,
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão do monstro
    center: 12
};
