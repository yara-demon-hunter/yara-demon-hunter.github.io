import { BOSS_MODELS } from '../../data_model/bosses.js';
import { HEROES } from '../../data_model/heroes.js';
import { SHADOW_CLONE_VISUALS, shadowColorsOf } from '../../data_model/visuals/characters/shadow_clone_visual.js';
import { ctx } from '../core/state.js';
import { lerpAngle } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';
import { createHeroAnim, updateHeroAnim } from './player.js';
import { renderPlayer25D } from './player25d.js';

// --- RIVAL (boss com o boneco de um herói) ---
// O Azael e o Demon Hunter como bosses: o mesmo boneco 2.5D do herói (js/render/player25d.js), com animação
// própria (anda, vira, golpeia no arranque da investida e faz a pose do dash), maior que o herói e sobre uma aura
// na cor do boss. Enfurecido, a lâmina acende como na Fúria. Os dados ficam em data_model/bosses.js (RIVAL_BASE).

// Estado visual por boss (não afeta a lógica do jogo); some junto com o objeto do boss
const animByBoss = new WeakMap();

function getAnim(e) {
    let a = animByBoss.get(e);
    if (!a) {
        a = createHeroAnim(false);
        a.lastX = e.x;
        a.lastY = e.y;
        a.facing = e.angle;
        animByBoss.set(e, a);
    }
    return a;
}

// Campos que o boneco lê do corpo e que um inimigo não tem
function prepareBody(e) {
    e.comboStep ??= 1;
    e.iFrames ??= 0;
    e.hitTime ??= -100000;
    e.hitDirX ??= 0;
    e.hitDirY ??= 0;
    e.castAge ??= -1;
    e.lastHitFlash ??= 0;
    // Levou um golpe: o mesmo tranco e o mesmo anel de dano do herói
    const flash = e.hitFlash ?? 0;
    if (flash > e.lastHitFlash + 0.001) {
        e.hitTime = performance.now();
        e.hitDirX = e.recoilX ?? 0;
        e.hitDirY = e.recoilY ?? 0;
    }
    e.lastHitFlash = flash;
}

export function renderRival(e) {
    const model = BOSS_MODELS[e.type];
    const a = getAnim(e);
    prepareBody(e);
    if (!e.baking) {
        updateHeroAnim(a, e);
        // Andando de lado ele continua de frente para o alvo (e.angle); atirando, para onde atira
        const look = e.castAge >= 0 && e.castAngle != null ? e.castAngle : e.angle;
        if (!a.swingActive) a.facing = lerpAngle(a.facing, look, e.castAge >= 0 ? 0.5 : 0.15);
    }

    const k = model.renderScale;
    // Sombra do rival: paleta de sombra (a mesma do Shadow Clone), semitransparente, na aura do rival
    const shadow = model.isShadow;
    const colors = shadow
        ? shadowColorsOf(model.heroModel)
        : HEROES[model.heroKey].colors ?? undefined;
    drawGlow(ctx, model.color, e.x, e.y, e.radius * 2.4, shadow ? 0.22 : e.enraged ? 0.55 : 0.32);
    ctx.save();
    if (shadow) ctx.globalAlpha = SHADOW_CLONE_VISUALS.alpha;
    ctx.translate(e.x, e.y);
    ctx.scale(k, k);
    ctx.translate(-e.x, -e.y);
    renderPlayer25D(e, a, colors, null, model.heroModel);
    ctx.restore();
}
