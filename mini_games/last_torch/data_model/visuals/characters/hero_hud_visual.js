// --- DADOS VISUAIS: barras em cima da cabeça do herói (vida e Fúria). ---
// São do HUD do Last Torch, não do personagem: o desenho do herói fica na biblioteca (library/characters/hunter/).
// Lidos por js/render/arena.js.

// Filete da Fúria, colado embaixo da barrinha de vida (mesma largura)
const FURY_BAR = {
    width: 44,
    height: 3,
    offsetY: 48,
    back: 'rgba(15, 23, 42, 0.85)',
    fillLeft: '#a855f7',
    fillRight: '#f472b6',
    border: 'rgba(216, 180, 254, 0.45)'
};

export const HERO_HUD_VISUALS = {
    // Barrinha de vida em cima da cabeça
    hpBar: {
        width: 44,
        height: 5,
        offsetY: 54,
        back: 'rgba(15, 23, 42, 0.85)',
        fillLeft: '#10b981',
        fillRight: '#2dd4bf',
        border: 'rgba(167, 243, 208, 0.5)'
    },
    // Carregando: enche conforme os golpes acertam. Ativa: esvazia até a Fúria acabar, em tons quentes.
    // Sem carga nenhuma o filete nem aparece.
    furyBar: FURY_BAR,
    furyBarActive: { ...FURY_BAR, fillLeft: '#dc2626', fillRight: '#fde047', border: 'rgba(253, 186, 116, 0.7)' }
};
