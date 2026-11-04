// --- PERSONAGENS (jogabilidade) ---
// Cada personagem tem atributos e uma habilidade de dash próprios.
// A massa também afeta a aceleração do dash; a barra SPEED do menu mostra a velocidade normal.
// A arte de cada um fica em visuals/characters.js.
export const ROSTER = [
    { id: 'fox',      name: 'FOX',      mass: 1.0,  speed: 1.0,  jump: 1.0,
        dash: { name: 'FLARE DASH', description: 'A fast burst with extra reach.', speed: 21, frames: 14, cooldown: 48 } },
    { id: 'cat',      name: 'CAT',      mass: 0.9,  speed: 1.05, jump: 1.05,
        dash: { name: 'POUNCE', description: 'A pounce that kicks upward.', speed: 17, frames: 12, cooldown: 40, verticalSpeed: -4.5 } },
    { id: 'dog',      name: 'DOG',      mass: 1.15, speed: 1.0,  jump: 0.97,
        dash: { name: 'BULLDOG CHARGE', description: 'A charge that hits harder.', speed: 16, frames: 16, cooldown: 52, hitForceMultiplier: 1.35 } },
    { id: 'mouse',    name: 'MOUSE',    mass: 0.62, speed: 1.05, jump: 1.08,
        dash: { name: 'QUICKSTEP', description: 'A quick dash with a short cooldown.', speed: 20, frames: 8, cooldown: 28 } },
    { id: 'elephant', name: 'ELEPHANT', mass: 1.85, speed: 0.95, jump: 0.88,
        dash: { name: 'BULLDOZER', description: 'A heavy, high-impact charge.', speed: 14, frames: 14, cooldown: 58, hitForceMultiplier: 1.65 } },
    { id: 'bunny',    name: 'BUNNY',    mass: 0.8,  speed: 1.05, jump: 1.2,
        dash: { name: 'SPRING DASH', description: 'A spring-loaded dash that leaps up.', speed: 16, frames: 11, cooldown: 38, verticalSpeed: -7 } },
    { id: 'pig',      name: 'PIG',      mass: 1.4,  speed: 1.0,  jump: 0.92,
        dash: { name: 'BRACE DASH', description: 'Reduce bonus impact force while dashing.', speed: 15, frames: 13, cooldown: 48, incomingForceMultiplier: 0.45 } },
    { id: 'penguin',  name: 'PENGUIN',  mass: 1.15, speed: 0.98, jump: 0.95,
        dash: { name: 'BELLY SLIDE', description: 'Keep your speed while sliding on the ground.', speed: 17, frames: 18, cooldown: 50, groundFriction: 0.99 } },
    { id: 'frog',     name: 'FROG',     mass: 0.85, speed: 1.0,  jump: 1.3,
        dash: { name: 'DIVE KICK', description: 'Dive downward to catch airborne rivals.', speed: 17, frames: 11, cooldown: 42, airVerticalSpeed: 5.5 } }
];

export const DEFAULT_PICKS = [0, 1];       // P1 raposa, P2 gato

// Velocidade que o jogador sente (a mesma conta do movimento em js/entities/player.js)
export const effectiveSpeed = (c) => c.speed / Math.sqrt(c.mass);
