// --- DADOS VISUAIS: Herói em 2.5D (TESTE). ---
// Lidos por js/render/player25d.js (ative com ?hero=25d na URL).
// Usa a mesma paleta do herói top-down; aqui ficam só a câmera e as medidas do corpo em 3D.
import { HERO_VISUALS } from './hero_visual.js';

export const HERO_25D_VISUALS = {
    colors: HERO_VISUALS.colors,

    // Escala visual do desenho (não altera o raio de colisão em CHARACTER_MODEL)
    scale: 2.1,

    // Câmera: olhando quase de cima, levemente inclinada.
    // heightScale: quanto 1 unidade de altura sobe na tela (0 = top-down puro)
    // groundSquash: achatamento do chão do próprio boneco (1 = igual ao resto do jogo)
    heightScale: 0.62,
    groundSquash: 0.86,
    depthHeightWeight: 0.6,       // peso da altura na ordem de desenho (o que fica na frente)

    // Sombra no chão
    shadowRadiusFront: 6.5,
    shadowRadiusSide: 5.5,
    shadowColor: 'rgba(0, 0, 0, 0.38)',

    // Medidas do corpo (unidades antes da escala; a = frente, b = direita, z = altura)
    // Pernas e botas
    hipHeight: 10,
    hipSpread: 2,
    footSpread: 2.4,
    kneeForward: 1.2,
    ankleHeight: 2.6,
    legWidth: 2.6,
    bootWidth: 3,
    bootLength: 2,
    strideLength: 4.5,
    footLift: 15.5,

    // Tronco (meio-eixos da seção: A = frente/trás, B = lados)
    waist: { A: 2.5, B: 3.4 },
    chest: { A: 2.8, B: 4.6 },
    shoulderHeight: 17,
    sashHeight: 10.8,
    runLean: 5,                 // tronco e cabeça vão para a frente na corrida
    breathAmount: 0.35,

    // Braços
    shoulderRadius: 2,
    armWidth: 2.2,
    handRadius: 1.2,
    handHeight: 10,
    armSwing: 2.6,

    // Capuz e máscara
    headHeight: 21,
    hoodRadius: 3.9,
    hoodTipLength: 3.2,
    maskForward: 2.9,
    maskDepth: 1.3,
    maskWidth: 2.3,
    maskHeight: 3.1,
    maskHeightOffset: -0.6,

    // Capa (presa nas costas dos ombros, barra perto do chão; sobe e vai para trás na corrida)
    capeAnchorHeight: 17.4,
    capeHemHeight: 2.5,
    capeRunLift: 10.5,
    capeLength: 3,
    capeRunLength: 20,
    capeTailWidth: 7,

    // Espada: em repouso aponta para trás e para baixo; no golpe varre na horizontal
    bladeLength: 12,
    bladeWidth: 2,
    swingRadius: 7,
    swingHeight: 11.5,
    restBladeDrop: 0.45
};
