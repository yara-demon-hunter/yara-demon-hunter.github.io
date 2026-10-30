// --- DADOS VISUAIS: Sprites dos monstros. ---
// Monstro comum não é redesenhado a cada quadro: js/render/monster_sprites.js roda a arte procedural
// uma vez por quadro de animação, guarda num atlas e o jogo só carimba. Um monstro custa 2 drawImage.
// extent: metade do tamanho do quadro, em múltiplos do raio desenhado (precisa caber o monstro inteiro).
// bakeSeconds: duração de um ciclo da animação na arte (fecha o laço sem salto).
// playSeconds: duração do ciclo no jogo.
// speed: velocidade do boneco enquanto os quadros são gerados.
// wobble/float: balanço e flutuação aplicados na hora do carimbo (não dependem do quadro).
export const SPRITE_FRAMES = 6;
export const SPRITE_UNDERLAY_PIXELS = 44;      // aura e sombra são borradas: resolução baixa basta

// Pixels do sprite por unidade do mundo. Segue a tela, dentro destes limites
export const SPRITE_MIN_SCALE = 0.7;
export const SPRITE_MAX_SCALE = 1.2;

export const MONSTER_SPRITES = {
    SKELETON: { extent: 1.15, bakeSeconds: 1 / 1.8, playSeconds: 0.62, speed: 70 },
    BAT: { extent: 1.7, bakeSeconds: 1 / 11, playSeconds: 0.22, speed: 120, wobbleAmount: 0.18, wobbleHz: 2.2 },
    VAMPIRE: { extent: 1.05, bakeSeconds: 1 / 1.1, playSeconds: 0.9, speed: 45, floatAmount: 0.06, floatHz: 1 },
    WITCH: { extent: 1.3, bakeSeconds: 1 / 1.82, playSeconds: 0.75, speed: 40 },
    NECROMANCER: { extent: 1.3, bakeSeconds: 1 / 1.82, playSeconds: 0.9, speed: 34 },
    MOTH: { extent: 1.45, bakeSeconds: 1 / 9, playSeconds: 0.2, speed: 100, wobbleAmount: 0.3, wobbleHz: 3.1 },
    BLOATER: { extent: 1.25, bakeSeconds: 1 / 1.6, playSeconds: 0.7, speed: 33 },
    WRAITH: { extent: 1.9, bakeSeconds: 1 / 2.4, playSeconds: 0.5, speed: 60, floatAmount: 0.06, floatHz: 1.1 },
    ZOMBIE_WOLF: { extent: 2.2, bakeSeconds: 1 / 2.6, playSeconds: 0.4, speed: 85 },
    HEADLESS_KNIGHT: { extent: 2.3, bakeSeconds: 1, playSeconds: 1, speed: 26 }
};
