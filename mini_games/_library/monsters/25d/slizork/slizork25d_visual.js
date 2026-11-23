import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Slizork, o Tirano de Lodo, 2.5D (slizork25d.js) ---
// Chefe do Swamp: uma gosma verde enorme com cara de chefe. Corpo gelatinoso que balança, sobrancelhas furiosas, olhos amarelos brilhantes, boca larga com
// dentes, coroa enferrujada com espinhos, braços de gosma terminando em punhos, ossos e crânios engolidos por dentro e gotas escorrendo. Medidas em unidades do boneco.
export const SLIZORK_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: {
        ...BASE_COLORS,
        aura: 'rgba(132, 204, 22, 0.55)',
        outline: '#07130a', body: '#5fc02e', bodyDark: '#2f7a1c', bodyLight: '#a6ef5a', shine: 'rgba(224, 255, 180, 0.85)', bubble: 'rgba(200, 255, 160, 0.7)',
        skull: 'rgba(226, 218, 190, 0.6)', bone: 'rgba(226, 218, 190, 0.7)', eye: '#ef4444', eyeGlow: 'rgba(239, 68, 68, 0.95)', blade: '#9aa0a6', bladeDark: '#4b4f55', rust: '#8a4a26', pupil: '#1a1306', mouth: '#3a1020', tongue: '#b8344f', tongueLight: '#e8738a', tooth: '#f6f1da',
        crown: '#a8873a', crownDark: '#5e4a1c', crownGem: '#dc2626', brow: '#1d4a14', glow: 'rgba(130, 220, 70, 0.55)', puddle: 'rgba(14, 34, 10, 0.5)', drip: '#6dbb3e'
    },
    strideSpeed: 3,
    bodyR: 8.2,
    wobble: 0.09,
    wobbleHz: 1,
    blobs: 7,
    bubbles: 9,
    drips: 4,
    auraRadius: 30, auraAlpha: 0.25, focusZ: 8, focusA: 1, scalePerRadius: 0.1, center: 7
};
