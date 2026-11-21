// Layouts gravados pelo editor (scenery/layouts/): aplicados por createScenery
import './layouts/index.js';

// Importa todos os cenários, que se registram sozinhos (registerScenery). O jogo importa este arquivo e escolhe um
// por id com createScenery(id). Cenário novo: uma linha aqui.
import './dark_forest/dark_forest.js';
import './dark_forest_2/dark_forest_2.js';
import './river_crossing/river_crossing.js';
import './swamp/swamp.js';
import './village_gate/village_gate.js';
import './castle_gate/castle_gate.js';
import './river_crossing_2/river_crossing_2.js';
import './river_crossing_3/river_crossing_3.js';
import './swamp_2/swamp_2.js';
import './swamp_3/swamp_3.js';
import './village_gate_2/village_gate_2.js';
import './village_gate_3/village_gate_3.js';
import './castle_gate_2/castle_gate_2.js';
import './castle_gate_3/castle_gate_3.js';
import './graveyard/graveyard.js';
import './graveyard_2/graveyard_2.js';
import './graveyard_3/graveyard_3.js';

export { createScenery, registerScenery, sceneryIds } from './scenery.js';
