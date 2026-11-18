import { CHARACTER_MODEL } from '../../data_model/character.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { BLUE_TORCH, FIREBALLS, FIRE_TORNADO, HEARTH_PHOENIX, FLAME_BLADE, PHOENIX_PACT } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { updateHUD } from '../ui/hud.js';
import { blast, dealDamage, ignite } from './damage.js';
import { addShockwave, createExplosion, screenFlash, shakeScreen, slowMotion } from './effects.js';
import { wander, followRate } from './companions.js';
import { mod } from './modifiers.js';
import { hearthPhoenixBeak, hearthPhoenixView, phoenixBeak } from '../render/phoenix.js';
import { addGroundFire, nearestEnemy, ready } from './powers.js';
import { getSpellCooldown, getSpellDamage, getTorchFireDamage, getWarmthRadius } from './stats.js';

// --- SKILLS DA CHAMA ---
// O guardião ganha com paciência: fica perto da tocha, firme, e deixa o fogo trabalhar.
// Desenho em js/render/skills.js.

// --- HEARTH RING ---
function updateFireRing(dt) {
    const level = getPowerLevel(powers.fireRing);
    if (!level) return;
    const M = POWER_MODELS.fireRing;
    const tick = ready('fireRing', dt, M.tickSeconds);
    const damage = getTorchFireDamage() * level.dps * M.tickSeconds;
    for (const e of state.enemies) {
        const d = Math.hypot(e.x - state.coreX, e.y - state.coreY);
        if (Math.abs(d - level.radius) > M.width + e.radius) continue;
        e.slow = Math.max(e.slow ?? 0, level.slow);
        if (tick) dealDamage(e, damage, { noCrit: true, quiet: true, torchFire: true });
    }
    if (powers.fireRing.evolved) updateSolarFlare(dt, level);
}

// Solar Wall: de tempos em tempos a muralha sobe e joga para longe quem está nela
function updateSolarFlare(dt, level) {
    const F = EVOLUTIONS.fireRing.flare;
    if (!ready('solarFlare', dt, F.seconds)) return;
    const damage = getTorchFireDamage() * F.damage;
    for (const e of state.enemies) {
        const dx = e.x - state.coreX;
        const dy = e.y - state.coreY;
        const d = Math.hypot(dx, dy) || 1;
        if (Math.abs(d - level.radius) > F.reach + e.radius) continue;
        const push = e.isBoss ? 0 : F.knockback;
        dealDamage(e, damage, { kbX: (dx / d) * push, kbY: (dy / d) * push, noCrit: true, style: 'spell', torchFire: true });
    }
    addShockwave(state.coreX, state.coreY, { radius: level.radius + F.reach, color: isBlueTorch() ? '#bae6fd' : '#fef08a', width: 10, seconds: 0.4 });
    audio.playNova();
}

// --- TORCH WARD ---
// Um escudo de chama protege a tocha e se renova sozinho. Cada nível guarda mais escudos, renova mais rápido e repele de mais longe.
export function isBlueTorch() {
    return passives.blueTorch.lvl > 0;
}

function updateTorchWard(dt) {
    const W = state.torchWard;
    const level = getPowerLevel(powers.torchWard);
    if (!level) {
        W.charges = 0;
        W.timer = 0;
        return;
    }
    if (W.flash > 0) W.flash -= dt;
    W.charges = Math.min(W.charges, level.charges);
    if (W.charges >= level.charges) {
        W.timer = 0;
        return;
    }
    W.timer += dt;
    if (W.timer < level.cooldown) return;
    W.timer = 0;
    W.charges++;
    addShockwave(state.coreX, state.coreY, { radius: 52, color: wardColor(), width: 4, seconds: 0.4 });
    audio.playShield();
}

function wardColor() {
    return isBlueTorch() ? '#93c5fd' : '#fde68a';
}

// Um tiro inimigo ia acertar a tocha: o escudo o devolve. Devolve true se havia escudo
export function wardSpendForShot(x, y) {
    const W = state.torchWard;
    if (!getPowerLevel(powers.torchWard) || W.charges <= 0) return false;
    W.charges--;
    W.flash = 0.35;
    addShockwave(x, y, { radius: 36, color: wardColor(), width: 5, seconds: 0.3 });
    return true;
}

