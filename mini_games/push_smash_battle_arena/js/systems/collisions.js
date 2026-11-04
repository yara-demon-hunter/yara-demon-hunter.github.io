import { BOUNCE } from '../../data_model/bounce.js';
import { COMBAT } from '../../data_model/combat.js';
import { BOMB } from '../../data_model/match.js';
import { PHYSICS } from '../../data_model/physics.js';
import { TEXTS } from '../../data_model/texts.js';
import { playSound } from '../audio/sound.js';
import { shrinkPlatform } from '../core/arena.js';
import { state } from '../core/state.js';
import { otherPlayer, players } from '../entities/player.js';
import { addBurst, addPopup, addRing, createDust, createParticles, showBanner } from './effects.js';
import { spawnMassBlobs } from './mass.js';

export function impactForce(attacker, victim) {
    let f = (attacker.isDashing ? COMBAT.dashHitForce : COMBAT.hitForce) * (attacker.knockTimer > 0 ? COMBAT.knockbackBuff : 1) *
        Math.sqrt(attacker.effMass / victim.effMass);
    if (attacker.isDashing) f *= attacker.character.dash.hitForceMultiplier ?? 1;
    if (victim.stunTimer > 0) f *= COMBAT.stunnedVictimMultiplier; // amassado voa mais longe
    return Math.min(f, COMBAT.maxForce);
}

export function isSmash(attacker, victim) {
    return attacker.isPounding && attacker.poundWindup === 0 && attacker.vy > 0 &&
        attacker.y < victim.y - victim.radius * COMBAT.smash.aboveRatio && victim.stunTimer === 0;
}

export function resolvePlayerCollisions() {
    const p1 = players[0];
    const p2 = players[1];
    if (!p1.isAlive || !p2.isAlive) return;

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

    if (state.hitCooldown > 0) return;
    state.hitCooldown = COMBAT.hitCooldownFrames;

    // Passar a bomba quente
    if (state.bombHolder && state.bombPassCd === 0) {
        state.bombHolder = otherPlayer(state.bombHolder);
        state.bombPassCd = BOMB.passCooldownFrames;
        addPopup(state.bombHolder.x, state.bombHolder.y - state.bombHolder.radius - 30, TEXTS.passed, '#ff7f50');
        playSound('beep');
    }

    if (isSmash(p1, p2)) return doSmash(p1, p2);
    if (isSmash(p2, p1)) return doSmash(p2, p1);

    // Pisou na cabeça: quem caiu quica pra cima (mais alto segurando pra cima)
    if (isHeadStomp(p1, p2)) return doHeadBounce(p1, p2);
    if (isHeadStomp(p2, p1)) return doHeadBounce(p2, p1);

    const anyDash = p1.isDashing || p2.isDashing;
    playSound('hit');
    state.cameraShake = Math.max(state.cameraShake, anyDash ? COMBAT.shake.dash : COMBAT.shake.normal);
    state.hitStop = anyDash ? COMBAT.hitStopFrames.dash : COMBAT.hitStopFrames.normal;

    // Quique elástico: só a componente da velocidade ao longo da linha entre as bolas é trocada
    const approach = (p1.vx - p2.vx) * nx + (p1.vy - p2.vy) * ny;
    if (approach > 0) {
        const j = (1 + BOUNCE.restitution.rival) * approach / (1 / p1.effMass + 1 / p2.effMass);
        p1.vx -= j / p1.effMass * nx;
        p1.vy -= j / p1.effMass * ny;
        p2.vx += j / p2.effMass * nx;
        p2.vy += j / p2.effMass * ny;
    }

    // Chute extra de quem ataca (dash, item KNOCKBACK, massa), também ao longo da linha entre as bolas
    let forceP1 = impactForce(p2, p1);
    let forceP2 = impactForce(p1, p2);
    if (p1.hasShield) { forceP1 = COMBAT.shieldedForce; p1.hasShield = false; }
    else if (p1.isDashing) forceP1 *= p1.character.dash.incomingForceMultiplier ?? 1;
    if (p2.hasShield) { forceP2 = COMBAT.shieldedForce; p2.hasShield = false; }
    else if (p2.isDashing) forceP2 *= p2.character.dash.incomingForceMultiplier ?? 1;
    p1.vx -= nx * forceP1;
    p1.vy -= ny * forceP1;
    p2.vx += nx * forceP2;
    p2.vy += ny * forceP2;
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
}

