// --- DADOS VISUAIS: Tocha (center tower). ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

// --- TOCHA (CENTER TOWER) ---
// A luz da tocha abre um círculo sem névoa. O raio acompanha a vida do núcleo.
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

    // Corpo da tocha (visto de cima)
    baseColor: '#1b1410',
    baseRimColor: '#4a3322',
    flameColors: ['rgba(234, 88, 12, 0.85)', 'rgba(251, 146, 60, 0.85)', 'rgba(253, 224, 71, 0.9)'],
    flameCoreColor: '#fff7ed',
    flameGlowColor: 'rgba(251, 146, 60, 0.9)',
    flameMinScale: 0.1,            // tamanho da chama com a vida zerada: quase apagada
    flameSmoothing: 5,             // suavidade ao encolher após um golpe (maior = mais rápido)
    tongues: 6,
    embers: 8,
    emberColor: '#fdba74',

    // Barrinha de vida em cima da fogueira
    hpBar: {
        width: 58,
        height: 6,
        offsetY: 58,               // distância do centro da fogueira até a barra
        back: 'rgba(15, 23, 42, 0.85)',
        fillLeft: '#e11d48',
        fillRight: '#fb923c',
        border: 'rgba(253, 186, 116, 0.6)'
    }
};
