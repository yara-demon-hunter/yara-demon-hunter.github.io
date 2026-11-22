// --- DADOS VISUAIS: peça Poça de lodo (mud_pool) ---
export const MUD_POOL_VISUALS = {
    rim: '#0b0f07',                        // a sombra de lama em volta
    lip: '#3a3a22',                        // a borda grossa de lama seca
    lipLight: 'rgba(170, 170, 110, 0.35)', // o brilho no alto da borda
    deep: '#0a120b',                       // o fundo do lodo (centro)
    mid: '#26391f',                        // o lodo perto da borda
    glow: 'rgba(120, 220, 90, 0.20)',      // o brilho esverdeado de fungo
    sheen: 'rgba(210, 240, 190, 0.28)',    // o reflexo úmido
    weed: '#4a6a2a',                       // as folhas e o capim na beirada
    wobble: 1,                             // quão irregular é a borda (0 = redonda)
    tufts: 9,                              // tufos de capim na beirada
    pads: 2,                               // folhas boiando
    rx: 62,                                // raio horizontal (tamanho médio)
    ry: 38                                 // raio vertical
};

// --- Variantes (mesma peça, outros valores) ---
// Piche: preto brilhante, borda lisa e fina, reflexo roxo-azulado, sem vegetação
export const TAR_POOL_VISUALS = {
    ...MUD_POOL_VISUALS,
    rim: '#07070a', lip: '#1d1d26', lipLight: 'rgba(150, 140, 200, 0.35)', deep: '#030306', mid: '#101018', glow: 'rgba(130, 90, 220, 0.18)', sheen: 'rgba(180, 170, 255, 0.4)', weed: '#2a2a38',
    wobble: 0.55, tufts: 0, pads: 0, rx: 58, ry: 34
};
// Tóxica: verde-limão que brilha, borda irregular e enferrujada, sem vegetação
export const TOXIC_POOL_VISUALS = {
    ...MUD_POOL_VISUALS,
    rim: '#0e1206', lip: '#4a4a1e', lipLight: 'rgba(210, 230, 90, 0.4)', deep: '#1b3a0c', mid: '#6aa81c', glow: 'rgba(190, 255, 60, 0.38)', sheen: 'rgba(240, 255, 170, 0.5)', weed: '#8aa82a',
    wobble: 1.7, tufts: 3, pads: 0, rx: 60, ry: 36
};
// Ferrugem: lodo avermelhado com borda de terra seca, capim seco
export const RUST_POOL_VISUALS = {
    ...MUD_POOL_VISUALS,
    rim: '#160b07', lip: '#5a3a24', lipLight: 'rgba(220, 160, 110, 0.35)', deep: '#1f0e08', mid: '#6a2f1c', glow: 'rgba(255, 120, 60, 0.2)', sheen: 'rgba(255, 200, 160, 0.3)', weed: '#8a6a34',
    wobble: 1.2, tufts: 6, pads: 1, rx: 64, ry: 38
};
