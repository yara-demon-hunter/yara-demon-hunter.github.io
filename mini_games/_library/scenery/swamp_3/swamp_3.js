import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../swamp/swamp.js';
import { SWAMP_3_VISUALS as F } from './swamp_3_visual.js';

// --- CENÁRIO: PÂNTANO PROFUNDO (swamp_3) ---
// Variante 3 de `swamp`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'swamp_3', name: 'Pântano Profundo', visual: F, paintBase }));
