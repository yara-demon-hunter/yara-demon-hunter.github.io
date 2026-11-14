// --- DADOS VISUAIS: Shadow Clone (passiva) ---
// O clone é o mesmo boneco 2.5D do herói (js/render/player25d.js) pintado com esta paleta de sombra.
// Lido por js/render/shadow_clone.js e pelo golpe em js/render/entities.js. Só afeta o desenho.
import { HERO_VISUALS } from '../../../library/characters/hunter/hero_visual.js';
import { AZAEL_VISUALS } from '../../../library/characters/azael/azael_visual.js';
import { BRUTOS_VISUALS } from '../../../library/characters/brutos/brutos_visual.js';
import { AVGUSTINO_VISUALS } from '../../../library/characters/avgustino/avgustino_visual.js';
import { ROWAN_VISUALS } from '../../../library/characters/rowan/rowan_visual.js';

// Tons de sombra que o clone do Azael usa nas peças só dele (pele, cabelo, faixas, bainha)
const AZAEL_SHADOW = {
    skin: '#2a1846', skinShade: '#170c2a', skinLight: '#3b2363', outline: '#000000',
    hair: '#4c2f80', hairShade: '#2a1846', eye: '#c084fc', eyeGlow: 'rgba(192, 132, 252, 0.7)',
    warPaint: '#000000', bandana: '#1e1035', bandanaShade: '#110a20', bandage: '#140a24', bandageLine: '#07030d',
    claw: '#05020a', scabbard: '#05020a', hilt: '#07030d', tsuba: '#4c1d95'
};

