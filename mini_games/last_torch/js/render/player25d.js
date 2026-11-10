import { HERO_25D_VISUALS as V } from '../../library/characters/hunter/hero25d_visual.js';
import { renderHero25D, renderSwordDetail as renderLibrarySword, setHeroHooks } from '../../library/characters/hunter/hero25d.js';
import { easeOutCubic } from '../../library/core/easing.js';
import { KNIFE_VISUALS } from '../../data_model/visuals/effects/knife_visual.js';
import { OATH_VISUALS } from '../../data_model/visuals/characters/oath_visual.js';
import { SKILLS_VISUALS } from '../../data_model/visuals/effects/skills_visual.js';
import { getPowerLevel } from '../../data_model/powers.js';
import { ctx, passives, player, powers, state } from '../core/state.js';
import { getFireCastRatio, getKnifeChargeRatio } from '../systems/knives.js';
import { drawFireOrb, drawFlameTongue } from './fire.js';
import { drawGlow } from '../../library/core/glow.js';
import { drawGearGround, gearParts } from './hero_gear.js';
import { drawDagger } from './knife.js';
import { heroAnim } from './player.js';
import './bodies.js';

// --- HERÓI 2.5D NO LAST TORCH ---
// O boneco mora na biblioteca (library/characters/hunter/hero25d.js; Azael e Brutos em library/characters/<id>/).
// Aqui o jogo liga as regras dele ao boneco e à animação (library/characters/hunter/hero_hooks.js): arremesso da
// adaga, adaga e bola de fogo na mão livre, cortes do combo, Fúria, Bloodlust, Flaming Sword e o equipamento dos
// Juramentos (js/render/hero_gear.js). O estado de animação do herói fica em js/render/player.js.

// Adaga presa na mão, apontando na direção do antebraço (encurta quando aponta para a câmera)
function drawHeldDagger(rig, shoulder, hand, t) {
    const d = [hand[0] - shoulder[0], hand[1] - shoulder[1], hand[2] - shoulder[2]];
    const len = Math.hypot(...d) || 1;
    const p0 = rig.project(...hand);
    const p1 = rig.project(hand[0] + d[0] / len, hand[1] + d[1] / len, hand[2] + d[2] / len);
    const fore = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    ctx.save();
    ctx.translate(p0.x, p0.y);
    ctx.rotate(Math.atan2(p1.y - p0.y, p1.x - p0.x));
    ctx.scale(KNIFE_VISUALS.handScale * Math.max(0.35, fore), KNIFE_VISUALS.handScale);
    drawDagger(ctx, t);
    ctx.restore();
}

// Flaming Sword: línguas de fogo ao longo da lâmina; sob o Oath of the Hearth, maiores e douradas
function drawBladeFire(rig, hand, dir, t) {
    const F = SKILLS_VISUALS.fire;
    const hot = state.oath === 'oathHearth';
    const scale = hot ? F.swordOathScale : 1;
    const length = rig.bladeLength;
    for (let i = 0; i < F.swordTongues; i++) {
        const k = 0.14 + (0.86 * i) / (F.swordTongues - 1);
        const p = rig.project(hand[0] + dir[0] * length * k, hand[1] + dir[1] * length * k, hand[2] + dir[2] * length * k);
        drawFlameTongue(p.x, p.y, F.swordSize * scale * (1.15 - k * 0.5), t, i, hot);
    }
}

// Último golpe de quem anima (herói ou clone: os golpes do clone têm shadow: true)
function lastSlashOf(shadow) {
    for (let i = state.bladeSlashes.length - 1; i >= 0; i--) {
        if (!!state.bladeSlashes[i].shadow === shadow) return state.bladeSlashes[i];
    }
    return null;
}

setHeroHooks({
    // Arremesso da adaga (mão esquerda). O Shadow Clone arremessa junto com o herói
    throwVisual: KNIFE_VISUALS,
    throwProgress() {
        const k = (performance.now() - state.knifeThrowTime) / 1000 / KNIFE_VISUALS.throwSeconds;
        return k >= 0 && k < 1 ? k : -1;
    },
    throwing: (now) => (now - state.knifeThrowTime) / 1000 < KNIFE_VISUALS.throwSeconds,
    throwAngle: () => state.knifeThrowAngle,
    // Golpe novo: o corte da lâmina (arco e giro) de quem anima
    lastSlash: (body) => lastSlashOf(body !== player),
    // Charged Dagger Throw e Fireballs: a mão fica para trás carregando
    chargeRatio: getKnifeChargeRatio,
    fireHoldRatio: getFireCastRatio,
    // Na mão: a bola de fogo (com Fireballs) ou a adaga
    drawHeldItem(rig, { shoulder, hand, pose, charge, fireHold }) {
        if (passives.fireballs.lvl > 0) {
            const orb = rig.project(...hand);
            const grow = fireHold > 0 ? easeOutCubic(fireHold) : 1;
            drawFireOrb(orb.x, orb.y - 2, SKILLS_VISUALS.fire.orbRadius * (0.3 + 0.7 * grow) * (1 + charge * 0.7), pose.t);
        } else drawHeldDagger(rig, shoulder, hand, pose.t);
    },
    // Boss rival (js/render/rival.js): a lâmina acende quando ele enfurece, não com a Fúria do herói
    frenzy: (body) => (body.isBoss ? !!body.enraged : state.frenzyActiveTimer > 0),
    // Bloodlust: a lâmina fica mais vermelha conforme a fome sobe (só a do herói)
    drawBladeAura(rig, body, x, y) {
        const level = body === player ? getPowerLevel(powers.bloodlust) : null;
        const hunger = level ? state.bloodlust.stacks / level.stacks : 0;
        if (hunger > 0) drawGlow(ctx, SKILLS_VISUALS.bloodlust.blade, x, y, 8 + hunger * 13, 0.3 + hunger * 0.5);
    },
    drawBladeExtras(rig, body, hand, dir, t) {
        if (body === player && passives.flameBlade.lvl > 0) drawBladeFire(rig, hand, dir, t);
    },
    // Juramentos: forma (espada e capuz), o que fica no chão e as peças extras
    gearShape: (gear) => OATH_VISUALS[gear],
    gearGround: drawGearGround,
    gearParts
});

// body: herói (padrão) ou Shadow Clone, com o seu estado de animação e a sua paleta.
// oathGear: forma do Juramento (colors já vem com a paleta dele). model: 'hunter' (padrão) ou o id de um boneco (js/render/bodies.js)
export function renderPlayer25D(body = player, bodyAnim = heroAnim, colors = V.colors, oathGear = null, model = 'hunter') {
    renderHero25D(body, bodyAnim, colors, oathGear, model);
}

// Espada de perfil, com a mão na origem e a ponta em +x (previews/weapon_previews.html)
export function renderSwordDetail({ colors = V.colors, oathGear = null, fire = false, frenzy = false }) {
    renderLibrarySword({ colors, oathGear, frenzy, extras: fire ? drawBladeFire : null });
}
