import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../swamp/swamp.js';
import { SWAMP_2_VISUALS as F } from './swamp_2_visual.js';

// --- CENÁRIO: PÂNTANO MORTO (swamp_2) ---
// Variante 2 de `swamp`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'swamp_2', name: 'Pântano Morto', visual: F, paintBase }));
