import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, player, powers, state } from '../core/state.js';
import { followRate, wander } from './companions.js';
import { blast, dealDamage } from './damage.js';
import { addShockwave, createExplosion, shakeScreen } from './effects.js';
import { startCast } from './moves.js';
import { nearestEnemy, ready } from './powers.js';
import { getSpellCooldown, getSpellDamage } from './stats.js';

// --- SKILLS DA MALDIÇÃO ---
// O feiticeiro fica longe e deixa a horda morrer em cadeia: bolas à distância, pragas que pulam, fendas no chão.
// Desenho em js/render/skills.js.

// --- LAUGHING SKULL ---
// A cada recarga, com monstros perto, solta `count` caveiras. Cada uma persegue o monstro de MAIS VIDA que nenhuma outra caveira já caça e explode nele (ou em qualquer
// monstro que ela toque no caminho). Se o alvo morrer, procura outro; sem ninguém ao alcance, voa reta e explode no fim da vida. Números: POWER_MODELS.laughingSkull. Desenho: renderLaughingSkulls.
const strongest = (x, y, range, taken) => {
    let best = null;
    for (const e of state.enemies) {
        if (e.hp <= 0 || e.untargetable || e.emerge || taken?.has(e) || Math.hypot(e.x - x, e.y - y) > range) continue;
        if (!best || e.hp > best.hp) best = e;
    }
    return best;
};
function explodeSkull(s) {
    blast(s.x, s.y, s.burst, s.damage, POWER_MODELS.laughingSkull.base.knockback, '#a78bfa', 'spell');
    createExplosion(s.x, s.y, '#e8e0c8', 10);
    addShockwave(s.x, s.y, { radius: s.burst * 0.7, color: '#7c3aed', width: 3, seconds: 0.25 });
}
function updateLaughingSkull(dt) {
    const M = POWER_MODELS.laughingSkull.base;
    const skulls = state.skulls;
    for (let i = skulls.length - 1; i >= 0; i--) {
        const s = skulls[i];
        s.age += dt;
        if (!s.target || s.target.hp <= 0 || !state.enemies.includes(s.target)) s.target = strongest(s.x, s.y, M.triggerRange, new Set(skulls.filter(o => o !== s).map(o => o.target)));
        if (s.target) {
            let diff = Math.atan2(s.target.y - s.y, s.target.x - s.x) - s.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            s.angle += Math.max(-1, Math.min(1, diff)) * Math.min(Math.abs(diff), M.turnRate * dt);
        }
        s.x += Math.cos(s.angle) * M.speed * dt;
        s.y += Math.sin(s.angle) * M.speed * dt;
        const touched = state.enemies.some(e => e.hp > 0 && !e.untargetable && !e.emerge && Math.hypot(e.x - s.x, e.y - s.y) < e.radius + M.hitRadius);
        if (touched || s.age >= M.life || state.phase !== 'HUNT') {
            skulls.splice(i, 1);
            if (state.phase === 'HUNT') explodeSkull(s);
        }
    }
    const level = getPowerLevel(powers.laughingSkull);
    if (!level || state.phase !== 'HUNT' || player.hp <= 0 || !ready('laughingSkull', dt, getSpellCooldown(level.cooldown))) return;
    if (!strongest(player.x, player.y, M.triggerRange)) { state.powerTimers.laughingSkull = 0.4; return; }       // ninguém perto: não gasta a recarga
    const taken = new Set();
    for (let k = 0; k < level.count; k++) {
        const target = strongest(player.x, player.y, M.triggerRange, taken) ?? strongest(player.x, player.y, M.triggerRange);
        if (!target) break;
        taken.add(target);
        const angle = Math.atan2(target.y - player.y, target.x - player.x) + (k - (level.count - 1) / 2) * 0.7;
        state.skulls.push({ x: player.x + Math.cos(angle) * 20, y: player.y - 24 + Math.sin(angle) * 10, angle, target, age: 0, damage: getSpellDamage() * level.damage, burst: level.radius });
    }
    startCast();
    audio.playSummon?.();
}
export { updateLaughingSkull };

// --- GRAVE WISP ---
// Caveira em chamas que flutua perto do ombro e atira no que está longe
function updateGraveWisp(dt) {
    const level = getPowerLevel(powers.graveWisp);
    if (!level) return;
    const wisp = state.wisp;
    const t = state.runTime;
    const drift = wander(t, 1);
    const homeX = player.x - 26 + drift.x;
    const homeY = player.y - 14 + drift.y;
    if (!wisp.placed) {
        wisp.x = homeX;
        wisp.y = homeY;
        wisp.placed = true;
    }
    const pull = Math.min(1, dt * followRate(7));
    wisp.x += (homeX - wisp.x) * pull;
    wisp.y += (homeY - wisp.y) * pull;

    if (wisp.flash > 0) wisp.flash -= dt;

    const M = POWER_MODELS.graveWisp;
    if (!ready('graveWisp', dt, getSpellCooldown(level.cooldown))) return;
    const skip = new Set();
    for (let i = 0; i < level.count; i++) {
        const target = nearestEnemy(player.x, player.y, M.range, skip);
        if (!target) break;
        skip.add(target);
        const a = Math.atan2(target.y - wisp.y, target.x - wisp.x);
        state.bolts.push({
            x: wisp.x, y: wisp.y,
            vx: Math.cos(a) * M.speed, vy: Math.sin(a) * M.speed,
            speed: M.speed, turnRate: M.turnRate,
            target, soul: true,
            damage: getSpellDamage() * level.damage,
            life: 1.8
        });
    }
    if (skip.size > 0) {
        wisp.flash = 0.16;
        audio.playBolt();
    }
}

