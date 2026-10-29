// --- DADOS VISUAIS: Vampiro. ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

// --- VAMPIRO (monstro VAMPIRE) ---
// Referência de arte: art_reference/vampire. Vista de cima: nobre pálido de cabelo preto
// penteado para trás, olhos vermelhos e presas, gola alta e capa preta com forro vermelho
// abrindo atrás. Ao morrer se desfaz em morcegos (lógica em js/systems/enemies.js).
// Só afeta o desenho; tamanho e velocidade ficam em MONSTER_MODELS.VAMPIRE.
export const VAMPIRE_VISUALS = {
    // Escala visual do desenho em relação ao raio do monstro
    scale: 1.45,

    colors: {
        cape: '#0f0a12',
        capeShade: '#050307',
        capeEdge: '#2a1c30',
        lining: '#7f1d1d',
        liningLight: '#b91c1c',
        collar: '#1a1020',
        collarLining: '#991b1b',
        skin: '#dfe3ea',
        skinShade: '#a7aebb',
        hair: '#0b0b10',
        hairShine: '#2b2b38',
        eye: '#ef4444',
        eyeGlow: 'rgba(239, 68, 68, 0.85)',
        fang: '#f8fafc',
        medallion: '#dc2626',
        medallionRim: '#d4a017',
        nail: '#e5e7eb',
        aura: '#450a0a'
    },

    // Corpo (em múltiplos do raio, antes da escala)
    shoulderDepth: 0.26,
    shoulderWidth: 0.6,
    headRadius: 0.27,
    headForward: 0.12,

    // Gola alta: duas pontas rígidas ao redor da cabeça
    collarSpread: 0.48,
    collarBack: 0.3,

    // Capa (abre em leque atrás, mostra o forro ao virar)
    capeStrips: 7,
    capeLength: 0.85,
    capeTailWidth: 1.5,
    capeWave: 0.06,
    capeWaveHz: 1.1,
    capeTurnOpen: 0.35,

    // Deslizar
    floatHz: 1,
    floatAmount: 0.03,
    turnSmoothing: 5,

    // Braços: para trás segurando a capa; esticam ao chegar perto do herói
    sleeveWidth: 0.16,
    handRadius: 0.06,
    nailLength: 0.12,
    nailCount: 4,
    grabDistance: 90,          // px: começa a esticar os braços
    grabSmoothing: 6,

    // Brilho e sombra
    auraAlpha: 0.32,
    auraRadius: 1.8,
    shadowAlpha: 0.3,

    // Barra de vida acima do monstro
    healthBarOffset: 10
};
