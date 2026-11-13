import { THORN_BARK, THORN_BURST } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { blast, dealDamage } from './damage.js';
import { addNumber, addShockwave, createExplosion, screenFlash, shakeScreen } from './effects.js';
import { mod } from './modifiers.js';
import { startCast } from './moves.js';
import { nearestEnemy, ready } from './powers.js';
import { getSpellCooldown, getSpellDamage } from './stats.js';
import { feedTorch } from './torch.js';

// --- SKILLS DA NATUREZA ---
// O druida controla o campo em vez de bater mais forte: prende os monstros no chão (raízes), bebe a vida deles (videira),
// some atrás de uma árvore que cresce na hora (carvalho) e deixa o chão envenenado (cogumelos). O dano é de feitiço.
// Tudo o que fica no campo mora em state.nature; o desenho está em js/render/nature.js (sprites montados uma vez).
// Regras que outros sistemas leem:
//   e.rooted (segundos)   monstro preso por raízes: não anda (js/systems/enemies.js), leva mais dano com Barbed Roots
//                         (js/systems/damage.js) e sofre o esmagamento (e.rootDps) aqui
//   state.nature.lure     o carvalho ACORDADO: os monstros comuns por perto vão bater nele em vez de no herói (enemies.js)
//   state.nature.hideIn   o arbusto em que o herói está escondido agora, ou null: monstros comuns não o veem (enemies.js)
//   state.nature.ambush   o golpe da emboscada está pronto: o próximo corte do herói bate mais forte (consumeAmbush)
const N = state.nature;
const COLOR = '#4ade80';

// --- RAÍZES ---
// Prende um monstro. Boss fica só uma fração do tempo; o Captain Brutos (imparável) não fica.
export function rootEnemy(e, seconds, dps = 0) {
    if (e.unstoppable || e.hp <= 0) return false;
    const M = POWER_MODELS.graspingRoots;
    const time = seconds * (1 + mod('rootSeconds')) * (e.isBoss ? M.bossRatio : 1);
    e.rootDps = e.rooted > 0 ? Math.max(e.rootDps ?? 0, dps) : dps;
    e.rooted = Math.max(e.rooted ?? 0, time);
    e.rootMax = e.rooted;
    e.vx = 0;
    e.vy = 0;
    return true;
}

function updateGraspingRoots(dt) {
    const M = POWER_MODELS.graspingRoots;
    // O esmagamento de quem está preso (venha a raiz de onde vier)
    if (ready('rootTick', dt, M.tickSeconds)) {
        const base = getSpellDamage() * M.tickSeconds;
        for (const e of state.enemies) {
            if (e.rooted > 0 && e.rootDps > 0) dealDamage(e, base * e.rootDps, { noCrit: true, quiet: true });
        }
    }
    const level = getPowerLevel(powers.graspingRoots);
    if (!level || !ready('graspingRoots', dt, getSpellCooldown(level.cooldown))) return;
    const skip = new Set();
    for (const e of state.enemies) if (e.rooted > 0) skip.add(e);
    let caught = 0;
    for (let i = 0; i < level.count; i++) {
        const target = nearestEnemy(player.x, player.y, M.range, skip);
        if (!target) break;
        skip.add(target);
        if (!rootEnemy(target, level.seconds, level.dps)) continue;
        caught++;
        createExplosion(target.x, target.y, COLOR, 5);
    }
    if (caught > 0) {
        startCast();
        audio.playShackle(true);
    } else state.powerTimers.graspingRoots = 0.4;      // ninguém ao alcance: tenta de novo logo
}

