// --- ARENAS ---
import { ARENA } from './match.js';

const k = ARENA.scale;

// O visual de cada uma fica em visuals/arena.js. groundFriction: atrito no chão (null = o padrão de physics.js).
// terrain: formato do chão. Sem terrain = plataforma reta. 'halfpipe' = rampa em U (como de skate): o meio é reto
// e as pontas sobem em arcos de raio `radius` (px). Quem desce pega velocidade e sobe do outro lado.
// 'zigzag' = chão em "WWW": vales redondos e picos pontudos de altura `height`, um a cada `wavelength` px.
//   Ninguém fica parado num pico: escorrega para o vale mais próximo.
// ledges: plataformas no alto, de mão única (sobe por baixo e pousa em cima; baixo em cima delas desce).
//   Posições pensadas para a arena de 800x450 (o `k` ajusta para o tamanho real).
export const STAGES = [
    { id: 'night',  name: 'NIGHT FOREST', groundFriction: null },
    { id: 'desert', name: 'DESERT',       groundFriction: null,
      terrain: {
          type: 'zigzag', wavelength: 125 * k, height: 50 * k, thickness: 34, slopeDamping: 0.996,
          ledges: [
              { x: 75, y: 180, width: 80 }, { x: 645, y: 180, width: 80 },     // alto, perto das paredes
              { x: 350, y: 160, width: 100 }                                   // topo, no centro
          ].map(l => ({ x: l.x * k, y: l.y * k, width: l.width * k }))
      } },
    { id: 'snow',   name: 'SNOW PEAK',    groundFriction: 0.985,     // gelo: escorrega (pouco atrito, para a rampa render)
      terrain: { type: 'halfpipe', radius: 150, thickness: 34, slopeDamping: 0.994 } }
];

export const DEFAULT_STAGE = 0;
export const SELECTION_STORAGE_KEY = 'pushsmash_selection';
