// --- DADOS VISUAIS: Formas do herói sob um Juramento. ---
// Cada Juramento troca a paleta e veste o herói com equipamento próprio (js/render/hero_gear.js).
// colors: mesmas chaves de HERO_VISUALS.colors (só o que muda). aura: cor da transformação e do brilho nos pés.
// bladeLength e bladeWidth multiplicam a espada. hoodTip multiplica a ponta do capuz; hoodRise levanta ela.
// slash: cor do corte em cada passo do combo.
export const OATH_VISUALS = {
    // Guerreiro: vermelho e osso, chifres, ombreiras com espinhos e uma espada enorme
    slaughter: {
        aura: '#ef4444',
        slash: ['#dc2626', '#ef4444', '#f97316'],
        bladeLength: 1.6,
        bladeWidth: 1.8,
        hoodTip: 1,
        hoodRise: 0,
        gear: { metal: '#44403c', metalLight: '#78716c', bone: '#e7e0cf', boneShade: '#a8a08c' },
        colors: {
            cape: '#2a0808', capeFold: '#4a0e0e', capeEdge: '#991b1b', capeInner: '#1c0505',
            body: '#160707', sleeve: '#2b0c0c', sash: '#b91c1c', boots: '#0f0505',
            hood: '#1f0707', hoodFold: '#3f0f0f', hoodInner: '#050000',
            mask: '#e7d9c8', maskShade: '#a38f7c', maskEyes: '#dc2626', eyeGlint: '#fecaca',
            glove: '#1a0606', strap: '#3b0d0d', buckle: '#a8a29e',
            blade: '#f87171', bladeCore: '#fff1f2', runes: '#fee2e2', bladeGlow: '#ef4444',
            bladeGlowSoft: 'rgba(239, 68, 68, 0.85)', bladeGlowSoftFrenzy: 'rgba(253, 186, 116, 0.9)'
        }
    },
    // Ladrão: violeta quase preto, cachecol comprido ao vento e adagas cruzadas nas costas
    whispers: {
        aura: '#a78bfa',
        slash: ['#7c3aed', '#8b5cf6', '#c084fc'],
        bladeLength: 0.9,
        bladeWidth: 0.85,
        hoodTip: 0.8,
        hoodRise: 0,
        gear: { scarf: '#8b5cf6', scarfShade: '#5b21b6', sheath: '#27203a', hilt: '#d4a72c', steel: '#c4b5fd' },
        colors: {
            cape: '#120a24', capeFold: '#1e1138', capeEdge: '#4c1d95', capeInner: '#0c0618',
            body: '#0c0816', sleeve: '#160e29', sash: '#6d28d9', boots: '#07040e',
            hood: '#110a20', hoodFold: '#231543', hoodInner: '#000000',
            mask: '#1e1b2e', maskShade: '#110e1c', maskEyes: '#a78bfa', eyeGlint: '#ede9fe',
            glove: '#0a0614', strap: '#1f1436', buckle: '#8b5cf6',
            blade: '#a78bfa', bladeCore: '#f5f3ff', runes: '#ede9fe', bladeGlow: '#8b5cf6',
            bladeGlowSoft: 'rgba(139, 92, 246, 0.85)', bladeGlowSoftFrenzy: 'rgba(216, 180, 254, 0.9)'
        }
    },
    // Fé (Oath of Faith): roupa escura com acabamento dourado, estola branca com cruzes, auréola sobre a cabeça e uma cruz de
    // luz flutuando atrás das costas. Serve para qualquer herói: as chaves de cor cobrem o boneco padrão e o do Avgustino
    faith: {
        aura: '#fde68a',
        slash: ['#fbbf24', '#fde68a', '#fef9e7'],
        bladeLength: 1.05,
        bladeWidth: 1.1,
        hoodTip: 0.8,
        hoodRise: 0,
        gear: {
            halo: '#fde68a', haloGlow: 'rgba(253, 230, 138, 0.8)',
            stole: '#f5f0e1', stoleShade: '#cfc6ad', stoleTrim: '#d4a72c', stoleCross: '#b8860b',
            cross: '#fef9e7', crossEdge: '#d4a72c', crossGlow: 'rgba(254, 243, 199, 0.75)', mote: '#fef3c7'
        },
        colors: {
            // Boneco padrão (capuz e máscara)
            cape: '#1c1830', capeFold: '#2a2445', capeEdge: '#d4a72c', capeInner: '#120f20',
            body: '#16131f', sleeve: '#221d33', sash: '#d4a72c', boots: '#0d0b14',
            hood: '#1a1628', hoodFold: '#2c2642', hoodInner: '#05040a',
            mask: '#f5f0e1', maskShade: '#bfb595', maskEyes: '#f59e0b', eyeGlint: '#fffbeb',
            glove: '#f5f0e1', strap: '#8a6d12', buckle: '#fde68a',
            // Avgustino (sobretudo, chapéu, crucifixo)
            // (o chapéu fica com as cores dele: só a auréola brilha na cabeça)
            coat: '#1d1a2b', coatShade: '#131120', coatLight: '#d4a72c', cross: '#fde68a', crossShade: '#b8860b', chain: '#fbbf24',
            // A lâmina: ouro e luz
            blade: '#fde68a', bladeCore: '#fffbeb', runes: '#fffbeb', bladeGlow: '#fbbf24',
            bladeGlowSoft: 'rgba(251, 191, 36, 0.8)', bladeGlowSoftFrenzy: 'rgba(254, 249, 231, 0.95)'
        }
    },
    // Guardião (Oath of the Hearth): ARMADURA DE FOGO. Placas de ferro escuro com rachaduras de lava brilhando, ombreiras e
    // elmo soltando chamas, um núcleo de fogo no peito e brasas subindo. Serve para qualquer herói (boneco padrão e Avgustino)
    hearth: {
        aura: '#f97316',
        slash: ['#ea580c', '#f97316', '#fbbf24'],
        bladeLength: 1.1,
        bladeWidth: 1.25,
        hoodTip: 0.7,
        hoodRise: 0,
        gear: {
            iron: '#2b211b', ironLight: '#4a3a2e', outline: '#0c0806',
            lava: '#f97316', lavaHot: '#fde68a', lavaGlow: 'rgba(249, 115, 22, 0.85)',
            flameOuter: '#ea580c', flameMid: '#f97316', flameCore: '#fde68a',
            ember: '#fb923c', emberHot: '#fde68a'
        },
        colors: {
            cape: '#1c1410', capeFold: '#2a1c14', capeEdge: '#f97316', capeInner: '#120d0a',
            body: '#16110e', sleeve: '#2a201a', sash: '#ea580c', boots: '#0f0b08',
            hood: '#1a1310', hoodFold: '#2e2018', hoodInner: '#060403',
            mask: '#3a2c22', maskShade: '#20160f', maskEyes: '#fb923c', eyeGlint: '#fde68a',
            glove: '#2b211b', strap: '#4a3a2e', buckle: '#f97316',
            coat: '#1c1410', coatShade: '#120d0a', coatLight: '#f97316', hat: '#1c1410', hatShade: '#120d0a', hatLight: '#3a2c22',
            hatBand: '#ea580c', cross: '#fbbf24', crossShade: '#b45309', chain: '#f97316',
            blade: '#fb923c', bladeCore: '#fff7ed', runes: '#fde68a', bladeGlow: '#f97316',
            bladeGlowSoft: 'rgba(249, 115, 22, 0.85)', bladeGlowSoftFrenzy: 'rgba(253, 224, 71, 0.95)'
        }
    },
    // Druida: capa verde-musgo; folhas giram em volta do corpo (orbit: raio do anel) e o brilho dos pés é verde
    wild: {
        aura: '#4ade80',
        slash: ['#16a34a', '#4ade80', '#bef264'],
        bladeLength: 1,
        bladeWidth: 1,
        hoodTip: 1,
        hoodRise: 0,
        gear: { leaf: '#5fa33a', leafLight: '#a3d65c', leafShade: '#33661f', leaves: 6, orbit: 9.5 },
        // A capa (e o sobretudo do Avgustino) fica verde-musgo; o resto mantém as cores do herói
        colors: {
            cape: '#1f3a1c', capeFold: '#2c4f27', capeEdge: '#5fa33a', capeInner: '#142812',
            coat: '#1f3320', coatShade: '#142214', coatLight: '#5fa33a'
        }
    },
    // Feiticeiro: roxo e magenta, capuz alto, grimório flutuando e runas girando nos pés
    ruin: {
        aura: '#d946ef',
        slash: ['#c026d3', '#d946ef', '#a855f7'],
        bladeLength: 0.85,
        bladeWidth: 0.8,
        hoodTip: 1.7,
        hoodRise: 4.6,
        gear: { cover: '#4a044e', coverEdge: '#a21caf', page: '#f5e6c8', ink: '#86198f', rune: 'rgba(217, 70, 239, 0.8)', spark: 'rgba(240, 171, 252, 0.9)' },
        colors: {
            cape: '#1e0a2e', capeFold: '#2e1046', capeEdge: '#86198f', capeInner: '#14061f',
            body: '#14071f', sleeve: '#24103a', sash: '#a21caf', boots: '#0b0412',
            hood: '#1b0a2b', hoodFold: '#3b1660', hoodInner: '#000000',
            mask: '#e9d5ff', maskShade: '#a78bca', maskEyes: '#d946ef', eyeGlint: '#fdf4ff',
            glove: '#12071d', strap: '#3b1660', buckle: '#d946ef',
            blade: '#d8b4fe', bladeCore: '#faf5ff', runes: '#f5d0fe', bladeGlow: '#c026d3',
            bladeGlowSoft: 'rgba(192, 38, 211, 0.85)', bladeGlowSoftFrenzy: 'rgba(240, 171, 252, 0.95)'
        }
    }
};