// --- VIDEIRA QUE DRENA ---
let healFloat = 0;
function updateLeechVine(dt) {
    const level = getPowerLevel(powers.leechVine);
    const vines = N.vines;
    if (!level) {
        vines.length = 0;
        return;
    }
    const M = POWER_MODELS.leechVine;
    // Solta quem morreu ou saiu do alcance
    for (let i = vines.length - 1; i >= 0; i--) {
        const e = vines[i];
        if (e.hp <= 0 || !state.enemies.includes(e) || Math.hypot(e.x - player.x, e.y - player.y) > M.breakRange) vines.splice(i, 1);
    }
    if (!ready('leechVine', dt, M.tickSeconds)) return;
    while (vines.length > level.targets) vines.pop();
    if (vines.length < level.targets) {
        const skip = new Set(vines);
        while (vines.length < level.targets) {
            const target = nearestEnemy(player.x, player.y, M.range, skip);
            if (!target) break;
            skip.add(target);
            vines.push(target);
        }
    }
    if (vines.length === 0 || player.hp <= 0) return;
    const amount = getSpellDamage() * level.dps * M.tickSeconds;
    let drained = 0;
    for (const e of vines) drained += dealDamage(e, amount, { noCrit: true, quiet: true });
    const heal = drained * level.heal;
    if (player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + heal);
        healFloat += heal;
        if (healFloat >= 4) {
            addNumber(player.x, player.y - 40, healFloat, 1, 'heal');
            healFloat = 0;
        }
    }
    if (powers.leechVine.evolved) feedTorch(heal * EVOLUTIONS.leechVine.torchShare);
}

// --- CARVALHO MALIGNO ---
// Uma semente drena o monstro com mais vida ao alcance. Quando ele morre, a muda nasce no local e amadurece:
// primeiro cura o herói dentro do círculo, depois vira a árvore que atrai e chicoteia monstros.
function growOak(x, y, level) {
    N.oaks.push({
        x, y: y - 6, stage: 'sapling', growthAge: 0, age: 0, seconds: level.seconds, transition: 0,
        healRadius: POWER_MODELS.shelterOak.healingRadius, hp: level.hp, maxHp: level.hp,
        reach: level.reach, damage: level.damage, lashSeconds: level.lashSeconds, lash: 0, awake: 0, awakeGoal: 0, shake: 0,
        lures: POWER_MODELS.shelterOak.lureRadius, swipes: [],
        evolved: powers.shelterOak.evolved
    });
    addShockwave(x, y, { radius: POWER_MODELS.shelterOak.healingRadius, color: COLOR, width: 4, seconds: 0.45 });
    createExplosion(x, y, '#166534', 10);
    audio.playSummon();
}

function fellOak(oak) {
    createExplosion(oak.x, oak.y - 20, '#166534', 18);
    createExplosion(oak.x, oak.y, '#78350f', 10);
    if (!oak.evolved || oak.stage !== 'adult') return;
    // Ancient Grove: as raízes rasgam o chão em volta
    const B = EVOLUTIONS.shelterOak.burst;
    const reach = oak.reach * B.radiusRatio;
    const damage = getSpellDamage() * B.damage;
    for (const e of state.enemies) {
        if (Math.hypot(e.x - oak.x, e.y - oak.y) > reach + e.radius) continue;
        dealDamage(e, damage, { noCrit: true, style: 'spell' });
        rootEnemy(e, B.seconds);
    }
    addShockwave(oak.x, oak.y, { radius: reach, color: COLOR, width: 9, seconds: 0.5 });
    shakeScreen(7);
    audio.playSlam(0.6);
}

