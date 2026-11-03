// --- ELASTICIDADE ---
// Cada eixo é independente: bater no chão só mexe na velocidade vertical, bater na parede só na horizontal
// (nada de "transferir" ganho de um eixo para o outro). Em cada batida:
//   saída = velocidade_de_entrada × restituição  (+ impulso extra se o jogador estiver segurando o direcional)
// O impulso extra cresce a cada batida seguida no MESMO eixo (cadeia X e cadeia Y separadas).
export const BOUNCE = {
    maxChain: 4,
    chainFrames: 80,           // sem quicar nesse eixo por esse tempo, a cadeia zera
    holdThreshold: 0.3,        // quanto o direcional precisa apontar para o lado do quique (0 a 1)
    popupFromChain: 3,         // a partir daqui aparece "x3", "x4" na tela
    // Fração da velocidade que volta (1 = quique perfeito)
    restitution: { floor: 0.28, wall: 0.45, rival: 0.55, head: 0.4 },
    floor: {
        minImpact: 5,          // abaixo disso não conta como pouso
        settleBelow: 6,        // sem segurar: pousos mais fracos que isso não quicam
        pumpBase: 8,           // impulso extra ao pousar segurando pra cima
        pumpPerChain: 1.7,
        maxSpeed: 18
    },
    wall: {
        minSpeed: 4,           // velocidade mínima para contar a batida
        pumpBase: 4,           // impulso extra segurando o direcional (qualquer lado)
        pumpPerChain: 2.4,
        maxSpeed: 22
    },
    rival: {                   // impulso extra ao bater no rival segurando o direcional para longe dele
        pumpBase: 3,
        pumpPerChain: 1.2,
        axisThreshold: 0.35    // quanto da batida precisa estar no eixo para subir a cadeia dele
    },
    head: {                    // pisar na cabeça do rival (eixo vertical)
        pumpBase: 7,
        pumpHeld: 9,           // segurando pra cima
        pumpPerChain: 1.7,
        victimMomentum: 0.3,   // fração da queda que empurra o rival pra baixo
        minFallSpeed: 2,
        aboveRatio: 0.4,
        maxSpeed: 18
    }
};
