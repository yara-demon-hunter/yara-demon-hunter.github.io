// --- DADOS VISUAIS: Lobo Zumbi. ---
// Referência de arte: art_reference/zombie_wolf. Vista de cima: lobo magro em galope, costelas à mostra,
// chama roxa na espinha e na ponta da cauda, olhos violeta e coleira de ferro partida.
// Só afeta o desenho; colisão e velocidade ficam em MONSTER_MODELS.ZOMBIE_WOLF.
export const ZOMBIE_WOLF_VISUALS = {
    scale: 1.5,
    colors: {
        fur: '#2b2744',
        furDark: '#171428',
        furLight: '#5a5388',
        bone: '#d8d0b8',
        boneDark: '#8a8168',
        gum: '#2a0f1f',
        fang: '#ece3b0',
        flame: '#6d28d9',
        flameMid: '#a78bfa',
        flameTip: '#ede9fe',
        flameGlow: 'rgba(139, 92, 246, 0.6)',
        eye: '#d9f99d',
        eyeGlow: 'rgba(192, 132, 252, 0.95)',
        iron: '#6b4a2f',
        rust: '#9a6a30',
        ink: '#07050d',
        aura: 'rgba(124, 58, 237, 0.55)',
        aimAura: 'rgba(233, 213, 255, 0.95)'
    },
    gallopHz: 2.6,              // tudo anima em múltiplos do galope: o ciclo do sprite fecha sem salto
    auraRadius: 2.1,
    auraAlpha: 0.2,
    shadowAlpha: 0.3,
    healthBarOffset: 10
};