// Gasta um escudo: todo monstro em volta é jogado para longe e atordoado (o chefe só leva o empurrão menor). Devolve false se não havia escudo.
// `source` é o monstro que tocou a tocha (ele nunca fica dentro do raio da chama)
export function wardTorch(source = null) {
    const W = state.torchWard;
    const level = getPowerLevel(powers.torchWard);
    if (!level || W.charges <= 0) return false;
    W.charges--;
    W.flash = 0.5;
    const color = wardColor();
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        const dx = e.x - state.coreX;
        const dy = e.y - state.coreY;
        const d = Math.hypot(dx, dy) || 1;
        if (e !== source && d > level.radius + e.radius) continue;
        const push = level.knockback * (1 - (e.knockbackResist ?? 0)) * (e.isBoss ? 0.35 : 1);
        e.vx += (dx / d) * push;
        e.vy += (dy / d) * push;
        if (!e.isBoss) e.stunned = Math.max(e.stunned ?? 0, level.stun);
        const out = state.coreX + (dx / d) * (CORE_MODEL.collisionRadius + e.radius + 4);
        const outY = state.coreY + (dy / d) * (CORE_MODEL.collisionRadius + e.radius + 4);
        if (d < CORE_MODEL.collisionRadius + e.radius + 4) {
            e.x = out;
            e.y = outY;
        }
    }
    addShockwave(state.coreX, state.coreY, { radius: level.radius, color, width: 9, seconds: 0.4 });
    addShockwave(state.coreX, state.coreY, { radius: level.radius * 0.6, color: '#ffffff', width: 4, seconds: 0.28 });
    createExplosion(state.coreX, state.coreY - 20, color, 14);
    shakeScreen(5);
    audio.playShieldBreak();
    return true;
}

// --- BLUE TORCH ---
// O frio da chama azul: quem está no calor da tocha fica lento e, enquanto durar, leva mais dano de tudo (damage.js)
const CHILL_SECONDS = 0.35;
function updateBlueTorch(dt) {
    const on = isBlueTorch();
    const reach = getWarmthRadius();
    for (const e of state.enemies) {
        if (e.chilled > 0) e.chilled -= dt;
        if (!on || e.hp <= 0 || Math.hypot(e.x - state.coreX, e.y - state.coreY) > reach + e.radius) continue;
        e.slow = Math.max(e.slow ?? 0, BLUE_TORCH.chill);
        e.chilled = CHILL_SECONDS;
    }
}

// --- PHOENIX PACT ---
// A fênix voa no ombro do herói, do lado de trás de quem anda, e olha para o alvo ao atirar
export function updatePhoenix(dt) {
    const bird = state.phoenix;
    if (passives.phoenixPact.lvl <= 0 || state.phoenixSpent) {
        bird.placed = false;
        return;
    }
    const P = PHOENIX_PACT;
    const t = state.runTime;
    const moved = player.x - (bird.heroX ?? player.x);
    bird.heroX = player.x;
    if (Math.abs(moved) > 0.3) bird.side = moved > 0 ? -1 : 1;
    const drift = wander(t, 0);
    const homeX = player.x + bird.side * P.shoulderX + drift.x;
    const homeY = player.y + P.shoulderY + drift.y;
    if (!bird.placed) {
        bird.x = homeX;
        bird.y = homeY;
        bird.placed = true;
        bird.rise = 0;
        bird.facing = -bird.side;
        createExplosion(homeX, homeY, '#fde047', 10);
        addShockwave(homeX, homeY, { radius: 44, color: '#fb923c', width: 4, seconds: 0.4 });
        audio.playPhoenixRise();
    }
    const pull = Math.min(1, dt * followRate(P.followSpeed));
    const vx = (homeX - bird.x) * pull;
    bird.x += vx;
    bird.y += (homeY - bird.y) * pull;
    bird.tilt += (Math.max(-0.3, Math.min(0.3, vx * 0.05)) - bird.tilt) * Math.min(1, dt * 8);
    bird.rise = Math.min(1, bird.rise + dt / P.riseSeconds);
    if (bird.flash > 0) bird.flash -= dt;
    if (bird.look > 0) bird.look -= dt;
    else bird.facing = -bird.side;

    if (bird.rise < 1 || !ready('phoenixFire', dt, getSpellCooldown(P.cooldownSeconds))) return;
    const target = nearestEnemy(player.x, player.y, P.range);
    if (!target) return;
    bird.facing = target.x >= bird.x ? 1 : -1;
    bird.look = 0.6;
    bird.flash = 0.16;
    const from = phoenixBeak(bird.x, bird.y, bird.facing);
    const a = Math.atan2(target.y - from.y, target.x - from.x);
    state.bolts.push({
        x: from.x, y: from.y,
        vx: Math.cos(a) * P.speed, vy: Math.sin(a) * P.speed,
        speed: P.speed, turnRate: P.turnRate,
        target, fire: true, style: 'spell',
        damage: getSpellDamage() * P.boltDamage,
        life: 1.8,
        onHit: burstPhoenixFire
    });
    // Recua com o tiro, como quem cospe o fogo
    bird.x -= Math.cos(a) * 6;
    bird.y -= Math.sin(a) * 6;
    audio.playBolt();
}

