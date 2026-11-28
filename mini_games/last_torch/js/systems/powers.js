import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { createMonster } from '../../data_model/monsters.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { blast, dealDamage, ignite } from './damage.js';
import { addShockwave, createExplosion, screenFlash, shakeScreen } from './effects.js';
import { startCast } from './moves.js';
import { hurtPlayer } from './player.js';
import { spreadHex, updateLaughingSkull } from './skills_curse.js';
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

    // Wrath of Heaven (evoluído): o raio CAI DO CÉU no primeiro alvo (um trovão grosso, com clarão e tremor) e dali salta pelos outros
    const heaven = !!powers.chainLightning.evolved;
    const points = heaven ? [{ x: current.x + (Math.random() - 0.5) * 70, y: current.y - 520 }] : [{ x: startX, y: startY }];
    let jumps = level.jumps;
    while (current && jumps > 0) {
        struck.add(current);
        points.push({ x: current.x, y: current.y });
        dealDamage(current, damage, { noCrit: true, style: 'spell' });
        createExplosion(current.x, current.y, '#7dd3fc', heaven ? 8 : 4);
        if (heaven) addShockwave(current.x, current.y, { radius: 34 + (level.jumps - jumps) * 2, color: '#e0f2fe', width: 4, seconds: 0.25 });
        jumps--;
        current = nearestEnemy(current.x, current.y, M.jumpRange, struck);
    }
    if (heaven) {
        const path = jaggedPath(points, 38, 34);
        state.lightning.push({ points: path, life: 0.34, maxLife: 0.34, heaven: true, forks: lightningForks(path), hits: points.slice(1) });
        shakeScreen(2);                                        // sem clarão na tela inteira (cansava o olho): só um tremor leve
    } else state.lightning.push({ points: jaggedPath(points), life: 0.2, maxLife: 0.2 });
    audio.playZap();
    return true;
}

// Quebra cada trecho em pontos deslocados, para parecer um raio
function jaggedPath(points, stepLength = 26, wobble = 22) {
    const path = [points[0]];
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const steps = Math.max(2, Math.floor(Math.hypot(b.x - a.x, b.y - a.y) / stepLength));
        for (let s = 1; s < steps; s++) {
            const k = s / steps;
            path.push({
                x: a.x + (b.x - a.x) * k + (Math.random() - 0.5) * wobble,
                y: a.y + (b.y - a.y) * k + (Math.random() - 0.5) * wobble
            });
        }
        path.push(b);
    }
    return path;
}

// Ramificações finas que saem do raio forte (Wrath of Heaven): cada uma é um pequeno traço em zigue-zague para o lado
function lightningForks(path) {
    const forks = [];
    for (let i = 2; i < path.length - 1; i += 2) {
        if (Math.random() < 0.45) continue;
        const p = path[i];
        const side = Math.random() < 0.5 ? -1 : 1;
        const pts = [p];
        let x = p.x, y = p.y;
        const n = 2 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n; k++) { x += side * (14 + Math.random() * 22); y += 6 + Math.random() * 20; pts.push({ x, y }); }
        forks.push(pts);
    }
    return forks;
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
        // O cone gira para o monstro MAIS PERTO (e o herói vira junto: o corpo trava nessa direção em js/render/player25d.js, lockFacing). Dá para andar recuando enquanto ele sopra
        // para trás; e um arremesso (adaga, bola de energia) vai pelo mesmo rumo, que é o da mira automática. Sem monstro perto, o cone fica onde está
        const aimed = nearestEnemy(player.x, player.y, level.range + 120);
        if (aimed) b.aim = Math.atan2(aimed.y - player.y, aimed.x - player.x);
        let diff = (b.aim ?? b.angle) - b.angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        b.angle += Math.max(-M.turnSpeed * dt, Math.min(M.turnSpeed * dt, diff));
        player.angle = b.angle;                         // o rumo do herói é o do sopro
        b.tick -= dt;
        if (b.tick <= 0) { b.tick += M.tickSeconds; breathTick(b, level, M); }
        // O gelo no chão: por onde o sopro passa fica uma camada de gelo (só o visual, desde o começo; o Permafrost é que a torna lenta). Uma nova a cada frost.patchEvery s; o cone gira, então cada uma aponta para um lado
        {
            const F = M.frost;
            b.iceCd = (b.iceCd ?? 0) - dt;
            if (b.iceCd <= 0) {
                b.iceCd += F.patchEvery;
                if (state.icePatches.length >= F.maxPatches) state.icePatches.shift();
                state.icePatches.push({ x: player.x, y: player.y, angle: b.angle, range: level.range, half: level.halfAngle, life: F.seconds, maxLife: F.seconds });
            }
        }
        b.sound -= dt;
        if (b.sound <= 0) { b.sound = 0.7; audio.playIceBreath?.(); }
        state.powerTimers.absoluteZero = getSpellCooldown(level.cooldown);       // a recarga só começa a correr quando o sopro acaba
        if (b.age >= M.breathSeconds) breaths.splice(i, 1);
    }
    // Enquanto o Chili Breath sopra, este espera (sem gastar a recarga)
    if (!level || breaths.length > 0 || state.fireBreaths.length > 0 || state.phase !== 'HUNT' || !ready('absoluteZero', dt, getSpellCooldown(level.cooldown))) return;
    // O sopro começa quando um monstro chega ao alcance do cone, virado para o mais perto
    const nearest = nearestEnemy(player.x, player.y, level.range);
    if (!nearest) { state.powerTimers.absoluteZero = 0.3; return; }       // ninguém perto: não gasta a recarga
    const best = Math.atan2(nearest.y - player.y, nearest.x - player.x);
    player.angle = best;
    breaths.push({ x: player.x, y: player.y, angle: best, age: 0, tick: 0, sound: 0, touched: new Set(), range: level.range, half: level.halfAngle });
    startCast();
    shakeScreen(2);
}