function updateShelterOak(dt) {
    const M = POWER_MODELS.shelterOak;
    const level = getPowerLevel(powers.shelterOak);
    const timers = state.powerTimers;
    if (level && state.phase === 'HUNT' && N.oaks.length === 0 && !N.seed) {
        timers.shelterOak = (timers.shelterOak ?? 2) - dt;
        if (timers.shelterOak <= 0) {
            let target = null;
            let nearest = M.plantRange;
            for (const e of state.enemies) {
                if (e.hp <= 0) continue;
                const distance = Math.hypot(e.x - player.x, e.y - player.y);
                if (distance > M.plantRange) continue;
                if (!target || e.hp > target.hp || (e.hp === target.hp && distance < nearest)) {
                    target = e;
                    nearest = distance;
                }
            }
            if (target) {
                const distance = Math.hypot(target.x - player.x, target.y - player.y);
                N.seed = {
                    target,
                    timer: M.seedTickSeconds,
                    flightAge: 0,
                    flightSeconds: Math.min(0.42, Math.max(0.16, distance / 850)),
                    startX: player.x,
                    startY: player.y - 20,
                    attached: false
                };
                timers.shelterOak = getSpellCooldown(level.cooldown);
                audio.playSeedLaunch();
            } else {
                timers.shelterOak = 0.5;
            }
        }
    }
    if (N.seed) {
        const seed = N.seed;
        if (!state.enemies.includes(seed.target)) {
            N.seed = null;
        } else if (seed.target.hp > 0) {
            if (!seed.attached) {
                seed.flightAge = Math.min(seed.flightSeconds, seed.flightAge + dt);
                if (seed.flightAge >= seed.flightSeconds) {
                    seed.attached = true;
                    createExplosion(seed.target.x, seed.target.y - seed.target.radius, '#86efac', 5);
                }
            } else {
                seed.timer -= dt;
                if (seed.timer <= 0) {
                    seed.timer = M.seedTickSeconds;
                    dealDamage(seed.target, getSpellDamage() * M.seedDamage * M.seedTickSeconds, { noCrit: true, quiet: true });
                    createExplosion(seed.target.x, seed.target.y - seed.target.radius, '#86efac', 2);
                }
            }
        }
    }
    N.lure = null;
    const bark = passives.thornBark.lvl > 0;
    for (let i = N.oaks.length - 1; i >= 0; i--) {
        const oak = N.oaks[i];
        if (oak.stage !== 'adult') {
            oak.growthAge += dt;
            if (oak.stage === 'sapling' && oak.growthAge >= M.saplingSeconds) {
                oak.stage = 'young';
                oak.transition = 0.45;
                createExplosion(oak.x, oak.y - 14, '#4ade80', 8);
                addShockwave(oak.x, oak.y, { radius: 34, color: COLOR, width: 4, seconds: 0.35 });
            }
            if (oak.growthAge >= M.adultSeconds) {
                oak.stage = 'adult';
                oak.age = 0;
                oak.transition = 0.45;
                createExplosion(oak.x, oak.y - 22, '#4ade80', 14);
                addShockwave(oak.x, oak.y, { radius: oak.reach, color: COLOR, width: 5, seconds: 0.45 });
                audio.playSummon();
            }
            if (oak.stage !== 'adult' && player.hp > 0 && Math.hypot(player.x - oak.x, player.y - oak.y) <= oak.healRadius) {
                player.hp = Math.min(player.maxHp, player.hp + M.healingPerSecond * dt);
            }
        }
        if (oak.stage === 'adult') oak.age += dt;
        if (oak.transition > 0) oak.transition = Math.max(0, oak.transition - dt);
        if (oak.shake > 0) oak.shake -= dt;
        // Acorda com monstro por perto e volta a dormir quando o perigo passa
        let near = false;
        for (const e of state.enemies) {
            if (e.hp > 0 && Math.hypot(e.x - oak.x, e.y - oak.y) < oak.reach * M.wakeRatio + e.radius) {
                near = true;
                break;
            }
        }
        const goal = oak.stage === 'adult' && near && oak.age > M.growSeconds ? 1 : 0;
        if (goal > oak.awakeGoal) {
            createExplosion(oak.x, oak.y - 30, '#7f1d1d', 10);
            addShockwave(oak.x, oak.y, { radius: oak.reach, color: '#b91c1c', width: 4, seconds: 0.4 });
            audio.playBossRoar?.();
            oak.lash = 0.25;
        }
        oak.awakeGoal = goal;
        oak.awake += (goal - oak.awake) * Math.min(1, dt * 7);
        // Acordada: chicoteia o que está ao alcance
        if (oak.awake > 0.7) {
            N.lure = oak;
            oak.lash -= dt;
            if (oak.lash <= 0) {
                const hit = [];
                for (const e of state.enemies) if (e.hp > 0 && Math.hypot(e.x - oak.x, e.y - oak.y) < oak.reach + e.radius) hit.push(e);
                if (hit.length > 0) {
                    oak.lash = oak.lashSeconds;
                    oak.swipes.length = 0;
                    const damage = getSpellDamage() * oak.damage;
                    hit.sort((a, b) => Math.hypot(a.x - oak.x, a.y - oak.y) - Math.hypot(b.x - oak.x, b.y - oak.y));
                    hit.forEach((e, k) => {
                        const a = Math.atan2(e.y - oak.y, e.x - oak.x);
                        dealDamage(e, damage, { noCrit: true, style: 'spell', kbX: Math.cos(a) * 220, kbY: Math.sin(a) * 220 });
                        if (k < 4) oak.swipes.push({ x: e.x, y: e.y, age: 0, side: k % 2 ? 1 : -1 });
                    });
                    oak.shake = 0.22;
                    shakeScreen(3);
                    audio.playSlice();
                } else oak.lash = 0.15;
            }
        }
        for (const sw of oak.swipes) sw.age += dt;
        // Monstros que alcançam o tronco batem nele (cada um no seu ritmo) e recuam
        for (const e of state.enemies) {
            if (e.oakCd > 0) e.oakCd -= dt;
            if (e.oakCd > 0 || Math.hypot(e.x - oak.x, e.y - oak.y) > M.trunkRadius + e.radius) continue;
            e.oakCd = M.hitSeconds;
            oak.hp -= e.damage;
            oak.shake = 0.18;
            const a = Math.atan2(e.y - oak.y, e.x - oak.x);
            e.vx += Math.cos(a) * 160;
            e.vy += Math.sin(a) * 160;
            createExplosion(oak.x, oak.y - 14, '#a16207', 4);
            if (bark) {
                dealDamage(e, getSpellDamage() * THORN_BARK.damage, { noCrit: true, style: 'spell' });
                rootEnemy(e, THORN_BARK.rootSeconds);
            }
        }
        if (oak.hp <= 0 || (oak.stage === 'adult' && oak.age >= oak.seconds)) {
            N.oaks.splice(i, 1);
            timers.shelterOak = getSpellCooldown(level.cooldown);
            fellOak(oak);
        }
    }
}

