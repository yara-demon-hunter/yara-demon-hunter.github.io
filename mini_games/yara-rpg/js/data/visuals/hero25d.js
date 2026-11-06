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
        heightScale: 0.62,
        groundSquash: 0.86,
        depthHeightWeight: 0.6,       // peso da altura na ordem de desenho (o que fica na frente)

        // Sombra no chão
        shadowRadiusFront: 6.5,
        shadowRadiusSide: 5.5,
        shadowColor: 'rgba(0, 0, 0, 0.42)',

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
        footLift: 2.5,

        // Tronco (meio-eixos da seção: A = frente/trás, B = lados)
        waist: { A: 2.5, B: 3.4 },
        chest: { A: 2.8, B: 4.6 },
        shoulderHeight: 17,
        sashHeight: 10.8,
        runLean: 5,                   // tronco e cabeça vão para a frente na corrida
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
            scabbard: '#141414',
            scabbardShine: '#3a3a40',
            hilt: '#2a2420',
            tsuba: '#a88b4a'
        },

        // Cabeça (sem capuz): esfera do cabelo, com o rosto desenhado na superfície da frente (não é uma peça colada)
        headRadius: 3.3,
        // A câmera vê quase de cima: a cabeça "olha" um pouco para cima para o rosto aparecer (radianos).
        // faceTilt de perfil; faceTiltFront a mais quando ele está virado para a câmera.
        faceTilt: 0.45,
        faceTiltFront: 0.45,
        // De lado, a cabeça vira um pouco para a câmera (radianos), senão o rosto vira uma faixa fina na borda
        faceTurn: 0.5,
        // Rosto em coordenadas da cabeça (s = lado, u = altura): contorno do rosto da bandana até o queixo
        face: [[2.1, 0.75], [2.45, 0], [2.35, -1.1], [1.85, -2.3], [1, -3.2], [0, -3.55]],
        jawForward: 1.2,          // o queixo sai um pouco da esfera
        faceOut: 0.6,             // o rosto fica um pouco à frente do volume do cabelo (lê de perfil)
        // Bandana: altura do meio da faixa (u) e largura
        bandHeight: 0.75,
        bandWidth: 1.25,
        // Orelhas pontudas para os lados, para trás e para cima
        earLength: 2.4,
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
        bladeLength: 15,
        bladeWidth: 1.3,
        bladeCurve: 0.5,
        // Bainha presa no lado esquerdo da cintura, boca à frente, ponta para trás e para baixo
        scabbardMouth: [1.6, -3.7, 11],
        scabbardDir: [-0.86, -0.12, -0.48],
        scabbardLength: 12,
        hiltLength: 3.6,
        // A lâmina aparece aos poucos enquanto a mão sai do cabo (fração do swingBlend até ficar inteira)
        drawBlend: 0.25,
        // Brilho em volta da katana (menor que o da espada rúnica: é aço, não magia)
        glowScale: 0.75
    };

    window.YaraRpgData.visuals.hero25d = Object.freeze({ hero: HERO, body: BODY, azael: AZAEL });
})();
