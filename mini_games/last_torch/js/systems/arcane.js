// --- ATAQUE ARCANO (Gudran) ---
// O herói sem lâmina: no lugar do golpe de espada, ele ergue o cajado e solta um raio de energia azul no monstro mais perto
// (js/systems/combat.js chama fireArcaneBolt). Dano de MAGIA (número azul). Cada 3º raio do combo é maior e empurra mais.
// Com a Runa Soberana (Curse Path) o raio fura monstros e estoura em luz azul onde acaba. Números: ARCANE_BOLT e SOVEREIGN_RUNE
// em data_model/passives.js. Desenho: js/render/arcane.js.
import { ARCANE_BOLT as B, SOVEREIGN_RUNE as RUNE } from '../../data_model/passives.js';
import { audio, passives, player, state } from '../core/state.js';
import { dealDamage } from './damage.js';
import { addShockwave, createExplosion } from './effects.js';
import { chargeUlt } from './combat.js';
import { characterStat, getAtkRadius, getFuryChargePerHit, getRuneShield, getSpellDamage } from './stats.js';
import { mod } from './modifiers.js';
import { startCast } from './moves.js';
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
    const pierce = passives.sovereignRune.lvl > 0 ? RUNE.pierce : 0;
    state.arcaneBolts.push({
        x: player.x + Math.cos(angle) * B.spawnForward,
        y: player.y + Math.sin(angle) * B.spawnForward,
        vx: Math.cos(angle) * B.speed,
        vy: Math.sin(angle) * B.speed,
        angle, big,
        radius: big ? B.comboRadius : B.radius,
        damage: getSpellDamage() * B.damageRatio * (big ? B.comboRatio : 1),
        knockback: B.knockback * (big ? characterStat('comboKnockback') : 1),
        range: getAtkRadius() + 70,           // um pouco além do alvo: o raio erra e segue se o monstro se mexer
        travelled: 0,
        pierces: pierce,
        struck: null
    });
    createExplosion(player.x + Math.cos(angle) * B.spawnForward, player.y + Math.sin(angle) * B.spawnForward - B.flightHeight, '#93c5fd', big ? 6 : 3);     // clarão na esfera do cajado
    audio.playSwordSlash?.(big ? 3 : 1);
}

// O raio acaba (batendo, ou chegando ao fim do alcance): com a Runa Soberana, estoura em área
function endBolt(b) {
    if (passives.sovereignRune.lvl <= 0) return;
    const radius = RUNE.burstRadius * (b.big ? 1.25 : 1);
    for (const e of state.enemies) {
        if (e.hp <= 0 || Math.hypot(e.x - b.x, e.y - b.y) > radius + e.radius) continue;
        const a = Math.atan2(e.y - b.y, e.x - b.x);
        dealDamage(e, b.damage * RUNE.burstDamage, { style: 'spell', kbX: Math.cos(a) * 90, kbY: Math.sin(a) * 90 });
    }
    addShockwave(b.x, b.y, { radius, color: '#60a5fa', width: 4, seconds: 0.3 });
    createExplosion(b.x, b.y, '#93c5fd', 8);
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
                endBolt(b);
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

// --- ESCUDO DE RUNAS (o clique do Gudran, no lugar da adaga) ---
// Runas azuis giram em volta dele por `seconds`. Um monstro que encosta numa runa leva dano de magia e é jogado para fora; o mesmo
// monstro só leva outro toque depois de hitSeconds. Usa o mesmo relógio de recarga das habilidades do botão (state.quake.timer),
// como o Axe Quake e o Root Snare, e não sai durante o raio da Fúria. Números: abilities.runeShield no data_model/characters/gudran.js.
function updateRuneShield(dt) {
    const R = state.runeShield;
    if (mod('runeShield') <= 0) return;
    const S = getRuneShield();
    const wants = state.knifeInput.held || state.quake.touch || state.knifeInput.stick.fire;
    if (wants && state.quake.timer <= 0 && R.left <= 0 && !beamActive() && player.dashTimer <= 0 && state.phase === 'HUNT') {
        state.quake.timer = S.cooldownSeconds;
        state.knifeInput.stick.fire = false;
        R.left = S.seconds;
        R.age = 0;
        startCast();
        addShockwave(player.x, player.y, { radius: S.radius, color: '#60a5fa', width: 6, seconds: 0.4 });
        createExplosion(player.x, player.y, '#93c5fd', 10);
        audio.playReflect?.();
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
