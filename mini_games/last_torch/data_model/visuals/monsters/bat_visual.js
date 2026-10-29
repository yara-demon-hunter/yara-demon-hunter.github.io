// --- DADOS VISUAIS: Morcego. ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

// --- MORCEGO (monstro BAT) ---
// Referência de arte: art_reference/bat. Vista de cima: corpo pequeno e peludo, duas asas de
// membrana que batem rápido, orelhas pontudas e olhos vermelhos. Só afeta o desenho; o tamanho
// de colisão e a velocidade ficam em MONSTER_MODELS.BAT.
export const BAT_VISUALS = {
    // Escala visual do desenho em relação ao raio do monstro
    scale: 1.9,

    colors: {
        body: '#2a1740',
        bodyShade: '#170b27',
        wing: '#3b1d5c',
        wingBone: '#1d0d33',
        wingEdge: '#7c3aed',
        ear: '#2a1740',
        earInner: '#a855f7',
        eye: '#fb7185',
        eyeGlow: 'rgba(251, 113, 133, 0.9)',
        fang: '#f8fafc',
        aura: '#7c3aed'
    },

    // Corpo (em múltiplos do raio, antes da escala)
    bodyLength: 0.95,
    bodyWidth: 0.55,
    headRadius: 0.38,
    headOffset: 0.7,
    earLength: 0.5,
    earSpread: 0.32,

    // Asas
    wingSpan: 1.5,              // do corpo até a ponta da asa aberta
    wingChord: 0.9,             // largura da asa no encaixe com o corpo
    wingSweep: 0.55,            // quanto a ponta da asa fica para trás
    wingScallops: 3,            // "dentes" da membrana na borda de trás
    wingBoneCount: 3,           // dedos/ossos que sustentam a membrana
    flapHz: 11,                 // batidas por segundo
    flapMinSpan: 0.28,          // asa fechada = fração do tamanho aberto
    flapSweepShift: 0.25,       // a ponta avança/recua a cada batida

    // Voo
    wobbleAmount: 0.18,         // zigue-zague lateral (radianos)
    wobbleHz: 2.2,
    bobAmount: 0.06,            // sobe e desce do corpo junto com as asas
    turnSmoothing: 10,

    // Brilho e sombra
    auraAlpha: 0.28,
    auraRadius: 2.3,
    shadowAlpha: 0.22,
    shadowOffset: 0.9,

    // Barra de vida acima do monstro
    healthBarOffset: 10
};
