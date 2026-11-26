import { EXECUTIONER, FINAL_BLOW, PARRY, SHATTER_STRIKE, WAR_CRY } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { isFireCasting } from './knives.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { blast, dealDamage } from './damage.js';
import { addGibs, addShockwave, createExplosion, hitStop, screenFlash, shakeScreen, zoomPunch } from './effects.js';
import { addGroundFire } from './powers.js';
import { startMove } from './moves.js';
import { getAtkDamage, getBladeDamage } from './stats.js';

// --- SKILLS DA LÂMINA ---
// O guerreiro quer estar no meio da horda: matar acelera, ser cercado rende um rugido, quem sobra morre de um golpe.
// Desenho em js/render/skills.js; as poses em js/render/player25d.js.
const TAU = Math.PI * 2;

// --- BLOODLUST ---
export function feedBloodlust() {
    const level = getPowerLevel(powers.bloodlust);
    if (!level) return;
    const hunger = state.bloodlust;
    hunger.stacks = Math.min(level.stacks, hunger.stacks + 1);
    hunger.timer = level.seconds;
}

function updateBloodlust(dt) {
    const hunger = state.bloodlust;
    if (hunger.stacks <= 0) return;
    hunger.timer -= dt;
    if (hunger.timer > 0) return;
    hunger.stacks--;
    hunger.timer = POWER_MODELS.bloodlust.decaySeconds;
}

// --- CRIMSON TIDE ---
// Com a fome alta, cada golpe joga uma meia-lua de sangue que atravessa a horda
export function launchCrescent(angle) {
    if (!powers.bloodlust.evolved) return;
    const C = EVOLUTIONS.bloodlust.crescent;
    if (state.bloodlust.stacks < C.minStacks) return;
    // Executioner: a meia-lua vira TRÊS em leque (mesmo dano em cada uma) em vez de uma
    const fan = passives.executioner.lvl > 0 ? EXECUTIONER.crescents : 1;
    for (let i = 0; i < fan; i++) {
        const a = angle + (i - (fan - 1) / 2) * EXECUTIONER.spread;
        state.crescents.push({
            x: player.x, y: player.y, angle: a,
            vx: Math.cos(a) * C.speed, vy: Math.sin(a) * C.speed,
            travelled: 0, age: 0,
            damage: getBladeDamage() * C.damage,
            struck: new Set()
        });
    }
}

// Final Blow: o 3º golpe do combo causa o dobro de dano (o multiplicador entra no dano do golpe, em combat.js)
export function getFinalBlowMultiplier() {
    return passives.finalBlow.lvl > 0 ? FINAL_BLOW.damageMultiplier : 1;
}

// Shatter Strike: o monstro atingido pelo golpe fica "em voo" por windowSeconds; se bater num outro enquanto é empurrado, os dois levam dano baixo
export function markShatter(e) {
    if (passives.shatterStrike.lvl <= 0) return;
    e.shatterUntil = state.runTime + SHATTER_STRIKE.windowSeconds;
    e.shatterHit = new Set();
}

function updateShatter() {
    if (passives.shatterStrike.lvl <= 0) return;
    const S = SHATTER_STRIKE;
    for (const e of state.enemies) {
        if (!(e.shatterUntil > state.runTime) || e.hp <= 0 || Math.hypot(e.vx ?? 0, e.vy ?? 0) < S.minSpeed) continue;
        for (const o of state.enemies) {
            if (o === e || o.hp <= 0 || e.shatterHit.has(o) || Math.hypot(o.x - e.x, o.y - e.y) > e.radius + o.radius) continue;
            e.shatterHit.add(o);
            const a = Math.atan2(o.y - e.y, o.x - e.x);
            const damage = getAtkDamage() * S.damage;
            dealDamage(o, damage, { noCrit: true, kbX: Math.cos(a) * S.knockback, kbY: Math.sin(a) * S.knockback });
            dealDamage(e, damage * 0.5, { noCrit: true, quiet: true });
            createExplosion((e.x + o.x) / 2, (e.y + o.y) / 2 - 4, '#fde68a', 5);
        }
    }
}

function updateCrescents(dt) {
    const C = EVOLUTIONS.bloodlust.crescent;
    const { crescents } = state;
    for (let i = crescents.length - 1; i >= 0; i--) {
        const w = crescents[i];
        w.x += w.vx * dt;
        w.y += w.vy * dt;
        w.age += dt;
        w.travelled += (w.speed ?? C.speed) * dt;
        for (const e of state.enemies) {
            if (w.struck.has(e) || Math.hypot(e.x - w.x, e.y - w.y) > e.radius + (w.radius ?? C.radius)) continue;
            w.struck.add(e);
            dealDamage(e, w.damage, { kbX: Math.cos(w.angle) * 160, kbY: Math.sin(w.angle) * 160 });
            createExplosion(e.x, e.y, '#ef4444', 4);
        }
        if (w.travelled >= (w.range ?? C.range)) crescents.splice(i, 1);
    }
}

