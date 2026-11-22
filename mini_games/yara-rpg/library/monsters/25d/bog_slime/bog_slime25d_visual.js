// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/bog_slime/bog_slime25d_visual.js e rode o sync.
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Lodo Vivo 2.5D (bog_slime25d.js) ---
// Massa de lodo verde-escura do pântano: borbulha, balança, tem um crânio meio dissolvido por dentro, dois olhos amarelos e pseudópodes que se arrastam.
// Medidas em unidades do boneco.
export const BOG_SLIME_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: {
        ...BASE_COLORS,
        aura: 'rgba(132, 204, 22, 0.45)',
        outline: '#0a1608', body: '#3f7a2c', bodyDark: '#23491a', bodyLight: '#7cc050', shine: 'rgba(214, 255, 170, 0.8)', bubble: 'rgba(190, 255, 150, 0.7)',
        skull: 'rgba(222, 214, 188, 0.55)', eye: '#fde68a', pupil: '#1a1306', mouth: '#10240c', glow: 'rgba(130, 220, 70, 0.5)', puddle: 'rgba(14, 34, 10, 0.5)'
    },
    strideSpeed: 4,
    bodyR: 4.4,
    wobble: 0.1,           // quanto o corpo balança
    wobbleHz: 1,           // inteiros: o ciclo do sprite tem 1 s
    blobs: 5,              // pseudópodes em volta
    bubbles: 6,
    auraRadius: 19, auraAlpha: 0.2, focusZ: 6, focusA: 1, scalePerRadius: 0.16, center: 4
};
