import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../graveyard/graveyard.js';
import { GRAVEYARD_3_VISUALS as F } from './graveyard_3_visual.js';

// --- CENÁRIO: CEMITÉRIO PROFANADO (graveyard_3) ---
// Variante 3 de `graveyard`: o chão vem do mesmo desenho; o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'graveyard_3', name: 'Cemitério Profanado', visual: F, paintBase }));
