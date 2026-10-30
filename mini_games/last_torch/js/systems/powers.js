import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, player, powers, state } from '../core/state.js';
import { blast, dealDamage } from './damage.js';
import { addShockwave, createExplosion, screenFlash, shakeScreen } from './effects.js';
import { hurtPlayer } from './player.js';
import { getAtkDamage } from './stats.js';

// --- PODERES ---
// Cada poder lê os dados do nível atual com getPowerLevel (data_model/powers.js).
// O desenho fica em js/render/powers.js. Temporizadores: state.powerTimers.
const TAU = Math.PI * 2;

// Conta o tempo de um poder com recarga: true quando disparou
function ready(key, dt, cooldown) {
    const timers = state.powerTimers;
    timers[key] = (timers[key] ?? cooldown * 0.5) - dt;
    if (timers[key] > 0) return false;
    timers[key] = cooldown;
    return true;
}

function nearestEnemy(x, y, maxDist, skip = null) {
    let best = null;
    let min = maxDist;
    for (const e of state.enemies) {
        if (e.hp <= 0 || skip?.has(e)) continue;
        const d = Math.hypot(e.x - x, e.y - y);
        if (d < min) {
            min = d;
            best = e;
        }
    }
    return best;
}

// --- LÂMINAS ORBITANDO ---
function updateOrbitBlades(dt) {
    const level = getPowerLevel(powers.orbitBlades);
    if (!level) return;
    const M = POWER_MODELS.orbitBlades;
    state.orbitAngle += M.spin * dt;
    const damage = getAtkDamage() * level.damage;

    for (let i = 0; i < level.count; i++) {
        const a = state.orbitAngle + (i / level.count) * TAU;
        const x = player.x + Math.cos(a) * level.radius;
        const y = player.y + Math.sin(a) * level.radius;
        for (const e of state.enemies) {
            if (e.orbitCd > 0 || Math.hypot(e.x - x, e.y - y) > e.radius + M.bladeRadius) continue;
            e.orbitCd = M.hitCooldown;
            dealDamage(e, damage, { kbX: Math.cos(a) * M.knockback, kbY: Math.sin(a) * M.knockback });
            createExplosion(x, y, '#a5f3fc', 3);
            audio.playHit(1);
        }
    }
}

// --- FOGO NOS PASSOS ---
function updateEmberTrail() {
    const level = getPowerLevel(powers.emberTrail);
    if (!level) return;
    const M = POWER_MODELS.emberTrail;
    const moved = Math.hypot(player.x - (state.trailX ?? player.x), player.y - (state.trailY ?? player.y));
    state.trailX = player.x;
    state.trailY = player.y;
    state.trailDistance += moved;
    if (state.trailDistance < M.dropEvery) return;
    state.trailDistance = 0;

    const fires = state.groundFires;
    if (fires.length >= M.maxFires) fires.shift();
    fires.push({
        x: player.x, y: player.y,
        life: level.life, maxLife: level.life,
        radius: level.radius,
        dps: level.dps,
        tick: 0,
        evolved: powers.emberTrail.evolved
    });
}

// Elite em chamas: o fogo dele machuca o herói
export function addHostileFire(x, y) {
    state.groundFires.push({ x, y, life: 2.4, maxLife: 2.4, radius: 20, hostile: true, tick: 0 });
}

function updateGroundFires(dt) {
    const fires = state.groundFires;
    const tickSeconds = POWER_MODELS.emberTrail.tickSeconds;
    for (let i = fires.length - 1; i >= 0; i--) {
        const f = fires[i];
        f.life -= dt;
        if (f.life <= 0) {
            fires.splice(i, 1);
            continue;
        }
        f.tick -= dt;
        if (f.tick > 0) continue;
        f.tick = tickSeconds;
        if (f.hostile) {
            if (Math.hypot(player.x - f.x, player.y - f.y) < f.radius + 10) hurtPlayer(8, f.x, f.y, 0.5);
            continue;
        }
        const damage = getAtkDamage() * f.dps * tickSeconds;
        for (const e of state.enemies) {
            if (Math.hypot(e.x - f.x, e.y - f.y) < f.radius + e.radius) dealDamage(e, damage, { noCrit: true, quiet: true });
        }
    }
}