export function isHeadStomp(a, v) {
    return !a.isPounding && a.vy > BOUNCE.head.minFallSpeed && a.y < v.y - v.radius * BOUNCE.head.aboveRatio;
}

// Pisar na cabeça: só o eixo vertical muda. O rival leva parte da queda (momento) e quem pisou quica
export function doHeadBounce(a, v) {
    const h = BOUNCE.head;
    let out = a.vy * BOUNCE.restitution.head;
    if (a.upHeld) {
        a.chainUp('y');
        out += h.pumpHeld + a.chain.y * h.pumpPerChain;
    } else {
        out += h.pumpBase;
    }
    v.vy = Math.max(v.vy, 0) + a.vy * h.victimMomentum * (a.effMass / v.effMass);
    a.vy = -Math.min(out, h.maxSpeed);
    a.squash(0.7, 1.4);
    v.squash(1.4, 0.65);
    state.hitStop = COMBAT.hitStopFrames.headBounce;
    state.cameraShake = Math.max(state.cameraShake, COMBAT.shake.headBounce);
    playSound('hit');
    addPopup(a.x, a.y - a.radius - 14, a.upHeld && a.chain.y >= 2 ? `${TEXTS.bop} x${a.chain.y}` : TEXTS.bop, a.color);
    createParticles((a.x + v.x) / 2, v.y - v.radius, '#ffffff', 10);
    addBurst((a.x + v.x) / 2, v.y - v.radius, 34, '#ffffff');
}

// SMASH: cair do alto no rival amassa ele e arranca massa
export function doSmash(attacker, victim) {
    attacker.isPounding = false;
    attacker.vy = -COMBAT.smash.attackerBounce;
    attacker.vx *= 0.5;
    attacker.squash(1.4, 0.7);
    state.hitStop = COMBAT.hitStopFrames.smash;
    state.cameraShake = COMBAT.shake.smash;
    playSound('smash');

    if (victim.hasShield) {
        victim.hasShield = false;
        addPopup(victim.x, victim.y - victim.radius - 12, TEXTS.blocked, '#26de81');
        return;
    }

    victim.stunTimer = COMBAT.smash.stunFrames;
    victim.isPounding = false;
    victim.dashTimer = 0;
    victim.vx += (victim.x - attacker.x) * COMBAT.smash.pushX;
    victim.vy = victim.isGrounded ? COMBAT.smash.victimFallOnGround : COMBAT.smash.victimFallInAir; // no ar vira meteoro pra baixo

    const loss = Math.min(COMBAT.smash.massLoss, victim.mass - PHYSICS.minMass);
    victim.addMass(-loss);
    if (loss > 0.01) spawnMassBlobs(victim, loss);

    showBanner(TEXTS.smash, attacker.color, 800);
    addPopup(victim.x, victim.y - victim.radius - 12, TEXTS.splat, '#ffffff');
    createParticles(victim.x, victim.y, victim.color, 24, 14);
    addBurst(victim.x, victim.y, 78, '#ffffff');
    addRing(victim.x, victim.y + victim.radius, 110, victim.color);
    createDust(victim.x, victim.y + victim.radius, 8, 6);
    shrinkPlatform(COMBAT.smash.platformShrink);
    if (attacker.controls.isBot && Math.random() < COMBAT.smash.botTauntChance) attacker.wantTaunt = true;
}