// --- CHILI BREATH ("bafo de pimenta": o Freezing Breath do fogo) ---
// A mesma lógica do sopro gelado: quando um monstro chega ao alcance, o lança-chamas sai da boca e dura M.breathSeconds, o cone GIRA para o monstro mais perto (o herói vira junto: lockFacing) e a cada
// tickSeconds fere e ACENDE (burn) quem está dentro. Cone mais estreito e mais comprido. Nunca durante a Fúria (o especial) e nunca junto com o Freezing Breath: enquanto um dos dois sopra, o outro espera.
function updateChiliBreath(dt) {
    const M = POWER_MODELS.chiliBreath;
    const level = getPowerLevel(powers.chiliBreath);
    const breaths = state.fireBreaths;
    if (state.frenzyActiveTimer > 0) {
        if (breaths.length > 0 && level) state.powerTimers.chiliBreath = getSpellCooldown(level.cooldown);      // o sopro cortado conta como usado
        breaths.length = 0;
        return;
    }
    for (let i = breaths.length - 1; i >= 0; i--) {
        const b = breaths[i];
        if (!level || state.phase !== 'HUNT' || player.hp <= 0) { breaths.splice(i, 1); continue; }
        b.age += dt;
        const aimed = nearestEnemy(player.x, player.y, level.range + 120);
        if (aimed) b.aim = Math.atan2(aimed.y - player.y, aimed.x - player.x);
        let diff = (b.aim ?? b.angle) - b.angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        b.angle += Math.max(-M.turnSpeed * dt, Math.min(M.turnSpeed * dt, diff));
        player.angle = b.angle;
        b.tick -= dt;
        if (b.tick <= 0) {
            b.tick += M.tickSeconds;
            const damage = getSpellDamage() * level.dps * M.tickSeconds;
            const burn = getSpellDamage() * level.burnDps;
            for (const e of state.enemies) {
                if (e.hp <= 0 || e.emerge || !inCone(e, player.x, player.y, b.angle, level.range, level.halfAngle)) continue;
                dealDamage(e, damage, { kbX: Math.cos(b.angle) * M.knockback, kbY: Math.sin(b.angle) * M.knockback, noCrit: true, style: 'spell', quiet: true });
                ignite(e, burn, level.burnSeconds);
            }
        }
        b.sound -= dt;
        if (b.sound <= 0) { b.sound = 0.5; audio.playFlame?.(); }
        state.powerTimers.chiliBreath = getSpellCooldown(level.cooldown);       // a recarga só começa a correr quando o sopro acaba
        if (b.age >= M.breathSeconds) breaths.splice(i, 1);
    }
    // Enquanto o Freezing Breath sopra, este espera (sem gastar a recarga)
    if (!level || breaths.length > 0 || state.frostBreaths.length > 0 || state.phase !== 'HUNT' || !ready('chiliBreath', dt, getSpellCooldown(level.cooldown))) return;
    const nearest = nearestEnemy(player.x, player.y, level.range);
    if (!nearest) { state.powerTimers.chiliBreath = 0.3; return; }       // ninguém perto: não gasta a recarga
    const best = Math.atan2(nearest.y - player.y, nearest.x - player.x);
    player.angle = best;
    breaths.push({ x: player.x, y: player.y, angle: best, age: 0, tick: 0, sound: 0, range: level.range, half: level.halfAngle });
    startCast();
    shakeScreen(2);
}

