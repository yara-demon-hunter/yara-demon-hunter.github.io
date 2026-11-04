// --- PERSONAGENS (jogabilidade) ---
// Cada personagem muda três coisas: massa (tamanho e peso: empurra mais e voa menos), velocidade e pulo.
// A massa já deixa o bicho mais lento (a aceleração divide pela raiz da massa); `speed` é um ajuste por cima.
// Velocidade final = speed / √massa: rato ≈ 1,33, elefante ≈ 0,70. A barra SPEED do menu mostra esse valor.
// A arte de cada um fica em visuals/characters.js.
export const ROSTER = [
    { id: 'fox',      name: 'FOX',      mass: 1.0,  speed: 1.0,  jump: 1.0 },
    { id: 'cat',      name: 'CAT',      mass: 0.9,  speed: 1.05, jump: 1.05 },
    { id: 'dog',      name: 'DOG',      mass: 1.15, speed: 1.0,  jump: 0.97 },
    { id: 'mouse',    name: 'MOUSE',    mass: 0.62, speed: 1.05, jump: 1.08 },
    { id: 'elephant', name: 'ELEPHANT', mass: 1.85, speed: 0.95, jump: 0.88 },
    { id: 'bunny',    name: 'BUNNY',    mass: 0.8,  speed: 1.05, jump: 1.2 },
    { id: 'pig',      name: 'PIG',      mass: 1.4,  speed: 1.0,  jump: 0.92 },
    { id: 'penguin',  name: 'PENGUIN',  mass: 1.15, speed: 0.98, jump: 0.95 },
    { id: 'frog',     name: 'FROG',     mass: 0.85, speed: 1.0,  jump: 1.3 }
];

export const DEFAULT_PICKS = [0, 1];       // P1 raposa, P2 gato

// Velocidade que o jogador sente (a mesma conta do movimento em js/entities/player.js)
export const effectiveSpeed = (c) => c.speed / Math.sqrt(c.mass);
