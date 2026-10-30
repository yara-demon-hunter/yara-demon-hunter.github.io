// --- DADOS VISUAIS: Demon Lord (boss). ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

// --- DEMON LORD (boss DEMON_LORD) ---
// Referência de arte: art_reference/demon_lord. Vista de cima: demônio vermelho musculoso,
// chifres de carneiro cinza-escuros, olhos laranja em brasa, asas de morcego enormes e cauda
// longa terminando numa ponta de lança. Ataca lançando bolas de fogo.
// Só afeta o desenho; tamanho, tiro e velocidade ficam em BOSS_MODELS.DEMON_LORD.
export const DEMON_LORD_VISUALS = {
    // Escala visual do desenho em relação ao raio do boss
    scale: 1.5,

    colors: {
        skin: '#9b1c1c',
        skinShade: '#5f0f12',
        skinLight: '#c2412d',
        outline: '#1c0505',
        membrane: '#7a1616',
        membraneShade: '#4c0c0e',
        membraneEdge: '#2a0607',
        bone: '#3a0a0b',
        wingClaw: '#18181b',
        horn: '#3f3f46',
        hornRidge: '#5b5b66',
        hornDark: '#1c1c21',
        eye: '#ff5a1f',
        eyeGlow: 'rgba(255, 90, 31, 0.9)',
        teeth: '#e7e0c9',
        claw: '#27272a',
        spear: '#3f3f46',
        spearEdge: '#8b8b96',
        aura: '#7f1d1d'
    },

    // Corpo (em múltiplos do raio, antes da escala)
    torsoLength: 0.42,
    torsoWidth: 0.56,
    headRadius: 0.24,
    headForward: 0.4,

    // Chifres de carneiro: saem para os lados, curvam para trás e a ponta volta para a frente
    hornWidth: 0.12,

    // Asas: ossos (ângulo em graus a partir da frente, comprimento em raios) com membrana entre eles
    wingBones: [
        { angle: 84, length: 1.75 },
        { angle: 104, length: 1.95 },
        { angle: 128, length: 1.7 },
        { angle: 155, length: 1.25 }
    ],
    wingRootBack: 0.12,
    wingRootSide: 0.36,
    wingScallop: 0.22,          // quanto a membrana afunda entre um osso e outro
    flapHz: 0.7,
    flapAmount: 0.14,           // quanto a asa encolhe ao subir (vista de cima)
    flapSweep: 8,               // graus que os ossos varrem no bater

    // Cauda com ponta de lança
    tailSegments: 10,
    tailLength: 1.9,
    tailWidth: 0.16,
    tailWaveHz: 0.9,
    tailWave: 0.28,
    spearLength: 0.34,
    spearWidth: 0.14,

    // Andar pesado
    stepHz: 1.1,
    stepSway: 0.04,
    turnSmoothing: 3,

    // Ataque: o braço direito estica e a bola de fogo cresce na mão antes do disparo
    chargeSeconds: 0.7,
    releaseSeconds: 0.3,
    fireballInHand: 0.2,        // raio da bola na mão (em raios) quando totalmente carregada

    // Brilho e sombra
    auraAlpha: 0.35,
    auraRadius: 2.2,
    shadowAlpha: 0.32,

    // Barra de vida acima do boss
    healthBarOffset: 30,

    // Projétil: bola de fogo
    fireball: {
        glowColor: 'rgba(249, 115, 22, 0.6)',
        glowRadius: 3.4,
        trailParticles: 7,
        trailSpacing: 0.75,
        flickerHz: 14,
        colors: {
            core: '#fff7d6',
            inner: '#fde047',
            mid: '#f97316',
            outer: '#dc2626'
        }
    }
};