// --- ARBUSTO DA EMBOSCADA ---
// Cresce onde o herói está. Dentro dele o herói some de vista (monstros comuns o ignoram) e o próximo corte sai bem mais
// forte; o golpe quebra o disfarce por alguns segundos. O arbusto também some com o tempo.
function updateHidingBush(dt) {
    const M = POWER_MODELS.hidingBush;
    const level = getPowerLevel(powers.hidingBush);
    const timers = state.powerTimers;
    if (level && state.phase === 'HUNT') {
        timers.hidingBush = (timers.hidingBush ?? 3) - dt;
        if (timers.hidingBush <= 0 && N.bushes.length === 0 && nearestEnemy(player.x, player.y, M.plantRange)) {
            timers.hidingBush = getSpellCooldown(level.cooldown);
            N.bushes.push({ x: player.x, y: player.y + 2, age: 0, seconds: level.seconds, radius: level.radius, ambush: level.ambush, rustle: 0 });
            createExplosion(player.x, player.y, '#166534', 14);
            addShockwave(player.x, player.y, { radius: level.radius * 1.4, color: COLOR, width: 4, seconds: 0.4 });
            audio.playSmoke();
        }
    }
    N.hideIn = null;
    N.ambush = false;
    if (N.stealthCd > 0) N.stealthCd -= dt;
    let inside = null;
    for (let i = N.bushes.length - 1; i >= 0; i--) {
        const b = N.bushes[i];
        b.age += dt;
        if (b.rustle > 0) b.rustle -= dt;
        if (b.age >= b.seconds) {
            N.bushes.splice(i, 1);
            createExplosion(b.x, b.y, '#166534', 8);
            continue;
        }
        if (b.age > M.growSeconds && player.hp > 0 && Math.hypot(player.x - b.x, player.y - b.y) < b.radius) inside = b;
    }
    if (inside && N.stealthCd <= 0) {
        N.hideTime += dt;
        N.hideIn = inside;
        N.ambush = N.hideTime >= M.stealthSeconds;
        N.ambushBonus = inside.ambush;
    } else N.hideTime = 0;
}

// Multiplicador de dano do corte da emboscada (js/systems/stats.js, getBladeDamage); 0 sem emboscada pronta
export function getAmbushBonus() {
    return N.ambush ? N.ambushBonus : 0;
}

// O corte saiu: a emboscada acaba, o herói fica à vista por um tempo e o arbusto balança
export function consumeAmbush() {
    if (!N.ambush) return;
    N.ambush = false;
    N.hideIn = null;
    N.hideTime = 0;
    N.stealthCd = POWER_MODELS.hidingBush.revealSeconds;
    if (N.bushes[0]) N.bushes[0].rustle = 0.35;
    createExplosion(player.x, player.y, '#4ade80', 12);
    addShockwave(player.x, player.y, { radius: 60, color: '#bbf7d0', width: 4, seconds: 0.3 });
    shakeScreen(2);
}

// --- COGUMELOS DE ESPOROS ---
function addPod(x, y) {
    N.pods.push({ x, y, age: 0, seed: Math.random() * 6.283 });
}

function podLimit(level) {
    return level.max;
}

