import { HERO_VISUALS as V } from '../../library/characters/hunter/hero_visual.js';
import { createHeroAnim, updateHeroAnim } from '../../library/characters/hunter/hero_anim.js';
import { renderHeroTopDown } from '../../library/characters/hunter/hero_topdown.js';
import { ctx, player, state } from '../core/state.js';

// --- HERÓI DO JOGADOR ---
// O desenho e a animação do herói moram na biblioteca (library/characters/hunter/); as regras do jogo que mexem na
// animação (arremesso, cortes do combo) são ligadas em js/render/player25d.js. Aqui ficam o estado de animação do
// herói do jogador, o rastro de sombra e o herói top-down antigo (?hero=topdown).
// O Shadow Clone e os rivais têm o seu próprio estado, criado com createHeroAnim.
const anim = createHeroAnim();
export { anim as heroAnim };

// Rastro de sombra escura, quase imperceptível
export function renderPlayerTrail() {
    updateHeroAnim(anim, player);
    for (let i = 0; i < player.trail.length; i++) {
        const pt = player.trail[i];
        if (pt.alpha <= 0) continue;
        const fade = 1 - i / player.trail.length;
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha * fade * V.shadowTrailAlpha);
        ctx.fillStyle = V.colors.shadowTrail;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(2, V.shadowTrailRadius * fade), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Herói top-down antigo (?hero=topdown; o padrão é o 2.5D de js/render/player25d.js)
export function renderPlayer() {
    renderHeroTopDown(player, anim, state.frenzyActiveTimer > 0);
}
