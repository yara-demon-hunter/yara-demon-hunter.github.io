import { FAN_OF_KNIVES, LONG_THROW } from '../../data_model/passives.js';
import { FRENZY_NOVA_SKILL, KNIFE_SKILL } from '../../data_model/skills.js';
import { KNIFE_VISUALS as K } from '../../data_model/visuals/effects/knife_visual.js';
import { audio, passives, player, state } from '../core/state.js';
import { chargeUlt } from './combat.js';
import { createExplosion } from './effects.js';
import { getAtkDamage, getKnockback } from './stats.js';

// --- ADAGA DE ARREMESSO (golpe separado da lâmina, com recarga própria) ---
// Começa o arremesso na direção da mira (mouse ou dedo): a mão esquerda recua e a adaga
// só sai no instante em que é solta (KNIFE_VISUALS.letGoFraction da animação).
export function throwKnife(aimX, aimY) {
    let angle = Math.atan2(aimY - player.y, aimX - player.x);
    if (Math.hypot(aimX - player.x, aimY - player.y) < 1) angle = player.angle;

    state.knifeTimer = KNIFE_SKILL.cooldownSeconds;
    state.knifeThrowTime = performance.now();
    state.knifeThrowAngle = angle;
    state.knifePending = K.throwSeconds * K.letGoFraction;
}

// A adaga deixa a mão esquerda: nasce à frente e à esquerda do herói. Cada adaga para no primeiro inimigo atingido.
// Skills passivas: Long Throw (mais alcance e velocidade) e Fan of Knives (várias adagas em leque).
function releaseKnife() {
    const aim = state.knifeThrowAngle;
    const cos = Math.cos(aim);
    const sin = Math.sin(aim);
    const x = player.x + cos * K.spawnForward - sin * K.spawnSide;
    const y = player.y + sin * K.spawnForward + cos * K.spawnSide;

    const long = passives.longThrow.lvl > 0;
    const speed = KNIFE_SKILL.speed * (long ? LONG_THROW.speedMultiplier : 1);
    const maxRange = KNIFE_SKILL.maxRange * (long ? LONG_THROW.rangeMultiplier : 1);
    const count = passives.fanOfKnives.lvl > 0 ? FAN_OF_KNIVES.count : 1;
    const spread = (FAN_OF_KNIVES.spreadDegrees * Math.PI) / 180;
    const damage = getAtkDamage() * KNIFE_SKILL.damageMultiplier;
    const knockback = getKnockback() * KNIFE_SKILL.knockbackMultiplier;

    for (let i = 0; i < count; i++) {
        const angle = aim + (i - (count - 1) / 2) * spread;
        state.knives.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            angle, speed, maxRange, damage, knockback,
            travelled: 0
        });
    }

    createExplosion(x, y - K.flightHeight, K.colors.edge, 5 + count * 2);
    audio.playSwordSlash(1);
}

export function updateKnives(dt) {
    state.knifeTimer = Math.max(0, state.knifeTimer - dt);

    if (state.knifePending !== null) {
        state.knifePending -= dt;
        if (state.knifePending <= 0) {
            state.knifePending = null;
            releaseKnife();
        }
    }

    const { held, x, y } = state.knifeInput;
    if (held && state.knifeTimer <= 0 && state.knifePending === null) throwKnife(x, y);

    const { knives, enemies } = state;
    for (let i = knives.length - 1; i >= 0; i--) {
        const k = knives[i];
        k.x += k.vx * dt;
        k.y += k.vy * dt;
        k.travelled += k.speed * dt;

        const hit = enemies.find(e => Math.hypot(e.x - k.x, e.y - k.y) < e.radius + KNIFE_SKILL.radius);
        if (hit) {
            hit.hp -= k.damage;
            hit.vx += Math.cos(k.angle) * k.knockback;
            hit.vy += Math.sin(k.angle) * k.knockback;
            createExplosion(k.x, k.y, hit.color, 6);
            chargeUlt(FRENZY_NOVA_SKILL.chargePerHit);
            knives.splice(i, 1);
            continue;
        }

        const outside = k.x < 0 || k.x > state.width || k.y < 0 || k.y > state.height;
        if (outside || k.travelled >= k.maxRange) knives.splice(i, 1);
    }
}
