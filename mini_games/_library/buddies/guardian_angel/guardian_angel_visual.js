import { HERO_VISUALS } from '../../characters/hunter/hero_visual.js';

// --- ANJO GUARDIÃO: cores e medidas do boneco 2.5D (angel25d.js) ---
// Valores padrão. Mudar aqui muda o buddy em todos os jogos (depois do sync). As cores vêm da referência
// (art_reference/images/guardian-angel.jpeg): branco e dourado claro, contorno marrom, energia azul e branca.
// As chaves de colors que o motor do herói lê (outline, bladeGlowSoft...) vêm de HERO_VISUALS.colors.
export const GUARDIAN_ANGEL_VISUALS = {
    colors: {
        ...HERO_VISUALS.colors,
        outline: '#6d5c4e',
        // Roupa e armadura
        armor: '#f6f7fb', armorShade: '#d9dce8', armorLight: '#ffffff',
        robe: '#fbfbfd', robeShade: '#e3e5ef', cape: '#eceef6', capeShade: '#d3d7e6',
        gold: '#e2bd68', goldShade: '#b8923f', goldLight: '#f6e5ab', belt: '#7b6a5c', glove: '#ffffff',
        // Rosto, cabelo e elmo
        skin: '#f2cfae', skinShade: '#dfb391', hair: '#f1d68d', hairShade: '#d8b865', helmet: '#cfd4df', helmetLight: '#eef1f7',
        eye: '#3b3340', brow: '#8a6a3a', mouth: '#c98d7a',
        // Asas
        wing: '#fcfcff', wingBack: '#e3e6f1', wingGold: '#f3e3b0',
        // Luz: auréola, cajado de energia e cristal. bladeGlowSoft é o brilho que o motor põe em volta da "lâmina" (o cajado)
        halo: '#f6cf62', haloLight: '#fff2b0', aura: 'rgba(255, 244, 205, 0.85)',
        bladeGlowSoft: 'rgba(150, 200, 255, 0.8)', bladeGlowSoftFrenzy: 'rgba(255, 226, 140, 0.85)',
        staffGlow: 'rgba(110, 175, 255, 0.45)', staffCore: '#9cc8ff', staffBlue: '#4f93f0', staffWhite: '#ffffff',
        crystal: '#e6f3ff', crystalEdge: 'rgba(109, 140, 190, 0.9)',
        orbGlow: 'rgba(255, 226, 140, 0.95)', orbCore: 'rgba(255, 255, 255, 0.95)',
        shot: '#ffffff', shotGlow: 'rgba(255, 236, 170, 0.9)'
    },

    // Lidos pelo motor do herói (body_registry.js)
    bodyScale: 1.1,             // um pouco maior que o herói
    glowScale: 0.45,            // brilho em volta do cajado
    bladeLength: 6.5,           // do ponto da mão de cima até o cristal
    bladeWidth: 1,
    strideSpeed: 5,             // ritmo das pernas (herói: V.strideSpeed)

    // Só dele
    hover: 12,                  // altura do voo, unidades
    bobAmount: 0.7,             // sobe e desce do voo, unidades
    flapSpeed: 6.5,             // batidas de asa (rad/s) parado; sobe com a velocidade e ao lançar
    flapOpen: 0.5,              // quanto a asa abre e fecha (rad)
    staffBelow: 8.5,            // quanto o cajado passa abaixo da mão de cima
    headRadius: 3
};
