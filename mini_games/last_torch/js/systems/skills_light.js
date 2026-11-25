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
import { createHeroAnim } from '../../library/characters/hunter/hero_anim.js';
import { heroBladeTip } from '../../library/characters/hunter/hero25d.js';
import { lerpAngle } from '../../library/core/easing.js';

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
    // Um círculo por vez: a recarga só corre depois que o atual acaba, e enquanto ele existe nenhum outro é criado.
    // Mesmo com um círculo ativo, ele ainda precisa envelhecer e receber dano abaixo.
    if (L.grounds.length === 0 && level && ready('holyGround', dt, getSpellCooldown(level.cooldown))) {
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
    // Os frascos seguem mesmo com a Blessed Rain (evoluída): eles usam sempre os números do nível comprado, não os da chuva
    const vials = powers.holyWater.lvl > 0 ? M.levels[powers.holyWater.lvl - 1] : null;
    if (vials && ready('holyWater', dt, getSpellCooldown(vials.cooldown))) {
        const skip = new Set();
        for (let i = 0; i < vials.count; i++) {
            const t = nearestEnemy(player.x, player.y, M.range, skip);
            if (!t) break;
            skip.add(t);
            // Chuva abençoada: os frascos caem espalhados em volta do alvo
            const spread = powers.holyWater.evolved && i > 0 ? 40 : 0;
            const a = Math.random() * TAU;
            throwVial(t.x + Math.cos(a) * spread, t.y + Math.sin(a) * spread, vials);
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

// --- SACRED PENDANT ---
// O colar sagrado no peito do herói. Com monstros em cima dele, acende: uma onda branca sai do herói, joga todos para longe,
// atordoa e fere com magia. Desenho em js/render/light.js (renderPendant).
function updatePendant(dt) {
    const M = POWER_MODELS.sacredPendant;
    const P = L.pendant;
    if (P.flash > 0) P.flash = Math.max(0, P.flash - dt * 2.2);
    for (let i = L.pendantRings.length - 1; i >= 0; i--) {
        L.pendantRings[i].age += dt;
        if (L.pendantRings[i].age >= L.pendantRings[i].seconds) L.pendantRings.splice(i, 1);
    }
    const level = getPowerLevel(powers.sacredPendant);
    if (!level || state.phase !== 'HUNT' || player.hp <= 0) return;
    const timers = state.powerTimers;
    timers.sacredPendant = (timers.sacredPendant ?? getSpellCooldown(level.cooldown) * 0.4) - dt;
    if (timers.sacredPendant > 0) return;
    const near = state.enemies.some(e => e.hp > 0 && Math.hypot(e.x - player.x, e.y - player.y) < level.radius * M.wakeRatio + e.radius);
    if (!near) {
        timers.sacredPendant = 0.3;
        return;
    }
    timers.sacredPendant = getSpellCooldown(level.cooldown);
    const damage = getSpellDamage() * level.damage;
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d > level.radius + e.radius) continue;
        const a = Math.atan2(e.y - player.y, e.x - player.x);
        const push = level.knockback * (e.isBoss ? M.bossKnockbackRatio : 1);
        dealDamage(e, damage, { noCrit: true, style: 'spell', kbX: Math.cos(a) * push, kbY: Math.sin(a) * push });
        e.stunned = Math.max(e.stunned ?? 0, level.stun * (e.isBoss ? M.bossStunRatio : 1));
    }
    L.pendantRings.push({ age: 0, seconds: 0.55, radius: level.radius });
    P.flash = 1;
    addShockwave(player.x, player.y, { radius: level.radius, color: '#ffffff', width: 7, seconds: 0.4 });
    createExplosion(player.x, player.y, '#ffffff', 10);
    screenFlash('#ffffff', 0.1);
    shakeScreen(4);
    audio.playPendant?.();
}

// --- GUARDIAN ANGEL ---
// O anjo voa em volta da tocha e, com o cajado, lança bolas de luz nos monstros mais perto dela (quem ameaça a chama vem
// primeiro). A bola leva um instante no ar e estoura em área onde o monstro estiver. Desenho em js/render/light.js (renderAngel).
function landAngelShot(shot, level) {
    const e = shot.target;
    const x = e && e.hp > 0 ? e.x : shot.tx;
    const y = e && e.hp > 0 ? e.y : shot.ty;
    const damage = getSpellDamage() * level.damage;
    for (const m of state.enemies) {
        if (m.hp <= 0 || Math.hypot(m.x - x, m.y - y) > level.burst + m.radius) continue;
        const a = Math.atan2(m.y - y, m.x - x);
        dealDamage(m, damage, { noCrit: true, style: 'spell', kbX: Math.cos(a) * 70, kbY: Math.sin(a) * 70 });
    }
    L.bursts.push({ x, y, radius: level.burst, age: 0, seconds: 0.35 });
    createExplosion(x, y, '#fef9c3', 6);
    audio.playAngelHit?.();
}

// O posto do anjo: em cima e à esquerda da tocha
export function getAngelPost() {
    const P = POWER_MODELS.guardianAngel.guard.post;
    return { x: state.coreX + Math.cos(P.angle) * P.distance, y: state.coreY + Math.sin(P.angle) * P.distance };
}

// Provoca: o monstro comum por perto vai bater no anjo (enemies.js, no mesmo lugar do convertido do Avgustino). Devolve o anjo ou null.
// O dano chega por hurtConvert (hp e hitFlash); a queda é tratada aqui, em updateGuardianAngel.
export function provokingAngel(e) {
    const A = L.angel;
    if (!A.on || A.hp <= 0) return null;
    return Math.hypot(A.x - e.x, A.y - e.y) < POWER_MODELS.guardianAngel.provokeRadius ? A : null;
}

// O anjo vivo (em campo), ou null: golpes, projéteis e magias de monstros e chefes o acertam como acertam o herói e as sombras
export function liveAngel() {
    const A = L.angel;
    return A.on && A.hp > 0 ? A : null;
}

// Dano de monstro ou chefe no anjo (golpes em arco, estocadas, socos, explosões, magias de chefe, fogo no chão). Depois de um golpe ele
// fica invulnerável por um instante (como o herói e as sombras), para o mesmo golpe não contar várias vezes. Devolve true se levou o dano.
export function damageAngel(amount, invulnerableSeconds = 0.3) {
    const A = liveAngel();
    if (!A || A.iFrames > 0) return false;
    A.hp -= amount;
    A.hitFlash = 0.12;
    A.iFrames = invulnerableSeconds;
    return true;
}

// Tiro de monstro que acerta o anjo: ele ABSORVE o tiro (mesmo invulnerável: nesse caso sem dano) e leva o dano
export function hitAngelWithShot(p) {
    const A = liveAngel();
    if (!A || Math.hypot(A.x - p.x, A.y - p.y) > p.radius + A.radius) return false;
    damageAngel(p.damage, 0.12);
    return true;
}

// Anda em linha reta até (x, y) sem passar de speed; nunca sai da área de guarda em volta da tocha
function flyTo(A, x, y, speed, stop, dt) {
    const dx = x - A.x;
    const dy = y - A.y;
    const dist = Math.hypot(dx, dy);
    if (dist > stop) {
        const step = Math.min(dist - stop, speed * dt);
        A.x += (dx / dist) * step;
        A.y += (dy / dist) * step;
    }
    const fromX = A.x - state.coreX;
    const fromY = A.y - state.coreY;
    const out = Math.hypot(fromX, fromY);
    const { radius: area, minRadius, post } = POWER_MODELS.guardianAngel.guard;
    if (out > area) {
        A.x = state.coreX + (fromX / out) * area;
        A.y = state.coreY + (fromY / out) * area;
    } else if (out < minRadius) {
        // Perto demais da tocha: empurra para o raio mínimo, para o lado em que já estava (ou o do posto, se estiver em cima dela)
        const ax = out > 1 ? fromX / out : Math.cos(post.angle);
        const ay = out > 1 ? fromY / out : Math.sin(post.angle);
        A.x = state.coreX + ax * minRadius;
        A.y = state.coreY + ay * minRadius;
    }
}

// Distância de um ponto a um segmento (para saber se o monstro está no raio)
function distToSegment(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len2 = dx * dx + dy * dy || 1;
    const k = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / len2));
    return Math.hypot(px - (x0 + dx * k), py - (y0 + dy * k));
}

