window.YaraRpgData = window.YaraRpgData || {};
window.YaraRpgData.rig = window.YaraRpgData.rig || {};

// ZEPH — lenhador jovem, jaqueta oliva, machado de duas mãos.
// Referência: mini_games/_library/characters/zeph/art_reference (ficha + GIFs só para estudo; o jogo não usa aquelas imagens).
// Convenções de ângulo e campos da pose: topo de js/systems/rig.js. Estilo: art_reference/STYLE.md.
(() => {
    // Guarda de combate: base de várias animações (o golpe começa e termina nela)
    const GUARD = {
        feet: [.12, -.1], crouch: .035, torso: 9, head: -2, twist: 8, headYaw: -8, twoHand: true,
        armF: [28, 80], weapon: 140, grip: .34, grip2: .06, blade: 1, frown: 1, hipShift: 0, lift: 0
    };
    const g = (extra) => ({ ...GUARD, ...extra });
    // Parado explorando: machado apoiado no ombro, mão de trás solta
    const IDLE = {
        feet: [.065, -.075], crouch: .006, torso: 2, head: 0, armF: [10, 110], armB: [-4, 14],
        weapon: 238, grip: .12, blade: -1, frown: .2, hipShift: 0
    };
    const i = (extra) => ({ ...IDLE, ...extra });
    const WALK = { weaponOnBack: true, torso: 6, head: -2 };
    const w = (extra) => ({ ...WALK, ...extra });

    window.YaraRpgData.rig.zeph = Object.freeze({
        // Proporção realista de ~6,5 cabeças (1 = altura do corpo).
        body: {
            foot: .045, shin: .225, thigh: .235, torso: .295, neck: .04, head: .165,
            shoulderDrop: .035, shoulderW: .118, hipW: .058,
            // seções do tronco: [altura relativa ao torso, meia-profundidade, meia-largura]
            torsoShape: [[-.37, .075, .112], [0, .066, .106], [.35, .062, .098], [.65, .078, .122], [.9, .062, .132], [1, .03, .055]], upperArm: .185, forearm: .16,
            // larguras de perfil: coxa (topo, meio), joelho, panturrilha, bota
            thighW: [.095, .08], kneeW: .058, calfW: .064, bootW: .056, bootHeight: .11, footLength: .115,
            upperArmW: [.058, .05], elbowW: .044, forearmW: .047, wristW: .034, hand: .07, handW: .048,
            neckW: .056, jacketHem: .11, belt: .026, strap: .011, bag: [.08, .1]
        },
        // Câmera 3/4: girado 35° para a tela, olhando 10° de cima
        camera: { yaw: 35, pitch: 10 },
        weapon: { kind: 'axe', length: .5, grip: .22, grip2: .05, handleW: .022, head: .085 },
        style: { outline: .005 },
        // Rampas de 3 tons por material: [sombra, base, luz]
        colors: {
            skin: ['#b07352', '#e0a982', '#f5cfaa'], iris: '#3d5a6b',
            hair: ['#2a1a10', '#4d311f', '#7d5539'],
            jacket: ['#36431f', '#55682e', '#7d9249'],
            pants: ['#29331b', '#3e4b2a', '#58683b'],
            boot: ['#55361d', '#84572f', '#ad7b4c'], sole: '#2a1c12',
            belt: ['#36210f', '#5a3a22', '#7e5636'], buckle: ['#6e5426', '#b08a4a', '#e2c27e'],
            strap: ['#8c6c40', '#c49c66', '#e6c591'],
            bag: ['#4a3420', '#765636', '#9d7b54'],
            wood: ['#47291a', '#7a4a2a', '#a8703f'],
            steel: ['#585f66', '#9aa3ab', '#eef3f6'],
            potion: ['#7a1022', '#d9324a', '#ff8a96']
        },

        // Pose neutra (pernas livres): o que uma pose não disser vem daqui.
        base: {
            torso: 3, head: 0, armF: [8, 15], armB: [-6, 12], legF: [6, -4], legB: [-6, -4],
            weapon: 220, blade: -1, grip: .2, grip2: .04, crouch: 0, hipShift: 0, x: 0, lift: 0, yaw: 0, twist: 0, headYaw: 0,
            twoHand: false, weaponOnBack: false, lid: 0, frown: 0, potion: false, seat: false
        },

        animations: {
            // Parado: troca o peso devagar entre as pernas (pés fixos), respira, mexe a cabeça, pisca.
            idle: {
                loop: true, noise: 1, blink: true,
                keys: [
                    { t: 0, pose: i({}) },
                    { t: 1500, pose: i({ hipShift: .01, torso: 2.5, head: 1.5, armF: [11, 108], weapon: 239, headYaw: 8 }) },
                    { t: 3000, pose: i({ hipShift: .018, crouch: .01, torso: 3, head: -1, headYaw: 28, twist: 4 }) },
                    { t: 4500, pose: i({ hipShift: .006, torso: 1.8, head: 1, headYaw: -6 }) },
                    { t: 6000, pose: i({}) }
                ]
            },

            // Em combate: guarda baixa com o machado à frente, respirando mais rápido.
            guard: {
                loop: true, noise: .6, blink: true,
                keys: [
                    { t: 0, pose: g({}) },
                    { t: 1500, pose: g({ crouch: .045, torso: 10, armF: [27, 82] }) },
                    { t: 3000, pose: g({}) }
                ]
            },

            // Explorando: ciclo clássico de 8 poses (contato, descida, passagem, subida × 2); machado nas costas.
            walk: {
                loop: true, blink: true,
                keys: [
                    { t: 0, pose: w({ legF: [26, -3], legB: [-22, -8], armF: [-22, 18], armB: [22, 24] }) },
                    { t: 125, pose: w({ legF: [18, -16], legB: [-26, -38], armF: [-16, 18], armB: [16, 22] }) },
                    { t: 250, pose: w({ legF: [2, -6], legB: [20, -70], armF: [0, 14], armB: [0, 16] }) },
                    { t: 375, pose: w({ legF: [-14, -2], legB: [34, -30], armF: [14, 20], armB: [-14, 16] }) },
                    { t: 500, pose: w({ legF: [-22, -8], legB: [26, -3], armF: [22, 24], armB: [-22, 18] }) },
                    { t: 625, pose: w({ legF: [-26, -38], legB: [18, -16], armF: [16, 22], armB: [-16, 18] }) },
                    { t: 750, pose: w({ legF: [20, -70], legB: [2, -6], armF: [0, 16], armB: [0, 14] }) },
                    { t: 875, pose: w({ legF: [34, -30], legB: [-14, -2], armF: [-14, 16], armB: [14, 20] }) },
                    { t: 1000, pose: w({ legF: [26, -3], legB: [-22, -8], armF: [-22, 18], armB: [22, 24] }) }
                ]
            },

            // Golpe (tempos do GIF): ergue devagar, desce rápido dando um passo, segura o impacto, recupera.
            attack: {
                impact: 490,
                keys: [
                    { t: 0, ease: 'out', pose: g({}) },
                    { t: 200, pose: g({ twist: -22, headYaw: 14, torso: -6, head: -5, armF: [150, 28], weapon: 196, grip: .2, grip2: .04, hipShift: -.03, crouch: .02 }) },
                    { t: 290, ease: 'in', pose: g({ twist: -30, headYaw: 20, torso: -10, head: -6, armF: [172, 14], weapon: 206, grip: .2, grip2: .04, hipShift: -.045, crouch: .02 }) },
                    { t: 490, ease: 'hold', pose: g({ twist: 6, headYaw: -10, torso: 30, head: 12, armF: [30, 12], weapon: 58, grip: .24, grip2: .05, hipShift: .07, crouch: .1, feet: [.21, -.1] }) },
                    { t: 620, pose: g({ twist: 6, headYaw: -10, torso: 30, head: 12, armF: [30, 12], weapon: 58, grip: .24, grip2: .05, hipShift: .07, crouch: .1, feet: [.21, -.1] }) },
                    { t: 800, pose: g({ twist: 12, torso: 15, armF: [36, 55], weapon: 118, grip: .3, hipShift: .03, crouch: .06, feet: [.15, -.1] }) },
                    { t: 960, pose: g({}) }
                ]
            },

            // Especial: agacha carregando, salta com o machado no alto e desce com todo o peso.
            special: {
                impact: 880,
                keys: [
                    { t: 0, ease: 'out', pose: g({}) },
                    { t: 450, pose: g({ twist: -34, headYaw: 22, crouch: .13, torso: -12, head: -6, armF: [172, 18], weapon: 210, grip: .2, grip2: .04, hipShift: -.05 }) },
                    { t: 740, ease: 'in', pose: g({ twist: -40, headYaw: 24, lift: .14, crouch: .12, torso: -18, head: -8, armF: [178, 8], weapon: 214, grip: .2, grip2: .04, hipShift: .02, feet: [.16, -.04] }) },
                    { t: 880, ease: 'hold', pose: g({ twist: 10, headYaw: -12, crouch: .14, torso: 38, head: 12, armF: [28, 10], weapon: 48, grip: .24, grip2: .05, hipShift: .1, feet: [.26, -.12] }) },
                    { t: 1060, pose: g({ twist: 10, headYaw: -12, crouch: .14, torso: 38, head: 12, armF: [28, 10], weapon: 48, grip: .24, grip2: .05, hipShift: .1, feet: [.26, -.12] }) },
                    { t: 1400, pose: g({}) }
                ]
            },

            // Aparo: ergue o cabo na vertical à frente, aguenta o golpe e o corpo cede para trás (pés fixos).
            parry: {
                impact: 180,
                keys: [
                    { t: 0, ease: 'out', pose: g({}) },
                    { t: 180, pose: g({ torso: -3, head: -4, armF: [62, 70], weapon: 170, grip: .36, grip2: .06, crouch: .05 }) },
                    { t: 330, pose: g({ torso: -12, head: -9, armF: [56, 78], weapon: 174, grip: .36, grip2: .06, crouch: .045, hipShift: -.06 }) },
                    { t: 600, pose: g({}) }
                ]
            },

            // Esquiva: agacha, salta para trás encolhido, aterrissa amortecendo.
            dodge: {
                keys: [
                    { t: 0, ease: 'out', pose: g({}) },
                    { t: 110, pose: g({ crouch: .11, torso: 14, armF: [32, 78] }) },
                    { t: 300, pose: g({ yaw: -18, twist: -10, lift: .12, crouch: .1, torso: -16, head: -6, hipShift: -.06, feet: [.02, -.17] }) },
                    { t: 450, pose: g({ crouch: .11, torso: 10, hipShift: -.04, feet: [.06, -.15] }) },
                    { t: 600, pose: g({}) }
                ]
            },

            // Tomando dano: a cabeça vai primeiro, o tronco segue, olhos fecham; pés não saem do lugar.
            hit: {
                keys: [
                    { t: 0, ease: 'out', pose: g({}) },
                    { t: 70, ease: 'out', pose: g({ twist: -14, headYaw: 25, torso: -16, head: -22, hipShift: -.06, armF: [40, 62], weapon: 156, lid: .8 }) },
                    { t: 200, pose: g({ torso: -10, head: -8, hipShift: -.04 }) },
                    { t: 450, pose: g({}) }
                ]
            },

            // Descansar: senta num toco com o machado nas costas, fica sonolento.
            rest: {
                noise: .5,
                keys: [
                    { t: 0, pose: { weaponOnBack: true } },
                    { t: 450, pose: { weaponOnBack: true, seat: true, torso: 16, head: 8, legF: [84, -96], legB: [78, -92], armF: [44, 28], armB: [38, 26] } },
                    { t: 2150, pose: { weaponOnBack: true, seat: true, torso: 20, head: 14, legF: [84, -96], legB: [78, -92], armF: [44, 30], armB: [38, 28], lid: .85 } },
                    { t: 2600, pose: { weaponOnBack: true } }
                ]
            },

            // Poção: leva a mão livre à boca, inclina a cabeça e fecha os olhos ao beber.
            potion: {
                keys: [
                    { t: 0, pose: { weaponOnBack: true } },
                    { t: 300, pose: { weaponOnBack: true, armB: [28, 138], head: -24, torso: -5, potion: true } },
                    { t: 800, pose: { weaponOnBack: true, armB: [30, 142], head: -28, torso: -6, potion: true, lid: .7 } },
                    { t: 1100, pose: { weaponOnBack: true } }
                ]
            }
        }
    });
})();
