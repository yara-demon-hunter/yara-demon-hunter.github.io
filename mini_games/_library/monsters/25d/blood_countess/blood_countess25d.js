import { BLOOD_COUNTESS_25D_VISUALS as S } from './blood_countess25d_visual.js';
import { registerVampireVariant, renderVampire25D } from '../vampire/vampire25d.js';

// --- BLOOD COUNTESS 2.5D (chefe) ---
// O corpo do Vampiro (../vampire/vampire25d.js) com as medidas e cores de blood_countess25d_visual.js: ombreiras ornamentadas, filigrana prateada,
// cabelo prateado, gola alta e capa preta com forro vinho. Estica os braços ao chegar perto do herói, como o vampiro.
// Uso: renderBloodCountess25D(e), ou o modelo 'blood_countess' em renderHero25D.
registerVampireVariant('blood_countess', S);

export function renderBloodCountess25D(e) {
    renderVampire25D(e, 'blood_countess', S);
}
