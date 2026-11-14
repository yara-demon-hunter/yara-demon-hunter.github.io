import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { PASSIVE_SKILL_MODELS } from '../../data_model/passives.js';
import { audio, player, powers, state } from '../core/state.js';
import { blast, dealDamage } from './damage.js';
import { addNumber, addShockwave, createExplosion, screenFlash, shakeScreen } from './effects.js';
import { mod } from './modifiers.js';
import { startCast } from './moves.js';
import { nearestEnemy, ready } from './powers.js';
import { getMaxPlayerHp, getSpellCooldown, getSpellDamage } from './stats.js';
import { feedTorch } from './torch.js';

// --- SKILLS DA LUZ ---
// O padre fica firme e deixa a luz trabalhar: chão consagrado que queima e atrasa, água benta que abençoa (o monstro
// abençoado leva mais de tudo) e a ira divina que cai em cima dos mais fortes. Desenho em js/render/light.js.
const L = state.light;
const TAU = Math.PI * 2;

const isDemon = (e) => e.elite || e.isBoss;

// Onde há mais monstros juntos dentro do alcance do herói
function densestSpot(radius, range) {
    let spot = null;
    let most = 0;
    for (const a of state.enemies) {
        if (a.hp <= 0 || Math.hypot(a.x - player.x, a.y - player.y) > range) continue;
        let count = 0;
        for (const b of state.enemies) if (b.hp > 0 && Math.hypot(a.x - b.x, a.y - b.y) < radius) count++;
        if (count > most) {
            most = count;
            spot = a;
        }
    }
    return spot;
}

// --- SACRED GROUND ---
function updateHolyGround(dt) {
    const M = POWER_MODELS.holyGround;
    const level = getPowerLevel(powers.holyGround);
    // Um círculo por vez: a recarga só corre depois que o atual acaba, e enquanto ele existe nenhum outro é criado
    if (L.grounds.length > 0) return;
    if (level && ready('holyGround', dt, getSpellCooldown(level.cooldown))) {
        const spot = densestSpot(level.radius, M.range);
        if (spot) {
            L.grounds.push({
                x: spot.x, y: spot.y, age: 0, seconds: level.seconds, radius: level.radius,
                dps: level.dps, slow: level.slow, tick: 0, evolved: powers.holyGround.evolved
            });
            addShockwave(spot.x, spot.y, { radius: level.radius, color: '#fde68a', width: 6, seconds: 0.4 });
            audio.playBlast();
            startCast();
        }
    }
    const E = EVOLUTIONS.holyGround;
    for (let i = L.grounds.length - 1; i >= 0; i--) {
        const g = L.grounds[i];
        g.age += dt;
        if (g.age >= g.seconds) {
            L.grounds.splice(i, 1);
            if (g.evolved) {
                // Fim do círculo: uma cruz de luz estoura
                state.blastBudget++;
                blast(g.x, g.y, g.radius * E.finale.radiusRatio, getSpellDamage() * E.finale.damage, 120, '#fef3c7', 'spell');
                L.bursts.push({ x: g.x, y: g.y, age: 0, seconds: 0.5, radius: g.radius * E.finale.radiusRatio, cross: true });
            }
            continue;
        }
        const reach = g.radius;
        g.tick -= dt;
        const pulse = g.tick <= 0;
        if (pulse) g.tick = M.tickSeconds;
        const base = getSpellDamage() * g.dps * M.tickSeconds;
        for (const e of state.enemies) {
            if (e.hp <= 0 || Math.hypot(e.x - g.x, e.y - g.y) > reach + e.radius) continue;
            e.slow = Math.max(e.slow ?? 0, g.slow);
            if (pulse) dealDamage(e, base * (g.evolved && isDemon(e) ? 1 + E.demonBonus : 1), { noCrit: true, quiet: true });
        }
        if (g.evolved && player.hp > 0 && Math.hypot(player.x - g.x, player.y - g.y) < reach) {
            player.hp = Math.min(getMaxPlayerHp(), player.hp + E.healPerSecond * dt);
        }
    }
}

// --- HOLY WATER ---
function throwVial(x, y, level, blessed = true) {
    const M = POWER_MODELS.holyWater;
    L.flasks.push({ x0: player.x, y0: player.y - 20, x1: x, y1: y, age: 0, seconds: M.flightSeconds, level });
}

