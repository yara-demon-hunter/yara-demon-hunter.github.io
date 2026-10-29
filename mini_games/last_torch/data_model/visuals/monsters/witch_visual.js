// --- DADOS VISUAIS: Bruxa. ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

// --- BRUXA (monstro WITCH) ---
// Referência de arte: art_reference/witch. Vista de cima: velha corcunda num manto roxo-escuro
// esfarrapado com capuz, rosto pálido e enrugado com um olho vermelho, cabelo grisalho saindo
// do capuz e mãos ossudas com garras. Ataca formando uma bola de magia escura na frente da mão.
// Só afeta o desenho; tamanho, tiro e velocidade ficam em MONSTER_MODELS.WITCH.
export const WITCH_VISUALS = {
    // Escala visual do desenho em relação ao raio do monstro
    scale: 1.7,

    colors: {
        robe: '#2a2333',
        robeShade: '#17121f',
        robeFold: '#3d3350',
        robeEdge: '#4a3f5e',
        hood: '#251e2e',
        hoodInner: '#08060c',
        hoodFold: '#3a3048',
        skin: '#b9bab2',
        skinShade: '#8a8c85',
        wrinkle: '#5f615b',
        eye: '#ef4444',
        eyeGlow: 'rgba(239, 68, 68, 0.85)',
        eyeSocket: '#1a1418',
        hair: '#9fb3b0',
        hairShade: '#6e8886',
        hand: '#a9aaa2',
        claw: '#ecebe4',
        rope: '#5e5246',
        orbCore: '#12061c',
        orbRim: '#7e22ce',
        orbSwirl: '#c084fc',
        orbGlow: 'rgba(126, 34, 206, 0.85)',
        particleDark: '#2e1046',
        particleLight: '#a855f7',
        aura: '#3b0764'
    },

    // Corpo corcunda (em múltiplos do raio, antes da escala)
    shoulderDepth: 0.3,
    shoulderWidth: 0.56,
    hunchForward: 0.22,        // cabeça à frente dos ombros (corcunda)
    hoodRadius: 0.36,
    hoodTipLength: 0.5,        // ponta do capuz caindo para trás

    // Rosto dentro do capuz
    faceOffset: 0.2,
    faceWidth: 0.24,
    faceLength: 0.26,
    noseLength: 0.13,

    // Cabelo grisalho saindo do capuz
    hairLocks: 3,              // mechas de cada lado
    hairLength: 0.2,
    hairSwayAmount: 0.05,

    // Manto esfarrapado (arrasta atrás, mais comprido quando anda rápido)
    robeStrips: 9,
    robeBaseLength: 0.75,
    robeRunExtraLength: 0.45,
    robeTailWidth: 1.35,
    robeWaveIdle: 0.04,
    robeWaveRun: 0.1,
    robeWaveHz: 1.6,
    robeTurnLag: 0.25,         // o manto abre para o lado ao virar

    // Andar mancando (balanço lateral do corpo)
    runSpeedForFullEffect: 60,
    hobbleHz: 1.4,
    hobbleAmount: 0.07,        // radianos
    speedSmoothing: 8,
    turnSmoothing: 6,

    // Braços: a mão direita conjura, a esquerda fica para trás
    sleeveWidth: 0.2,
    handRadius: 0.055,
    clawLength: 0.14,
    clawCount: 4,

    // Feitiço
    chargeSeconds: 0.9,        // começa a carregar quando falta isso para o tiro
    releaseSeconds: 0.35,      // depois do disparo o braço segura esticado e volta
    orbOffset: 0.2,            // distância do orbe à frente da mão
    orbMinRadius: 0.05,
    orbMaxRadius: 0.22,
    orbGlowRadius: 1.0,
    orbSpinHz: 1.8,
    particleCount: 7,
    particleSize: 0.05,
    particleOrbit: 0.45,       // distância de onde as partículas são sugadas

    // Brilho e sombra
    auraAlpha: 0.3,
    auraRadius: 1.7,
    shadowAlpha: 0.28,

    // Projétil (bola de magia escura), em múltiplos do raio do projétil
    bolt: {
        glowColor: 'rgba(126, 34, 206, 0.8)',
        glowRadius: 3.2,
        trailParticles: 5,
        trailSpacing: 0.9,
        spinHz: 3
    },

    // Barra de vida acima do monstro
    healthBarOffset: 8
};
