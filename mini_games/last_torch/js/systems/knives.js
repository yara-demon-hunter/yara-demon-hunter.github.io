import { FAN_OF_KNIVES, LONG_THROW } from '../../data_model/passives.js';
import { KNIFE_SKILL } from '../../data_model/skills.js';
import { KNIFE_VISUALS as K } from '../../data_model/visuals/effects/knife_visual.js';
import { POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, joystick, passives, player, powers, state } from '../core/state.js';
import { dealDamage } from './damage.js';
import { createExplosion } from './effects.js';
import { mod } from './modifiers.js';
import { getAtkDamage, getKnifeCooldown, getKnockback } from './stats.js';

// --- ADAGA DE ARREMESSO (golpe separado da lâmina, com recarga própria) ---
// Começa o arremesso na direção da mira (mouse ou dedo): a mão esquerda recua e a adaga
// só sai no instante em que é solta (KNIFE_VISUALS.letGoFraction da animação).
export function throwKnife(aimX, aimY) {
    let angle = Math.atan2(aimY - player.y, aimX - player.x);
    if (Math.hypot(aimX - player.x, aimY - player.y) < 1) angle = player.angle;

    state.knifeTimer = getKnifeCooldown();
    state.knifeThrowTime = performance.now();
    state.knifeThrowAngle = angle;
    state.knifeThrowPower = getKnifeChargeRatio();
    state.knifeCharge = 0;
    state.knifePending = K.throwSeconds * K.letGoFraction;
}

// A adaga deixa a mão esquerda: nasce à frente e à esquerda do herói. Cada adaga para no primeiro inimigo atingido.
// Skills passivas: Long Throw (mais alcance e velocidade) e Fan of Knives (várias adagas em leque).
function releaseKnife(thrower = player) {
    const aim = state.knifeThrowAngle;
    const cos = Math.cos(aim);
    const sin = Math.sin(aim);
    const x = thrower.x + cos * K.spawnForward - sin * K.spawnSide;
    const y = thrower.y + sin * K.spawnForward + cos * K.spawnSide;

    const speed = KNIFE_SKILL.speed * (passives.longThrow.lvl > 0 ? LONG_THROW.speedMultiplier : 1);
    const maxRange = getKnifeRange();
    const count = passives.fanOfKnives.lvl > 0 ? FAN_OF_KNIVES.count : 1;
    const spread = (FAN_OF_KNIVES.spreadDegrees * Math.PI) / 180;
    const ricochet = getPowerLevel(powers.ricochet);
    const lance = getPowerLevel(powers.soulLance);
    const power = state.knifeThrowPower >= POWER_MODELS.soulLance.minCharge ? state.knifeThrowPower : 0;
    const damage = getAtkDamage() * KNIFE_SKILL.damageMultiplier * (1 + mod('knifeDamage') + (ricochet?.damage ?? 0))
        * (1 + power * (lance?.damage ?? 0));
    const knockback = getKnockback() * KNIFE_SKILL.knockbackMultiplier;

    for (let i = 0; i < count; i++) {
        const angle = aim + (i - (count - 1) / 2) * spread;
        state.knives.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            angle, speed, maxRange, damage, knockback,
            travelled: 0,
            bounces: ricochet?.bounces ?? 0,
            pierces: Math.round(power * (lance?.pierces ?? 0)),
            scale: 1 + power * (POWER_MODELS.soulLance.maxScale - 1),
            struck: null                // monstros já atingidos por esta adaga (Ricochet)
        });
    }

    createExplosion(x, y - K.flightHeight, K.colors.edge, 5 + count * 2);
    if (thrower === player) audio.playSwordSlash(1);
}

// Alcance atual da adaga (com Long Throw)
export function getKnifeRange() {
    return KNIFE_SKILL.maxRange * (passives.longThrow.lvl > 0 ? LONG_THROW.rangeMultiplier : 1);
}

// Soul Lance: fração da carga atual (0 a 1)
export function getKnifeChargeRatio() {
    const lance = getPowerLevel(powers.soulLance);
    return lance ? Math.min(1, state.knifeCharge / lance.seconds) : 0;
}

