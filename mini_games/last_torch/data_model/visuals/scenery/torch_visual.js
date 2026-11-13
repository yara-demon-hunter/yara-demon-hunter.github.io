// --- DADOS VISUAIS: Tocha (center tower). ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

// --- TOCHA (CENTER TOWER) ---
// A luz da tocha abre um círculo sem névoa. O raio acompanha a vida do núcleo. A chama encolhe junto.
export const TORCH_VISUALS = {
    // Raio da luz (fração do menor lado da tela): cheio com 100% de vida, mínimo com 0%
    lightRadiusMaxRatio: 0.62,
    lightRadiusMinRatio: 0.13,
    lightShrinkCurve: 0.85,        // <1: encolhe mais rápido no começo; >1: mais devagar
    lightSmoothing: 2.5,           // suavidade ao mudar de tamanho (maior = mais rápido)
    lightFlicker: 0.03,            // tremida da luz (fração do raio)
    lightEdgeSoftness: 0.45,       // 0 = borda dura; 1 = degradê até o centro
    // Luz do herói: abre a névoa em volta dele, onde quer que esteja
    heroLightRadius: 210,
    heroLightSolid: 0.35,          // fração do raio totalmente iluminada
    heroLightStrength: 0.92,       // 1 = sem névoa nenhuma no centro
    groundGlowColor: '255, 150, 60',
    groundGlowAlpha: 0.3,

    // Tamanho do fogo pela vida da tocha: pares [vida, tamanho], ligados em linha reta (1 = o fogo cheio do desenho).
    // Pedido do usuário: a cheia maior; pela metade = a cheia antiga; quase apagada = a "pela metade" antiga.
    // (o desenho da tocha em si está em library/objects/torch: poste, gaiola, fogo, brasas e brilho)
    flameBySize: [[0, 0.3], [0.12, 0.38], [0.5, 0.77], [1, 1]],
    flameSmoothing: 5,             // suavidade ao encolher após um golpe (maior = mais rápido)

    // Barrinha de vida da tocha: em cima dela, logo acima do fogo cheio (offsetY = distância da base do poste para cima)
    hpBar: {
        width: 58,
        height: 6,
        offsetY: 80,               // distância da base do poste até a barra (positivo = acima)
        back: 'rgba(15, 23, 42, 0.85)',
        fillLeft: '#e11d48',
        fillRight: '#fb923c',
        border: 'rgba(253, 186, 116, 0.6)'
    }
};
