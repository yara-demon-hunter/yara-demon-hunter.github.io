// --- DADOS VISUAIS: atlas e sprites pequenos ---
// Tudo que se repete (lutadores, brilhos) é desenhado uma vez e depois carimbado
// com drawImage: muito mais barato do que refazer os caminhos a cada quadro.
export const CHARACTER_ATLAS = {
    pixelsPerUnit: 2,          // pixels do sprite por unidade do mundo
    extent: 2.6,               // metade do quadro, em raios do corpo (precisa caber a cauda balançando, orelhas de coelho e estrelas)
    columns: 6,
    // Quadros de cada animação, na ordem em que entram no atlas
    anims: { idle: 6, run: 6, jump: 2, pound: 1, dash: 1, stun: 4, taunt: 4, scared: 2, glide: 2 },   // glide: só o corvo usa
    idleFrameFrames: 9,        // quantos frames do jogo dura cada quadro do idle
    runPhasePerPixel: 0.045    // quanto o ciclo de corrida avança por pixel andado
};

export const FX = {
    glowSize: 48,
    starPixels: 64,
    dustPixels: 48,
    particleGlowScale: 2.2,
    star: { life: 18, spin: 0.15 },
    // Estilo quadrinho (capa do jogo): explosão em estrela, palavra de impacto, pedras e estrelinhas coloridas
    comic: {
        wordLife: 36,                 // quadros que a palavra fica na tela
        blastLife: 16,
        blastPixels: 256,
        wordPixels: 160,              // altura do sprite da palavra (é esticado ao tamanho do evento)
        wordFont: '900 italic 96px "Arial Black", Impact, "Segoe UI", sans-serif',
        outline: '#5a2300',
        wordGradient: ['#fff3a0', '#ffc61a', '#ff8a00'],
        badge: ['#ff4d1f', '#ff8a00'],
        blast: { outer: '#ff7a1a', mid: '#ffb21a', inner: '#fff1a8', core: '#ffffff' },
        rocks: ['#8a5a36', '#a8723f', '#6f4527'],
        stars: ['#ffd32a', '#4cc3ff', '#ff6b3d', '#5ee06a', '#ffffff']
    },
    ring: { life: 20, width: 5 },
    shadow: { alpha: 0.4, widthRatio: 1.1, heightRatio: 0.28, fadeHeight: 260 },
    // Mira do SKY DROP no chão: anel achatado com marcas girando; acende quando o rival está embaixo
    reticle: { radius: 32, flatten: 0.36, width: 4, spin: 0.06, pulse: 0.25, lockColor: '#ffd32a', voidColor: '#ff4757' },
    // Foguete do SKY DROP: chamas e fumaça saindo por baixo enquanto sobe
    rocket: { flames: ['#ffd32a', '#ffa502', '#ff4757'], flamesPerFrame: 3, flameSpeed: 7, smokePerFrame: 1 }
};
