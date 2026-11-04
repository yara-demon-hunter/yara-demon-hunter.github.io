import { BOUNCE } from '../../data_model/bounce.js';
import { COMBAT } from '../../data_model/combat.js';
import { TEXTS } from '../../data_model/texts.js';
import { playSound } from '../audio/sound.js';
import { shrinkPlatform } from '../core/arena.js';
import { state } from '../core/state.js';
import { players } from '../entities/player.js';
import { addBurst, addPopup, addRing, comicImpact, createDust, createParticles, showBanner } from './effects.js';
import { triggerKO } from './replay.js';
import { updateHeartsHUD } from '../ui/hud.js';

function applyRivalBounce(p1, p2, nx, ny, attackImpulse = 0) {
    const approach = (p1.vx - p2.vx) * nx + (p1.vy - p2.vy) * ny;
    const bounceImpulse = approach > 0
        ? (1 + BOUNCE.restitution.rival) * approach / (1 / p1.effMass + 1 / p2.effMass)
        : 0;
    const j = bounceImpulse + attackImpulse;
    if (j === 0) return;
    p1.vx -= j / p1.effMass * nx;
    p1.vy -= j / p1.effMass * ny;
    p2.vx += j / p2.effMass * nx;
    p2.vy += j / p2.effMass * ny;
}

function dashImpulse(attacker, victim, directionToVictim) {
    const forwardSpeed = attacker.vx * directionToVictim;
    if (!attacker.isDashing || forwardSpeed <= 0) return 0;
    const skill = attacker.character.dash;
    const brace = victim.isDashing ? victim.character.dash.incomingForceMultiplier ?? 1 : 1;
    const T = COMBAT.special.turbo;
    const impulse = attacker.effMass * forwardSpeed * COMBAT.dashMomentumTransfer *
        (skill.hitForceMultiplier ?? 1) * brace * (attacker.turbo ? T.forceMul : 1);
    return Math.min(impulse, COMBAT.maxDashImpulse * (attacker.turbo ? T.maxImpulseMul : 1));
}

export function isSmash(attacker, victim) {
    return attacker.isPounding && attacker.poundWindup === 0 && attacker.vy > 0 &&
        attacker.y < victim.y - victim.radius * COMBAT.smash.aboveRatio && victim.stunTimer === 0;
}

