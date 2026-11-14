// --- DADOS VISUAIS: Sprites dos monstros. ---
// QUAL ARTE OS MONSTROS USAM:
//   '25d'     os bonecos 2.5D da biblioteca (library/monsters/25d), vistos pela câmera de cima do jogo
//   'topdown' o desenho 2D plano de cima de antes (library/monsters/topdown); continua na biblioteca e vale trocar de volta
// O Esqueleto Rastejante (monstro novo) não tem desenho 2D antigo: no 'topdown' ele usa o do Esqueleto.
export const MONSTER_ART = '25d';

// Monstro comum não é redesenhado a cada quadro: js/render/monster_sprites.js roda a arte procedural
// uma vez por quadro de animação, guarda num atlas e o jogo só carimba. Um monstro custa 2 drawImage.
// extent: metade do tamanho do quadro, em múltiplos do raio desenhado (precisa caber o monstro inteiro).
// bakeSeconds: duração de um ciclo da animação na arte (fecha o laço sem salto).
// playSeconds: duração do ciclo no jogo.
// speed: velocidade do boneco enquanto os quadros são gerados.
// wobble/float: balanço e flutuação aplicados na hora do carimbo (não dependem do quadro).
// Estes valem para MONSTER_SPRITES (o desenho 2D de cima); os do 2.5D estão em MONSTER_SPRITES_25D, no fim.
export const SPRITE_FRAMES = 6;
export const SPRITE_UNDERLAY_PIXELS = 44;      // aura e sombra são borradas: resolução baixa basta

// Pixels do sprite por unidade do mundo. Segue a tela, dentro destes limites
export const SPRITE_MIN_SCALE = 0.7;
export const SPRITE_MAX_SCALE = 1.2;

export const MONSTER_SPRITES = {
    SKELETON: { extent: 1.15, bakeSeconds: 1 / 1.8, playSeconds: 0.62, speed: 70 },
    SKELETON_CRAWLER: { extent: 1.15, bakeSeconds: 1 / 1.8, playSeconds: 0.9, speed: 34 },
    BAT: { extent: 1.7, bakeSeconds: 1 / 11, playSeconds: 0.22, speed: 120, wobbleAmount: 0.18, wobbleHz: 2.2 },
    VAMPIRE: { extent: 1.05, bakeSeconds: 1 / 1.1, playSeconds: 0.9, speed: 45, floatAmount: 0.06, floatHz: 1 },
    WITCH: { extent: 1.3, bakeSeconds: 1 / 1.82, playSeconds: 0.75, speed: 40 },
    NECROMANCER: { extent: 1.3, bakeSeconds: 1 / 1.82, playSeconds: 0.9, speed: 34 },
    MOTH: { extent: 1.45, bakeSeconds: 1 / 9, playSeconds: 0.2, speed: 100, wobbleAmount: 0.3, wobbleHz: 3.1 },
    BLOATER: { extent: 1.25, bakeSeconds: 1 / 1.6, playSeconds: 0.7, speed: 33 },
    WRAITH: { extent: 1.9, bakeSeconds: 1 / 2.4, playSeconds: 0.5, speed: 60, floatAmount: 0.06, floatHz: 1.1 },
    SHADOW_WOLF: { extent: 2.1, bakeSeconds: 1 / 2.8, playSeconds: 0.38, speed: 100 },
    ZOMBIE_WOLF: { extent: 2.2, bakeSeconds: 1 / 2.6, playSeconds: 0.4, speed: 85 },
    HEADLESS_KNIGHT: { extent: 2.3, bakeSeconds: 1, playSeconds: 1, speed: 26 },
    // Passada do esqueleto a 22 de velocidade: 1,8 Hz x 22/70 = ~0,57 ciclos por segundo
    // live: em campo é desenhado ao vivo (o golpe mexe braço, tronco e espada); o sprite serve ao bestiário e à sombra
    BONE_COLOSSUS: { extent: 2.6, bakeSeconds: 1 / 0.566, playSeconds: 1.8, speed: 22, live: true }
};

