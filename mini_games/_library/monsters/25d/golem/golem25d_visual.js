import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Golem de Brasa e Musgo 2.5D (golem25d.js) ---
// Gigante de pedra rachada com lava nas frestas, musgo no alto das peças, chifres, olhos de brasa e um núcleo brilhando no peito.
// Medidas em unidades do boneco (o herói tem ~25 de altura; o golem tem ~36). Só afeta o desenho; vida, soco e andar ficam no jogo.
export const GOLEM_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: {
        ...BASE_COLORS,
        stone: '#6b625a',
        stoneDark: '#3b352f',
        stoneLight: '#9a8f82',
        moss: '#4f8a1f',
        mossLight: '#79b83a',
        lava: '#ff6a13',
        lavaLight: '#ffc14d',
        core: '#ffb347',
        coreGlow: 'rgba(255, 140, 40, 0.95)',
        eye: '#ffd060',
        eyeGlow: 'rgba(255, 170, 40, 0.9)',
        ink: '#17120e',
        aura: 'rgba(255, 120, 30, 0.5)'
    },
    strideSpeed: 5,                // passos lentos e pesados

    // Corpo
    hipHeight: 12,
    chestHeight: 24,
    torsoWidth: 8.4,
    legWidth: 4.8,
    legSpread: 5,
    stride: 3.2,
    footLift: 1.8,
    bounce: 0.45,
    // Braços (punhos enormes) e cabeça
    armWidth: 4.2,
    armLength: 16,
    fistSize: 5.6,
    headHeight: 30,
    headSize: 4.8,
    hornLength: 6,
    // Núcleo no peito e quantas rachaduras de lava
    coreSize: 2.6,
    coreHeight: 6,
    cracks: 7,

    // Versão em sprites: tamanho da imagem em raios do monstro, quanto sobe (fração do tamanho) e quantos px andados por passo
    spriteScale: 8,
    spriteUnits: 30,               // tamanho da imagem em unidades do boneco (para o Ateliê e quem desenha pelo boneco)
    spriteLift: -0.04,
    spriteFeet: 0.18,              // onde ficam os pés, abaixo do centro (fração do tamanho): a sombra se prende aqui
    shadowRadius: 0.2,             // raio da sombra (fração do tamanho)
    pixelsPerCycle: 8,

    auraRadius: 22,
    auraAlpha: 0.18,
    focusZ: 18,
    focusA: 14,
    scalePerRadius: 0.2,
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão
    center: 17
};