function updateHolyWater(dt) {
    const M = POWER_MODELS.holyWater;
    const level = getPowerLevel(powers.holyWater);
    // Blessed Rain (evoluída): os frascos param, só a chuva
    if (level && !powers.holyWater.evolved && ready('holyWater', dt, getSpellCooldown(level.cooldown))) {
        const skip = new Set();
        for (let i = 0; i < level.count; i++) {
            const t = nearestEnemy(player.x, player.y, M.range, skip);
            if (!t) break;
            skip.add(t);
            // Chuva abençoada: os frascos caem espalhados em volta do alvo
            const spread = powers.holyWater.evolved && i > 0 ? 40 : 0;
            const a = Math.random() * TAU;
            throwVial(t.x + Math.cos(a) * spread, t.y + Math.sin(a) * spread, level);
        }
        if (skip.size > 0) {
            startCast();
            audio.playBolt();
        }
    }
    for (let i = L.flasks.length - 1; i >= 0; i--) {
        const f = L.flasks[i];
        f.age += dt;
        if (f.age < f.seconds) continue;
        L.flasks.splice(i, 1);
        splash(f.x1, f.y1, f.level.radius, getSpellDamage() * f.level.damage, f.level);
    }
    updateHolyRain(dt, level);
    updatePuddles(dt);
}

// O frasco (ou a gota da chuva) estoura: dano em área, abençoa quem pega e deixa o chão molhado de água benta
function splash(x, y, radius, damage, level) {
    const M = POWER_MODELS.holyWater;
    state.blastBudget++;
    blast(x, y, radius, damage, M.knockback, '#60a5fa', 'spell');
    for (const e of state.enemies) {
        if (e.hp > 0 && Math.hypot(e.x - x, e.y - y) < radius + e.radius) e.blessed = level.seconds;
    }
    // Respingos: gotas azuis saltando do estouro (js/render/light.js)
    for (let k = 0; k < 10 && L.drops.length < 60; k++) {
        const a = Math.random() * TAU;
        const v = 60 + Math.random() * 90;
        L.drops.push({ x, y, z: 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.72, vz: 120 + Math.random() * 110, age: 0, life: 0.55, size: 1.2 + Math.random() * 1.3 });
    }
    if (L.puddles.length >= M.maxPuddles) L.puddles.shift();
    L.puddles.push({ x, y, radius: radius * M.puddleRatio, age: 0, seconds: level.puddleSeconds, dps: level.puddleDps, tick: 0, seed: Math.random() * TAU, blessSeconds: level.seconds });
}

// Chão molhado: quem passa por cima queima (dano de magia) e fica abençoado
function updatePuddles(dt) {
    const M = POWER_MODELS.holyWater;
    for (let i = L.puddles.length - 1; i >= 0; i--) {
        const p = L.puddles[i];
        p.age += dt;
        if (p.age >= p.seconds) {
            L.puddles.splice(i, 1);
            continue;
        }
        p.tick -= dt;
        const pulse = p.tick <= 0;
        if (pulse) p.tick = M.puddleTickSeconds;
        for (const e of state.enemies) {
            if (e.hp <= 0 || Math.hypot(e.x - p.x, (e.y - p.y) / 0.72) > p.radius + e.radius) continue;
            e.blessed = Math.max(e.blessed ?? 0, 1);
            if (pulse) dealDamage(e, getSpellDamage() * p.dps * M.puddleTickSeconds, { noCrit: true, quiet: true, style: 'spell' });
        }
    }
}

// Blessed Rain (evoluída): de tempos em tempos a chuva benta cai sobre a tela inteira. Todo monstro em campo queima e fica
// abençoado enquanto ela dura, e gotas grandes estouram em cima de monstros (dano em área e poça)
function updateHolyRain(dt, level) {
    if (!level || !powers.holyWater.evolved) {
        L.rain = 0;
        L.rainTimer = 0;
        return;
    }
    const R = EVOLUTIONS.holyWater.rain;
    if (L.rain > 0) {
        L.rain -= dt;
        L.rainTick -= dt;
        if (L.rainTick <= 0) {
            L.rainTick = R.tickSeconds;
            const damage = getSpellDamage() * R.dps * R.tickSeconds;
            for (const e of state.enemies) {
                if (e.hp <= 0) continue;
                e.blessed = Math.max(e.blessed ?? 0, R.tickSeconds + 0.6);
                dealDamage(e, damage, { noCrit: true, quiet: true, style: 'spell' });
            }
        }
        L.rainDrop -= dt;
        if (L.rainDrop <= 0) {
            L.rainDrop = R.dropSeconds;
            const alive = state.enemies.filter(e => e.hp > 0);
            const e = alive[Math.floor(Math.random() * alive.length)];
            if (e) splash(e.x, e.y, R.radius, getSpellDamage() * R.damage, level);
        }
        return;
    }
    // A primeira chuva vem logo depois da evolução (o relógio já começa quase cheio)
    L.rainTimer += dt;
    if (L.rainTimer >= getSpellCooldown(R.every) && state.enemies.length > 0) {
        L.rainTimer = 0;
        L.rain = R.seconds;
        L.rainTick = 0.4;
        L.rainDrop = 0.5;
        startCast();
        audio.playBolt();
    }
}

