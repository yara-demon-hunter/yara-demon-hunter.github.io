// --- DADOS VISUAIS: paletas de quem reaproveita a arte de outro monstro. ---
// Lidas por js/render/entities.js. renderAs e palette ficam em data_model/bosses.js.
import { DEMON_LORD_VISUALS } from './demon_lord_visual.js';
import { VAMPIRE_VISUALS } from '../monsters/vampire_visual.js';
import { WITCH_VISUALS } from '../monsters/witch_visual.js';

export const BOSS_PALETTES = {
    countess: {
        ...VAMPIRE_VISUALS.colors,
        cape: '#3b0617',
        capeShade: '#1f030c',
        capeEdge: '#7f1d3a',
        lining: '#e11d48',
        liningLight: '#fb7185',
        collar: '#2a0512',
        collarLining: '#be123c',
        hair: '#7f1d1d',
        hairShine: '#b91c1c',
        skin: '#f1e4e4',
        eye: '#fb7185',
        eyeGlow: 'rgba(251, 113, 133, 0.9)',
        medallion: '#fb7185',
        aura: '#881337'
    },
    longNight: {
        ...DEMON_LORD_VISUALS.colors,
        skin: '#2e1065',
        skinShade: '#160733',
        skinLight: '#5b21b6',
        outline: '#05010f',
        membrane: '#1e0b45',
        membraneShade: '#0f0524',
        membraneEdge: '#05010f',
        bone: '#0f0524',
        horn: '#0b0a12',
        hornRidge: '#3b3555',
        hornDark: '#05040a',
        eye: '#c084fc',
        eyeGlow: 'rgba(192, 132, 252, 0.95)',
        teeth: '#e9d5ff',
        aura: '#4c1d95'
    }
};

export const NECROMANCER_COLORS = {
    ...WITCH_VISUALS.colors,
    robe: '#16251b',
    robeShade: '#0b140e',
    robeFold: '#24392b',
    robeEdge: '#2f4a38',
    hood: '#131f17',
    hoodInner: '#040806',
    hoodFold: '#223428',
    skin: '#d6d3c4',
    skinShade: '#a8a596',
    eye: '#86efac',
    eyeGlow: 'rgba(134, 239, 172, 0.9)',
    orbCore: '#052e16',
    orbRim: '#16a34a',
    orbSwirl: '#86efac',
    orbGlow: 'rgba(22, 163, 74, 0.85)',
    particleDark: '#14532d',
    particleLight: '#4ade80',
    aura: '#14532d'
};
