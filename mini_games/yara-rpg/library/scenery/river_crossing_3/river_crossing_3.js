// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/river_crossing_3/river_crossing_3.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../river_crossing/river_crossing.js';
import { RIVER_CROSSING_3_VISUALS as F } from './river_crossing_3_visual.js';

// --- CENÁRIO: TRAVESSIA DO RIO AO ENTARDECER (river_crossing_3) ---
// Variante 3 de `river_crossing`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'river_crossing_3', name: 'Travessia do Rio ao Entardecer', visual: F, paintBase }));
