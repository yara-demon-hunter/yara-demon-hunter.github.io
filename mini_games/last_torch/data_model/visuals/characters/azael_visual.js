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
        capeInner: '#46382b',
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
        bladeGlowSoft: 'rgba(191, 227, 255, 0.4)',
        bladeGlowFrenzy: '#ff4d4d',
        bladeGlowSoftFrenzy: 'rgba(255, 77, 77, 0.7)',
        buckle: '#a88b4a',
        eyeGlint: '#ff2a2a',

        // Só do Azael
        // Pele cinza-azulada clara, como nas imagens (mais escura que o cabelo, para os dois não virarem uma mancha só)
        skin: '#c3ccd8',
        skinShade: '#8792a3',
        skinLight: '#dde3ec',
        outline: '#1a1d22',
        hair: '#f1f2f0',
        hairShade: '#a3abb8',
        mouth: '#4a5260',
        eye: '#ff2a2a',
        eyeGlow: 'rgba(255, 42, 42, 0.6)',
        warPaint: '#15171a',
        bandana: '#5a4a39',
        bandanaShade: '#3a3026',
        bandage: '#4a3d30',
        bandageLine: '#2a221a',
        claw: '#1f2328',
        scabbard: '#212121',
        scabbardShine: '#353536',
        hilt: '#454545',
        tsuba: '#a88b4a'
    },

    // Cabeça (sem capuz): esfera do cabelo, com o rosto desenhado na superfície da frente (não é uma peça colada)
    headRadius: 3.3,
    // A câmera vê quase de cima: a cabeça "olha" um pouco para cima para o rosto aparecer (radianos).
    // faceTilt de perfil; faceTiltFront a mais quando ele está virado para a câmera.
    faceTilt: 0.46,
    faceTiltFront: 0.32,
    // De lado, a cabeça vira um pouco para a câmera (radianos), senão o rosto vira uma faixa fina na borda
    faceTurn: 0.49,
    // Rosto em coordenadas da cabeça (s = lado, u = altura): contorno do rosto da bandana até o queixo
    face: [[2.1, 0.75], [2.45, 0], [2.35, -1.1], [1.85, -2.3], [1, -3.2], [0, -3.55]],
    jawForward: 1.84,        // quanto o queixo sai da esfera
    faceOut: -1.62,          // rosto para fora (+) ou para dentro (-) do volume do cabelo
    // Bandana: altura do meio da faixa (u) e largura
    bandHeight: 0.75,
    bandWidth: 1.25,
    // Orelhas pontudas para os lados, para trás e para cima
    earLength: 3.13,
    // Cabelo: mechas presas no alto da cabeça que caem até o meio das costas e voam com a capa
    hairStrands: 6,
    hairLength: 6.5,
    hairRunLength: 2.5,        // a mais para trás na corrida
    hairWidth: 1,
    hairWaveSpeed: 6,
    hairWave: 0.9,
    // Pontas da bandana amarradas atrás da cabeça: caem paradas, esvoaçam para trás na corrida
    bandanaTailLength: 6.5,

    // Capa de pano: ondula da raiz até a barra (mais na corrida) e cede no meio com o peso
    capeRipple: 0.35,
    capeRippleRun: 1.1,
    capeRippleSpeed: 7,
    capeSag: 1.6,

    // Corrida: o corpo sobe e desce a cada passo e vai um pouco agachado (postura de espadachim)
    runBob: 0.7,
    runCrouch: 0.6,

    // Pernas: calça larga e pé descalço de 3 dedos com garras
    legWidth: 3.3,
    toeLength: 2.3,
    heelToeLength: 1.5,
    toeSpread: 0.75,
    clawLength: 0.8,

    // Katana: mais longa e fina que a espada do herói, levemente curva
    bladeLength: 17.2,
    bladeWidth: 1.3,
    bladeCurve: 0.04,
    // Bainha presa no lado direito da cintura (do lado da mão da katana), boca à frente, ponta para trás e para baixo
    scabbardMouth: [0.87, 3.94, 10.4],
    scabbardDir: [-1.23, 0.53, -0.43],
    scabbardLength: 9.6,
    // Mão esquerda na bainha: distância da boca da bainha (para trás, ao longo dela)
    sheathHand: -4,
    // Ajustes dos braços em repouso (a = frente, b = lado: + direita, z = altura). Somem no golpe.
    // Mão direita (no cabo da katana) e cotovelo direito
    rightHandOffset: [-1.92, 2, -0.16],
    rightElbowOffset: [-2, -0.05, 0.28],
    // Mão esquerda (na bainha) e cotovelo esquerdo
    leftHandOffset: [0.67, -0.67, 0.05],
    leftElbowOffset: [-0.67, 0.5, -0.44],
    hiltLength: 3.6,
    // Guarda (tsuba): posição ao longo da espada (+ vai para o lado da lâmina, - para o cabo) e tamanho (raio).
    // A cor é colors.tsuba.
    guardOffset: -0.88,
    guardSize: 2.11,
    // A lâmina aparece aos poucos enquanto a mão sai do cabo (fração do swingBlend até ficar inteira)
    drawBlend: 0.25,
    // Brilho em volta da katana (menor que o da espada rúnica do herói: é aço, não magia)
    glowScale: 0.75
};