// --- CREEPING HEX ---
function hexEnemy(e, level) {
    e.hexTimer = level.seconds;
    e.hexDps = level.dps;
}

function updateCreepingHex(dt) {
    const M = POWER_MODELS.creepingHex;
    const tick = ready('hexTick', dt, M.tickSeconds);
    const base = tick ? getSpellDamage() * M.tickSeconds : 0;
    for (const e of state.enemies) {
        if (!(e.hexTimer > 0)) continue;
        e.hexTimer -= dt;
        if (tick) dealDamage(e, base * e.hexDps, { noCrit: true, quiet: true });
    }
    const level = getPowerLevel(powers.creepingHex);
    if (!level || !ready('creepingHex', dt, getSpellCooldown(level.cooldown))) return;
    const clean = state.enemies.filter(e => e.hp > 0 && !(e.hexTimer > 0));
    let target = null;
    let best = M.range;
    for (const e of clean) {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < best) {
            best = d;
            target = e;
        }
    }
    if (!target) return;
    hexEnemy(target, level);
    state.lightning.push({ points: [{ x: player.x, y: player.y - 30 }, { x: target.x, y: target.y }], life: 0.22, maxLife: 0.22, hex: true });
    createExplosion(target.x, target.y, '#a855f7', 6);
    startCast();
    audio.playHex();
}

// Monstro amaldiçoado morreu: a maldição pula para os vizinhos
export function spreadHex(e) {
    const level = getPowerLevel(powers.creepingHex);
    if (!level || !(e.hexTimer > 0)) return;
    const M = POWER_MODELS.creepingHex;
    const skip = new Set([e]);
    for (let i = 0; i < level.spread; i++) {
        let next = null;
        let best = M.spreadRange;
        for (const o of state.enemies) {
            if (skip.has(o) || o.hp <= 0 || o.hexTimer > 0) continue;
            const d = Math.hypot(o.x - e.x, o.y - e.y);
            if (d < best) {
                best = d;
                next = o;
            }
        }
        if (!next) break;
        skip.add(next);
        hexEnemy(next, level);
        state.lightning.push({ points: [{ x: e.x, y: e.y }, { x: next.x, y: next.y }], life: 0.26, maxLife: 0.26, hex: true });
    }
    if (skip.size > 1) audio.playHex();
}

// --- VOID RIFT ---
// Onde há mais monstros juntos (a horda tem poucas dezenas: comparar pares é barato, e só roda na recarga)
function densestSpot(radius) {
    let spot = null;
    let most = 0;
    for (const a of state.enemies) {
        let count = 0;
        for (const b of state.enemies) {
            if (Math.hypot(a.x - b.x, a.y - b.y) < radius) count++;
        }
        if (count > most) {
            most = count;
            spot = a;
        }
    }
    return spot;
}

function openRift(x, y, level, damage, seconds, last) {
    state.rifts.push({
        x, y, age: 0, seconds, last,
        radius: level.radius, pull: level.pull, damage,
        evolved: powers.voidRift.evolved
    });
    audio.playRift();
}

function updateVoidRift(dt) {
    const level = getPowerLevel(powers.voidRift);
    if (level && ready('voidRift', dt, getSpellCooldown(level.cooldown))) {
        const spot = densestSpot(level.radius * 1.2);
        if (spot) {
            openRift(spot.x, spot.y, level, level.damage, level.seconds, !powers.voidRift.evolved);
            startCast();
        }
    }

    const M = POWER_MODELS.voidRift;
    const { rifts } = state;
    for (let i = rifts.length - 1; i >= 0; i--) {
        const r = rifts[i];
        r.age += dt;
        const reach = r.radius * M.reach;
        const force = r.pull * dt;
        for (const e of state.enemies) {
            if (e.isBoss) continue;
            const dx = r.x - e.x;
            const dy = r.y - e.y;
            const d = Math.hypot(dx, dy);
            if (d > reach || d < 6) continue;
            e.x += (dx / d) * force;
            e.y += (dy / d) * force;
        }
        if (r.age < r.seconds) continue;

        rifts.splice(i, 1);
        state.blastBudget++;
        blast(r.x, r.y, r.radius, getSpellDamage() * r.damage, M.knockback, '#a855f7', 'spell');
        addShockwave(r.x, r.y, { radius: r.radius * 1.3, color: '#7c3aed', width: 10, seconds: 0.4 });
        createExplosion(r.x, r.y, '#c084fc', 16);
        shakeScreen(8);
        audio.playRiftCollapse();
        if (!r.last) {
            const S = EVOLUTIONS.voidRift.secondRift;
            openRift(r.x, r.y, r, r.damage * S.damage, S.seconds, true);
        }
    }
}

export function updateCurseSkills(dt) {
    updateGraveWisp(dt);
    updateCreepingHex(dt);
    updateVoidRift(dt);
}

export function clearCurseSkills() {
    state.rifts.length = 0;
    state.wisp.placed = false;
}
