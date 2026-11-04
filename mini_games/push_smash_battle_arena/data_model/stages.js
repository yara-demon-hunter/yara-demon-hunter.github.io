// --- ARENAS ---
// O visual de cada uma fica em visuals/arena.js. groundFriction: atrito no chão (null = o padrão de physics.js).
// terrain: formato do chão. Sem terrain = plataforma reta. 'halfpipe' = rampa em U (como de skate): o meio é reto
// e as pontas sobem em arcos de raio `radius` (px). Quem desce pega velocidade e sobe do outro lado.
export const STAGES = [
    { id: 'night',  name: 'NIGHT FOREST', groundFriction: null },
    { id: 'desert', name: 'DESERT',       groundFriction: null },
    { id: 'snow',   name: 'SNOW PEAK',    groundFriction: 0.985,     // gelo: escorrega (pouco atrito, para a rampa render)
      terrain: { type: 'halfpipe', radius: 150, thickness: 34, slopeDamping: 0.994 } }
];

export const DEFAULT_STAGE = 0;
export const SELECTION_STORAGE_KEY = 'pushsmash_selection';