// Blessed Rain (evoluída): o monstro abençoado que morre explode em luz
export function onLightKill(e) {
    if (!(e.blessed > 0)) return;
    // Silent Vigil: cada monstro abençoado que cai cura o herói
    const heal = mod('blessedKillHeal');
    if (heal > 0 && player.hp > 0) {
        const healed = Math.min(getMaxPlayerHp() - player.hp, heal);
        if (healed > 0) {
            player.hp += healed;
            addNumber(player.x, player.y - 40, healed, 1, 'heal');
        }
    }
    if (!powers.holyWater.evolved) return;
    const B = EVOLUTIONS.holyWater.baptism;
    state.blastBudget++;
    blast(e.x, e.y, B.radius, getSpellDamage() * B.damage, 80, '#fef3c7', 'spell');
    L.bursts.push({ x: e.x, y: e.y, age: 0, seconds: 0.4, radius: B.radius, cross: false });
}

// --- SMITE ---
function updateSmite(dt) {
    const M = POWER_MODELS.smite;
    const level = getPowerLevel(powers.smite);
    if (level && ready('smite', dt, getSpellCooldown(level.cooldown))) {
        const picked = state.enemies
            .filter(e => e.hp > 0 && Math.hypot(e.x - player.x, e.y - player.y) <= M.range)
            .sort((a, b) => b.hp - a.hp)
            .slice(0, level.count);
        const judgment = powers.smite.evolved ? EVOLUTIONS.smite.judgment : 0;
        for (const e of picked) {
            // Divine Wrath (evoluída): o raio dura mais, é maior e tem faíscas, impacto com onda e clarão forte
            const wrath = powers.smite.evolved;
            L.bolts.push({ x: e.x, y: e.y, age: 0, seconds: wrath ? 0.75 : 0.4, radius: wrath ? M.radius * 1.6 : M.radius, wrath, seed: Math.random() * 100 });
            const banish = judgment > 0 && !e.isBoss && e.hp < e.maxHp * judgment;
            dealDamage(e, banish ? e.hp + 1 : getSpellDamage() * level.damage, { noCrit: true, style: 'spell' });
            e.stunned = Math.max(e.stunned ?? 0, level.stun * (e.isBoss ? M.bossStunRatio : 1));
            createExplosion(e.x, e.y, '#fef3c7', wrath ? 16 : 8);
            if (wrath) addShockwave(e.x, e.y, { radius: M.radius * 3.2, color: '#fde68a', width: 8, seconds: 0.5 });
        }
        if (picked.length) {
            screenFlash('#fef3c7', powers.smite.evolved ? 0.14 : 0.1);
            shakeScreen(powers.smite.evolved ? 8 : 4);
            startCast();
            audio.playBlast();
        }
    }
}

// --- CHURCH BELL ---
// O sino pendurado sobre a tocha. Quando há monstros perto dela, toca: uma onda de som sai da tocha, empurra para longe,
// fere com magia e atordoa. Na evolução (Cathedral Toll) são 3 badaladas seguidas, cada anel maior; abençoados levam o dobro
// e cada badalada cura a tocha. Desenho em js/render/light.js
function toll() {
    const M = POWER_MODELS.churchBell;
    const E = EVOLUTIONS.churchBell;
    const B = L.bell;
    const lv = B.level;
    const evolved = powers.churchBell.evolved;
    const radius = lv.radius * (1 + M.growth * B.index);
    const base = getSpellDamage() * lv.damage;
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        const d = Math.hypot(e.x - state.coreX, e.y - state.coreY);
        if (d > radius + e.radius) continue;
        const a = Math.atan2(e.y - state.coreY, e.x - state.coreX);
        const dmg = base * (evolved && e.blessed > 0 ? E.blessedMultiplier : 1);
        dealDamage(e, dmg, { noCrit: true, style: 'spell', kbX: Math.cos(a) * lv.knockback, kbY: Math.sin(a) * lv.knockback });
        e.stunned = Math.max(e.stunned ?? 0, lv.stun * (e.isBoss ? M.bossStunRatio : 1));
    }
    if (evolved) feedTorch(E.torchHeal);
    L.bellRings.push({ age: 0, seconds: 0.6, radius });
    B.swing = 1;
    B.flash = 1;
    audio.playBell?.(B.index > 0);
    shakeScreen(2 + B.index);
    B.index++;
}