function updateSporePods(dt) {
    const M = POWER_MODELS.sporePods;
    const level = getPowerLevel(powers.sporePods);
    const power = 1 + mod('poison');
    if (level && state.phase === 'HUNT' && ready('sporePods', dt, getSpellCooldown(level.cooldown)) && N.pods.length < podLimit(level)) {
        let free = true;
        for (const p of N.pods) if (Math.hypot(p.x - player.x, p.y - player.y) < M.minGap) free = false;
        if (free && Math.hypot(player.x - state.coreX, player.y - state.coreY) > 46) addPod(player.x, player.y + 4);
        else state.powerTimers.sporePods = 0.5;       // em cima de outro: espera o herói andar
    }
    // Cogumelo pisado estoura em nuvem
    for (let i = N.pods.length - 1; i >= 0; i--) {
        const p = N.pods[i];
        p.age += dt;
        if (p.age < M.armSeconds || !level) continue;
        let stepped = false;
        for (const e of state.enemies) {
            if (Math.hypot(e.x - p.x, e.y - p.y) < M.triggerRadius + e.radius) {
                stepped = true;
                break;
            }
        }
        if (!stepped) continue;
        N.pods.splice(i, 1);
        N.clouds.push({ x: p.x, y: p.y, age: 0, seconds: level.seconds * power, radius: level.radius, dps: level.dps * power, slow: level.slow, seed: p.seed });
        createExplosion(p.x, p.y, '#a3e635', 12);
        audio.playSmoke();
    }
    // Nuvens: freiam a cada quadro e envenenam a cada tique
    const tick = N.clouds.length > 0 && ready('sporeTick', dt, M.tickSeconds);
    const base = tick ? getSpellDamage() * M.tickSeconds : 0;
    for (let i = N.clouds.length - 1; i >= 0; i--) {
        const c = N.clouds[i];
        c.age += dt;
        if (c.age >= c.seconds) {
            N.clouds.splice(i, 1);
            continue;
        }
        for (const e of state.enemies) {
            if (Math.hypot(e.x - c.x, e.y - c.y) > c.radius + e.radius) continue;
            e.slow = Math.max(e.slow ?? 0, c.slow);
            e.poisonedUntil = state.runTime + 0.3;
            if (tick) dealDamage(e, base * c.dps, { noCrit: true, quiet: true });
        }
    }
}

// --- LOBOS ESPIRITUAIS ---
// A matilha caça solta: cada lobo corre atrás do monstro mais perto dele (sem se afastar demais do herói), fica em cima
// e morde de tempos em tempos. Os monstros que o alcançam batem nele: o lobo tem vida, cai, e a matilha o chama de volta
// depois de um tempo. Sem monstro por perto, eles rodeiam o herói e se curam aos poucos.
function wolfPrey(w, taken) {
    const M = POWER_MODELS.spiritWolves;
    let best = null;
    let min = M.huntRange;
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        if (Math.hypot(e.x - player.x, e.y - player.y) > M.leash) continue;
        const d = Math.hypot(e.x - w.x, e.y - w.y) + (taken.has(e) ? 70 : 0);
        if (d < min) {
            min = d;
            best = e;
        }
    }
    return best;
}

function wolfHome(w, i, t) {
    const M = POWER_MODELS.spiritWolves;
    const count = N.wolves.length;
    const a = (i / count) * 6.283 + t * 0.7 + w.seed;
    return { x: player.x + Math.cos(a) * M.homeRadius, y: player.y + Math.sin(a) * M.homeRadius * 0.7 + 6 };
}

function wolfMaxHp(level, evolved) {
    return (evolved ? EVOLUTIONS.spiritWolves.levels.hp : level.hp) * (1 + mod('wolfHealth'));
}

function newWolf(level, evolved, index) {
    const a = Math.random() * 6.283;
    const hp = wolfMaxHp(level, evolved);
    return { x: player.x + Math.cos(a) * 30, y: player.y + Math.sin(a) * 30, angle: a, mode: 'roam', prey: null, cool: 0.4 + index * 0.4, seed: index * 2.1, age: 0, lift: 0, trail: [], bit: 0, moving: false, hp, maxHp: hp, dead: false, respawn: 0, hurt: 0 };
}

