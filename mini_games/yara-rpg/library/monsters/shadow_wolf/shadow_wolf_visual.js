// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/shadow_wolf/shadow_wolf_visual.js e rode o sync.
// --- DADOS VISUAIS: Lobo Sombriço. ---
// Mesmo lobo do Yara RPG (yara-rpg/images/monsters/shadow-wolf.webp), visto de cima: pelo cinza-azulado escuro
// com mechas claras, juba desgrenhada, olhos e boca vermelhos, e a traseira se desfazendo em fumaça preta.
// Só afeta o desenho; colisão e velocidade ficam no jogo (no Last Torch, MONSTER_MODELS.SHADOW_WOLF).
export const SHADOW_WOLF_VISUALS = {
    scale: 1.45,
    colors: {
        fur: '#2e2c3f',
        furDark: '#1a1826',
        furMid: '#3d3a55',
        furLight: '#8ea3bf',
        ink: '#07060c',
        smoke: '#0b0a12',
        mouth: '#7f1d1d',
        fang: '#f1efe6',
        nose: '#111018',
        eye: '#ef4444',
        eyeGlow: 'rgba(239, 68, 68, 0.9)',
        aura: 'rgba(30, 27, 60, 0.75)'
    },
    gallopHz: 2.8,              // tudo anima em múltiplos do galope: o ciclo do sprite fecha sem salto
    auraRadius: 2.1,
    auraAlpha: 0.22,
    shadowAlpha: 0.3,
    healthBarOffset: 10
};