// A bola de fogo acertou: o alvo queima e a explosão alcança os vizinhos
function burstPhoenixFire(b, hit) {
    const P = PHOENIX_PACT;
    ignite(hit, b.damage * P.burnRatio, P.burnSeconds);
    for (const e of state.enemies) {
        if (e === hit || e.hp <= 0 || Math.hypot(e.x - b.x, e.y - b.y) > P.splashRadius + e.radius) continue;
        dealDamage(e, b.damage * P.splashRatio, { noCrit: true, quiet: true });
        ignite(e, b.damage * P.burnRatio, P.burnSeconds);
    }
    addShockwave(b.x, b.y, { radius: P.splashRadius, color: '#fb923c', width: 3, seconds: 0.24 });
}

// Devolve true se a fênix morreu para o herói levantar
export function tryPhoenix() {
    if (passives.phoenixPact.lvl <= 0 || state.phoenixSpent) return false;
    const bird = state.phoenix;
    state.phoenixSpent = true;
    // A ave mergulha no herói e vira as asas de fogo em volta dele (js/render/skills.js)
    state.phoenixFx = { x: player.x, y: player.y, age: 0, seconds: 1.3 };
    if (bird.placed) {
        Object.assign(state.phoenixFx, { fromX: bird.x, fromY: bird.y, facing: bird.facing });
        createExplosion(bird.x, bird.y, '#fde047', 16);
    }
    bird.placed = false;
    player.hp = player.maxHp * PHOENIX_PACT.healRatio;
    player.iFrames = PHOENIX_PACT.invulnerableSeconds;
    state.enemyProjectiles.length = 0;
    state.blastBudget++;
    blast(player.x, player.y, PHOENIX_PACT.radius, getSpellDamage() * PHOENIX_PACT.damage, PHOENIX_PACT.knockback, '#fb923c', 'spell');
    addShockwave(player.x, player.y, { radius: PHOENIX_PACT.radius * 1.3, color: '#fde047', width: 12, seconds: 0.7 });
    createExplosion(player.x, player.y, '#fb923c', 30);
    slowMotion(0.3, 0.7);
    screenFlash('#fb923c', 0.6);
    shakeScreen(14);
    showBanner('', 'REBORN', 'The phoenix gave its life', 'gold');
    audio.playPhoenix();
    updateHUD();
    return true;
}

// A tocha apagou: a fênix se joga na chama e a reacende com metade da vida (uma vez por hora, a mesma vida da fênix que levanta o herói).
// Devolve true se a tocha foi salva
export function tryPhoenixTorch() {
    if (passives.phoenixPact.lvl <= 0 || state.phoenixSpent) return false;
    const bird = state.phoenix;
    state.phoenixSpent = true;
    state.phoenixFx = { x: state.coreX, y: state.coreY - 20, age: 0, seconds: 1.3 };
    if (bird.placed) {
        Object.assign(state.phoenixFx, { fromX: bird.x, fromY: bird.y, facing: bird.facing });
        createExplosion(bird.x, bird.y, '#fde047', 16);
    }
    bird.placed = false;
    state.coreHp = state.coreHpMax * 0.5;
    // Protege o herói também: o pulso de fogo sai da tocha e os tiros voam longe
    player.iFrames = Math.max(player.iFrames, PHOENIX_PACT.invulnerableSeconds);
    state.enemyProjectiles.length = 0;
    state.blastBudget++;
    blast(state.coreX, state.coreY, PHOENIX_PACT.radius, getSpellDamage() * PHOENIX_PACT.damage, PHOENIX_PACT.knockback, '#fb923c', 'spell');
    addShockwave(state.coreX, state.coreY, { radius: PHOENIX_PACT.radius * 1.3, color: '#fde047', width: 12, seconds: 0.7 });
    createExplosion(state.coreX, state.coreY - 20, '#fb923c', 30);
    slowMotion(0.3, 0.7);
    screenFlash('#fb923c', 0.6);
    shakeScreen(14);
    showBanner('', 'THE TORCH LIVES', 'The phoenix gave its life', 'gold');
    audio.playPhoenix();
    updateHUD();
    return true;
}

