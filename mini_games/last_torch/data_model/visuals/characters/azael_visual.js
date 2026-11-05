// --- DADOS VISUAIS: Azael (herói 2.5D). Referência: art_reference/azael. ---
// Demônio ronin: pele branco-prateada, cabelo branco esvoaçante, olhos vermelhos, bandana e capa marrons,
// katana na bainha da cintura e pés descalços de 3 dedos (2 na frente, 1 atrás).
// Lido por js/render/player25d.js e js/render/azael25d.js. Mesmas medidas de corpo e câmera do herói 2.5D
// (hero25d_visual.js); aqui ficam só a paleta e as peças que mudam.
import { HERO_VISUALS } from './hero_visual.js';

export const AZAEL_VISUALS = {
    // Mesmas chaves de HERO_VISUALS.colors (os Juramentos e o resto do jogo continuam funcionando) + as do Azael
    colors: {
        ...HERO_VISUALS.colors,
        // Capa, cachecol e bandana: pano marrom gasto
        cape: '#4e4032',
        capeFold: '#2f261d',
        capeEdge: '#6b5a47',
        capeInner: '#3a3026',
        // body: calça larga escura; sleeve/glove: pele (braços nus)
        body: '#2e2822',
        sleeve: '#cfd6de',
        glove: '#cfd6de',
        sash: '#5a4a39',
        boots: '#cfd6de',
        // Espada: katana prateada, sem runas; brilho frio e fraco
        blade: '#d6dde4',
        bladeCore: '#ffffff',
        runes: '#ffffff',
        bladeGlow: '#bfe3ff',
        bladeGlowSoft: 'rgba(191, 227, 255, 0.55)',
        bladeGlowFrenzy: '#ff4d4d',
        bladeGlowSoftFrenzy: 'rgba(255, 77, 77, 0.7)',
        buckle: '#a88b4a',
        eyeGlint: '#ff2a2a',

        // Só do Azael
        // Pele branco-prateada (um pouco mais cinza que o cabelo, para os dois não virarem uma mancha só)
        skin: '#cfd6de',
        skinShade: '#8f99a6',
        skinLight: '#e6ebf0',
        outline: '#1a1d22',
        hair: '#fafaf7',
        hairShade: '#aab1bb',
        eye: '#ff2a2a',
        eyeGlow: 'rgba(255, 42, 42, 0.6)',
        warPaint: '#15171a',
        bandana: '#5a4a39',
        bandanaShade: '#3a3026',
        bandage: '#4a3d30',
        bandageLine: '#2a221a',
        claw: '#1f2328',
        scabbard: '#141414',
        hilt: '#2a2420',
        tsuba: '#a88b4a'
    },

    // Cabeça (sem capuz): menor que o capuz do herói
    headRadius: 3.1,
    earLength: 2.4,
    // Rosto projetado para a frente (como a máscara do herói), para ler bem vindo de cima
    faceForward: 2.1,
    faceDepth: 1.3,
    faceWidth: 2.3,
    faceHeight: 3.2,
    faceHeightOffset: -0.7,
    // Cabelo: mechas presas no alto da cabeça que caem até o meio das costas e voam com a capa
    hairStrands: 6,
    hairLength: 6.5,
    hairRunLength: 2.5,        // a mais para trás na corrida
    hairWidth: 1,
    hairWaveSpeed: 6,
    hairWave: 0.9,
    // Pontas da bandana atrás da cabeça
    bandanaTailLength: 5,

    // Pernas: calça larga e pé descalço de 3 dedos com garras
    legWidth: 3.3,
    toeLength: 2.3,
    heelToeLength: 1.5,
    toeSpread: 0.75,
    clawLength: 0.8,

    // Katana: mais longa e fina que a espada do herói, levemente curva
    bladeLength: 15,
    bladeWidth: 1.3,
    bladeCurve: 0.5,
    // Bainha presa no lado esquerdo da cintura, boca à frente, ponta para trás e para baixo
    scabbardMouth: [1.6, -3.7, 11],
    scabbardDir: [-0.86, -0.12, -0.48],
    scabbardLength: 12,
    hiltLength: 3.6,
    // Abaixo deste swingBlend a lâmina está guardada (e a mão volta para o cabo)
    sheathBelow: 0.18
};
