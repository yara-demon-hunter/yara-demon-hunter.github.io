// --- IA DO BOT ---
// O cérebro é o mesmo nos três níveis (js/systems/bot_ai.js); o que muda são os "defeitos" abaixo.
// Unidades: pixels e frames (60 por segundo). Chances "por frame" valem a cada passo enquanto a situação dura.
export const BOT_LEVELS = {
    easy: {
        reaction: 16,              // frames de atraso para enxergar o rival (humano ≈ 10 a 15)
        aimError: 34,              // erro de mira (px) no smash e no SKY DROP, sorteado de tempos em tempos
        hesitateChance: 0.012,     // por frame: chance de "travar" um instante sem fazer nada
        hesitateFrames: [15, 40],
        dodgeChance: 0.2,          // chance de desviar de cada ameaça (SKY DROP, smash, dash vindo)
        dodgeDash: false,          // usa o dash para fugir da queda do SKY DROP
        smartPositioning: false,   // fica do lado do centro para empurrar o rival para fora
        predict: false,            // mira onde o rival VAI estar (velocidade), não onde está
        recoverDash: false,        // usa o dash no ar para voltar para a arena
        jumpAttackRange: 90,
        jumpAttackChance: 0.012,   // por frame, com o rival perto: pulo para cair em cima dele
        randomJumpChance: 0.012,
        smashChance: 0.25,         // por frame, alinhado em cima do rival: aperta o SMASH
        smashAbove: 30,            // quanto acima do rival precisa estar para tentar o smash
        dashRange: 100,
        dashChance: 0.03,          // por frame, em posição de dash
        turboChance: 0.04,         // por frame, com o medidor cheio e o rival ao alcance
        edgeMargin: 25,
        deadZone: 12,
        skyDropMinHover: 45,       // SKY DROP: frames lá no alto antes de poder soltar (dá tempo do rival fugir)
        skyDropAim: 16,            // ... e quão alinhado precisa estar
        skyLead: 0                 // quantos frames à frente mira o rival no SKY DROP
    },
    normal: {
        reaction: 9,
        aimError: 16,
        hesitateChance: 0.005,
        hesitateFrames: [10, 28],
        dodgeChance: 0.55,
        dodgeDash: false,
        smartPositioning: true,
        predict: false,
        recoverDash: true,
        jumpAttackRange: 130,
        jumpAttackChance: 0.03,
        randomJumpChance: 0.006,
        smashChance: 0.6,
        smashAbove: 30,
        dashRange: 140,
        dashChance: 0.08,
        turboChance: 0.1,
        edgeMargin: 30,
        deadZone: 10,
        skyDropMinHover: 34,
        skyDropAim: 12,
        skyLead: 6
    },
    hard: {
        reaction: 3,
        aimError: 6,
        hesitateChance: 0.0015,
        hesitateFrames: [6, 16],
        dodgeChance: 0.92,
        dodgeDash: true,
        smartPositioning: true,
        predict: true,
        recoverDash: true,
        jumpAttackRange: 160,
        jumpAttackChance: 0.06,
        randomJumpChance: 0.003,
        smashChance: 1,
        smashAbove: 30,
        dashRange: 170,
        dashChance: 0.3,
        turboChance: 0.25,
        edgeMargin: 35,
        deadZone: 8,
        skyDropMinHover: 26,
        skyDropAim: 10,
        skyLead: 12
    }
};

export const BOT_LEVEL_ORDER = ['easy', 'normal', 'hard'];
export const DEFAULT_BOT_LEVEL = 'normal';
