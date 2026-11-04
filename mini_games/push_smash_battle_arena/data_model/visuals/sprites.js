// --- DADOS VISUAIS: atlas e sprites pequenos ---
// Tudo que se repete (lutadores, moedas, itens, massa, brilhos) é desenhado uma vez e depois carimbado
// com drawImage: muito mais barato do que refazer os caminhos a cada quadro.
export const CHARACTER_ATLAS = {
    pixelsPerUnit: 2,          // pixels do sprite por unidade do mundo
    extent: 2.2,               // metade do quadro, em raios do corpo (precisa caber cauda, orelhas de coelho e estrelas)
    columns: 6,
    // Quadros de cada animação, na ordem em que entram no atlas
    anims: { idle: 6, run: 6, jump: 2, pound: 1, dash: 1, stun: 4, taunt: 4, scared: 2 },
    idleFrameFrames: 9,        // quantos frames do jogo dura cada quadro do idle
    runPhasePerPixel: 0.045    // quanto o ciclo de corrida avança por pixel andado
};

export const COIN_SPRITE = {
    frames: 6,
    pixelsPerUnit: 3,
    sizeInRadii: 2.8,          // tamanho do quadro em raios da moeda
    spinFrames: 5,             // frames do jogo por quadro
    bobAmount: 3,
    bobSpeed: 0.08,
    face: '#ffd32a',
    edge: '#ffa502',
    shine: '#fff3b0',
    glow: '#ffd32a'
};

export const ITEM_SPRITE = {
    pixelsPerUnit: 3,
    sizeInRadii: 2.6,
    bobAmount: 2.5,
    bobSpeed: 0.1,
    rim: '#ffffff',
    shade: 'rgba(0, 0, 0, 0.28)'
};

export const BLOB_SPRITE = {
    pixelsPerUnit: 3,
    wobbleSpeed: 0.2,
    wobbleAmount: 0.12,
    blinkBelowFrames: 120
};

export const FX = {
    glowSize: 48,
    starPixels: 64,
    dustPixels: 48,
    particleGlowScale: 2.2,
    star: { life: 18, spin: 0.15 },
    ring: { life: 20, width: 5 },
    shadow: { alpha: 0.4, widthRatio: 1.1, heightRatio: 0.28, fadeHeight: 260 }
};
