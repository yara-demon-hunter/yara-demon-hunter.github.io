// --- FÍSICA GERAL ---
// Unidades: pixels e frames (o jogo roda a 60 passos por segundo).
export const PHYSICS = {
    gravity: 0.45,
    groundFriction: 0.88,      // perda de velocidade horizontal por frame no chão
    airDrag: 0.975,            // ... e no ar (o embalo dura bem mais)
    airControl: 0.5,           // fração da aceleração de corrida que vale no ar
    maxSpeedX: 22,
    maxFallSpeed: 26,
    baseRadius: 20,            // raio da bola com massa 1
    radiusLerp: 0.15,          // quão rápido o tamanho acompanha a massa
    wallSlideFactor: 0.6,      // cair colado na parede desacelera
    fallOutBottom: 60,         // K.O. quando passa disso abaixo da tela
    fallOutSides: 120          // ... ou além disso dos lados
};

export const MOVEMENT = {
    runAccel: 0.9,
    jumpSpeed: 11,
    wallJumpKick: 12,          // empurrão lateral do wall jump
    dash: {
        speed: 18,
        frames: 15,
        cooldown: 45
    },
    pound: {                   // SMASH: apertar baixo no ar
        windupFrames: 8,
        windupDrag: 0.5,
        fallSpeed: 18,
        missLagFrames: 14,     // preso no chão se errar
        shockRange: 110,       // onda de choque no chão
        shockPush: 6,
        shockLift: 4
    },
    tauntFrames: 45,
    squashRecover: 0.18,
    stunSquash: { x: 1.7, y: 0.35 }
};