// --- HEARTH PHOENIX ---
// Uma fênix de fogo nasce da tocha, rodeia a chama e atira nos monstros que chegam perto dela
function updateHearthPhoenix(dt) {
    const bird = state.hearthBird;
    if (passives.hearthPhoenix.lvl <= 0) {
        bird.placed = false;
        return;
    }
    const H = HEARTH_PHOENIX;
    const t = state.runTime;
    const a = t * H.orbitSpeed;
    const homeX = state.coreX + Math.cos(a) * H.orbit;
    const homeY = state.coreY + H.hoverY + Math.sin(a) * H.orbit * H.orbitFlat;
    if (!bird.placed) {
        bird.x = state.coreX;
        bird.y = state.coreY - 40;
        bird.placed = true;
        bird.rise = 0;
        bird.breath = 0;
        bird.breathCd = 4;
        createExplosion(bird.x, bird.y, '#fde047', 12);
        addShockwave(bird.x, bird.y, { radius: 50, color: '#fb923c', width: 4, seconds: 0.4 });
        audio.playPhoenixRise();
    }
    const pull = Math.min(1, dt * followRate(H.followSpeed));
    const vx = (homeX - bird.x) * pull;
    const vy = (homeY - bird.y) * pull;
    bird.x += vx;
    bird.y += vy;
    bird.tilt += (Math.max(-0.3, Math.min(0.3, vx * 0.05)) - bird.tilt) * Math.min(1, dt * 8);
    bird.rise = Math.min(1, bird.rise + dt / H.riseSeconds);
    if (bird.flash > 0) bird.flash -= dt;
    if (bird.look > 0) bird.look -= dt;
    else if (Math.abs(vx) > 0.02) bird.facing = vx >= 0 ? 1 : -1;

    // Para onde ela olha: o jato ou o tiro (alvo) ou a direção do voo. Daí vêm o lado do desenho e a boca do fogo.
    if (bird.breath > 0) {
        bird.dirX = Math.cos(bird.breathAng);
        bird.dirY = Math.sin(bird.breathAng);
    } else if (bird.look <= 0 && dt > 0) {
        const n = Math.hypot(vx, vy) || 1;
        const k = Math.min(1, dt * 5);
        bird.dirX += (vx / n - bird.dirX) * k;
        bird.dirY += (vy / n - bird.dirY) * k;
    }
    // Trocar de desenho (lado) ou de direção só depois de um tempo parada: evita o sprite piscar entre duas visões quando ela gira
    bird.hold = (bird.hold ?? 0) - dt;
    if (bird.hold <= 0) {
        const view = hearthPhoenixView(bird.dirX, bird.dirY);
        const face = Math.abs(bird.dirX) > 0.2 ? (bird.dirX >= 0 ? 1 : -1) : bird.facing;
        if (view !== bird.view || face !== bird.facing) {
            bird.view = view;
            bird.facing = face;
            bird.hold = bird.breath > 0 ? 0.5 : 0.25;
        }
    }
    // A boca do fogo anda macia até o bico (sem pulos quando o desenho troca)
    const beak = hearthPhoenixBeak(bird.x, bird.y, bird.facing, bird.view);
    const bk = Math.min(1, dt * 30);
    bird.beakX = bird.beakX === undefined ? beak.x : bird.beakX + (beak.x - bird.beakX) * bk;
    bird.beakY = bird.beakY === undefined ? beak.y : bird.beakY + (beak.y - bird.beakY) * bk;

    if (state.phase !== 'HUNT') bird.breath = 0;
    if (bird.rise < 1) return;
    if (bird.breath > 0) {
        updateHearthBreath(bird, dt, H);
        return;
    }
    bird.breathCd -= dt;
    if (bird.breathCd <= 0) {
        const foe = nearestEnemy(state.coreX, state.coreY, H.range);
        if (foe) {
            const from = hearthPhoenixBeak(bird.x, bird.y, bird.facing, bird.view);
            bird.breath = H.breathSeconds;
            bird.breathAng = Math.atan2(foe.y - from.y, foe.x - from.x);
            bird.breathCd = getSpellCooldown(H.breathCooldown);
            bird.breathTick = 0;
            bird.look = 0;
            audio.playPhoenixRise();
            return;
        }
    }

    if (!ready('hearthPhoenix', dt, getSpellCooldown(H.cooldownSeconds))) return;
    const target = nearestEnemy(state.coreX, state.coreY, H.range);
    if (!target) return;
    const ang0 = Math.atan2(target.y - bird.y, target.x - bird.x);
    bird.dirX = Math.cos(ang0);
    bird.dirY = Math.sin(ang0);
    bird.view = hearthPhoenixView(bird.dirX, bird.dirY);
    bird.facing = target.x >= bird.x ? 1 : -1;
    bird.look = 0.6;
    bird.flash = 0.16;
    const from = hearthPhoenixBeak(bird.x, bird.y, bird.facing, bird.view);
    const ang = Math.atan2(target.y - from.y, target.x - from.x);
    const blue = isBlueTorch();
    state.bolts.push({
        x: from.x, y: from.y,
        vx: Math.cos(ang) * H.speed, vy: Math.sin(ang) * H.speed,
        speed: H.speed, turnRate: H.turnRate,
        target, fire: !blue, blue, style: 'spell', torchFire: true,
        damage: getTorchFireDamage() * H.boltDamage,
        life: 1.8,
        onHit: burstPhoenixFire
    });
    audio.playBolt();
}

