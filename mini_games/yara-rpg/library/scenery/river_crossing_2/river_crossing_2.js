// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/river_crossing_2/river_crossing_2.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../river_crossing/river_crossing.js';
import { RIVER_CROSSING_2_VISUALS as F } from './river_crossing_2_visual.js';

// --- CENÁRIO: TRAVESSIA DO RIO GELADO (river_crossing_2) ---
// Variante 2 de `river_crossing`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'river_crossing_2', name: 'Travessia do Rio Gelado', visual: F, paintBase }));