// Quantos monstros o raio pegaria nesta direção (chefe vale 3)
function beamScore(A, angle, length, width) {
    const x1 = A.x + Math.cos(angle) * length;
    const y1 = A.y + Math.sin(angle) * length;
    let score = 0;
    for (const e of state.enemies) {
        if (e.hp > 0 && distToSegment(e.x, e.y, A.x, A.y, x1, y1) <= width / 2 + e.radius) score += e.isBoss ? 3 : 1;
    }
    return score;
}

// A direção da maior fila de monstros ao alcance (a decisão é na hora do gesto; o raio não segue o alvo)
function pickBeamLine(A, level) {
    let best = null;
    for (const e of state.enemies) {
        if (e.hp <= 0 || Math.hypot(e.x - A.x, e.y - A.y) > level.beamLength + e.radius) continue;
        const angle = Math.atan2(e.y - A.y, e.x - A.x);
        const score = beamScore(A, angle, level.beamLength, level.beamWidth);
        const nearTorch = Math.hypot(e.x - state.coreX, e.y - state.coreY);
        if (!best || score > best.score || (score === best.score && nearTorch < best.nearTorch)) best = { angle, score, nearTorch };
    }
    return best;
}

// Archangel: o raio sai da ponta do cajado e cruza a tela toda (como o do Gudran, js/systems/fury.js), na direção em que o anjo OLHA
// (o gesto o vira para a maior fila de monstros antes). Fere e atordoa em pulsos tudo o que está no caminho.
function fireAngelBeam(A, level) {
    const E = EVOLUTIONS.guardianAngel;
    const { tip } = heroBladeTip(A, A.anim, 'angel');
    const angle = A.anim.facing;
    L.angelBeams.push({
        ox: A.x, oy: A.y, sx: tip.x, sy: tip.y, angle, dx: Math.cos(angle), dy: Math.sin(angle),
        age: 0, seconds: level.beamPulses * level.beamPulseSeconds + 0.3, pulse: 0,
        pulsesLeft: level.beamPulses, nextPulse: 0.1, pulseSeconds: level.beamPulseSeconds,
        width: level.beamWidth, damage: getSpellDamage() * level.beamDamage, stun: level.beamStun, bossStunRatio: E.bossStunRatio
    });
    screenFlash('#ffffff', 0.12);
    shakeScreen(3);
    audio.playAngelBeam?.();
}

