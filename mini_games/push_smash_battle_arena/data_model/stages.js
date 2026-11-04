// --- ARENAS ---
// O visual de cada uma fica em visuals/arena.js. groundFriction: atrito no chão (null = o padrão de physics.js).
export const STAGES = [
    { id: 'night',  name: 'NIGHT FOREST', groundFriction: null },
    { id: 'desert', name: 'DESERT',       groundFriction: null },
    { id: 'snow',   name: 'SNOW PEAK',    groundFriction: 0.955 }    // gelo: escorrega
];

export const DEFAULT_STAGE = 0;
export const SELECTION_STORAGE_KEY = 'pushsmash_selection';