// Sprites dos monstros 2.5D. Como o boneco tem "cima" fixo na tela, o sprite não gira: cada monstro é gravado em
// SPRITE_DIRECTIONS direções (uma linha do atlas cada) x SPRITE_FRAMES quadros, e o jogo escolhe a direção mais perto.
// extent: metade do quadro, em unidades do boneco (o herói tem ~25 de altura), com o corpo no centro. Precisa caber o
//   monstro inteiro em qualquer direção.
// bakeSeconds: duração de um ciclo da animação (a passada fecha o laço sozinha; o resto fecha se couber nesse tempo).
// playSeconds: duração do ciclo no jogo. speed: velocidade do boneco enquanto os quadros são gravados.
// swayAmount/swayHz: balanço de lado dos voadores, em raios do monstro (aplicado ao carimbar, não gravado).
// directions/frames (opcionais): quantas direções e quadros gravar (padrão: SPRITE_DIRECTIONS e SPRITE_FRAMES). Os que são
//   desenhados ao vivo e só usam o sprite no bestiário gravam bem menos, para não gastar memória à toa.
export const SPRITE_DIRECTIONS = 16;
export const MONSTER_SPRITES_25D = {
    SKELETON: { extent: 16, bakeSeconds: 1 / 1.8, playSeconds: 0.62, speed: 70 },
    SKELETON_CRAWLER: { extent: 20, bakeSeconds: 1 / 1.8, playSeconds: 0.95, speed: 34 },
    BAT: { extent: 16, bakeSeconds: 1 / 5.5, playSeconds: 0.22, speed: 120, swayAmount: 0.16, swayHz: 2.2 },
    VAMPIRE: { extent: 21, bakeSeconds: 1, playSeconds: 1, speed: 45 },
    WITCH: { extent: 19, bakeSeconds: 1 / 1.8, playSeconds: 0.75, speed: 40 },
    NECROMANCER: { extent: 19, bakeSeconds: 1 / 1.8, playSeconds: 0.9, speed: 34 },
    MOTH: { extent: 14, bakeSeconds: 1 / 4.5, playSeconds: 0.22, speed: 100, swayAmount: 0.26, swayHz: 3.1 },
    BLOATER: { extent: 15, bakeSeconds: 1 / 1.6, playSeconds: 0.7, speed: 33 },
    WRAITH: { extent: 15, bakeSeconds: 1 / 1.1, playSeconds: 0.9, speed: 60 },
    SHADOW_WOLF: { extent: 20, bakeSeconds: 1 / 2.8, playSeconds: 0.38, speed: 100 },
    // Buddies (BUDDY_MODELS): os lobos do Rowan, montados sob demanda
    BUDDY_SHADOW_WOLF: { extent: 20, bakeSeconds: 1 / 2.8, playSeconds: 0.38, speed: 100 },
    BUDDY_WHITE_WOLF: { extent: 20, bakeSeconds: 1 / 2.8, playSeconds: 0.38, speed: 100 },
    // O treant: o carvalho evoluído andando (Ancient Grove); ciclo de passos lento e pesado
    BUDDY_TREANT: { extent: 30, bakeSeconds: 1, playSeconds: 1.1, speed: 40 },
    ZOMBIE_WOLF: { extent: 19, bakeSeconds: 1 / 2.6, playSeconds: 0.4, speed: 85 },
    HEADLESS_KNIGHT: { extent: 23, bakeSeconds: 1, playSeconds: 1, speed: 26 },
    // live: em campo é desenhado ao vivo (o golpe mexe braço, tronco e espada); o sprite serve ao bestiário
    BONE_COLOSSUS: { extent: 26, bakeSeconds: 1.667, playSeconds: 1.8, speed: 22, live: true, directions: 4, frames: 1 }
};
