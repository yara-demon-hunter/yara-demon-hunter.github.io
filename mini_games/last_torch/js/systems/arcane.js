// --- RAIO ARCANO E ESCUDO DE RUNAS (Gudran) ---
// 27/11/2026: o ataque básico do Gudran é uma cajadada (o golpe normal, físico). O CLIQUE é o arremesso de adaga do jogo com uma bola de energia azul (burstArcaneKnife aqui;
// o arremesso em js/systems/knives.js, com o gesto staffCast do boneco). O código do raio antigo (fireArcaneBolt, state.arcaneBolts) fica para quem tiver basicAttack: 'arcane'.
// O ESCUDO DE RUNAS deixou de ser o clique: é um poder da árvore (Curse Path, só dele) que dispara sozinho quando monstros chegam perto (updateRuneShield).
// Com a Runa Soberana (Curse Path) o raio EXPLODE em luz azul no primeiro monstro que acerta (não atravessa) e a explosão fere os outros em volta. Números: ARCANE_BOLT e SOVEREIGN_RUNE
// em data_model/passives.js. Desenho: js/render/arcane.js.
import { ARCANE_BOLT as B, SOVEREIGN_RUNE as RUNE } from '../../data_model/passives.js';
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
    const pierce = passives.sovereignRune.lvl > 0 ? RUNE.pierce : 0;       // 0: com a Runa o raio explode no primeiro, não atravessa
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
        pierces: pierce,
        struck: null
    });
    createExplosion(player.x + Math.cos(angle) * B.spawnForward, player.y + Math.sin(angle) * B.spawnForward - B.flightHeight, '#93c5fd', big ? 6 : 3);     // clarão na esfera do cajado
    audio.playSwordSlash?.(big ? 3 : 1);
}

// O raio acaba (batendo, ou chegando ao fim do alcance): com a Runa Soberana, estoura em área. `primary` é o monstro que o raio já acertou em cheio
// (ele não leva a explosão de novo: a explosão é para os outros em volta)
function endBolt(b, primary = null) {
    if (passives.sovereignRune.lvl <= 0) return;
    const radius = RUNE.burstRadius * (b.big ? 1.25 : 1);
    for (const e of state.enemies) {
        if (e === primary || e.hp <= 0 || Math.hypot(e.x - b.x, e.y - b.y) > radius + e.radius) continue;
        const a = Math.atan2(e.y - b.y, e.x - b.x);
        dealDamage(e, b.damage * RUNE.burstDamage, { style: 'spell', kbX: Math.cos(a) * 90, kbY: Math.sin(a) * 90 });
    }
    addShockwave(b.x, b.y, { radius, color: '#60a5fa', width: 5, seconds: 0.35 });
    addShockwave(b.x, b.y, { radius: radius * 0.55, color: '#dbeafe', width: 3, seconds: 0.22 });
    createExplosion(b.x, b.y, '#93c5fd', b.big ? 16 : 11);
    createExplosion(b.x, b.y, '#dbeafe', 5);
    shakeScreen(b.big ? 4 : 2);
    audio.playBlast?.();
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
                endBolt(b, hit);
                arcaneBolts.splice(i, 1);
            }
            continue;
        }
        const outside = b.x < 0 || b.x > state.width || b.y < 0 || b.y > state.height;
        if (outside || b.travelled >= b.range) {
            if (!outside) endBolt(b);
            arcaneBolts.splice(i, 1);
        }
    }
}

// --- BOLA DE ENERGIA (o clique do Gudran) ---
// O clique é o arremesso de adaga do jogo (js/systems/knives.js): a bola de energia azul voa com os números da adaga (alcance, velocidade, recarga, dano de magia). Com a Runa
// Soberana ela EXPLODE no primeiro monstro (ou no fim do alcance) e fere os outros em volta: é esta função, chamada por knives.js.
export function burstArcaneKnife(k, primary = null) {
    if (passives.sovereignRune.lvl <= 0 || k.style !== 'arcane') return;
    for (const e of state.enemies) {
        if (e === primary || e.hp <= 0 || Math.hypot(e.x - k.x, e.y - k.y) > RUNE.burstRadius + e.radius) continue;
        const a = Math.atan2(e.y - k.y, e.x - k.x);
        dealDamage(e, k.damage * RUNE.burstDamage, { style: 'spell', kbX: Math.cos(a) * 90, kbY: Math.sin(a) * 90 });
    }
    addShockwave(k.x, k.y, { radius: RUNE.burstRadius, color: '#60a5fa', width: 5, seconds: 0.35 });
    addShockwave(k.x, k.y, { radius: RUNE.burstRadius * 0.55, color: '#dbeafe', width: 3, seconds: 0.22 });
    createExplosion(k.x, k.y, '#93c5fd', 11);
    createExplosion(k.x, k.y, '#dbeafe', 5);
    shakeScreen(2);
    audio.playBlast?.();
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
    for (let k = 0; k < S.runes; k++) {
        const a = R.angle + (k / S.runes) * Math.PI * 2;
        const rx = player.x + Math.cos(a) * S.radius;
        const ry = player.y + Math.sin(a) * S.radius;
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
