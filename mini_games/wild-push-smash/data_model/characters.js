// --- PERSONAGENS (jogabilidade) ---
// Cada personagem tem atributos e uma habilidade de dash próprios.
// Cada dash.speed é a velocidade efetiva do dash e não depende da massa ou da velocidade normal.
// A barra SPEED do menu mostra a aceleração de corrida normal.
// Alguns têm um passivo extra (glide: o corvo plana segurando ↑ no ar).
// A arte de cada um fica em visuals/characters.js.
export const ROSTER = [
    { id: 'fox',      name: 'FOX',      mass: 1.0,  speed: 1.0,  jump: 1.0,
        dash: { name: 'FLARE DASH', description: 'A fast burst with extra reach.', speed: 21, frames: 14, cooldown: 48 } },
    { id: 'cat',      name: 'CAT',      mass: 0.9,  speed: 1.05, jump: 1.05,
        dash: { name: 'POUNCE', description: 'A pounce that kicks upward.', speed: 19, frames: 12, cooldown: 34, verticalSpeed: -4.5 } },
    { id: 'dog',      name: 'DOG',      mass: 1.15, speed: 1.0,  jump: 0.97,
        dash: { name: 'BULLDOG CHARGE', description: 'A charge that hits harder.', speed: 16, frames: 16, cooldown: 52, hitForceMultiplier: 1.25 } },
    { id: 'mouse',    name: 'MOUSE',    mass: 0.75, speed: 1.1, jump: 0.88,
        dash: { name: 'QUICKSTEP', description: 'A quick dash with a short cooldown.', speed: 22, frames: 12, cooldown: 26, hitForceMultiplier: 2.0 } },
    { id: 'elephant', name: 'ELEPHANT', mass: 2.0, speed: 0.95, jump: 0.8,
        dash: { name: 'BULLDOZER', description: 'A heavy, high-impact charge.', speed: 14, frames: 14, cooldown: 62, hitForceMultiplier: 1.65 } },
    { id: 'bunny',    name: 'BUNNY',    mass: 0.8,  speed: 1.05, jump: 1.1,
        dash: { name: 'SPRING DASH', description: 'A spring-loaded dash that leaps up.', speed: 16, frames: 11, cooldown: 54, verticalSpeed: -5.5 } },
    { id: 'pig',      name: 'PIG',      mass: 1.4,  speed: 1.0,  jump: 0.92,
        dash: { name: 'BRACE DASH', description: 'Reduce bonus impact force while dashing.', speed: 15, frames: 13, cooldown: 48, incomingForceMultiplier: 0.55 } },
    { id: 'penguin',  name: 'PENGUIN',  mass: 1.05, speed: 1.05, jump: 1.03,
        dash: { name: 'BELLY SLIDE', description: 'Keep your speed while sliding on the ground.', speed: 19, frames: 20, cooldown: 40, groundFriction: 0.99, hitForceMultiplier: 1.15 } },
    { id: 'frog',     name: 'FROG',     mass: 0.85, speed: 1.0,  jump: 1.3,
        dash: { name: 'DIVE KICK', description: 'Dive downward to catch airborne rivals.', speed: 17, frames: 11, cooldown: 58, airVerticalSpeed: 5.5 } },
    // glide: segurando ↑ no ar, a queda fica lenta (fallSpeed = queda máxima; brake = quão rápido freia;
    // airControl = multiplica o controle lateral enquanto plana)
    { id: 'crow',     name: 'CROW',     mass: 0.75, speed: 1.0,  jump: 1.0,
        dash: { name: 'WING GUST', description: 'A quick swoop with a short cooldown.', speed: 19, frames: 10, cooldown: 42 },
        glide: { name: 'GLIDE', description: 'Hold ▲ in the air to float down slowly.', fallSpeed: 1.6, brake: 0.3, airControl: 1.4 } }
];

export const DEFAULT_PICKS = [0, 1];       // P1 raposa, P2 gato

// Aceleração horizontal efetiva, proporcional à força de corrida dividida pela massa.
export const effectiveSpeed = (c) => c.speed / c.mass;
