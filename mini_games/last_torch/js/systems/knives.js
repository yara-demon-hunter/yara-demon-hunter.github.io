import { FAN_OF_KNIVES, FIREBALLS, SHADOW_CLONE } from '../../data_model/passives.js';
import { KNIFE_SKILL } from '../../data_model/skills.js';
import { KNIFE_VISUALS as K } from '../../data_model/visuals/effects/knife_visual.js';
import { getThrownWeapon } from '../../library/weapons/thrown.js';
import { POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, joystick, passives, player, powers, state } from '../core/state.js';
import { dealDamage } from './damage.js';
import { createExplosion } from './effects.js';
import { mod } from './modifiers.js';
import { burstFireball } from './skills_flame.js';
import { markEnemy } from './skills_shadow.js';
import { markWithRose } from './skills_nature.js';
import { getKnifeBaseRange, getKnifeCooldown, getKnifeDamage, getKnockback } from './stats.js';
import { getHero } from './modifiers.js';

// O que o herói lança: adaga, ou a rosa do Rowan (a Rosa Negra, com a skill Dark Roses). Só muda o desenho: dano, alcance e
// todas as skills de adaga valem igual para a rosa
export function getThrownStyle() {
    if (getHero().thrown !== 'rose') return 'dagger';
    return passives.darkRoses.lvl > 0 ? 'darkRose' : 'rose';
}

const KNIFE_RELEASE_SECONDS = K.throwSeconds * K.letGoFraction;
// Toque no botão da adaga quase no fim da recarga: guarda o arremesso e solta assim que ficar pronta,
// em vez de ignorar o toque (parecia que o botão tinha travado)
const KNIFE_TAP_BUFFER_SECONDS = 0.35;

// --- ADAGA DE ARREMESSO (golpe separado da lâmina, com recarga própria) ---
// Começa o arremesso na direção da mira (mouse ou dedo): a mão esquerda recua e a adaga
// só sai no instante em que é solta (KNIFE_VISUALS.letGoFraction da animação).
export function throwKnife(aimX, aimY) {
    // Oath of Slaughter: a mão que lançava adagas só empunha a espada
    if (mod('noKnives') > 0) {
        state.knifeCharge = 0;
        return;
    }
    let angle = Math.atan2(aimY - player.y, aimX - player.x);
    if (Math.hypot(aimX - player.x, aimY - player.y) < 1) angle = player.angle;

    state.knifeTimer = getKnifeCooldown();
    // Fireballs: antes do arremesso a bola cresce na mão (getFireCastRatio); a animação só começa depois disso
    const hold = passives.fireballs.lvl > 0 ? getFireCastSeconds() : 0;
    state.knifeThrowTime = performance.now() + hold * 1000;
    state.knifeThrowAngle = angle;
    state.knifeThrowPower = getKnifeChargeRatio();
    state.knifeCharge = 0;
    state.knifePending = hold + KNIFE_RELEASE_SECONDS;
}

// Fireballs: o tempo de conjuração é fixo, nada o encurta
export function getFireCastSeconds() {
    return FIREBALLS.castSeconds;
}

// Fireballs: do começo da conjuração até a bola sair o herói não anda, não golpeia e não dá dash
export function isFireCasting() {
    return passives.fireballs.lvl > 0 && state.knifePending !== null;
}

// Quanto a bola já cresceu na mão (0 a 1); depois disso vem o movimento do arremesso
export function getFireCastRatio() {
    if (!isFireCasting()) return 0;
    const hold = state.knifePending - KNIFE_RELEASE_SECONDS;
    return hold > 0 ? 1 - hold / getFireCastSeconds() : 0;
}

// A adaga deixa a mão esquerda: nasce à frente e à esquerda do herói. Cada adaga para no primeiro inimigo atingido.
// Dagger Mastery dá dano, alcance e velocidade (mods knifeDamage, knifeRange, knifeSpeed); Fan of Knives lança várias adagas em leque.
function releaseKnife(thrower = player) {
    const aim = state.knifeThrowAngle;
    const cos = Math.cos(aim);
    const sin = Math.sin(aim);
    const x = thrower.x + cos * K.spawnForward - sin * K.spawnSide;
    const y = thrower.y + sin * K.spawnForward + cos * K.spawnSide;

    const speed = KNIFE_SKILL.speed * (1 + mod('knifeSpeed')) * getThrownWeapon(getThrownStyle()).speed;
    const maxRange = getKnifeRange();
    const count = passives.fanOfKnives.lvl > 0 ? FAN_OF_KNIVES.count : 1;
    const spread = (FAN_OF_KNIVES.spreadDegrees * Math.PI) / 180;
    const ricochet = getPowerLevel(powers.ricochet);
    const lance = getPowerLevel(powers.chargedThrow);
    const power = state.knifeThrowPower >= POWER_MODELS.chargedThrow.minCharge ? state.knifeThrowPower : 0;
    // A carga da Charged Dagger Throw se divide entre as adagas do leque
    const damage = getKnifeDamage() * (1 + power * (lance?.damage ?? 0) / count);
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
            scale: 1 + power * (POWER_MODELS.chargedThrow.maxScale - 1),
            fire: passives.fireballs.lvl > 0,
            style: getThrownStyle(),
            struck: null                // monstros já atingidos por esta adaga (Ricochet)
        });
    }

    createExplosion(x, y - K.flightHeight, passives.fireballs.lvl > 0 ? '#fb923c' : getThrownWeapon(getThrownStyle()).colors.edge, 5 + count * 2);
    if (thrower === player) audio.playSwordSlash(1);
}

