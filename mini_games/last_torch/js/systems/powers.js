import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { blast, dealDamage } from './damage.js';
import { addShockwave, createExplosion, screenFlash, shakeScreen } from './effects.js';
import { startCast } from './moves.js';
import { hurtPlayer } from './player.js';
import { spreadHex } from './skills_curse.js';
import { onNatureKill } from './skills_nature.js';
import { damageAngel, liveAngel, onLightKill } from './skills_light.js';
import { getBladeDamage, getKillHeal, getSpellCooldown, getSpellDamage, getTorchFireDamage } from './stats.js';

// --- PODERES ---
// Cada poder lê os dados do nível atual com getPowerLevel (data_model/powers.js).
// O desenho fica em js/render/powers.js. Temporizadores: state.powerTimers.
const TAU = Math.PI * 2;

// Conta o tempo de um poder com recarga: true quando disparou
export function ready(key, dt, cooldown) {
    const timers = state.powerTimers;
    timers[key] = (timers[key] ?? cooldown * 0.5) - dt;
    if (timers[key] > 0) return false;
    timers[key] = cooldown;
    return true;
}

export function nearestEnemy(x, y, maxDist, skip = null) {
    let best = null;
    let min = maxDist;
    for (const e of state.enemies) {
        if (e.hp <= 0 || e.untargetable || skip?.has(e)) continue;
        const d = Math.hypot(e.x - x, e.y - y);
        if (d < min) {
            min = d;
            best = e;
        }
    }
    return best;
}

// --- SPECTRAL BLADE (Blade Path) ---
// Quando monstros chegam perto, `count` lâminas fantasmas APARECEM em volta do herói (crescendo), giram por `duration` s fazendo dano de LÂMINA em quem toca, SOMEM
// (encolhendo) e só então a recarga corre. Números: POWER_MODELS.spectralBlade. Desenho: renderSpectralBlade (js/render/powers.js).
function updateSpectralBlade(dt) {
    const level = getPowerLevel(powers.spectralBlade);
    const R = state.spectralBlade;
    if (!level) { R.left = 0; return; }
    const M = POWER_MODELS.spectralBlade.base;
    if (R.left <= 0) {
        if (state.phase !== 'HUNT' || player.hp <= 0 || !ready('spectralBlade', dt, getSpellCooldown(level.cooldown))) return;
        const near = state.enemies.some(e => e.hp > 0 && !e.emerge && Math.hypot(e.x - player.x, e.y - player.y) <= level.radius + 130 + e.radius);
        if (!near) { state.powerTimers.spectralBlade = 0.3; return; }          // ninguém perto: não gasta a recarga
        R.left = level.duration;
        R.age = 0;
        R.count = level.count;
        createExplosion(player.x, player.y, '#c4b5fd', 8);
        addShockwave(player.x, player.y, { radius: level.radius, color: '#a78bfa', width: 4, seconds: 0.35 });
        audio.playSwordSlash?.(2);
    } else state.powerTimers.spectralBlade = getSpellCooldown(level.cooldown);      // a recarga só corre depois que as lâminas somem
    R.left -= dt;
    R.age += dt;
    R.angle += M.spin * dt;
    const grow = Math.min(1, R.age / M.appearSeconds, R.left / M.vanishSeconds);     // aparecem crescendo e somem encolhendo: só fere com as lâminas "cheias"
    if (grow < 0.5) return;
    const damage = getBladeDamage() * level.damage;
    for (let i = 0; i < level.count; i++) {
        const a = R.angle + (i / level.count) * TAU;
        const x = player.x + Math.cos(a) * level.radius;
        const y = player.y + Math.sin(a) * level.radius;
        for (const e of state.enemies) {
            if (e.hp <= 0 || e.bladeCd > 0 || Math.hypot(e.x - x, e.y - y) > e.radius + M.bladeRadius) continue;
            e.bladeCd = M.hitCooldown;
            dealDamage(e, damage, { kbX: Math.cos(a) * M.knockback, kbY: Math.sin(a) * M.knockback });
            createExplosion(x, y, '#c4b5fd', 3);
            audio.playHit(1);
        }
    }
    for (const e of state.enemies) if (e.bladeCd > 0) e.bladeCd -= dt;
}