// --- EARTHBREAKER ---
// Rachaduras no chão: linhas irregulares que saem do impacto (sorteadas uma vez)
export function addCracks(x, y, radius, molten) {
    const rays = [];
    const count = 7 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * TAU + (Math.random() - 0.5) * 0.4;
        const points = [];
        const length = radius * (0.65 + Math.random() * 0.35);
        for (let s = 1; s <= 4; s++) {
            const reach = length * (s / 4);
            const side = (Math.random() - 0.5) * 16 * (s < 4 ? 1 : 0.4);
            points.push({
                x: Math.cos(angle) * reach - Math.sin(angle) * side,
                y: (Math.sin(angle) * reach + Math.cos(angle) * side) * 0.82
            });
        }
        rays.push(points);
    }
    state.cracks.push({ x, y, rays, life: 2.6, maxLife: 2.6, molten });
}

// Anel que fere e atordoa, usado pelo impacto e pelos abalos do Cataclysm
function quake(x, y, radius, damage, knockback, stun) {
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d > radius + e.radius) return;
        const a = Math.atan2(e.y - y, e.x - x);
        dealDamage(e, damage, { kbX: Math.cos(a) * knockback, kbY: Math.sin(a) * knockback, noCrit: true });
        if (!e.isBoss) e.stunned = Math.max(e.stunned ?? 0, stun);
    });
}

function slamImpact() {
    const level = getPowerLevel(powers.earthbreaker);
    if (!level) return;
    const M = POWER_MODELS.earthbreaker;
    const { x, y } = player;
    const evolved = powers.earthbreaker.evolved;
    quake(x, y, level.radius, getBladeDamage() * level.damage, M.knockback, M.stunSeconds);
    addCracks(x, y, level.radius * 1.1, evolved);
    addShockwave(x, y, { radius: level.radius, color: '#e7e0cf', width: 12, seconds: 0.4 });
    addShockwave(x, y, { radius: level.radius * 0.6, color: '#fb923c', width: 6, seconds: 0.3 });
    addGibs('ROCK', x, y, 1 + level.radius / 120);
    createExplosion(x, y, '#a8a29e', 14);
    shakeScreen(14);
    hitStop(0.08);
    zoomPunch(0.03);
    audio.playSlam();

    if (!evolved) return;
    const E = EVOLUTIONS.earthbreaker;
    for (let i = 1; i <= E.aftershocks; i++) {
        state.aftershocks.push({ x, y, delay: i * E.aftershockSeconds, radius: level.radius + i * E.aftershockStep, damage: level.damage * E.aftershockDamage });
    }
    for (let i = 0; i < E.lava.count; i++) {
        const a = (i / E.lava.count) * TAU + Math.random() * 0.5;
        const r = level.radius * (0.45 + Math.random() * 0.5);
        addGroundFire(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.82, { life: E.lava.life, radius: E.lava.radius, dps: E.lava.dps, evolved: true });
    }
}

function updateAftershocks(dt) {
    const { aftershocks } = state;
    for (let i = aftershocks.length - 1; i >= 0; i--) {
        const s = aftershocks[i];
        s.delay -= dt;
        if (s.delay > 0) continue;
        aftershocks.splice(i, 1);
        quake(s.x, s.y, s.radius, getBladeDamage() * s.damage, POWER_MODELS.earthbreaker.knockback * 0.5, 0.3);
        addShockwave(s.x, s.y, { radius: s.radius, color: '#fb923c', width: 8, seconds: 0.35 });
        shakeScreen(6);
        audio.playSlam(0.6);
    }
}

function updateEarthbreaker(dt) {
    const level = getPowerLevel(powers.earthbreaker);
    if (!level) return;
    const timers = state.powerTimers;
    timers.earthbreaker = (timers.earthbreaker ?? level.cooldown * 0.4) - dt;
    // Pronto, espera ter alguém perto: o golpe nunca é gasto no vazio
    if (timers.earthbreaker > 0 || player.move || player.dashTimer > 0 || isFireCasting()) return;
    const near = state.enemies.some(e => Math.hypot(e.x - player.x, e.y - player.y) < level.radius * 0.8 + e.radius);
    if (!near) return;
    timers.earthbreaker = level.cooldown;
    startMove('slam', slamImpact);
    // No ar nada encosta nele: o salto também é uma esquiva
    player.iFrames = Math.max(player.iFrames, player.move.seconds * player.move.impactAt);
}

