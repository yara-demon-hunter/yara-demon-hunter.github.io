// --- DADOS VISUAIS: Kurama, o ninja de armadura (herói 2.5D). Referência: art_reference/images/kurama_reference.jpeg ---
// Ninja todo de preto e cinza-chumbo: capuz e máscara, cachecol grosso, ombreiras e braçadeiras de placas, faixa larga com nó
// e pano pendurado, tabi enfaixado, katana levemente curva e kunais duplos na mão livre. Lido por ../hunter/hero25d.js e kurama25d.js.
import { HERO_VISUALS } from '../hunter/hero_visual.js';

export const KURAMA_VISUALS = {
    // Mesmas chaves de HERO_VISUALS.colors (os Juramentos e o resto do jogo continuam funcionando) + as do Azael
    colors: {
        ...HERO_VISUALS.colors,
        // Sem capa: o pano é o capuz, o cachecol e as pontas da testeira. (as chaves cape* ficam por causa do resto do jogo)
        cape: '#17181b',
        capeFold: '#0b0b0d',
        capeEdge: '#2b2c31',
        capeInner: '#121315',
        body: '#141416',
        sleeve: '#1b1b1f',
        glove: '#0e0e10',
        sash: '#0f0f11',
        boots: '#0e0e10',
        // Katana de aço claro, levemente curva
        blade: '#cdd2da',
        bladeCore: '#ffffff',
        runes: '#ffffff',
        bladeGlow: '#cbd5e1',
        bladeGlowSoft: 'rgba(203, 213, 225, 0.4)',
        bladeGlowFrenzy: '#ff4d4d',
        bladeGlowSoftFrenzy: 'rgba(255, 77, 77, 0.7)',
        buckle: '#9ca3af',
        eyeGlint: '#ffffff',

        // Só do Kurama
        skin: '#c99d78',
        skinShade: '#9a7352',
        skinLight: '#e0b995',
        outline: '#08090b',
        hair: '#141416',           // o capuz
        hairShade: '#26272c',
        mouth: '#26272c',
        mask: '#101012',
        maskShade: '#070708',
        eye: '#f1efe9',
        eyeGlow: 'rgba(255, 214, 170, 0.4)',
        warPaint: '#08090b',
        bandana: '#1a1a1d',        // testeira e pontas soltas: cinza-chumbo
        bandanaShade: '#0c0c0e',
        bandage: '#1d1d21',
        bandageLine: '#08080a',
        claw: '#18181c',
        scabbard: '#18181b',
        scabbardShine: '#2f3037',
        hilt: '#1b1b20',
        tsuba: '#6b7280',
        // Armadura: placas de aço escuro com brilho nas bordas
        armor: '#222226',
        armorLight: '#46484f',
        armorEdge: '#62656e'
    },

    // Cabeça (sem capuz): esfera do cabelo, com o rosto desenhado na superfície da frente (não é uma peça colada)
    headRadius: 3.45,
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
    earLength: 0,
    // Cabelo: mechas presas no alto da cabeça que caem até o meio das costas e voam com a capa
    hairStrands: 6,
    hairLength: 2.6,
    hairRunLength: 2.2,        // a mais para trás na corrida
    hairWidth: 1,
    hairWaveSpeed: 6,
    hairWave: 0.9,
    // Pontas da bandana amarradas atrás da cabeça: caem paradas, esvoaçam para trás na corrida
    bandanaTailLength: 10,

    // Capa de pano: ondula da raiz até a barra (mais na corrida) e cede no meio com o peso
    capeRipple: 0.35,
    capeRippleRun: 1.1,
    capeRippleSpeed: 7,
    capeSag: 1.6,

    // Corrida: o corpo sobe e desce a cada passo e vai um pouco agachado (postura de espadachim)
    runBob: 0.7,
    // Ritmo das passadas deste personagem (maior = passos mais rápidos); sem ele, vale o strideSpeed geral do herói
    strideSpeed: 13,
    runCrouch: 0.6,

    // Pernas: calça larga e pé descalço de 3 dedos com garras
    legWidth: 3.3,
    toeLength: 2.3,
    heelToeLength: 1.5,
    toeSpread: 0.75,
    clawLength: 0,

    // Katana: mais longa e fina que a espada do herói, levemente curva
    bladeLength: 16.2,
    bladeWidth: 1.45,
    bladeCurve: 0.05,
    // Bainha presa no lado direito da cintura (do lado da mão da katana), boca à frente, ponta para trás e para baixo
    scabbardMouth: [0.87, 3.94, 10.4],
    scabbardDir: [-1.23, 0.53, -0.43],
    scabbardLength: 8.4,
    // Mão ESQUERDA (a que saca e ataca): em repouso fica no cabo, a esta distância da boca da bainha, ao longo dela
    // (negativo = para o lado do cabo). No golpe ela sai da bainha e varre.
    sheathHand: -4,
    // Ajustes dos braços em repouso (a = frente, b = lado: + direita, z = altura). Somem no golpe.
    // Mão DIREITA e cotovelo direito: ficam na bainha, parados (não acompanham o golpe)
    rightHandOffset: [-1.92, 2, -0.16],
    rightElbowOffset: [-2, -0.05, 0.28],
    // Mão ESQUERDA (a da espada, no cabo) e cotovelo esquerdo
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
    glowScale: 0.55
};
