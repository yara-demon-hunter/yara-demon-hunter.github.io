// --- DADOS VISUAIS: Shadow Clone (passiva) ---
// O clone é o mesmo boneco 2.5D do herói (js/render/player25d.js) pintado com esta paleta de sombra.
// Lido por js/render/shadow_clone.js e pelo golpe em js/render/entities.js. Só afeta o desenho.
import { HERO_VISUALS } from './hero_visual.js';

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
