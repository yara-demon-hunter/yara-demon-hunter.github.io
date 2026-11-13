// --- DADOS VISUAIS: Lobo Sombrio aliado (Shadow Wolf, buddy do Rowan) ---
// As CORES: pelo negro com reflexos arroxeados, olhos vermelhos e a chama roxa escura. Só afeta o desenho; vida, mordida e
// comportamento ficam no jogo. Referência: art_reference/images/shadow-wolf-BODY.webp.
export const SHADOW_WOLF_BUDDY_VISUALS = {
    scale: 1.45,
    colors: {
        fur: '#1a1624',
        furDark: '#0e0b16',
        furMid: '#2b2339',
        furLight: '#4a2f78',
        ink: '#050308',
        mouth: '#7f1020',
        fang: '#efe6f5',
        claw: '#c3b0dc',
        nose: '#0a0810',
        eye: '#ff3030',
        eyeGlow: 'rgba(239, 68, 68, 0.95)',
        // A chama roxa que sai do corpo: da base escura à ponta clara
        flameDark: '#3b0764',
        flame: '#6d28d9',
        flameLight: '#a78bfa',
        aura: 'rgba(76, 29, 149, 0.8)'
    },
    gallopHz: 2.8,
    auraRadius: 2.4,
    auraAlpha: 0.3,
    shadowAlpha: 0.3,
    healthBarOffset: 10
};
