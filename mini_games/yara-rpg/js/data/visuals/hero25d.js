window.YaraRpgData = window.YaraRpgData || {};
window.YaraRpgData.visuals = window.YaraRpgData.visuals || {};

// --- DADOS VISUAIS: heróis 2.5D do palco (js/stage/hero25d.js e js/stage/azael25d.js) ---
// Copiados do Last Torch (data_model/visuals/characters/hero_visual.js, hero25d_visual.js e azael_visual.js).
// O RPG tem a sua cópia: mudar aqui não muda o Last Torch, e vice-versa.
// hero: paleta e ritmos da animação. body: medidas do boneco em 3D. azael: paleta e peças do Azael.
(() => {
    const HERO_COLORS = {
        cape: '#07222d',
        capeFold: '#0b2f3c',
        capeEdge: '#103a49',
        body: '#0b1d26',
        sleeve: '#12232c',
        sash: '#1b2f38',
        boots: '#05121a',
        hood: '#0a1a22',
        hoodInner: '#010409',
        mask: '#e8eef2',
        maskShade: '#9fb1bc',
        maskEyes: '#020617',
        blade: '#7dd3fc',
        bladeCore: '#f0f9ff',
        runes: '#e0f2fe',
        bladeGlow: '#38bdf8',
        bladeGlowFrenzy: '#f0abfc',
        capeInner: '#0a2a37',
        glove: '#0a1218',
        strap: '#16262e',
        buckle: '#7e929c',
        hoodFold: '#0f2a34',
        eyeGlint: '#7dd3fc',
        bladeGlowSoft: 'rgba(56, 189, 248, 0.85)',
        bladeGlowSoftFrenzy: 'rgba(240, 171, 252, 0.85)',
        hurtRing: '#fb7185'
    };

    const HERO = {
        colors: HERO_COLORS,

        // Capa: tiras da barra rasgada e ondulação
        capeStrips: 9,
        capeWaveIdle: 1,
        capeWaveRun: 3,
        capeWaveSpeed: 9,

        // Suavização dos movimentos (maior = acompanha mais rápido)
        speedSmoothing: 12,
        runSmoothing: 9,
        strideSpeed: 16,
        capeFollow: 7,                // quão rápido a capa "alcança" o corpo
        capeDragPerSpeed: 0.055,      // quanto a capa fica para trás por px/s de velocidade
        capeMaxLag: 14,
        capeTurnLag: 0.8,             // capa abre para o lado ao virar
        runSpeedForFullEffect: 220,
        turnSmoothing: 10,

        // Golpe: preparação (puxa a lâmina para trás), corte e retorno suave
        windupFraction: 0.22,
        windupExtra: 0.3,
        recoverSeconds: 0.14,
        swingBlendRate: 16,
        dashBlendRate: 26,            // quão rápido entra e sai a pose do dash
        vigilBlendRate: 7,            // idem, a pose ajoelhada (lenta: é um gesto calmo)
        ghostCount: 4,                // cópias fantasmas da lâmina (rastro do corte)
        ghostGapSeconds: 0.018,
        // Meia abertura do arco do golpe (radianos), somada ao extraArc de cada passo do combo
        swingHalfArc: 0.8,

        // Idle: respiração ofegante
        breathPeriodSeconds: 1.1,

        // Brilho pulsante da espada
        bladePulsePeriodSeconds: 0.9,
        bladeGlowMin: 8,
        bladeGlowMax: 16,
        runeCount: 4,

        // Ataques do combo (1: corte, 2: corte de volta, 3: corte pesado); whirl: giro de 360°
        combo: {
            1: { seconds: 0.2, from: 1, to: -1, extraArc: 0.35 },
            2: { seconds: 0.22, from: -1, to: 1, extraArc: 0.6 },
            3: { seconds: 0.26, from: 1, to: -1, extraArc: 0.9 },
            whirl: { seconds: 0.34, spin: true }
        },
        restBladeAngle: 2.0,

        // Dano: o herói é empurrado para longe do golpe e volta (distâncias em unidades do boneco)
        knockback: {
            seconds: 0.32,
            distance: 6,
            peakAt: 0.3,
            ringSeconds: 0.35,
            ringStartRadius: 4,
            ringEndRadius: 16
        }
    };

    // Medidas do corpo (unidades; a = frente, b = direita, z = altura)
    const BODY = {
        // Câmera padrão do Last Torch (quase de cima). O palco usa a sua (data/visuals/stage.js → camera).
        heightScale: 0.54,
        groundSquash: 1.08,
        depthHeightWeight: 0.25,       // peso da altura na ordem de desenho (o que fica na frente)

        // Sombra no chão
        shadowRadiusFront: 3.3,
        shadowRadiusSide: 5.5,
        shadowColor: 'rgba(0, 0, 0, 0.42)',

        // Pernas e botas
        hipHeight: 9.6,
        hipSpread: 1.99,
        footSpread: 2.54,
        kneeForward: 0.49,
        ankleHeight: 2.45,
        legWidth: 3.77,
        bootWidth: 2.81,
        bootLength: 2.21,
        strideLength: 4.5,
        footLift: 2.5,

        // Tronco (meio-eixos da seção: A = frente/trás, B = lados)
        waist: { A: 2.5, B: 3.4 },
        chest: { A: 2.8, B: 4.6 },
        shoulderHeight: 17,
        sashHeight: 10.8,
        runLean: 3.3,                   // tronco e cabeça vão para a frente na corrida
        breathAmount: -0.19,

        // Braços
        shoulderRadius: 2,
        armWidth: 2.2,
        handRadius: 1.2,
        handHeight: 10,
        armSwing: 2.46,

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
        // (o Last Torch usa 10.5 e 20; no palco, visto mais de lado, a capa esticada virava uma tábua)
        capeRunLift: 6.5,
        capeLength: 3,
        capeRunLength: 13,
        capeTailWidth: 7,

        // Espada: em repouso aponta para trás e para baixo; no golpe varre na horizontal
        bladeLength: 12,
        bladeWidth: 2,
        swingRadius: 7,
        swingHeight: 11.5,
        restBladeDrop: 0.45,

        // Golpes e posturas. seconds: duração; impactAt: fração em que o golpe acontece
        moves: {
            // Golpe pesado: agacha, sobe com a espada erguida, desce fincando
            slam: { seconds: 0.68, impactAt: 0.64, crouchEnd: 0.2, riseEnd: 0.46, height: 16, crouch: 4, recoverAt: 0.84 },
            // Grito da Fúria: peito aberto, cabeça para trás, braços abertos
            roar: { seconds: 0.6, impactAt: 0.25, leanBack: 3.4, armReach: 10.5 },
            // Aparo: espada atravessada na frente do corpo, nas duas mãos
            guard: { seconds: 1.1, crouch: 2.2 },
            // Poção: a mão livre leva o frasco à boca e a cabeça vai para trás
            drink: { seconds: 1.1 },
            // Derrota: ajoelha e tomba
            fall: { seconds: 1.4, crouch: 6 }
        },
        // Dash: corpo abaixado e jogado para a frente, braços para trás
        dashLean: 7,
        dashCrouch: 3,
        // Ajoelhado (descanso): um joelho no chão, espada fincada à frente
        vigilCrouch: 3.6
    };

    const AZAEL = {
        // Mesmas chaves da paleta do herói + as do Azael
        colors: {
            ...HERO_COLORS,
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
            // Pele cinza-azulada clara (mais escura que o cabelo, para os dois não virarem uma mancha só)
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
        hairRunLength: 2.5,
        hairWaveSpeed: 6,
        hairWave: 0.9,
        // Pontas da bandana amarradas atrás da cabeça
        bandanaTailLength: 6.5,

        // Capa de pano: ondula da raiz até a barra (mais na corrida) e cede no meio com o peso
        capeRipple: 0.35,
        capeRippleRun: 1.1,
        capeRippleSpeed: 7,
        capeSag: 1.6,

        // Corrida: o corpo sobe e desce a cada passo e vai um pouco agachado
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
        // Brilho em volta da katana (menor que o da espada rúnica: é aço, não magia)
        glowScale: 0.75
    };

    // --- YARA (js/stage/yara25d.js). Referência: art_reference/yara ---
    // Moça meio-demônio: cabelo metade preto (lado direito dela, +b) e metade branco (esquerdo, -b) em duas
    // maria-chiquinhas, bandana e cachecol vermelhos, olhos vermelho (direito) e azul (esquerdo), top curto com a
    // barriga à mostra, ombreira com pelo no ombro esquerdo, calça larga, botas altas e uma espada curta.
    const YARA = {
        colors: {
            ...HERO_COLORS,
            // Sem capa: o pano é o cachecol vermelho
            cape: '#9b1c1c',
            capeFold: '#6b1212',
            capeEdge: '#c2412d',
            capeInner: '#6b1212',
            body: '#2b211b',          // calça
            sleeve: '#c98f62',
            glove: '#5a3a22',
            sash: '#5a3a22',
            boots: '#5a3a22',
            // Espada curta de aço com brilho vermelho
            blade: '#d9dee5',
            bladeCore: '#ffffff',
            runes: '#ffffff',
            bladeGlow: '#ef4444',
            bladeGlowSoft: 'rgba(239, 68, 68, 0.45)',
            bladeGlowFrenzy: '#ff2a2a',
            bladeGlowSoftFrenzy: 'rgba(255, 42, 42, 0.75)',
            buckle: '#9aa3ad',
            eyeGlint: '#ef4444',

            skin: '#c98f62',
            skinShade: '#9a6440',
            skinLight: '#e3b48a',
            outline: '#1f1612',
            mouth: '#7a2e2a',
            mouthInner: '#b4534d',
            blush: 'rgba(232, 110, 110, 0.35)',
            hairDark: '#1b1a22',
            hairDarkShade: '#3a3946',
            hairLight: '#eeeef2',
            hairLightShade: '#b5b8c4',
            eyeWhite: '#fbf7f0',
            eyeRight: '#dc2626',
            eyeLeft: '#3b82f6',
            eyeGlowRight: 'rgba(239, 68, 68, 0.45)',
            eyeGlowLeft: 'rgba(96, 165, 250, 0.45)',
            warPaint: '#141414',
            bandana: '#9b1c1c',
            bandanaShade: '#6b1212',
            tieRight: '#b91c1c',      // elástico do cabelo preto
            tieLeft: '#1e3a5f',       // elástico do cabelo branco
            top: '#2f3530',
            topShade: '#1e2320',
            pendant: '#c9ced6',
            metal: '#6b737c',
            metalLight: '#a3abb4',
            fur: '#f1f1ee',
            furShade: '#c9c9c4',
            bandage: '#e9e6dc',
            bandageLine: '#bdb8aa',
            leather: '#5a3a22',
            leatherShade: '#3a2414',
            flap: '#e9e2d0',
            flapMark: '#9b1c1c',
            pants: '#2b211b',
            pantsShade: '#1a1410'
        },

        // Cabeça: um pouco menor que a do Azael; mesmo truque de levantar e virar o rosto para a câmera
        headRadius: 2.87,
        faceTilt: 0.45,
        faceTiltFront: 0.45,
        faceTurn: 0.45,
        // Rosto mais delicado: queixo fino e arredondado
        face: [[1.95, 0.7], [2.3, 0], [2.15, -1.1], [1.55, -2.15], [0.75, -2.8], [0, -2.95]],
        jawForward: 2.04,
        faceOut: -1.65,
        bandHeight: 1.22,
        bandWidth: 1.22,
        earLength: 2.75,
        // Maria-chiquinhas: presas no alto, dos lados, caem até o meio das costas e voam na corrida
        tailLength: 3.5,
        tailRunLength: 2.4,
        tailWidth: 0.88,
        tailWave: 2.4,
        // Ponta do cachecol: sai do ombro esquerdo e voa para trás
        scarfTailLength: 15.7,

        // Corpo feminino: ombros mais estreitos, cintura fina, quadril largo, braços finos
        shoulderScale: 0.64,
        waistScale: 0.6,
        hipScale: 1.03,
        armScale: 0.65,
        legWidth: 3.57,
        bootHeight: 5,

        // Espada curta, reta e larga
        bladeLength: 13,
        bladeWidth: 2.85,
        glowScale: 0.37
    };

    // --- ZEPH (js/stage/zeph25d.js). Referência: art_reference/zeph ---
    // Rapaz jovem e magro da floresta: cabelo castanho bagunçado, jaqueta verde de gola alta com remendos, alça de
    // couro cruzando o peito com a bolsa no quadril esquerdo, cinto, calça verde enfiada em botas marrons e uma adaga.
    const ZEPH = {
        colors: {
            ...HERO_COLORS,
            cape: '#4b6236',
            capeFold: '#33452a',
            capeEdge: '#637a48',
            capeInner: '#33452a',
            body: '#3b4a2e',
            sleeve: '#4b6236',
            glove: '#d9a476',
            sash: '#7a4f2c',
            boots: '#7a4f2c',
            // Adaga de aço, sem brilho mágico (só um reflexo frio)
            blade: '#c9d0d6',
            bladeCore: '#f1f4f6',
            runes: '#f1f4f6',
            bladeGlow: '#cbd5e1',
            bladeGlowSoft: 'rgba(203, 213, 225, 0.25)',
            bladeGlowFrenzy: '#60a5fa',
            bladeGlowSoftFrenzy: 'rgba(96, 165, 250, 0.7)',
            buckle: '#9aa3ad',
            eyeGlint: '#cbd5e1',

            skin: '#d9a476',
            skinShade: '#a8744c',
            skinLight: '#f0c49a',
            outline: '#1a1410',
            mouth: '#7a3f2e',
            hair: '#4a2e1a',
            hairShade: '#2e1c10',
            hairLight: '#6b4528',
            eyeWhite: '#ece6d6',
            eye: '#5f7a55',
            jacket: '#4b6236',
            jacketShade: '#33452a',
            jacketLight: '#637a48',
            patch: '#3a4c2c',
            pants: '#3b4a2e',
            pantsShade: '#283320',
            leather: '#7a4f2c',
            leatherShade: '#523319',
            leatherLight: '#9a6a40',
            guard: '#5d646b',
            grip: '#6b4423'
        },

        // Cabeça: rosto jovem, queixo reto; o mesmo truque de levantar e virar o rosto para a câmera
        headRadius: 2.97,
        faceTilt: 0.45,
        faceTiltFront: 0.45,
        faceTurn: 0.54,
        face: [[2, 0.9], [2.3, 0], [2.1, -1.1], [1.55, -2.1], [0.8, -2.7], [0, -2.85]],
        jawForward: -10,
        faceOut: -0.69,
        earLength: 1.79,
        // Linha do cabelo na testa (altura u onde a franja começa)
        hairline: 0.86,
        // Volume do cabelo: a massa fica maior que a cabeça (o rosto continua no tamanho da cabeça)
        hairPuff: 1.16,
        // Cabelo bagunçado: ondulação do volume no alto (fração do raio)
        hairBumps: 0.07,
        // Franja: quantas pontas (por meia volta) e quanto descem na testa (radianos)
        bangSpikes: 19.1,
        bangDepth: 0.43,
        // Costeletas na frente das orelhas (radianos a mais para baixo)
        sideburn: 0.37,

        // Posições do rosto (coordenadas de uma cabeça de raio 3: s = para o lado, u = para cima; 0 = centro).
        // Olhos: centro, meia largura, abertura e tamanho da íris
        eyeX: 0.98,
        eyeY: -0.36,
        eyeWidth: 0.53,
        eyeOpen: 0.36,
        irisSize: 0.27,
        // Sobrancelhas: altura acima do olho, meia largura, quanto o lado de dentro desce (franzido) e espessura
        browY: 0.7,
        browWidth: 0.57,
        browTilt: 0.12,
        browThickness: 0.26,
        // Nariz (centro e comprimento) e boca (altura e meia largura)
        noseY: -0.97,
        noseLength: 0.8,
        mouthY: -2.1,
        mouthWidth: 0.4,
        // Orelhas: para a frente (+) ou para trás (-), altura do centro, meia altura e espessura
        earX: 1,
        earY: 0.14,
        earSize: 0.15,
        earWidth: 0.69,

        // Corpo magro de rapaz: ombros um pouco estreitos, braços finos
        shoulderScale: 0.84,
        waistScale: 0.77,
        armScale: 0.85,
        legWidth: 2.57,

        // Adaga: lâmina curta e reta
        bladeLength: 7.7,
        bladeWidth: 2.06,
        glowScale: 0.48
    };

    // --- OSKAR (js/stage/oskar25d.js). Referência: art_reference/oskar ---
    // Homem alto e massudo: barba cheia, cabelo ralo e curto, regata verde-oliva, alça cruzando o peito, cinto,
    // calça marrom-escura, botas com faixas e o machado de duas lâminas sempre nas duas mãos.
    const OSKAR = {
        colors: {
            ...HERO_COLORS,
            cape: '#4f5a32',
            capeFold: '#353d20',
            capeEdge: '#66713f',
            capeInner: '#353d20',
            body: '#3d2f22',
            sleeve: '#c98a5e',
            glove: '#c98a5e',
            sash: '#6b4a2a',
            boots: '#5a3d24',
            // Machado de ferro, sem brilho mágico (só um reflexo frio)
            blade: '#7d848b',
            bladeCore: '#c9ced3',
            runes: '#c9ced3',
            bladeGlow: '#cbd5e1',
            bladeGlowSoft: 'rgba(203, 213, 225, 0.2)',
            bladeGlowFrenzy: '#f97316',
            bladeGlowSoftFrenzy: 'rgba(249, 115, 22, 0.65)',
            buckle: '#9aa3ad',
            eyeGlint: '#cbd5e1',

            skin: '#c98a5e',
            skinShade: '#9a5f3c',
            skinLight: '#e0a679',
            outline: '#1a1410',
            mouth: '#24150e',
            hair: '#4a3020',
            hairShade: '#2e1d12',
            hairLight: '#6a4630',
            beard: '#4a3020',
            beardShade: '#2e1d12',
            eyeWhite: '#e6dfcf',
            eye: '#8a9a92',
            shirt: '#4f5a32',
            shirtShade: '#353d20',
            shirtLight: '#66713f',
            patch: '#3d4527',
            leather: '#6b4a2a',
            leatherShade: '#452e18',
            pants: '#3d2f22',
            pantsShade: '#281e15',
            boot: '#5a3d24',
            bootShade: '#3b2716',
            wrap: '#7a5a3a',
            wristband: '#3a2a1c',
            axeHead: '#7d848b',
            axeEdge: '#c9ced3',
            axeDark: '#4a4f55',
            haft: '#6b4423',
            haftShade: '#4a2e17',
            binding: '#8a6a44'
        },

        // Tamanho do boneco inteiro em relação aos outros (o mais alto do grupo)
        bodyScale: 1.1,

        // Cabeça: mandíbula larga; o mesmo truque de levantar e virar o rosto para a câmera
        headRadius: 2.7,
        faceTilt: 0.45,
        faceTiltFront: 0.4,
        faceTurn: 0.5,
        face: [[2.15, 0.9], [2.45, 0], [2.4, -1.15], [2.05, -2.25], [1.2, -2.9], [0, -3.05]],
        jawForward: 1,
        faceOut: 0.5,
        earLength: 0.6,
        // Cabelo ralo e curto: quase colado na cabeça, linha do cabelo alta (entradas), um pouco transparente
        hairline: 1.35,
        hairPuff: 1.03,
        hairBumps: 0.02,
        hairOpacity: 0.8,
        bangSpikes: 0,
        bangDepth: 0,
        sideburn: 0.45,
        // Entradas: quanto a linha do cabelo sobe nos cantos da testa (radianos)
        recede: 0.22,

        // Posições do rosto (coordenadas de uma cabeça de raio 3: s = para o lado, u = para cima; 0 = centro)
        eyeX: 0.95,
        eyeY: -0.3,
        eyeWidth: 0.45,
        eyeOpen: 0.24,
        irisSize: 0.2,
        browY: 0.5,
        browWidth: 0.6,
        browTilt: 0.18,
        browThickness: 0.34,
        noseY: -1.15,
        noseLength: 0.9,
        mouthY: -2.05,
        mouthWidth: 0.42,
        earX: 0.15,
        earY: 0.05,
        earSize: 0.45,
        earWidth: 0.9,
        // Barba: começa nas costeletas (altura u nos lados), cobre mandíbula e queixo; bigode acima da boca
        beardTop: -0.2,
        beardChin: -3.45,
        beardWidth: 2.45,
        mustacheY: -1.8,

        // Corpo massudo: ombros e peito bem largos, braços e pernas grossos
        shoulderScale: 1.12,
        waistScale: 1.05,
        armScale: 1.3,
        legWidth: 3.6,

        // Machado de duas lâminas: cabo comprido, cabeça dupla larga
        bladeLength: 13,
        bladeWidth: 1,
        axeHeadSize: 4,
        // Distância entre as duas mãos no cabo
        gripSpread: 3.2,
        glowScale: 0.3
    };

    window.YaraRpgData.visuals.hero25d = Object.freeze({ hero: HERO, body: BODY, azael: AZAEL, yara: YARA, zeph: ZEPH, oskar: OSKAR });
})();