// A sombra que cai explode em adagas para todos os lados: valem Dagger Mastery, Ricochet e Fan of Knives
export function burstKnives(x, y) {
    if (mod('noKnives') > 0) return;
    const B = SHADOW_CLONE.burst;
    const count = B.knives + (passives.fanOfKnives.lvl > 0 ? B.fanBonus : 0);
    const speed = KNIFE_SKILL.speed * (1 + mod('knifeSpeed')) * getThrownWeapon(getThrownStyle()).speed;
    const maxRange = getKnifeRange();
    const ricochet = getPowerLevel(powers.ricochet);
    const damage = getKnifeDamage() * B.damageMultiplier;
    const knockback = getKnockback() * KNIFE_SKILL.knockbackMultiplier;
    const offset = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
        const angle = offset + (i / count) * Math.PI * 2;
        state.knives.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            angle, speed, maxRange, damage, knockback,
            travelled: 0,
            bounces: ricochet?.bounces ?? 0,
            pierces: 0,
            scale: 1,
            fire: passives.fireballs.lvl > 0,
            style: getThrownStyle(),
            struck: null
        });
    }
    createExplosion(x, y - K.flightHeight, passives.fireballs.lvl > 0 ? '#fb923c' : getThrownWeapon(getThrownStyle()).colors.edge, 10 + count);
}

// Alcance atual da adaga (com Dagger Mastery)
export function getKnifeRange() {
    return getKnifeBaseRange() * (1 + mod('knifeRange'));
}

// Charged Dagger Throw: fração da carga atual (0 a 1)
export function getKnifeChargeRatio() {
    const lance = getPowerLevel(powers.chargedThrow);
    return lance ? Math.min(1, state.knifeCharge / lance.seconds) : 0;
}

// Botão da adaga (toque): arrastando mira na direção do arraste. Num toque rápido a mira é automática:
// o monstro mais perto dentro do alcance; sem nenhum, a direção em que o herói anda; parado, o monstro
// mais perto em qualquer lugar; sem monstros, a última direção do joystick
function aimWithStick(stick) {
    let angle;
    if (stick.x || stick.y) {
        angle = Math.atan2(stick.y, stick.x);
    } else {
        const range = getKnifeRange();
        let nearest = null;
        let best = Infinity;
        state.enemies.forEach(e => {
            if (e.hp <= 0) return;
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < best) {
                best = d;
                nearest = e;
            }
        });
        const moving = joystick.x || joystick.y;
        if (nearest && (best <= range || !moving)) angle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
        else if (moving) angle = Math.atan2(joystick.y, joystick.x);
        else if (joystick.lastX || joystick.lastY) angle = Math.atan2(joystick.lastY, joystick.lastX);
        else angle = player.angle;
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
    const lance = getPowerLevel(powers.chargedThrow);
    const ready = state.knifeTimer <= 0 && state.knifePending === null;
    // Charged Dagger Throw: segurar carrega (só com a adaga pronta) em vez de repetir o arremesso
    if (lance && ready && (held || stick.active) && mod('noKnives') <= 0) state.knifeCharge = Math.min(lance.seconds, state.knifeCharge + dt);

    if (stick.active || stick.fire) aimWithStick(stick);
    if (stick.fire) {
        const almostReady = state.knifeTimer <= KNIFE_TAP_BUFFER_SECONDS;
        if (ready) throwKnife(state.knifeInput.x, state.knifeInput.y);
        if (ready || !almostReady) {
            stick.fire = false;
            stick.x = 0;
            stick.y = 0;
        }
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
            dealDamage(hit, k.damage, { style: k.fire ? 'spell' : null, kbX: Math.cos(k.angle) * k.knockback, kbY: Math.sin(k.angle) * k.knockback });
            markEnemy(hit);
            if (k.style === 'darkRose') markWithRose(hit);
            if (k.fire) burstFireball(k, hit);
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