export function resolvePlayerCollisions() {
    const p1 = players[0];
    const p2 = players[1];
    if (!p1.isAlive || !p2.isAlive) return;
    if (p1.skyDrop > 0 || p2.skyDrop > 0) return; // lá no alto do SKY DROP ninguém se toca

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.hypot(dx, dy);
    const minDistance = p1.radius + p2.radius;
    if (distance >= minDistance) return;

    const nx = dx / (distance || 1);
    const ny = dy / (distance || 1);

    // Separação: o mais pesado se move menos
    const overlap = minDistance - distance;
    const total = p1.effMass + p2.effMass;
    p1.x -= nx * overlap * (p2.effMass / total);
    p1.y -= ny * overlap * (p2.effMass / total);
    p2.x += nx * overlap * (p1.effMass / total);
    p2.y += ny * overlap * (p1.effMass / total);

    if (state.hitCooldown > 0) {
        // A janela evita golpes repetidos, mas o contato ainda respeita massa e restituição.
        applyRivalBounce(p1, p2, nx, ny);
        return;
    }
    state.hitCooldown = COMBAT.hitCooldownFrames;

    if (isSmash(p1, p2)) return doSmash(p1, p2);
    if (isSmash(p2, p1)) return doSmash(p2, p1);

    // Pisou na cabeça: SKY DROP (quem pisou é lançado lá pro alto e mira a queda)
    if (isHeadStomp(p1, p2)) return doHeadStomp(p1, p2);
    if (isHeadStomp(p2, p1)) return doHeadStomp(p2, p1);

    const anyDash = p1.isDashing || p2.isDashing;
    playSound('hit');
    state.cameraShake = Math.max(state.cameraShake, anyDash ? COMBAT.shake.dash : COMBAT.shake.normal);
    state.hitStop = anyDash ? COMBAT.hitStopFrames.dash : COMBAT.hitStopFrames.normal;

    // O quique e o impulso de dash aplicam o mesmo impulso em sentidos opostos:
    // o momento total se conserva e a massa maior sofre menor variação de velocidade.
    const attackImpulse = dashImpulse(p1, p2, nx) - dashImpulse(p2, p1, -nx);
    applyRivalBounce(p1, p2, nx, ny, attackImpulse);
    p1.squash(0.75, 1.25);
    p2.squash(0.75, 1.25);

    // Quem segura o direcional para longe do rival ganha impulso extra: a parte horizontal da batida
    // alimenta a cadeia X e a parte vertical a cadeia Y, sem misturar os eixos
    [[p1, -nx, -ny], [p2, nx, ny]].forEach(([p, bx, by]) => {
        if (!p.heldToward(bx, by)) return;
        const r = BOUNCE.rival;
        if (Math.abs(bx) > r.axisThreshold) {
            p.chainUp('x');
            p.vx += bx * (r.pumpBase + p.chain.x * r.pumpPerChain);
        }
        if (Math.abs(by) > r.axisThreshold) {
            p.chainUp('y');
            p.vy += by * (r.pumpBase + p.chain.y * r.pumpPerChain);
        }
    });

    // Plataforma reduz levemente no choque
    shrinkPlatform(COMBAT.platformShrinkOnHit);
    createParticles((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, '#ffd32a', anyDash ? 22 : 12);
    addBurst((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, anyDash ? 52 : 36, anyDash ? '#ffffff' : '#ffd32a');
    comicImpact((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, anyDash ? 'dash' : 'hit', anyDash ? 80 : 56);

    // Medidor de especial: quem bate com dash e quem apanha enchem; DASH TURBO que acerta tira um coração
    const G = COMBAT.special.gain;
    [[p1, p2], [p2, p1]].forEach(([a, v]) => {
        if (a.turbo && a.isDashing && a.facing * (v.x - a.x) > 0) return turboHit(a, v);
        if (a.isDashing && a.facing * (v.x - a.x) > 0) { a.addSpecial(G.dashHit); v.addSpecial(G.takeHit); }
    });
    if (!anyDash) { p1.addSpecial(G.hit); p2.addSpecial(G.hit); }
}

// DASH TURBO acertou: tira um coração (K.O. se era o último), atordoa e arremessa. Quem está atordoado não toma dano.
export function turboHit(attacker, victim) {
    const T = COMBAT.special.turbo;
    attacker.turbo = false;
    attacker.dashTimer = 0;
    state.hitStop = T.hitStopFrames;
    state.cameraShake = Math.max(state.cameraShake, T.shake);
    playSound('smash');
    comicImpact(victim.x, victim.y, 'turbo', 130);
    addRing(victim.x, victim.y + victim.radius, 130, '#ff8a00');
    addPopup(victim.x, victim.y - victim.radius - 40, TEXTS.heartLost, victim.color);
    if (victim.stunTimer > 0) return;
    victim.hearts = Math.max(0, victim.hearts - 1);
    updateHeartsHUD();
    victim.stunTimer = T.stunFrames;
    victim.squash(1.6, 0.55);
    victim.addSpecial(COMBAT.special.gain.takeSmash);
    shrinkPlatform(COMBAT.smash.platformShrink);
    if (victim.hearts === 0) return triggerKO(victim);
    showBanner(TEXTS.turbo, attacker.color, 800);
}

export function isHeadStomp(a, v) {
    // Vale pisar no rival atordoado (lança outro SKY DROP), mas não no quique automático logo depois do smash:
    // tem que pousar e pular de novo, senão todo smash viraria SKY DROP sozinho
    return !a.isPounding && !a.smashBounce && a.vy > BOUNCE.head.minFallSpeed && a.y < v.y - v.radius * BOUNCE.head.aboveRatio;
}

// Pisar na cabeça: o rival leva parte da queda (momento) e quem pisou começa o SKY DROP
export function doHeadStomp(a, v) {
    v.vy = Math.max(v.vy, 0) + a.vy * BOUNCE.head.victimMomentum * (a.effMass / v.effMass);
    v.squash(1.4, 0.65);
    a.startSkyDrop();
    a.addSpecial(COMBAT.special.gain.stomp);
    state.hitStop = COMBAT.hitStopFrames.headBounce;
    state.cameraShake = Math.max(state.cameraShake, COMBAT.shake.headBounce);
    playSound('hit');
    addPopup(a.x, a.y - a.radius - 14, TEXTS.skyDrop, a.color);
    createParticles((a.x + v.x) / 2, v.y - v.radius, '#ffffff', 10);
    addBurst((a.x + v.x) / 2, v.y - v.radius, 34, '#ffffff');
    comicImpact((a.x + v.x) / 2, v.y - v.radius, 'stomp', 60);
}

// SMASH: cair do alto no rival amassa ele e tira um coração (sem corações é K.O.)
export function doSmash(attacker, victim) {
    attacker.isPounding = false;
    attacker.smashBounce = true;
    attacker.vy = -COMBAT.smash.attackerBounce;
    attacker.vx *= 0.5;
    attacker.squash(1.4, 0.7);
    state.hitStop = COMBAT.hitStopFrames.smash;
    state.cameraShake = COMBAT.shake.smash;
    playSound('smash');

    victim.stunTimer = COMBAT.smash.stunFrames;
    victim.isPounding = false;
    victim.dashTimer = 0;
    victim.vx += (victim.x - attacker.x) * COMBAT.smash.pushX;
    victim.vy = victim.isGrounded ? COMBAT.smash.victimFallOnGround : COMBAT.smash.victimFallInAir; // no ar vira meteoro pra baixo

    victim.hearts = Math.max(0, victim.hearts - 1);
    updateHeartsHUD();
    attacker.addSpecial(COMBAT.special.gain.smash);
    victim.addSpecial(COMBAT.special.gain.takeSmash);

    addPopup(victim.x, victim.y - victim.radius - 12, TEXTS.splat, '#ffffff');
    addPopup(victim.x, victim.y - victim.radius - 40, TEXTS.heartLost, victim.color);
    createParticles(victim.x, victim.y, victim.color, 24, 14);
    addBurst(victim.x, victim.y, 78, '#ffffff');
    comicImpact(victim.x, victim.y, 'smash', 120);
    addRing(victim.x, victim.y + victim.radius, 110, victim.color);
    createDust(victim.x, victim.y + victim.radius, 8, 6);
    shrinkPlatform(COMBAT.smash.platformShrink);
    if (victim.hearts === 0) return triggerKO(victim);
    showBanner(TEXTS.smash, attacker.color, 800);
    if (attacker.controls.isBot && Math.random() < COMBAT.smash.botTauntChance) attacker.wantTaunt = true;
}