// --- GOLDEN TORNADO (Curse Path) ---
// Quando monstros chegam perto, um tornado dourado de luz nasce ao lado do herói e CAÇA os monstros (anda até o mais perto) por `duration` s: fere tudo dentro dele
// (dano de feitiço por segundo) e arrasta quem está em volta para o centro. Some e só então a recarga corre. Números: POWER_MODELS.goldenTornado. Desenho: renderGoldenTornado.
function updateGoldenTornado(dt) {
    const level = getPowerLevel(powers.goldenTornado);
    if (!level) { if (state.goldenTornado) endGoldenTornado(); return; }
    const M = POWER_MODELS.goldenTornado.base;
    let T = state.goldenTornado;
    if (!T) {
        if (state.phase !== 'HUNT' || player.hp <= 0 || !ready('goldenTornado', dt, getSpellCooldown(level.cooldown))) return;
        const near = state.enemies.some(e => e.hp > 0 && !e.emerge && Math.hypot(e.x - player.x, e.y - player.y) <= 260 + e.radius);
        if (!near) { state.powerTimers.goldenTornado = 0.3; return; }
        const a = player.angle ?? 0;
        T = state.goldenTornado = { x: player.x + Math.cos(a) * 50, y: player.y + Math.sin(a) * 50, age: 0, seconds: level.duration, tick: 0, radius: level.radius, hits: new Set() };
        createExplosion(T.x, T.y, '#fde68a', 10);
        addShockwave(T.x, T.y, { radius: level.radius * 1.4, color: '#fbbf24', width: 5, seconds: 0.4 });
        audio.playNova?.();
    }
    state.powerTimers.goldenTornado = getSpellCooldown(level.cooldown);        // a recarga só corre depois que o tornado some
    T.age += dt;
    if (T.age >= T.seconds || state.phase !== 'HUNT') { endGoldenTornado(); return; }
    // Caça: trava num monstro e anda até ele; quando ele morre, vai para o mais perto (sem monstro, volta para perto do herói)
    if (!T.target || T.target.hp <= 0 || !state.enemies.includes(T.target) || Math.hypot(T.target.x - T.x, T.target.y - T.y) > 650) {
        T.target = null;
        let best = 520;
        for (const e of state.enemies) {
            if (e.hp <= 0 || e.emerge) continue;
            const d = Math.hypot(e.x - T.x, e.y - T.y);
            if (d < best) { best = d; T.target = e; }
        }
    }
    const tx = T.target ? T.target.x : player.x, ty = T.target ? T.target.y : player.y;
    const dx = tx - T.x, dy = ty - T.y, d = Math.hypot(dx, dy) || 1;
    if (d > 8) {
        const step = Math.min(d, M.speed * dt);
        T.x += (dx / d) * step;
        T.y += (dy / d) * step;
    }
    T.x = Math.max(20, Math.min(state.width - 20, T.x));
    T.y = Math.max(160, Math.min(state.height - 20, T.y));
    // Engole: quem está em volta é puxado em ESPIRAL para o centro (gira em volta dele enquanto se aproxima) e fere a cada instante. e.swallow (0 a 1) diz o quanto
    // o monstro já está "dentro" do tornado; o desenho (js/render/entities.js e renderGoldenTornado) o encolhe, o faz girar e o cobre de ouro. Chefe e pesados quase não se mexem
    const reach = T.radius * M.pullRatio;
    const tick = (T.tick -= dt) <= 0;
    if (tick) T.tick += M.tickSeconds;
    const damage = getSpellDamage() * level.dps * M.tickSeconds;
    const rise = Math.min(1, T.age / M.riseSeconds, (T.seconds - T.age) / M.fadeSeconds);
    for (const e of state.enemies) {
        const ex = T.x - e.x, ey = T.y - e.y, ed = Math.hypot(ex, ey) || 1;
        if (e.hp <= 0 || e.emerge || ed > reach + e.radius) { e.swallow = 0; continue; }
        e.swallow = Math.max(0, Math.min(1, (1 - ed / (T.radius * 1.15)) * 1.2)) * Math.max(0, rise);
        if (!e.isBoss && !e.immovable && ed > 6) {
            const resist = 1 - (e.knockbackResist ?? 0);
            const pull = M.pull * resist * dt, swirl = M.swirl * resist * dt;
            e.x += (ex / ed) * Math.min(pull, ed) + (-ey / ed) * swirl;        // para o centro + de lado: gira em volta dele
            e.y += (ey / ed) * Math.min(pull, ed) + (ex / ed) * swirl;
        }
        if (tick && ed <= T.radius + e.radius) dealDamage(e, damage, { noCrit: true, style: 'spell', quiet: true });
    }
}