// Botão da adaga (toque): arrastando mira na direção do arraste; sem arrastar, no monstro
// mais perto dentro do alcance (ou na última direção do joystick)
function aimWithStick(stick) {
    let angle = joystick.lastX || joystick.lastY ? Math.atan2(joystick.lastY, joystick.lastX) : player.angle;
    if (stick.x || stick.y) {
        angle = Math.atan2(stick.y, stick.x);
    } else {
        let best = getKnifeRange();
        state.enemies.forEach(e => {
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < best) {
                best = d;
                angle = Math.atan2(e.y - player.y, e.x - player.x);
            }
        });
    }
    stick.aimAngle = angle;
    state.knifeInput.x = player.x + Math.cos(angle) * 100;
    state.knifeInput.y = player.y + Math.sin(angle) * 100;
}

// Ricochet: a adaga salta para o monstro mais perto que ainda não acertou
function bounceKnife(k, hit) {
    if (k.bounces <= 0) return false;
    (k.struck ??= new Set()).add(hit);

    let next = null;
    let best = POWER_MODELS.ricochet.bounceRange;
    state.enemies.forEach(e => {
        if (e.hp <= 0 || k.struck.has(e)) return;
        const d = Math.hypot(e.x - k.x, e.y - k.y);
        if (d < best) {
            best = d;
            next = e;
        }
    });
    if (!next) return false;

    k.bounces--;
    k.angle = Math.atan2(next.y - k.y, next.x - k.x);
    k.vx = Math.cos(k.angle) * k.speed;
    k.vy = Math.sin(k.angle) * k.speed;
    k.travelled = 0;
    return true;
}

export function updateKnives(dt) {
    state.knifeTimer = Math.max(0, state.knifeTimer - dt);

    // Botão da adaga (toque): segurando só mira (linha tracejada); ao soltar arremessa uma vez na
    // direção mirada, se a recarga já terminou
    const { stick, held, x, y } = state.knifeInput;
    const lance = getPowerLevel(powers.soulLance);
    const ready = state.knifeTimer <= 0 && state.knifePending === null;
    // Soul Lance: segurar carrega (só com a adaga pronta) em vez de repetir o arremesso
    if (lance && ready && (held || stick.active)) state.knifeCharge = Math.min(lance.seconds, state.knifeCharge + dt);

    if (stick.active || stick.fire) aimWithStick(stick);
    if (stick.fire) {
        stick.fire = false;
        stick.x = 0;
        stick.y = 0;
        if (state.knifeTimer <= 0 && state.knifePending === null) throwKnife(state.knifeInput.x, state.knifeInput.y);
    }

    if (state.knifePending !== null) {
        state.knifePending -= dt;
        if (state.knifePending <= 0) {
            state.knifePending = null;
            releaseKnife();
        }
    }

    if (lance) {
        if (!held && !stick.active && state.knifeCharge > 0) throwKnife(x, y);
    } else if (held && state.knifeTimer <= 0 && state.knifePending === null) {
        throwKnife(x, y);
    }

    const { knives, enemies } = state;
    for (let i = knives.length - 1; i >= 0; i--) {
        const k = knives[i];
        k.x += k.vx * dt;
        k.y += k.vy * dt;
        k.travelled += k.speed * dt;

        const hit = enemies.find(e => e.hp > 0 && !k.struck?.has(e)
            && Math.hypot(e.x - k.x, e.y - k.y) < e.radius + KNIFE_SKILL.radius * k.scale);
        if (hit) {
            dealDamage(hit, k.damage, { kbX: Math.cos(k.angle) * k.knockback, kbY: Math.sin(k.angle) * k.knockback });
            createExplosion(k.x, k.y, hit.color, 6);
            audio.playHit(1);
            if (k.pierces > 0) {
                k.pierces--;
                (k.struck ??= new Set()).add(hit);
            } else if (!bounceKnife(k, hit)) {
                knives.splice(i, 1);
            }
            continue;
        }

        const outside = k.x < 0 || k.x > state.width || k.y < 0 || k.y > state.height;
        if (outside || k.travelled >= k.maxRange) knives.splice(i, 1);
    }
}