function updateChurchBell(dt) {
    const M = POWER_MODELS.churchBell;
    const B = L.bell;
    if (B.swing > 0) B.swing = Math.max(0, B.swing - dt * 0.7);
    if (B.flash > 0) B.flash = Math.max(0, B.flash - dt * 2.5);
    for (let i = L.bellRings.length - 1; i >= 0; i--) {
        L.bellRings[i].age += dt;
        if (L.bellRings[i].age >= L.bellRings[i].seconds) L.bellRings.splice(i, 1);
    }
    const level = getPowerLevel(powers.churchBell);
    if (!level || state.phase !== 'HUNT') {
        B.queue = 0;
        return;
    }
    // Badaladas em sequência (a evolução toca 3)
    if (B.queue > 0) {
        B.gap -= dt;
        if (B.gap <= 0) {
            B.queue--;
            B.gap = M.gapSeconds;
            toll();
        }
        return;
    }
    const timers = state.powerTimers;
    timers.churchBell = (timers.churchBell ?? getSpellCooldown(level.cooldown) * 0.5) - dt;
    if (timers.churchBell > 0) return;
    const near = state.enemies.some(e => e.hp > 0 && Math.hypot(e.x - state.coreX, e.y - state.coreY) < level.radius * M.wakeRatio + e.radius);
    if (!near) {
        timers.churchBell = 0.4;
        return;
    }
    timers.churchBell = getSpellCooldown(level.cooldown);
    B.level = level;
    B.index = 0;
    B.queue = powers.churchBell.evolved ? EVOLUTIONS.churchBell.tolls : M.tolls;
    B.gap = 0;
}

// --- OATH OF FAITH: os escudos de luz ---
// Três escudos dourados giram em volta do herói; cada um bate (dano de magia) e empurra o monstro que encosta nele, com uma
// pausa por monstro para não bater todo quadro.
function updateFaithShields(dt) {
    if (state.oath !== 'oathFaith' || player.hp <= 0) {
        L.shieldsOn = false;
        return;
    }
    const S = PASSIVE_SKILL_MODELS.oathFaith.shields;
    L.shieldsOn = true;
    L.shieldAngle = (L.shieldAngle ?? 0) + S.spin * dt;
    const damage = getSpellDamage() * S.damage;
    for (let i = 0; i < S.count; i++) {
        const a = L.shieldAngle + (i / S.count) * TAU;
        const x = player.x + Math.cos(a) * S.orbit;
        const y = player.y + Math.sin(a) * S.orbit * 0.72;
        for (const e of state.enemies) {
            if (e.hp <= 0 || e.faithCd > state.runTime || Math.hypot(e.x - x, e.y - y) > S.size + e.radius) continue;
            e.faithCd = state.runTime + S.hitSeconds;
            const k = Math.atan2(e.y - player.y, e.x - player.x);
            dealDamage(e, damage, { noCrit: true, style: 'spell', kbX: Math.cos(k) * S.knockback, kbY: Math.sin(k) * S.knockback });
            createExplosion(x, y, '#fde68a', 4);
        }
    }
}

export function updateLightSkills(dt) {
    updateFaithShields(dt);
    updateChurchBell(dt);
    for (let i = L.drops.length - 1; i >= 0; i--) {
        const d = L.drops[i];
        d.age += dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.z += d.vz * dt;
        d.vz -= 520 * dt;
        if (d.z <= 0 || d.age >= d.life) L.drops.splice(i, 1);
    }
    for (let i = L.bursts.length - 1; i >= 0; i--) {
        L.bursts[i].age += dt;
        if (L.bursts[i].age >= L.bursts[i].seconds) L.bursts.splice(i, 1);
    }
    for (let i = L.bolts.length - 1; i >= 0; i--) {
        L.bolts[i].age += dt;
        if (L.bolts[i].age >= L.bolts[i].seconds) L.bolts.splice(i, 1);
    }
    updateHolyGround(dt);
    updateHolyWater(dt);
    updateSmite(dt);
}

export function clearLightSkills() {
    L.grounds.length = 0;
    L.flasks.length = 0;
    L.bolts.length = 0;
    L.bursts.length = 0;
    L.puddles.length = 0;
    L.drops.length = 0;
    L.bellRings.length = 0;
    L.bell.queue = 0;
    L.rain = 0;
    L.rainTimer = 12;
}