function updateSpiritWolves(dt) {
    const level = getPowerLevel(powers.spiritWolves);
    const wolves = N.wolves;
    if (!level) {
        wolves.length = 0;
        return;
    }
    const M = POWER_MODELS.spiritWolves;
    const evolved = powers.spiritWolves.evolved;
    while (wolves.length < level.count) {
        wolves.push(newWolf(level, evolved, wolves.length));
        createExplosion(player.x, player.y, COLOR, 8);
    }
    wolves.length = level.count;
    const t = state.runTime;
    const run = M.runSpeed * (1 + mod('wolfSpeed'));
    const maxHp = wolfMaxHp(level, evolved);
    const respawnSeconds = evolved ? EVOLUTIONS.spiritWolves.respawnSeconds : M.respawnSeconds;
    const biteSeconds = evolved ? EVOLUTIONS.spiritWolves.levels.biteSeconds : level.biteSeconds;

    // Cada monstro bate num lobo no seu ritmo
    for (const e of state.enemies) if (e.wolfCd > 0) e.wolfCd -= dt;

    const taken = new Set();
    for (const w of wolves) if (!w.dead && w.prey) taken.add(w.prey);
    wolves.forEach((w, i) => {
        if (w.dead) {
            w.respawn -= dt;
            if (w.respawn <= 0) {
                Object.assign(w, newWolf(level, evolved, i), { cool: 0.3 });
                createExplosion(player.x, player.y, COLOR, 10);
            }
            return;
        }
        w.age += dt;
        if (w.cool > 0) w.cool -= dt;
        if (w.bit > 0) w.bit -= dt;
        if (w.hurt > 0) w.hurt -= dt;
        if (w.maxHp !== maxHp) {
            w.hp = Math.min(maxHp, w.hp * (maxHp / w.maxHp));
            w.maxHp = maxHp;
        }
        w.trail.unshift({ x: w.x, y: w.y });
        if (w.trail.length > 5) w.trail.pop();

        // Os monstros que encostam no lobo batem nele e ele recua um pouco
        for (const e of state.enemies) {
            if (e.wolfCd > 0 || e.stunned > 0 || e.hp <= 0) continue;
            if (Math.hypot(e.x - w.x, e.y - w.y) > M.bodyRadius + e.radius * 0.9) continue;
            e.wolfCd = M.hitSeconds;
            w.hp -= e.damage * M.damageTaken;
            w.hurt = 0.22;
            const a = Math.atan2(w.y - e.y, w.x - e.x);
            w.x += Math.cos(a) * 5;
            w.y += Math.sin(a) * 5;
            createExplosion(w.x, w.y, '#bbf7d0', 3);
            if (w.hp <= 0) break;
        }
        if (w.hp <= 0) {
            w.dead = true;
            w.respawn = respawnSeconds;
            w.prey = null;
            w.lift = 0;
            createExplosion(w.x, w.y, '#bbf7d0', 14);
            createExplosion(w.x, w.y, COLOR, 8);
            audio.playSlice();
            return;
        }

        const home = wolfHome(w, i, t);
        const tooFar = Math.hypot(w.x - player.x, w.y - player.y) > M.leash;
        let prey = w.prey;
        if (prey && (prey.hp <= 0 || !state.enemies.includes(prey) || tooFar)) {
            taken.delete(prey);
            prey = w.prey = null;
        }
        if (!prey && !tooFar && state.phase === 'HUNT') {
            prey = wolfPrey(w, taken);
            if (prey) {
                w.prey = prey;
                taken.add(prey);
            }
        }
        w.lift = 0;

        if (prey) {
            // Caça: corre até o monstro, fica em cima dele e morde
            const dx = prey.x - w.x;
            const dy = prey.y - w.y;
            const d = Math.hypot(dx, dy);
            const reach = M.biteRange + prey.radius;
            w.mode = 'hunt';
            w.angle = Math.atan2(dy, dx);
            w.moving = true;
            if (d > reach) {
                const step = Math.min(d - reach + 1, run * dt);
                w.x += (dx / d) * step;
                w.y += (dy / d) * step;
                if (d > reach + 40) w.lift = Math.sin(Math.min(1, (d - reach - 40) / 90) * Math.PI) * 5;
                return;
            }
            w.moving = w.cool > 0.2;
            if (w.cool <= 0) {
                const rooted = prey.rooted > 0 ? M.rootedBonus : 1;
                dealDamage(prey, getSpellDamage() * level.damage * rooted * (1 + mod('wolfDamage')), { noCrit: true, style: 'spell', kbX: Math.cos(w.angle) * 70, kbY: Math.sin(w.angle) * 70 });
                N.claws.push({ x: prey.x, y: prey.y, angle: w.angle, age: 0 });
                if (N.claws.length > 8) N.claws.shift();
                createExplosion(prey.x, prey.y, '#bbf7d0', 5);
                if (evolved) rootEnemy(prey, EVOLUTIONS.spiritWolves.hamstringSeconds);
                w.bit = 0.2;
                w.cool = biteSeconds * (0.9 + 0.2 * Math.random());
                shakeScreen(1);
                audio.playSlice();
            }
            return;
        }

        // Sem presa (ou longe demais do herói): volta a rodeá-lo e se cura devagar
        const dx = home.x - w.x;
        const dy = home.y - w.y;
        const d = Math.hypot(dx, dy);
        w.mode = d > 14 ? 'return' : 'roam';
        w.moving = d > 6;
        if (!tooFar) w.hp = Math.min(w.maxHp, w.hp + w.maxHp * M.regen * dt);
        if (d > 3) {
            const step = Math.min(d, (d > 14 ? run : run * 0.35) * dt);
            w.x += (dx / d) * step;
            w.y += (dy / d) * step;
            w.angle = Math.atan2(dy, dx);
        } else {
            const away = nearestEnemy(player.x, player.y, M.huntRange);
            w.angle = away ? Math.atan2(away.y - w.y, away.x - w.x) : Math.atan2(player.y - w.y, player.x - w.x) + 3.14;
        }
    });
    for (let i = N.claws.length - 1; i >= 0; i--) {
        N.claws[i].age += dt;
        if (N.claws[i].age > 0.3) N.claws.splice(i, 1);
    }
}