// --- RAIO EM CADEIA ---
function strikeChain(startX, startY, level, first = null) {
    const M = POWER_MODELS.chainLightning;
    const damage = getAtkDamage() * level.damage;
    const struck = new Set();
    let current = first ?? nearestEnemy(startX, startY, M.range);
    if (!current) return false;

    const points = [{ x: startX, y: startY }];
    let jumps = level.jumps;
    while (current && jumps > 0) {
        struck.add(current);
        points.push({ x: current.x, y: current.y });
        dealDamage(current, damage, { noCrit: true, style: 'storm' });
        createExplosion(current.x, current.y, '#7dd3fc', 4);
        jumps--;
        current = nearestEnemy(current.x, current.y, M.jumpRange, struck);
    }
    state.lightning.push({ points: jaggedPath(points), life: 0.2, maxLife: 0.2 });
    audio.playZap();
    return true;
}

// Quebra cada trecho em pontos deslocados, para parecer um raio
function jaggedPath(points) {
    const path = [points[0]];
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const steps = Math.max(2, Math.floor(Math.hypot(b.x - a.x, b.y - a.y) / 26));
        for (let s = 1; s < steps; s++) {
            const k = s / steps;
            path.push({
                x: a.x + (b.x - a.x) * k + (Math.random() - 0.5) * 22,
                y: a.y + (b.y - a.y) * k + (Math.random() - 0.5) * 22
            });
        }
        path.push(b);
    }
    return path;
}

function updateChainLightning(dt) {
    const level = getPowerLevel(powers.chainLightning);
    if (!level) return;
    if (ready('chainLightning', dt, level.cooldown)) strikeChain(player.x, player.y, level);
}

// Wrath of Heaven: todo crítico chama um raio
export function onCritical(e) {
    if (!powers.chainLightning.evolved) return;
    const timers = state.powerTimers;
    if ((timers.wrath ?? 0) > 0) return;
    timers.wrath = 0.25;
    strikeChain(e.x, e.y - 60, getPowerLevel(powers.chainLightning), e);
}

// --- PULSO DE ALMA ---
function updateSoulNova(dt) {
    const level = getPowerLevel(powers.soulNova);
    if (!level || !ready('soulNova', dt, level.cooldown)) return;
    const M = POWER_MODELS.soulNova;
    const evolved = powers.soulNova.evolved;
    const color = evolved ? '#a5f3fc' : '#c4b5fd';
    const damage = getAtkDamage() * level.damage;

    state.enemies.forEach(e => {
        if (Math.hypot(e.x - player.x, e.y - player.y) > level.radius + e.radius) return;
        const a = Math.atan2(e.y - player.y, e.x - player.x);
        dealDamage(e, damage, { kbX: Math.cos(a) * M.knockback, kbY: Math.sin(a) * M.knockback, noCrit: true });
        if (evolved && !e.isBoss) e.frozen = EVOLUTIONS.soulNova.freezeSeconds;
    });
    addShockwave(player.x, player.y, { radius: level.radius, color, width: 9, seconds: 0.45 });
    addShockwave(player.x, player.y, { radius: level.radius * 0.6, color: '#ffffff', width: 3, seconds: 0.3 });
    shakeScreen(4);
    audio.playNova();
}

// --- LUA FRIA ---
function updateChillAura(dt) {
    const level = getPowerLevel(powers.chillAura);
    if (!level) return;
    const tick = ready('chillTick', dt, 0.5);
    const damage = getAtkDamage() * level.dps * 0.5;
    for (const e of state.enemies) {
        if (Math.hypot(e.x - player.x, e.y - player.y) > level.radius + e.radius) continue;
        e.slow = Math.max(e.slow ?? 0, level.slow);
        if (tick) dealDamage(e, damage, { noCrit: true, quiet: true });
    }
}