// O tornado some: ninguém fica "engolido" (e.swallow volta a 0)
function endGoldenTornado() {
    state.goldenTornado = null;
    for (const e of state.enemies) e.swallow = 0;
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

// Fogo aliado fora dos passos (lava do Cataclysm)
export function addGroundFire(x, y, { life, radius, dps, evolved }) {
    state.groundFires.push({ x, y, life, maxLife: life, radius, dps, tick: 0, evolved });
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
            const angelF = liveAngel();
            if (angelF && Math.hypot(angelF.x - f.x, angelF.y - f.y) < f.radius + angelF.radius) damageAngel(8, 0.5);
            continue;
        }
        const damage = getSpellDamage() * f.dps * tickSeconds;
        for (const e of state.enemies) {
            if (Math.hypot(e.x - f.x, e.y - f.y) < f.radius + e.radius) dealDamage(e, damage, { noCrit: true, quiet: true });
        }
    }
}

// --- RAIO EM CADEIA ---
function strikeChain(startX, startY, level, first = null) {
    const M = POWER_MODELS.chainLightning;
    const damage = getSpellDamage() * level.damage;
    const struck = new Set();
    let current = first ?? nearestEnemy(startX, startY, M.range);
    if (!current) return false;

    const points = [{ x: startX, y: startY }];
    let jumps = level.jumps;
    while (current && jumps > 0) {
        struck.add(current);
        points.push({ x: current.x, y: current.y });
        dealDamage(current, damage, { noCrit: true, style: 'spell' });
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
    if (ready('chainLightning', dt, getSpellCooldown(level.cooldown)) && strikeChain(player.x, player.y, level)) startCast();
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
    if (!level || !ready('soulNova', dt, getSpellCooldown(level.cooldown))) return;
    const M = POWER_MODELS.soulNova;
    const evolved = powers.soulNova.evolved;
    const color = evolved ? '#a5f3fc' : '#c4b5fd';
    const damage = getSpellDamage() * level.damage;

    state.enemies.forEach(e => {
        if (Math.hypot(e.x - player.x, e.y - player.y) > level.radius + e.radius) return;
        const a = Math.atan2(e.y - player.y, e.x - player.x);
        dealDamage(e, damage, { kbX: Math.cos(a) * M.knockback, kbY: Math.sin(a) * M.knockback, noCrit: true, style: 'spell' });
        if (evolved && !e.isBoss) e.frozen = EVOLUTIONS.soulNova.freezeSeconds;
    });
    addShockwave(player.x, player.y, { radius: level.radius, color, width: 9, seconds: 0.45 });
    addShockwave(player.x, player.y, { radius: level.radius * 0.6, color: '#ffffff', width: 3, seconds: 0.3 });
    shakeScreen(4);
    startCast();
    audio.playNova();
}

// --- FREEZING BREATH (chave absoluteZero) ---
// Quando um monstro chega perto, o herói solta um sopro gelado em CONE pela boca que DURA M.breathSeconds (3 s) e GIRA com o herói (segue player.angle). A cada tickSeconds fere
// e congela (e.frozen: o bloco de gelo de js/render/entities.js) quem está dentro: o primeiro contato congela por `freeze`, e cada instante seguinte renova o gelo enquanto o monstro
// está no cone. Chefe também congela, mas por METADE do tempo (M.bossFreezeRatio). A recarga só corre depois que o sopro acaba; sem monstro ao alcance ele espera. O desenho: renderFrostBreaths (js/render/powers.js).
const inCone = (e, ox, oy, angle, range, half) => {
    const dx = e.x - ox, dy = e.y - oy;
    const d = Math.hypot(dx, dy);
    if (d > range + e.radius) return false;
    if (d < e.radius) return true;                                   // colado no herói
    let diff = Math.atan2(dy, dx) - angle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    return Math.abs(diff) <= half + Math.asin(Math.min(1, e.radius / d));      // o corpo do monstro alarga o cone
};
function breathTick(b, level, M) {
    const damage = getSpellDamage() * level.dps * M.tickSeconds;
    for (const e of state.enemies) {
        if (e.hp <= 0 || e.emerge || !inCone(e, player.x, player.y, b.angle, level.range, level.halfAngle)) continue;
        dealDamage(e, damage, { kbX: Math.cos(b.angle) * M.knockback, kbY: Math.sin(b.angle) * M.knockback, noCrit: true, style: 'spell', quiet: true });
        const k = e.isBoss ? M.bossFreezeRatio : 1;                 // chefe congela por metade do tempo
        if (!b.touched.has(e)) { b.touched.add(e); e.frozen = Math.max(e.frozen ?? 0, (level.freeze + M.holdFreeze) * k); }
        else e.frozen = Math.max(e.frozen ?? 0, (M.holdFreeze + 0.15) * k);
    }
}
function updateAbsoluteZero(dt) {
    const M = POWER_MODELS.absoluteZero;
    const level = getPowerLevel(powers.absoluteZero);
    const breaths = state.frostBreaths;
    // Durante a Fúria (o especial: o Lord's Decree do Gudran, etc.) o sopro não sai, e um que estivesse soprando é cortado: o gesto da Fúria e o do sopro brigavam na animação
    if (state.frenzyActiveTimer > 0) {
        if (breaths.length > 0 && level) state.powerTimers.absoluteZero = getSpellCooldown(level.cooldown);      // o sopro cortado conta como usado
        breaths.length = 0;
        return;
    }
    for (let i = breaths.length - 1; i >= 0; i--) {
        const b = breaths[i];
        if (!level || state.phase !== 'HUNT' || player.hp <= 0) { breaths.splice(i, 1); continue; }
        b.age += dt;
        // O cone vira com o herói (suave: acompanha o rumo para onde ele olha)
        let diff = player.angle - b.angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        b.angle += Math.max(-M.turnSpeed * dt, Math.min(M.turnSpeed * dt, diff));
        b.tick -= dt;
        if (b.tick <= 0) { b.tick += M.tickSeconds; breathTick(b, level, M); }
        b.sound -= dt;
        if (b.sound <= 0) { b.sound = 0.7; audio.playIceBreath?.(); }
        state.powerTimers.absoluteZero = getSpellCooldown(level.cooldown);       // a recarga só começa a correr quando o sopro acaba
        if (b.age >= M.breathSeconds) breaths.splice(i, 1);
    }
    if (!level || breaths.length > 0 || state.phase !== 'HUNT' || !ready('absoluteZero', dt, getSpellCooldown(level.cooldown))) return;
    // O melhor rumo para começar: a direção de cada monstro ao alcance, ficando com a que pega mais monstros
    const near = state.enemies.filter(e => e.hp > 0 && !e.emerge && Math.hypot(e.x - player.x, e.y - player.y) <= level.range + e.radius);
    if (near.length === 0) { state.powerTimers.absoluteZero = 0.3; return; }       // ninguém perto: não gasta a recarga
    let best = null, bestCount = -1, bestDist = Infinity;
    for (const t of near) {
        const angle = Math.atan2(t.y - player.y, t.x - player.x);
        const count = near.filter(e => inCone(e, player.x, player.y, angle, level.range, level.halfAngle)).length;
        const dist = Math.hypot(t.x - player.x, t.y - player.y);
        if (count > bestCount || (count === bestCount && dist < bestDist)) { best = angle; bestCount = count; bestDist = dist; }
    }
    player.angle = best;
    breaths.push({ x: player.x, y: player.y, angle: best, age: 0, tick: 0, sound: 0, touched: new Set(), range: level.range, half: level.halfAngle });
    startCast();
    shakeScreen(2);
}

// --- LUA FRIA ---
function updateChillAura(dt) {
    const level = getPowerLevel(powers.chillAura);
    if (!level) return;
    const tick = ready('chillTick', dt, 0.5);
    const damage = getSpellDamage() * level.dps * 0.5;
    for (const e of state.enemies) {
        if (Math.hypot(e.x - player.x, e.y - player.y) > level.radius + e.radius) continue;
        e.slow = Math.max(e.slow ?? 0, level.slow);
        if (tick) dealDamage(e, damage, { noCrit: true, quiet: true });
    }
}

// --- CHUVA DE ESTRELAS ---
function updateStarfall(dt) {
    const level = getPowerLevel(powers.starfall);
    if (level && ready('starfall', dt, getSpellCooldown(level.cooldown)) && state.enemies.length > 0) {
        startCast();
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
        blast(s.x, s.y, s.radius, getSpellDamage() * s.damage, POWER_MODELS.starfall.knockback, '#fde68a', 'spell');
    }
}

// --- SENTINELA DA CHAMA ---
function updateTorchBolts(dt) {
    const level = getPowerLevel(powers.torchBolts);
    if (level && ready('torchBolts', dt, getSpellCooldown(level.cooldown))) {
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
                damage: getTorchFireDamage() * level.damage,
                style: 'spell',
                blue: passives.blueTorch.lvl > 0,
                torchFire: true,
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
            const turn = (b.turnRate ?? M.turnRate) * dt;
            const speed = b.speed ?? M.speed;
            const turned = current + Math.max(-turn, Math.min(turn, diff));
            b.vx = Math.cos(turned) * speed;
            b.vy = Math.sin(turned) * speed;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const hit = state.enemies.find(e => e.hp > 0 && Math.hypot(e.x - b.x, e.y - b.y) < e.radius + M.radius);
        if (hit) {
            const a = Math.atan2(b.vy, b.vx);
            dealDamage(hit, b.damage, { kbX: Math.cos(a) * 90, kbY: Math.sin(a) * 90, style: b.style ?? (b.soul ? 'spell' : null), torchFire: b.torchFire });
            createExplosion(b.x, b.y, b.soul ? '#c084fc' : b.blue ? '#60a5fa' : '#fb923c', 6);
            b.onHit?.(b, hit);
        }
        if (hit || b.life <= 0) state.bolts.splice(i, 1);
    }
}

// --- GATILHOS DE MORTE ---
export function onEnemyKilled(e) {
    const heal = getKillHeal();
    if (heal > 0) player.hp = Math.min(player.maxHp, player.hp + heal);
    spreadHex(e);
    onNatureKill(e);
    onLightKill(e);
}

export function updatePowers(dt) {
    if (state.powerTimers.wrath > 0) state.powerTimers.wrath -= dt;
    updateSpectralBlade(dt);
    updateGoldenTornado(dt);
    updateEmberTrail();
    updateGroundFires(dt);
    updateChainLightning(dt);
    updateSoulNova(dt);
    updateAbsoluteZero(dt);
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
