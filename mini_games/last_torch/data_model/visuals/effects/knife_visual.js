// --- DADOS VISUAIS: Adaga de arremesso (golpe separado, lançado pela mão esquerda). ---
// Cores, medidas e ritmos lidos por js/render/knife.js, js/render/entities.js e js/render/player25d.js.
export const KNIFE_VISUALS = {
    colors: {
        bladeLight: '#e8f1fb',      // metade da lâmina que pega luz
        bladeShade: '#94a3b8',      // metade na sombra
        ridge: '#ffffff',           // nervura central
        edge: '#67e8f9',            // fio brilhante
        runes: '#67e8f9',
        guard: '#d4a72c',           // guarda e pomo (dourado)
        guardShade: '#8a6d12',
        grip: '#3b2417',            // cabo de couro
        wrap: '#8b5a34',            // tiras do cabo
        gem: '#22d3ee',
        glow: 'rgba(103, 232, 249, 0.45)',
        trail: 'rgba(165, 243, 252, 0.9)',
        shadow: 'rgba(0, 0, 0, 0.35)'
    },

    // Formato da adaga ao longo de +x, origem no meio do cabo (unidades da adaga)
    shape: {
        pommelX: -4.6,
        pommelRadius: 1.1,
        gripStart: -3.8,
        gripEnd: -0.6,
        gripHalf: 0.85,
        wraps: 3,
        guardX: 0,
        guardHalf: 2.6,
        guardCurl: 0.9,
        guardThickness: 1,
        bladeStart: 0.4,
        bladeEnd: 11,
        bladeBaseHalf: 1.1,
        bladeMaxHalf: 1.4,
        bladeMaxX: 3.5,
        runeCount: 3,
        centerX: 3               // ponto de equilíbrio (centro do desenho em voo)
    },

    // Em voo: tamanho, altura acima do chão (na altura da mão), sombra e rastro
    flightScale: 1.25,
    flightHeight: 18,
    shadowLength: 9,
    shadowWidth: 2.2,
    glowRadius: 18,
    ghostCount: 3,
    ghostGap: 7,
    trailLength: 26,

    // Na mão do herói 2.5D (multiplica as unidades da adaga)
    handScale: 0.6,

    // Ponto de onde a adaga sai, relativo ao herói (unidades do mundo; lado negativo = esquerda)
    spawnForward: 16,
    spawnSide: -4,

    // Animação da mão esquerda: recua (até windupFraction), lança (até releaseFraction) e volta.
    // A adaga é solta em letGoFraction; o herói se inclina para o arremesso (throwLean).
    throwSeconds: 0.4,
    windupFraction: 0.3,
    releaseFraction: 0.5,
    letGoFraction: 0.42,
    throwLean: 1.6
};