// Gelo no chão: as camadas duram frost.seconds. Só com o PERMAFROST (a evolução) deixam mais lento quem está em cima (e.slow, o mesmo da Chill Aura, refeito a cada quadro)
function updateIcePatches(dt) {
    const patches = state.icePatches;
    if (patches.length === 0) return;
    const level = getPowerLevel(powers.absoluteZero);
    const slow = powers.absoluteZero.evolved ? (level?.iceSlow ?? 0.5) : 0;
    for (let i = patches.length - 1; i >= 0; i--) {
        patches[i].life -= dt;
        if (patches[i].life <= 0) patches.splice(i, 1);
    }
    if (slow <= 0) return;
    for (const e of state.enemies) {
        if (e.hp <= 0 || e.emerge) continue;
        for (const p of patches) {
            if (inCone(e, p.x, p.y, p.angle, p.range, p.half)) { e.slow = Math.max(e.slow ?? 0, slow); break; }
        }
    }
}

// --- SUMMON SKELETONS (Curse Path) ---
// Quando monstros chegam perto, `count` esqueletos ALIADOS levantam do chão em volta do herói (até `maxAlive` vivos) e lutam até cair: entram em state.converts, a lista dos aliados
// (a IA, o dano deles e o desenho vêm de js/systems/conversion.js e js/render/entities.js). Não somem pelo tempo: ficam até morrer (tiros, explosões e golpes em área; o chefe fere 3x mais: ver hurtSummons em conversion.js).
const SKELETON_ALLY_FIELDS = { ally: true, vx: 0, vy: 0, lungeState: 0, rooted: 0, frozen: 0, stunned: 0, marked: 0, blessed: 0, chilled: 0, burning: 0, ravenMark: 0, slow: 0, hitFlash: 0, allyCd: 0, punchState: 0, punchCooldown: 0.4, swing: 0, throwArm: 0, slamHit: false, shotTimer: undefined, lungeTimer: 0.4 };
// Sorteia o tipo do esqueleto pelo peso de cada um
function pickSkeletonType(types) {
    let roll = Math.random() * types.reduce((sum, t) => sum + t.weight, 0);
    for (const t of types) { roll -= t.weight; if (roll < 0) return t; }
    return types[0];
}
function updateSummonSkeletons(dt) {
    const level = getPowerLevel(powers.summonSkeletons);
    if (!level || state.phase !== 'HUNT' || player.hp <= 0 || !ready('summonSkeletons', dt, getSpellCooldown(level.cooldown))) return;
    const B = POWER_MODELS.summonSkeletons.base;
    const target = nearestEnemy(player.x, player.y, B.triggerRange);
    const alive = state.converts.filter(a => a.summoned && a.hp > 0).length;
    if (!target || alive >= B.maxAlive) { state.powerTimers.summonSkeletons = 0.5; return; }       // ninguém perto (ou já tem todos): não gasta a recarga
    const toward = Math.atan2(target.y - player.y, target.x - player.x);
    const count = Math.min(B.perCast, B.maxAlive - alive);
    const hp = getSpellDamage() * level.hpPerMagic;           // a vida cresce com a MAGIA do herói (getSpellDamage)
    for (let i = 0; i < count; i++) {
        const a = toward + (i - (count - 1) / 2) * 0.9;
        const x = Math.max(20, Math.min(state.width - 20, player.x + Math.cos(a) * B.spawnDistance));
        const y = Math.max(160, Math.min(state.height - 20, player.y + Math.sin(a) * B.spawnDistance));
        const kind = pickSkeletonType(B.types);
        // Nasce como no Necromante: uma cova escura se abre no chão (telegraph 'grave', 0.7s) e, quando ela fecha, a terra voa e o esqueleto surge (boss_ai.js chama onSpawn)
        const damage = getSpellDamage() * level.damage / 1.4;        // 1.4 = CONVERSION.damageScale: cada mordida = dano de feitiço x level.damage
        const maxHp = Math.max(10, hp * kind.hp);
        state.telegraphs.push({
            kind: 'grave', radius: 18, age: 0, seconds: 0.7, monsterType: kind.type, x, y,
            onSpawn: () => {
                if (state.phase !== 'HUNT') return;
                const sk = createMonster(kind.type, state.turn, x, y);
                Object.assign(sk, SKELETON_ALLY_FIELDS, { summoned: true, emerge: null });
                sk.hp = sk.maxHp = maxHp;
                sk.damage = damage;
                state.converts.push(sk);
                createExplosion(x, y, '#4c1d95', 6);                 // e a energia negra do Curse Path
            }
        });
    }
    startCast();
    audio.playSummon?.();
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
    updateSummonSkeletons(dt);
    updateLaughingSkull(dt);
    updateIcePatches(dt);
    updateEmberTrail();
    updateGroundFires(dt);
    updateChainLightning(dt);
    updateSoulNova(dt);
    updateAbsoluteZero(dt);
    updateChiliBreath(dt);
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