// --- CHUVA DE ESTRELAS ---
function updateStarfall(dt) {
    const level = getPowerLevel(powers.starfall);
    if (level && ready('starfall', dt, level.cooldown) && state.enemies.length > 0) {
        for (let i = 0; i < level.count; i++) {
            const target = state.enemies[Math.floor(Math.random() * state.enemies.length)];
            state.stars.push({
                x: target.x, y: target.y,
                age: -i * 0.12,
                seconds: POWER_MODELS.starfall.fallSeconds,
                radius: level.radius,
                damage: level.damage
            });
        }
    }

    for (let i = state.stars.length - 1; i >= 0; i--) {
        const s = state.stars[i];
        s.age += dt;
        if (s.age < s.seconds) continue;
        state.stars.splice(i, 1);
        state.blastBudget++;
        blast(s.x, s.y, s.radius, getAtkDamage() * s.damage, POWER_MODELS.starfall.knockback, '#fde68a');
    }
}

// --- SENTINELA DA CHAMA ---
function updateTorchBolts(dt) {
    const level = getPowerLevel(powers.torchBolts);
    if (level && ready('torchBolts', dt, level.cooldown)) {
        const M = POWER_MODELS.torchBolts;
        const skip = new Set();
        for (let i = 0; i < level.count; i++) {
            const target = nearestEnemy(state.coreX, state.coreY, M.range, skip);
            if (!target) break;
            skip.add(target);
            const a = Math.atan2(target.y - state.coreY, target.x - state.coreX);
            state.bolts.push({
                x: state.coreX, y: state.coreY,
                vx: Math.cos(a) * M.speed, vy: Math.sin(a) * M.speed,
                target,
                damage: getAtkDamage() * level.damage,
                life: 1.6
            });
        }
        if (skip.size > 0) audio.playBolt();
    }

    const M = POWER_MODELS.torchBolts;
    for (let i = state.bolts.length - 1; i >= 0; i--) {
        const b = state.bolts[i];
        b.life -= dt;
        if (b.target && b.target.hp > 0) {
            // Curva suave até o alvo
            const current = Math.atan2(b.vy, b.vx);
            let diff = Math.atan2(b.target.y - b.y, b.target.x - b.x) - current;
            while (diff > Math.PI) diff -= TAU;
            while (diff < -Math.PI) diff += TAU;
            const turned = current + Math.max(-M.turnRate * dt, Math.min(M.turnRate * dt, diff));
            b.vx = Math.cos(turned) * M.speed;
            b.vy = Math.sin(turned) * M.speed;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const hit = state.enemies.find(e => e.hp > 0 && Math.hypot(e.x - b.x, e.y - b.y) < e.radius + M.radius);
        if (hit) {
            const a = Math.atan2(b.vy, b.vx);
            dealDamage(hit, b.damage, { kbX: Math.cos(a) * 90, kbY: Math.sin(a) * 90 });
            createExplosion(b.x, b.y, '#fb923c', 6);
        }
        if (hit || b.life <= 0) state.bolts.splice(i, 1);
    }
}

// --- GATILHOS DE MORTE ---
export function onEnemyKilled(e) {
    const blood = getPowerLevel(powers.bloodEdge);
    if (blood) player.hp = Math.min(player.maxHp, player.hp + blood.heal);

    const burst = getPowerLevel(powers.corpseBurst);
    if (burst && Math.random() < burst.chance) {
        blast(e.x, e.y, burst.radius, getAtkDamage() * burst.damage, POWER_MODELS.corpseBurst.knockback, '#fb7185');
        if (powers.corpseBurst.evolved) player.hp = Math.min(player.maxHp, player.hp + 1);
    }
}

export function updatePowers(dt) {
    if (state.powerTimers.wrath > 0) state.powerTimers.wrath -= dt;
    updateOrbitBlades(dt);
    updateEmberTrail();
    updateGroundFires(dt);
    updateChainLightning(dt);
    updateSoulNova(dt);
    updateChillAura(dt);
    updateStarfall(dt);
    updateTorchBolts(dt);

    for (let i = state.lightning.length - 1; i >= 0; i--) {
        state.lightning[i].life -= dt;
        if (state.lightning[i].life <= 0) state.lightning.splice(i, 1);
    }
}

// Evolução: clarão e grito, para o jogador saber que algo enorme aconteceu
export function celebrateEvolution() {
    screenFlash('#fde68a', 0.6);
    shakeScreen(10);
    addShockwave(player.x, player.y, { radius: 300, color: '#fde047', width: 10, seconds: 0.7 });
}