// --- MORTE DE UM MONSTRO (chamado por js/systems/powers.js, onEnemyKilled) ---
export function onNatureKill(e) {
    if (N.seed?.target === e) {
        const level = getPowerLevel(powers.shelterOak);
        N.seed = null;
        if (level) growOak(e.x, e.y, level);
    }
    if (e.rooted > 0) {
        if (passives.thornBurst.lvl > 0) {
            blast(e.x, e.y, THORN_BURST.radius, getSpellDamage() * THORN_BURST.damage, THORN_BURST.knockback, COLOR, 'spell');
        }
        // Strangling Grove: as raízes do morto pulam para o monstro mais perto
        const level = getPowerLevel(powers.graspingRoots);
        if (level && powers.graspingRoots.evolved) {
            let next = null;
            let best = EVOLUTIONS.graspingRoots.spreadRange;
            for (const o of state.enemies) {
                if (o === e || o.hp <= 0 || o.rooted > 0) continue;
                const d = Math.hypot(o.x - e.x, o.y - e.y);
                if (d < best) {
                    best = d;
                    next = o;
                }
            }
            if (next) rootEnemy(next, level.seconds, level.dps);
        }
    }
    // Plague Garden: quem morre dentro de uma nuvem deixa um cogumelo novo
    const pods = getPowerLevel(powers.sporePods);
    if (pods && powers.sporePods.evolved && e.poisonedUntil > state.runTime && N.pods.length < podLimit(pods)) addPod(e.x, e.y);
}

export function updateNatureSkills(dt) {
    // Wild Heart e Oath of the Wild: a floresta fecha as feridas aos poucos
    const regen = mod('hpRegen');
    if (regen > 0 && player.hp > 0 && player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + regen * dt);
    updateGraspingRoots(dt);
    updateLeechVine(dt);
    updateShelterOak(dt);
    updateHidingBush(dt);
    updateSporePods(dt);
    updateSpiritWolves(dt);
}

// Virada da hora: o campo fica limpo
export function clearNatureSkills() {
    N.oaks.length = 0;
    N.seed = null;
    N.bushes.length = 0;
    N.pods.length = 0;
    N.clouds.length = 0;
    N.vines.length = 0;
    N.claws.length = 0;
    N.lure = null;
    N.hideIn = null;
    N.ambush = false;
    N.hideTime = 0;
    N.stealthCd = 0;
    // Na virada da hora a matilha se refaz: quem caiu volta com a vida cheia
    for (const w of N.wolves) {
        w.prey = null;
        w.mode = 'roam';
        w.dead = false;
        w.hp = w.maxHp;
    }
    healFloat = 0;
}