export const SHADOW_CLONE_VISUALS = {
    alpha: 0.82,                // transparência do corpo
    spawnSeconds: 0.6,          // tempo para surgir (fade in)
    auraColor: 'rgba(91, 33, 182, 0.45)',
    auraRadius: 30,
    rangeAlpha: 0.6,            // círculo vermelho de alcance do clone (1 = igual ao do herói)
    slashColor: '#7c3aed',      // golpes do clone
    slashFrenzyColor: '#c026d3',
    spawnBurstColor: '#7c3aed',
    deathBurstColor: '#a855f7',
    // A área da tocha onde as sombras se movem
    area: { fill: 'rgba(124, 58, 237, 0.05)', edge: 'rgba(167, 139, 250, 0.32)', width: 1.6, dash: 10 },
    // Barra de vida em cima da cabeça
    hpBar: { width: 26, height: 3.5, offsetY: 46, back: 'rgba(15, 23, 42, 0.85)', fill: '#a855f7', border: 'rgba(196, 181, 253, 0.5)' },
    // Caída: anel no posto dela que enche até ela voltar
    respawnRing: { radius: 11, width: 3, color: 'rgba(168, 85, 247, 0.75)', back: 'rgba(168, 85, 247, 0.15)' },
    // Mesmas chaves de HERO_VISUALS.colors: tons de roxo quase preto, olhos e lâmina violeta
    colors: {
        ...HERO_VISUALS.colors,
        cape: '#0d0618',
        capeFold: '#1a0b2e',
        capeEdge: '#2e1065',
        capeInner: '#120824',
        body: '#0a0512',
        sleeve: '#140a24',
        sash: '#1e1035',
        boots: '#05020a',
        hood: '#0b0516',
        hoodFold: '#1b0d33',
        hoodInner: '#000000',
        mask: '#1e1b2e',
        maskShade: '#110e1c',
        maskEyes: '#a855f7',
        eyeGlint: '#e9d5ff',
        glove: '#07030d',
        strap: '#1a0f2b',
        buckle: '#3b2a5c',
        blade: '#6d28d9',
        bladeCore: '#c4b5fd',
        runes: '#ddd6fe',
        bladeGlow: '#7c3aed',
        bladeGlowSoft: 'rgba(124, 58, 237, 0.8)',
        bladeGlowSoftFrenzy: 'rgba(192, 38, 211, 0.85)'
    }
};
// Clone do Azael: o boneco dele (library/characters/azael/azael25d.js) com a mesma paleta de sombra
SHADOW_CLONE_VISUALS.azaelColors = { ...AZAEL_VISUALS.colors, ...SHADOW_CLONE_VISUALS.colors, ...AZAEL_SHADOW };
// Paleta de sombra de cada herói com boneco próprio (chave = model de data_model/heroes.js); quem não está aqui usa `colors`.
// Herói novo: uma linha aqui.
// Clone do Brutos: o boneco dele (library/characters/brutos/brutos25d.js) com tons de sombra nas peças só dele (pele, cabelo, armadura, couro, aço)
const BRUTOS_SHADOW = {
    skin: '#2a1846', skinShade: '#170c2a', skinLight: '#3b2363', outline: '#000000',
    hair: '#0d0719', hairShade: '#05030b', beard: '#0d0719', beardShade: '#05030b', mouth: '#0d0719',
    eye: '#c084fc', eyeWhite: '#3b2363', scar: '#4c1d95', scarLight: '#6d28d9',
    armor: '#160d29', armorShade: '#0a0615', armorLight: '#2a1846', armorEdge: '#4c2f80',
    mail: '#2a1846', mailShade: '#140a24', leather: '#1e1035', leatherShade: '#110a20', pantsShade: '#0a0612',
    iron: '#1b1030', ironLight: '#34205e',
    axeHead: '#6d4cc0', axeEdge: '#c4b5fd', axeDark: '#2a1846', haft: '#1e1035', haftShade: '#110a20', binding: '#0a0612'
};
SHADOW_CLONE_VISUALS.colorsByModel = {
    // Clone do Avgustino: pele, cabelo, sobretudo, chapéu e prata em tons de sombra
    avgustino: {
        ...AVGUSTINO_VISUALS.colors, ...SHADOW_CLONE_VISUALS.colors,
        skin: '#2a1846', skinShade: '#170c2a', skinLight: '#3b2363', outline: '#000000', mouth: '#0d0719',
        hair: '#34205e', hairShade: '#1e1035', beard: '#34205e', beardShade: '#1e1035',
        coat: '#160d29', coatShade: '#0a0615', coatLight: '#2a1846', hat: '#160d29', hatShade: '#0a0615', hatLight: '#2a1846', hatBand: '#05030b',
        shirt: '#0d0719', shirtShade: '#05030b', shirtLight: '#1e1035', pants: '#140a24', pantsShade: '#0a0612',
        boot: '#0d0719', bootShade: '#05030b', bootLight: '#1e1035', cross: '#c4b5fd', crossShade: '#7c3aed', chain: '#8b5cf6',
        lens: '#05030b', lensGlint: '#7c3aed', frame: '#1e1035', metal: '#4c2f80'
    },
    azael: SHADOW_CLONE_VISUALS.azaelColors,
    brutos: { ...BRUTOS_VISUALS.colors, ...SHADOW_CLONE_VISUALS.colors, ...BRUTOS_SHADOW },
    // Clone do Rowan: o boneco dele com pele, cabelo, túnica, folhas e madeira em tons de sombra; a semente fica violeta
    rowan: {
        ...ROWAN_VISUALS.colors, ...SHADOW_CLONE_VISUALS.colors,
        skin: '#2a1846', skinShade: '#170c2a', skinLight: '#3b2363', outline: '#000000', mouth: '#0d0719',
        hair: '#1e1035', hairShade: '#110a20', hairLight: '#34205e', eye: '#c084fc', eyeWhite: '#3b2363',
        jacket: '#160d29', jacketShade: '#0a0615', jacketLight: '#2a1846', patch: '#110a20', pants: '#140a24', pantsShade: '#0a0612',
        leather: '#1e1035', leatherShade: '#110a20', leatherLight: '#34205e', wood: '#1e1035', woodShade: '#0a0612', woodLight: '#4c2f80',
        leaf: '#4c1d95', leafShade: '#2e1065', leafLight: '#7c3aed', seed: '#a855f7', seedCore: '#e9d5ff', seedGlow: 'rgba(168, 85, 247, 0.5)',
        antler: '#34205e', antlerShade: '#1b1030'
    }
};
export const shadowColorsOf = (model) => SHADOW_CLONE_VISUALS.colorsByModel[model] ?? SHADOW_CLONE_VISUALS.colors;