// --- PARRY ---
// O golpe corpo a corpo que ia acertar o herói é desviado com a espada (hurtPlayer chama aqui antes de tirar vida). Quem bateu
// leva o contragolpe e fica atordoado, e os vizinhos também (PARRY, em data_model/passives.js). Devolve true se o golpe foi desviado.
export function tryParry(attacker) {
    const P = PARRY;
    if (passives.parry.lvl <= 0 || !attacker || attacker.hp <= 0 || (state.powerTimers.parry ?? 0) > 0) return false;
    // Salto, rugido ou dash em andamento têm a própria defesa; o aparo não os interrompe
    if (player.move || player.dashTimer > 0) return false;
    state.powerTimers.parry = P.cooldown;
    startMove('parry');
    player.iFrames = Math.max(player.iFrames, P.invulnerableSeconds);

    const a = Math.atan2(attacker.y - player.y, attacker.x - player.x);
    const mx = player.x + Math.cos(a) * (attacker.radius + 6) * 0.7;
    const my = player.y + Math.sin(a) * (attacker.radius + 6) * 0.7 - 8;
    const stun = (e) => { e.stunned = Math.max(e.stunned ?? 0, e.isBoss ? P.stun * P.bossStunRatio : P.stun); };
    dealDamage(attacker, getAtkDamage() * P.damage, { kbX: Math.cos(a) * P.knockback, kbY: Math.sin(a) * P.knockback, noCrit: true });
    stun(attacker);
    if (P.radius > 0) {
        for (const e of state.enemies) {
            if (e === attacker || e.hp <= 0 || Math.hypot(e.x - attacker.x, e.y - attacker.y) > P.radius + e.radius) continue;
            e.stunned = Math.max(e.stunned ?? 0, (e.isBoss ? P.bossStunRatio : 1) * P.stun * 0.5);
        }
        addShockwave(attacker.x, attacker.y, { radius: P.radius, color: '#bae6fd', width: 4, seconds: 0.3 });
    }
    // O "clang": faíscas de aço e um anel curto onde as lâminas se cruzam
    createExplosion(mx, my, '#e0f2fe', 14);
    createExplosion(mx, my, '#fde68a', 8);
    addShockwave(mx, my, { radius: 44, color: '#f8fafc', width: 5, seconds: 0.22 });
    screenFlash('#e0f2fe', 0.12);
    shakeScreen(5);
    hitStop(0.07);
    audio.playParry?.();
    return true;
}

function updateParry(dt) {
    if ((state.powerTimers.parry ?? 0) > 0) state.powerTimers.parry -= dt;
}

// --- WAR CRY ---
function warCryImpact() {
    const { x, y } = player;
    state.warCryTimer = WAR_CRY.bonusSeconds;
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d > WAR_CRY.radius + e.radius) return;
        const a = Math.atan2(e.y - y, e.x - x);
        dealDamage(e, getAtkDamage() * WAR_CRY.damage, { kbX: Math.cos(a) * WAR_CRY.knockback, kbY: Math.sin(a) * WAR_CRY.knockback, noCrit: true });
        if (!e.isBoss) e.stunned = Math.max(e.stunned ?? 0, WAR_CRY.stunSeconds);
    });
    addShockwave(x, y, { radius: WAR_CRY.radius, color: '#ef4444', width: 10, seconds: 0.45 });
    addShockwave(x, y, { radius: WAR_CRY.radius * 0.65, color: '#fecaca', width: 5, seconds: 0.35 });
    screenFlash('#ef4444', 0.18);
    shakeScreen(10);
    audio.playRoar();
}

function updateWarCry(dt) {
    if (state.warCryTimer > 0) state.warCryTimer -= dt;
    if (passives.warCry.lvl <= 0) return;
    const timers = state.powerTimers;
    if ((timers.warCry ?? 0) > 0) {
        timers.warCry -= dt;
        return;
    }
    if (player.move || state.phase !== 'HUNT' || isFireCasting()) return;
    let around = 0;
    for (const e of state.enemies) {
        if (Math.hypot(e.x - player.x, e.y - player.y) < WAR_CRY.triggerRadius + e.radius) around++;
    }
    if (around < WAR_CRY.monsters) return;
    timers.warCry = WAR_CRY.cooldownSeconds;
    startMove('roar', warCryImpact);
}

export function updateBladeSkills(dt) {
    updateShatter();
    updateBloodlust(dt);
    updateCrescents(dt);
    updateEarthbreaker(dt);
    updateAftershocks(dt);
    updateWarCry(dt);
    updateParry(dt);
    for (let i = state.executions.length - 1; i >= 0; i--) {
        state.executions[i].age += dt;
        if (state.executions[i].age >= state.executions[i].seconds) state.executions.splice(i, 1);
    }
}

export function clearBladeSkills() {
    state.crescents.length = 0;
    state.aftershocks.length = 0;
    state.executions.length = 0;
    state.cracks.length = 0;
}

export function updateCracks(dt) {
    const { cracks } = state;
    for (let i = cracks.length - 1; i >= 0; i--) {
        cracks[i].life -= dt;
        if (cracks[i].life <= 0) cracks.splice(i, 1);
    }
}
