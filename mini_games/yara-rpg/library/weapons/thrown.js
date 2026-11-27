// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/thrown.js e rode o sync.
import { DAGGER_VISUALS } from './dagger/dagger_visual.js';
import { drawThrownDagger } from './dagger/thrown_dagger.js';
import { ROSE_VISUALS } from './rose/rose_visual.js';
import { drawRose } from './rose/rose.js';
import { CROSS_VISUALS } from './cross/cross_visual.js';
import { drawCross } from './cross/cross.js';
import { SHURIKEN_VISUALS, drawShuriken } from './shuriken/shuriken.js';
import { KUNAI_VISUALS, drawKunai } from './kunai/kunai.js';
import { ARCANE_ORB_VISUALS, drawArcaneOrb } from './arcane_orb/arcane_orb.js';

// --- ARMAS DE ARREMESSO ---
// O que o herói lança com a mão livre: uma tabela de estilos. Cada um sabe se desenhar (ao longo de +x, origem no meio do
// cabo) e traz as cores do brilho, do rastro e da sombra. O jogo escolhe o estilo (dagger | rose | darkRose | cross | arcane) e sabe só isso.
//   draw(ctx, t)   desenha a arma (t = tempo, para as runas)
//   centerX        ponto de equilíbrio (centro do desenho em voo)
//   colors         glow, trail, shadow (e edge: a cor da faísca ao lançar)
//   speed          multiplica a velocidade de voo (a rosa voa mais devagar, para dar para ver a flor)
//   scale          multiplica o tamanho em voo
//   spin           giro em voo, em radianos por unidade andada (0 = voa reto, como a adaga)
export const THROWN_WEAPONS = {
    dagger: { draw: drawThrownDagger, centerX: DAGGER_VISUALS.shape.centerX, colors: DAGGER_VISUALS.colors, speed: 1, scale: 1, spin: 0 },
    rose: { draw: (ctx, t) => drawRose(ctx, t, false), centerX: ROSE_VISUALS.shape.centerX, colors: ROSE_VISUALS.rose.colors, speed: 0.55, scale: 1.95, spin: 0 },
    darkRose: { draw: (ctx, t) => drawRose(ctx, t, true), centerX: ROSE_VISUALS.shape.centerX, colors: ROSE_VISUALS.dark.colors, speed: 0.55, scale: 1.95, spin: 0 },
    // Crucifixo de prata do Avgustino: gira em voo, um pouco mais devagar que a adaga
    // Esfera arcana do Gudran: um pouco mais lenta que a adaga e maior, sem giro (a esfera brilha, não gira)
    arcane: { draw: drawArcaneOrb, centerX: ARCANE_ORB_VISUALS.shape.centerX, colors: ARCANE_ORB_VISUALS.colors, speed: 0.75, scale: 2.04, spin: 0 },       // scale 1.7 -> 2.04 (27/11/2026: a bola de energia do Gudran 20% maior)
    // Shuriken do Kuro (ninja): pequena e rápida, gira muito em voo
    shuriken: { draw: drawShuriken, centerX: SHURIKEN_VISUALS.shape.centerX, colors: SHURIKEN_VISUALS.colors, speed: 1.15, scale: 1.5, spin: 0.35 },
    // Kunai do Kurama: voa reto e quase sem giro
    kunai: { draw: drawKunai, centerX: KUNAI_VISUALS.shape.centerX, colors: KUNAI_VISUALS.colors, speed: 1, scale: 1.6, spin: 0.05 },
    cross: { draw: drawCross, centerX: CROSS_VISUALS.shape.centerX, colors: CROSS_VISUALS.colors, speed: 0.8, scale: 1.6, spin: 0.03 }
};

// Os efeitos da Dark Roses (a marca e as rosas de espinho no chão) estão em rose/rose_effects.js
export { drawRoseMark, drawThornPatch } from './rose/rose_effects.js';

export function getThrownWeapon(style) {
    return THROWN_WEAPONS[style] ?? THROWN_WEAPONS.dagger;
}