function updateAngelBeams(dt) {
    for (let i = L.angelBeams.length - 1; i >= 0; i--) {
        const b = L.angelBeams[i];
        b.age += dt;
        while (b.pulsesLeft > 0 && b.age >= b.nextPulse) {
            b.pulsesLeft--;
            b.nextPulse += b.pulseSeconds;
            b.pulse = 1;
            const half = b.width / 2;
            for (const e of state.enemies) {
                if (e.hp <= 0) continue;
                // Só o que está à frente do anjo e dentro da largura do raio (o mesmo teste do raio do Gudran)
                const along = (e.x - b.ox) * b.dx + (e.y - b.oy) * b.dy;
                if (along < 0) continue;
                const across = Math.abs((e.x - b.ox) * -b.dy + (e.y - b.oy) * b.dx);
                if (across > half + e.radius) continue;
                dealDamage(e, b.damage, { noCrit: true, style: 'spell', kbX: b.dx * 50, kbY: b.dy * 50 });
                e.stunned = Math.max(e.stunned ?? 0, b.stun * (e.isBoss ? b.bossStunRatio : 1));
                createExplosion(e.x, e.y - e.radius, '#ffffff', 3);
            }
        }
        if (b.age >= b.seconds) L.angelBeams.splice(i, 1);
    }
}

