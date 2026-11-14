// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/thrown.js e rode o sync.
import { DAGGER_VISUALS } from './dagger/dagger_visual.js';
import { drawThrownDagger } from './dagger/thrown_dagger.js';
import { ROSE_VISUALS } from './rose/rose_visual.js';
import { drawRose } from './rose/rose.js';
import { CROSS_VISUALS } from './cross/cross_visual.js';
import { drawCross } from './cross/cross.js';

// --- ARMAS DE ARREMESSO ---
// O que o herói lança com a mão livre: uma tabela de estilos. Cada um sabe se desenhar (ao longo de +x, origem no meio do
// cabo) e traz as cores do brilho, do rastro e da sombra. O jogo escolhe o estilo (dagger | rose | darkRose | cross) e sabe só isso.
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
    cross: { draw: drawCross, centerX: CROSS_VISUALS.shape.centerX, colors: CROSS_VISUALS.colors, speed: 0.8, scale: 1.6, spin: 0.03 }
};

// Os efeitos da Dark Roses (a marca e as rosas de espinho no chão) estão em rose/rose_effects.js
export { drawRoseMark, drawThornPatch } from './rose/rose_effects.js';

export function getThrownWeapon(style) {
    return THROWN_WEAPONS[style] ?? THROWN_WEAPONS.dagger;
}
