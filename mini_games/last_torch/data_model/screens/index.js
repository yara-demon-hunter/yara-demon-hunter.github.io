// --- MONSTROS POR TELA ---
// Cada tela tem o seu arquivo (aqui na pasta) com a lista própria de monstros: NÃO é cumulativo, a tela seguinte começa do zero.
// Este é o ÚNICO sistema: cenário sem arquivo aqui (só do sandbox) usa a lista da Dark Forest (screenOf).
import { SCREEN as darkForest } from './dark_forest.js';
import { SCREEN as river } from './river_crossing.js';
import { SCREEN as swamp } from './swamp.js';
import { SCREEN as graveyard } from './graveyard.js';
import { SCREEN as village } from './village.js';
import { SCREEN as castle } from './castle.js';

export const SCREEN_MONSTERS = Object.fromEntries([darkForest, river, swamp, graveyard, village, castle].map(s => [s.id, s]));

export const screenOf = (sceneryId) => SCREEN_MONSTERS[sceneryId] ?? SCREEN_MONSTERS.dark_forest_2;