// O sopro: o jato segue o monstro mais perto e queima todos no cone (dano em pulsos, e quem é pego continua em chamas)
function updateHearthBreath(bird, dt, H) {
    bird.breath -= dt;
    const from = { x: bird.beakX, y: bird.beakY };
    const foe = nearestEnemy(from.x, from.y, H.breathRange + 60);
    if (foe) {
        const want = Math.atan2(foe.y - from.y, foe.x - from.x);
        let diff = want - bird.breathAng;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        const turn = H.breathTurn * dt;
        bird.breathAng += Math.max(-turn, Math.min(turn, diff));
    }
    bird.breathTick -= dt;
    if (bird.breathTick > 0) return;
    bird.breathTick = H.breathTick;
    audio.playFlame();
    const damage = getTorchFireDamage() * H.breathDamage;
    const half = H.breathArc / 2;
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        const dx = e.x - from.x, dy = e.y - from.y;
        const d = Math.hypot(dx, dy);
        if (d > H.breathRange + e.radius) continue;
        let diff = Math.atan2(dy, dx) - bird.breathAng;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        // quem está perto precisa de mais folga de ângulo (o corpo dele tem largura)
        if (Math.abs(diff) > half + Math.atan2(e.radius, Math.max(d, 1))) continue;
        dealDamage(e, damage, { noCrit: true, quiet: true });
        ignite(e, damage * 0.8, H.breathBurnSeconds);
    }
}

// --- FIRE TORNADO ---
// De tempos em tempos um furacão de fogo se forma sobre a tocha e castiga tudo dentro do círculo tracejado (o calor da tocha)
function updateFireTornado(dt) {
    const T = state.fireTornado;
    // Fora da caçada (fim da onda, acampamento) o furacão se desfaz na hora; sem a skill também
    if (passives.fireTornado.lvl <= 0 || state.phase !== 'HUNT') {
        T.left = 0;
        if (passives.fireTornado.lvl <= 0) T.wait = null;
        return;
    }
    const F = FIRE_TORNADO;
    if (T.left <= 0) {
        if (T.wait === null) T.wait = F.firstDelaySeconds;      // acabou de aprender (ou de começar a noite)
        if (T.wait > 0) {
            T.wait = Math.max(0, T.wait - dt);
            return;
        }
        // Pronto: só se forma quando há monstro dentro do círculo de calor da tocha (senão espera, sem gastar a recarga)
        const reach = FIRE_TORNADO.radius;
        if (!state.enemies.some((e) => e.hp > 0 && Math.hypot(e.x - state.coreX, e.y - state.coreY) <= reach + e.radius)) return;
        T.left = F.durationSeconds;
        T.age = 0;
        T.tick = 0;
        T.wait = getSpellCooldown(F.cooldownSeconds);
        shakeScreen(6);
        audio.playPhoenixRise();
        addShockwave(state.coreX, state.coreY, { radius: reach, color: '#fb923c', width: 5, seconds: 0.5 });
        return;
    }
    T.left -= dt;
    T.age += dt;
    T.wait = Math.max(0, T.wait - dt);
    T.tick -= dt;
    const reach = FIRE_TORNADO.radius;
    const pulse = T.tick <= 0;
    if (pulse) {
        T.tick = F.tickSeconds;
        audio.playFlame();
    }
    const damage = getTorchFireDamage() * F.damage;
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        const dx = state.coreX - e.x, dy = state.coreY - e.y;
        const d = Math.hypot(dx, dy);
        if (d > reach + e.radius) continue;
        // o redemoinho puxa para dentro (os mais pesados, chefes, nem sentem)
        if (!e.isBoss && !e.immovable && d > 30) {
            const k = Math.min(F.pull * dt, d - 30) / d;
            e.x += dx * k;
            e.y += dy * k;
        }
        if (!pulse) continue;
        dealDamage(e, damage, { noCrit: true, quiet: true, torchFire: true });
        ignite(e, damage * 0.6, F.burnSeconds);
    }
}

