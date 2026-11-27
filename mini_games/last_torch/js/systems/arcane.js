// --- RAIO ARCANO E ESCUDO DE RUNAS ---
// 27/11/2026: o ataque básico do Gudran é uma cajadada (o golpe normal, físico). O CLIQUE dele é o arremesso de adaga do jogo com uma bola de energia azul (js/systems/knives.js, com o gesto
// staffCast do boneco). O código do raio antigo (fireArcaneBolt, state.arcaneBolts) fica para quem tiver basicAttack: 'arcane'.
// O ESCUDO DE RUNAS é um poder da árvore (Curse Path, de qualquer herói) que dispara sozinho quando monstros chegam perto (updateRuneShield). Evoluído (SOVEREIGN RUNE) as runas também
// LANÇAM bolas de energia, como as do clique do Gudran, para fora em várias direções. Números: POWER_MODELS.runeShield e EVOLUTIONS.runeShield em data_model/powers.js. Desenho: js/render/arcane.js.
import { ARCANE_BOLT as B } from '../../data_model/passives.js';
import { POWER_BOOST } from '../../data_model/powers.js';
import { audio, passives, player, state } from '../core/state.js';
import { ready } from './powers.js';
import { dealDamage } from './damage.js';
import { addShockwave, createExplosion, shakeScreen } from './effects.js';
import { chargeUlt } from './combat.js';
import { characterStat, getAtkRadius, getFuryChargePerHit, getRuneShield, getSpellCooldown, getSpellDamage } from './stats.js';
import { mod } from './modifiers.js';
import { startCast, startMove } from './moves.js';
import { beamActive } from './fury.js';

export function resetArcane() {
    state.arcaneBolts.length = 0;
    Object.assign(state.runeShield, { left: 0, angle: 0, age: 0 });
}

// Solta um raio no alvo. comboStep: 1, 2 ou 3 (o 3º é o forte)
export function fireArcaneBolt(target, comboStep) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    player.angle = angle;
    const big = comboStep === 3;
    state.arcaneBolts.push({
        x: player.x + Math.cos(angle) * B.spawnForward,
        y: player.y + Math.sin(angle) * B.spawnForward,
        vx: Math.cos(angle) * B.speed,
        vy: Math.sin(angle) * B.speed,
        angle, big,
        radius: big ? B.comboRadius : B.radius,
        damage: getSpellDamage() * B.damageRatio * (big ? B.comboRatio : 1),
        knockback: B.knockback * (big ? characterStat('comboKnockback') : 1),
        range: B.range,                       // voa até B.range: erra e segue se o monstro se mexer
        travelled: 0,
        pierces: 0,
        struck: null
    });
    createExplosion(player.x + Math.cos(angle) * B.spawnForward, player.y + Math.sin(angle) * B.spawnForward - B.flightHeight, '#93c5fd', big ? 6 : 3);     // clarão na esfera do cajado
    audio.playSwordSlash?.(big ? 3 : 1);
}

export function updateArcane(dt) {
    updateRuneShield(dt);
    const { arcaneBolts, enemies } = state;
    for (let i = arcaneBolts.length - 1; i >= 0; i--) {
        const b = arcaneBolts[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.travelled += B.speed * dt;

        const hit = enemies.find(e => e.hp > 0 && !b.struck?.has(e) && Math.hypot(e.x - b.x, e.y - b.y) < e.radius + b.radius);
        if (hit) {
            dealDamage(hit, b.damage, { style: 'spell', kbX: Math.cos(b.angle) * b.knockback, kbY: Math.sin(b.angle) * b.knockback });
            chargeUlt(getFuryChargePerHit());
            createExplosion(b.x, b.y, '#93c5fd', b.big ? 8 : 5);
            audio.playHit?.(1);
            if (b.pierces > 0) {
                b.pierces--;
                (b.struck ??= new Set()).add(hit);
            } else {
                arcaneBolts.splice(i, 1);
            }
            continue;
        }
        const outside = b.x < 0 || b.x > state.width || b.y < 0 || b.y > state.height;
        if (outside || b.travelled >= b.range) {
            arcaneBolts.splice(i, 1);
        }
    }
}

// --- ESCUDO DE RUNAS (poder da árvore, Curse Path, só do Gudran) ---
// Quando monstros chegam perto, runas azuis giram em volta dele por `seconds`. Um monstro que encosta numa runa leva dano de magia e é jogado para fora; o mesmo
// monstro só leva outro toque depois de hitSeconds. A recarga só corre depois que as runas somem. Números: POWER_MODELS.runeShield em data_model/powers.js.
function updateRuneShield(dt) {
    const R = state.runeShield;
    const S = getRuneShield();
    if (!S) { R.left = 0; return; }
    if (R.left <= 0) {
        if (state.phase !== 'HUNT' || beamActive() || player.hp <= 0 || !ready('runeShield', dt, getSpellCooldown(S.cooldown))) return;
        const near = state.enemies.some(e => e.hp > 0 && !e.emerge && Math.hypot(e.x - player.x, e.y - player.y) <= S.radius + 120 + e.radius);
        if (!near) { state.powerTimers.runeShield = 0.3; return; }       // ninguém perto: não gasta a recarga
        R.left = S.seconds;
        R.age = 0;
        R.boltTimer = undefined;
        startCast();
        addShockwave(player.x, player.y, { radius: S.radius, color: '#60a5fa', width: 6, seconds: 0.4 });
        createExplosion(player.x, player.y, '#93c5fd', 10);
        audio.playReflect?.();
    } else {
        state.powerTimers.runeShield = getSpellCooldown(S.cooldown);     // a recarga só começa quando as runas somem
    }
    if (R.left <= 0) return;
    R.left -= dt;
    R.age += dt;
    R.angle += S.spin * dt;
    if (state.phase !== 'HUNT') return;
    const damage = getSpellDamage() * S.damage;
    // Sovereign Rune (a evolução): a cada boltEvery s, CADA runa lança uma bola de energia para fora (a direção dela a partir do herói), a mesma bola do clique do Gudran
    const shoot = S.boltEvery ? (R.boltTimer = (R.boltTimer ?? S.boltEvery * 0.5) - dt) <= 0 : false;
    if (shoot) R.boltTimer += S.boltEvery;
    for (let k = 0; k < S.runes; k++) {
        const a = R.angle + (k / S.runes) * Math.PI * 2;
        const rx = player.x + Math.cos(a) * S.radius;
        const ry = player.y + Math.sin(a) * S.radius;
        if (shoot) {
            const speed = S.boltSpeed;
            state.knives.push({
                x: rx, y: ry, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, angle: a, speed, maxRange: S.boltRange,
                damage: getSpellDamage() * S.boltDamage * (1 + (POWER_BOOST.runeShield ?? 0)), knockback: 60,
                travelled: 0, bounces: 0, pierces: 0, scale: 1, fire: false, magic: true, style: 'arcane', struck: null
            });
        }
        for (const e of state.enemies) {
            if (e.hp <= 0 || Math.hypot(e.x - rx, e.y - ry) > e.radius + S.runeRadius) continue;
            if (state.runTime - (e.runeHitAt ?? -99) < S.hitSeconds) continue;
            e.runeHitAt = state.runTime;
            const out = Math.atan2(e.y - player.y, e.x - player.x);
            dealDamage(e, damage, { style: 'spell', kbX: Math.cos(out) * S.knockback, kbY: Math.sin(out) * S.knockback });
            createExplosion(rx, ry, '#93c5fd', 4);
        }
    }
}
