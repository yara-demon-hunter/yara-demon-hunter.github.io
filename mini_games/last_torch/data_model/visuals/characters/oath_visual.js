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
    // Guardião: ouro e brasa, ombreiras largas, peitoral e uma lanterna na cintura
    hearth: {
        aura: '#fbbf24',
        slash: ['#f59e0b', '#fbbf24', '#fb923c'],
        bladeLength: 1.1,
        bladeWidth: 1.25,
        hoodTip: 0.7,
        hoodRise: 0,
        gear: { gold: '#d4a72c', goldLight: '#fde68a', goldShade: '#8a6d12', lantern: '#fbbf24', flame: 'rgba(251, 146, 60, 0.9)', chain: '#78716c' },
        colors: {
            cape: '#3a2408', capeFold: '#4f3310', capeEdge: '#b45309', capeInner: '#2b1a05',
            body: '#1f1608', sleeve: '#33240d', sash: '#d97706', boots: '#120c04',
            hood: '#2b1c07', hoodFold: '#47300e', hoodInner: '#0a0602',
            mask: '#fde68a', maskShade: '#b8922f', maskEyes: '#7c2d12', eyeGlint: '#fff7ed',
            glove: '#1f1405', strap: '#6b4a12', buckle: '#fde68a',
            blade: '#fcd34d', bladeCore: '#fffbeb', runes: '#fef3c7', bladeGlow: '#f59e0b',
            bladeGlowSoft: 'rgba(245, 158, 11, 0.85)', bladeGlowSoftFrenzy: 'rgba(253, 224, 71, 0.95)'
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