// --- JURAMENTO DA CHAMA ---
// O calor da tocha também queima quem entra nele
function updateWarmthBurn(dt) {
    const burn = mod('warmthBurn');
    if (burn <= 0 || !ready('warmthBurn', dt, 0.5)) return;
    const reach = getWarmthRadius();
    const damage = getSpellDamage() * burn * 0.5;
    for (const e of state.enemies) {
        if (Math.hypot(e.x - state.coreX, e.y - state.coreY) > reach + e.radius) continue;
        dealDamage(e, damage, { noCrit: true, quiet: true });
    }
}

// Monstros em chamas (Flaming Sword e Fireballs)
const BURN_TICK = 0.5;
function updateBurns(dt) {
    for (const e of state.enemies) {
        if (!(e.burnTimer > 0)) continue;
        e.burnTimer -= dt;
        e.burnTick = (e.burnTick ?? 0) + dt;
        if (e.burnTick < BURN_TICK) continue;
        e.burnTick -= BURN_TICK;
        dealDamage(e, e.burnDps * BURN_TICK, { noCrit: true, quiet: true });
    }
}

// Fireballs: a adaga acertou. O alvo pega fogo e a explosão alcança os vizinhos
export function burstFireball(k, hit) {
    const radius = FIREBALLS.splashRadius * k.scale;
    const dps = k.damage * FIREBALLS.burnRatio;
    ignite(hit, dps, FIREBALLS.burnSeconds);
    for (const e of state.enemies) {
        if (e === hit || e.hp <= 0 || Math.hypot(e.x - k.x, e.y - k.y) > radius + e.radius) continue;
        dealDamage(e, k.damage * FIREBALLS.splashRatio, { noCrit: true, quiet: true });
        ignite(e, dps, FIREBALLS.burnSeconds);
    }
    addGroundFire(k.x, k.y, { life: FIREBALLS.patchSeconds, radius: radius * 0.7, dps: FIREBALLS.patchDps, evolved: false });
    addShockwave(k.x, k.y, { radius, color: '#fb923c', width: 4, seconds: 0.26 });
    createExplosion(k.x, k.y, '#fb923c', 9);
}

// Flaming Sword: monstro em chamas que morre passa o fogo a quem está perto
export function spreadBurn(dead) {
    if (passives.flameBlade.lvl <= 0 || !(dead.burnTimer > 0)) return;
    let any = false;
    for (const e of state.enemies) {
        if (e === dead || e.hp <= 0 || Math.hypot(e.x - dead.x, e.y - dead.y) > FLAME_BLADE.spreadRadius + e.radius) continue;
        ignite(e, dead.burnDps, FLAME_BLADE.burnSeconds);
        any = true;
    }
    if (any) addShockwave(dead.x, dead.y, { radius: FLAME_BLADE.spreadRadius, color: '#fb923c', width: 3, seconds: 0.3 });
}

export function updateFlameSkills(dt) {
    updateBurns(dt);
    updateFireRing(dt);
    updateTorchWard(dt);
    updateBlueTorch(dt);
    updateHearthPhoenix(dt);
    updateFireTornado(dt);
    updateWarmthBurn(dt);
    updatePhoenix(dt);
    const fx = state.phoenixFx;
    if (fx) {
        fx.age += dt;
        if (fx.age >= fx.seconds) state.phoenixFx = null;
    }
}