function updateGuardianAngel(dt) {
    const M = POWER_MODELS.guardianAngel;
    const G = M.guard;
    const A = L.angel;
    const level = getPowerLevel(powers.guardianAngel);
    updateAngelBeams(dt);
    // Bolas no ar: seguem o alvo e estouram na chegada
    for (let i = L.angelShots.length - 1; i >= 0; i--) {
        const shot = L.angelShots[i];
        shot.age += dt;
        if (shot.target?.hp > 0) {
            shot.tx = shot.target.x;
            shot.ty = shot.target.y;
        }
        if (shot.age >= shot.seconds) {
            L.angelShots.splice(i, 1);
            if (level) landAngelShot(shot, level);
        }
    }
    // O gesto do cajado (golpe 'staffCast' do boneco): a bola sai no instante de impacto
    if (A.move) {
        A.move.age += dt;
        if (A.move.onImpact && A.move.age >= A.move.seconds * A.move.impactAt) {
            const fire = A.move.onImpact;
            A.move.onImpact = null;
            fire();
        }
        if (A.move.age >= A.move.seconds) A.move = null;
    }
    if (!level) {
        A.on = false;
        A.placed = false;
        A.move = null;
        return;
    }
    // Caído: espera no tempo e volta ao posto (o anel no chão mostra quanto falta)
    if (A.respawn > 0) {
        A.on = false;
        A.respawn -= dt;
        return;
    }
    const { x: postX, y: postY } = getAngelPost();
    A.maxHp = Math.round(getMaxPlayerHp() * level.hpRatio);
    if (!A.placed) {
        A.placed = true;
        A.x = postX;
        A.y = postY;
        A.hp = A.maxHp;
        A.lastHp = A.hp;
        A.ghost = A.hp;
        A.hurtFx = 0;
        createExplosion(A.x, A.y - 20, '#fef9c3', 16);
        A.anim = createHeroAnim(false);       // o anjo tem a própria animação, como a sombra do Shadow Clone
        A.anim.lastX = A.x;
        A.anim.lastY = A.y;
        A.anim.facing = Math.atan2(state.coreY - A.y, state.coreX - A.x);
    }
    A.on = true;
    A.hp = Math.min(A.hp, A.maxHp);
    if (A.hitFlash > 0) A.hitFlash -= dt;
    if (A.iFrames > 0) A.iFrames -= dt;
    if (A.hurtFx > 0) A.hurtFx = Math.max(0, A.hurtFx - dt * 3);
    // O rastro da barra de vida: fica onde estava e desce devagar até a vida de agora
    A.ghost = Math.max(A.hp, Math.min(A.maxHp, A.ghost) - A.maxHp * 0.5 * dt);
    // Levou golpe: empurrão e anel do motor do boneco (hitTime e hitDir), longe de quem bateu
    if (A.hp < A.lastHp) {
        let from = null;
        for (const e of state.enemies) if (e.hp > 0 && Math.hypot(e.x - A.x, e.y - A.y) < 80) { from = e; break; }
        const dx = A.x - (from ? from.x : A.x - 1);
        const dy = A.y - (from ? from.y : A.y);
        const len = Math.hypot(dx, dy) || 1;
        A.hitDirX = dx / len;
        A.hitDirY = dy / len;
        A.hitTime = performance.now();
        // Sentir o golpe: o anjo é branco, então o dano precisa de cor: piscada vermelha no corpo (desenho), faíscas e o número
        A.hurtFx = 1;
        const lost = A.lastHp - A.hp;
        createExplosion(A.x, A.y - 24, '#fb7185', 9);
        createExplosion(A.x, A.y - 24, '#fef9c3', 4);
        addNumber(A.x, A.y - 62, lost, -1, 'hurt');
        shakeScreen(2);
    }
    A.lastHp = A.hp;
    if (A.hp <= 0) {
        // Caiu: estoura em luz e volta ao posto depois de respawnSeconds
        createExplosion(A.x, A.y - 20, '#fef9c3', 26);
        addShockwave(A.x, A.y, { radius: 60, color: '#fde68a', width: 5, seconds: 0.4 });
        audio.playBlast?.();
        A.on = false;
        A.placed = false;
        A.move = null;
        A.respawn = M.respawnSeconds;
        return;
    }

    // O monstro mais perto da tocha dentro do alcance de guarda (quem ameaça a chama vem primeiro)
    let target = null;
    let best = G.radius + G.engage;
    if (state.phase === 'HUNT') {
        for (const e of state.enemies) {
            if (e.hp <= 0) continue;
            const d = Math.hypot(e.x - state.coreX, e.y - state.coreY) - e.radius;
            if (d < best) {
                best = d;
                target = e;
            }
        }
    }
    if (target) {
        // Fica entre o monstro e a tocha, a castDistance do monstro
        const dx = state.coreX - target.x;
        const dy = state.coreY - target.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(G.castDistance, dist);
        flyTo(A, target.x + (dx / dist) * pull, target.y + (dy / dist) * pull, G.moveSpeed, 6, dt);
        // Durante o gesto do raio a direção fica travada na fila escolhida
        if (!A.move?.fixedAngle) A.angle = Math.atan2(target.y - A.y, target.x - A.x);
    } else {
        flyTo(A, postX, postY, G.returnSpeed, 3, dt);
        // No posto, de frente para a tocha
        if (Math.hypot(A.x - postX, A.y - postY) < 6) {
            A.anim.facing = lerpAngle(A.anim.facing, Math.atan2(state.coreY - A.y, state.coreX - A.x), Math.min(1, dt * 3));
        }
    }
    if (!target || A.move) return;

    const timers = state.powerTimers;
    // Evoluído (Archangel): de tempos em tempos, em vez da bola, o raio de luz na maior fila de monstros (só quando pega ao menos 2,
    // ou quando já passou tempo demais esperando)
    if (powers.guardianAngel.evolved) {
        timers.angelBeam = (timers.angelBeam ?? level.beamEvery * 0.6) - dt;
        if (timers.angelBeam <= 0) {
            const line = pickBeamLine(A, level);
            if (line && (line.score >= 2 || timers.angelBeam < -3)) {
                timers.angelBeam = level.beamEvery;
                A.angle = line.angle;
                A.move = { kind: 'staffCast', age: 0, seconds: EVOLUTIONS.guardianAngel.beamCastSeconds, impactAt: 0.58, fixedAngle: true, onImpact: () => fireAngelBeam(A, level) };
                return;
            }
        }
    }
    timers.guardianAngel = (timers.guardianAngel ?? getSpellCooldown(level.cooldown) * 0.5) - dt;
    if (timers.guardianAngel > 0) return;
    // Os mais perto da tocha dentro do alcance do cajado
    const targets = state.enemies
        .filter(e => e.hp > 0 && Math.hypot(e.x - A.x, e.y - A.y) < M.range + e.radius)
        .sort((a, b) => Math.hypot(a.x - state.coreX, a.y - state.coreY) - Math.hypot(b.x - state.coreX, b.y - state.coreY));
    if (!targets.length) {
        timers.guardianAngel = 0.3;
        return;
    }
    timers.guardianAngel = getSpellCooldown(level.cooldown);
    A.angle = Math.atan2(targets[0].y - A.y, targets[0].x - A.x);
    const count = level.count;
    A.move = {
        kind: 'staffCast', age: 0, seconds: M.castSeconds, impactAt: 0.58,
        onImpact() {
            // A bola sai do cristal: a ponta do cajado no instante do gesto
            const { tip } = heroBladeTip(A, A.anim, 'angel');
            let fired = 0;
            for (let i = 0; i < count; i++) {
                const t = targets[i % targets.length];
                if (t.hp <= 0) continue;
                L.angelShots.push({ x0: tip.x, y0: tip.y, target: t, tx: t.x, ty: t.y, age: -i * 0.12, seconds: M.shotSeconds });
                fired++;
            }
            if (fired) audio.playAngelBolt?.();
        }
    };
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

// Tudo o que este arquivo causa de dano leva a marca 'light' (state.dmgSource): o Judgment só aumenta o dano das skills do Light Path
export function updateLightSkills(dt) {
    state.dmgSource = 'light';
    try {
        updateLightInner(dt);
    } finally {
        state.dmgSource = null;
    }
}

function updateLightInner(dt) {
    updateFaithShields(dt);
    updateChurchBell(dt);
    updatePendant(dt);
    updateGuardianAngel(dt);
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
    L.pendantRings.length = 0;
    L.pendant.flash = 0;
    L.angelShots.length = 0;
    L.angelBeams.length = 0;
    L.angel.move = null;
    L.angel.placed = false;
    L.angel.respawn = 0;
    L.rain = 0;
    L.rainTimer = 12;
}
