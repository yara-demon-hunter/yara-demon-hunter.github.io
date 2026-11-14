import { THORN_BURST, THORN_ROSES } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS, getPowerLevel } from '../../data_model/powers.js';
import { audio, passives, player, powers, state } from '../core/state.js';
import { blast, dealDamage } from './damage.js';
import { addNumber, addShockwave, createExplosion, screenFlash, shakeScreen } from './effects.js';
import { getHero, mod } from './modifiers.js';
import { startCast } from './moves.js';
import { nearestEnemy, ready } from './powers.js';
import { getKnifeDamage, getSpellCooldown, getSpellDamage } from './stats.js';
import { noteAmbientHeal } from './torch.js';

// --- SKILLS DA NATUREZA ---
// O druida controla o campo em vez de bater mais forte: prende os monstros no chão (raízes), bebe a vida deles (videira),
// some atrás de uma árvore que cresce na hora (carvalho) e deixa o chão envenenado (cogumelos). O dano é de feitiço.
// Tudo o que fica no campo mora em state.nature; o desenho está em js/render/nature.js (sprites montados uma vez).
// Regras que outros sistemas leem:
//   e.rooted (segundos)   monstro preso por raízes: não anda (js/systems/enemies.js), leva mais dano com a Strangling Grove
//                         (js/systems/damage.js) e sofre o esmagamento (e.rootDps) aqui
//   state.nature.lure     o carvalho ACORDADO: os monstros comuns por perto vão bater nele em vez de no herói (enemies.js)
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

// --- VIDEIRA QUE DRENA (sai do carvalho) ---
// As videiras nascem de cada carvalho (muda não: só a árvore pequena ou a grande), agarram os monstros mais perto DELE e drenam
// a vida deles; o que drenam volta como vida para o próprio carvalho (não para o herói). Sem carvalho, a skill não faz nada.
// Cada carvalho guarda os monstros que está drenando em oak.vines (o desenho: js/render/nature.js).
function updateLeechVine(dt) {
    const level = getPowerLevel(powers.leechVine);
    const M = POWER_MODELS.leechVine;
    for (const oak of N.oaks) {
        oak.vines ??= [];
        if (!level || oak.stage === 'sapling') {
            oak.vines.length = 0;
            continue;
        }
        // Solta quem morreu ou saiu do alcance do carvalho
        for (let i = oak.vines.length - 1; i >= 0; i--) {
            const e = oak.vines[i];
            if (e.hp <= 0 || !state.enemies.includes(e) || Math.hypot(e.x - oak.x, e.y - oak.y) > M.breakRange) oak.vines.splice(i, 1);
        }
    }
    if (!level || !ready('leechVine', dt, M.tickSeconds)) return;
    const amount = getSpellDamage() * level.dps * M.tickSeconds;
    for (const oak of N.oaks) {
        if (oak.stage === 'sapling') continue;
        while (oak.vines.length > level.targets) oak.vines.pop();
        if (oak.vines.length < level.targets) {
            const skip = new Set(oak.vines);
            while (oak.vines.length < level.targets) {
                const target = nearestEnemy(oak.x, oak.y, M.range, skip);
                if (!target) break;
                skip.add(target);
                oak.vines.push(target);
            }
        }
        if (oak.vines.length === 0) continue;
        let drained = 0;
        for (const e of oak.vines) drained += dealDamage(e, amount, { noCrit: true, quiet: true });
        const heal = drained * level.heal;
        if (oak.hp < oak.maxHp) {
            oak.hp = Math.min(oak.maxHp, oak.hp + heal);
            oak.healFloat = (oak.healFloat ?? 0) + heal;
            if (oak.healFloat >= 4) {
                addNumber(oak.x, oak.y - 44, oak.healFloat, 1, 'heal');
                oak.healFloat = 0;
            }
        }
    }
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
    if (!oak.evolved || (oak.stage !== 'adult' && oak.stage !== 'elder')) return;
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
    // Uma árvore só: ou semente, ou árvore (ela fica a noite toda, de onda em onda)
    if (level && state.phase === 'HUNT' && N.oaks.length + N.seeds.length < 1) {
        timers.shelterOak = (timers.shelterOak ?? 2) - dt;
        if (timers.shelterOak <= 0) {
            let target = null;
            let nearest = M.plantRange;
            for (const e of state.enemies) {
                if (e.hp <= 0 || N.seeds.some(s => s.target === e)) continue;
                const distance = Math.hypot(e.x - player.x, e.y - player.y);
                if (distance > M.plantRange) continue;
                if (!target || e.hp > target.hp || (e.hp === target.hp && distance < nearest)) {
                    target = e;
                    nearest = distance;
                }
            }
            if (target) {
                const distance = Math.hypot(target.x - player.x, target.y - player.y);
                N.seeds.push({
                    target,
                    timer: M.seedTickSeconds,
                    flightAge: 0,
                    flightSeconds: Math.min(0.42, Math.max(0.16, distance / 850)),
                    startX: player.x,
                    startY: player.y - 20,
                    attached: false
                });
                timers.shelterOak = getSpellCooldown(level.cooldown);
                audio.playSeedLaunch();
            } else {
                timers.shelterOak = 0.5;
            }
        }
    }
    for (let i = N.seeds.length - 1; i >= 0; i--) {
        const seed = N.seeds[i];
        if (!state.enemies.includes(seed.target)) {
            N.seeds.splice(i, 1);
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
    for (let i = N.oaks.length - 1; i >= 0; i--) {
        const oak = N.oaks[i];
        // A árvore dura a noite toda: se o jogador subiu ou evoluiu a skill depois de plantá-la, ela acompanha
        if (level) {
            // Quarto estágio (furioso): um pouco maior, alcança e bate mais
            const fury = oak.stage === 'elder' ? M.elder : null;
            oak.reach = level.reach * (fury ? fury.reach : 1);
            oak.damage = level.damage * (fury ? fury.damage : 1);
            oak.lashSeconds = level.lashSeconds;
            oak.evolved = powers.shelterOak.evolved;
            if (level.hp > oak.maxHp) {
                oak.hp += level.hp - oak.maxHp;
                oak.maxHp = level.hp;
            }
        }
        if (oak.stage === 'sapling' || oak.stage === 'young') {
            oak.growthAge += dt * (1 + mod('oakGrowth'));
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
            if (oak.stage !== 'adult' && oak.stage !== 'elder' && player.hp > 0 && Math.hypot(player.x - oak.x, player.y - oak.y) <= oak.healRadius) {
                const healed = Math.min(player.maxHp - player.hp, M.healingPerSecond * dt);
                player.hp += healed;
                noteAmbientHeal(healed);       // entra no número verde junto com a cura da tocha
            }
        }
        const grown = oak.stage === 'adult' || oak.stage === 'elder';
        if (grown) {
            oak.age += dt;
            // Quarto estágio: o carvalho adulto continua crescendo (tempo + mortes) até ficar furioso de vez
            oak.growthAge += dt * (1 + mod('oakGrowth'));
            if (oak.stage === 'adult' && oak.growthAge >= M.elder.seconds) {
                oak.stage = 'elder';
                oak.transition = 0.45;
                createExplosion(oak.x, oak.y - 34, '#4ade80', 18);
                createExplosion(oak.x, oak.y - 30, '#7f1d1d', 8);
                addShockwave(oak.x, oak.y, { radius: oak.reach * M.elder.reach, color: COLOR, width: 6, seconds: 0.5 });
                audio.playSummon();
            }
        }
        // A cara furiosa (os sprites "evil" da biblioteca) é a do quarto estágio, e entra aos poucos
        oak.awake += ((oak.stage === 'elder' ? 1 : 0) - oak.awake) * Math.min(1, dt * 2);
        if (oak.transition > 0) oak.transition = Math.max(0, oak.transition - dt);
        if (oak.shake > 0) oak.shake -= dt;
        // Anda, bem devagar: vai até o monstro mais perto que ainda não está ao alcance dos galhos; sem monstros, volta para
        // perto do herói. Muda e árvore pequena ficam enraizadas.
        oak.walking = false;
        if (grown && oak.age > M.growSeconds) {
            let goal = null;
            let best = oak.reach * M.walk.seekRatio;
            let inReach = false;
            for (const e of state.enemies) {
                if (e.hp <= 0) continue;
                const d = Math.hypot(e.x - oak.x, e.y - oak.y);
                if (d < oak.reach * 0.8 + e.radius) inReach = true;
                if (d < best) {
                    best = d;
                    goal = e;
                }
            }
            if (!goal && Math.hypot(player.x - oak.x, player.y - oak.y) > M.walk.heroDistance) goal = player;
            if (goal && !inReach) {
                const a = Math.atan2(goal.y - oak.y, goal.x - oak.x);
                const speed = M.walk.speed * (oak.stage === 'elder' ? M.elder.walk : 1);
                oak.x = Math.max(30, Math.min(state.width - 30, oak.x + Math.cos(a) * speed * dt));
                oak.y = Math.max(40, Math.min(state.height - 20, oak.y + Math.sin(a) * speed * dt));
                oak.walking = true;
            }
        }
        // Raízes andando no desenho: entram e saem aos poucos (0 a 1)
        oak.walkK = (oak.walkK ?? 0) + ((oak.walking ? 1 : 0) - (oak.walkK ?? 0)) * Math.min(1, dt * 4);
        // Adulta: atrai os monstros por perto e chicoteia o que está ao alcance (sem "acordar": nada de rugido nem clarão)
        let near = false;
        for (const e of state.enemies) {
            if (e.hp > 0 && Math.hypot(e.x - oak.x, e.y - oak.y) < oak.reach * M.wakeRatio + e.radius) {
                near = true;
                break;
            }
        }
        if (grown && near && oak.age > M.growSeconds) {
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
                        dealDamage(e, damage, { noCrit: true, style: 'spell' });
                        if (k < 4) oak.swipes.push({ x: e.x, y: e.y, age: 0, side: k % 2 ? 1 : -1 });
                    });
                    oak.shake = 0.22;          // só a árvore balança: o chicote não empurra os monstros nem treme a tela
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
            if (oak.evolved) {
                dealDamage(e, getSpellDamage() * EVOLUTIONS.shelterOak.thornBark.damage, { noCrit: true, style: 'spell' });
                rootEnemy(e, EVOLUTIONS.shelterOak.thornBark.rootSeconds);
            }
        }
        // A árvore não murcha com o tempo (nem entre ondas): só cai se os monstros acabarem com a vida dela
        if (oak.hp <= 0) {
            N.oaks.splice(i, 1);
            timers.shelterOak = getSpellCooldown(level.cooldown);
            fellOak(oak);
        }
    }
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
        // Só o Rowan (o druida) come o cogumelo: ao pisar, ele estoura numa nuvem que CURA um pouco. Só vale depois de o herói se afastar do cogumelo que ele mesmo
        // plantou (senão comeria cada um no instante em que nasce)
        const heroDist = Math.hypot(player.x - p.x, player.y - p.y);
        if (heroDist > M.triggerRadius + 14) p.left = true;
        if (p.left && heroDist < M.triggerRadius && player.hp > 0 && getHero().id === 'rowan') {
            N.pods.splice(i, 1);
            const healed = Math.min(player.maxHp - player.hp, level.heal);
            if (healed > 0) {
                player.hp += healed;
                addNumber(player.x, player.y - 40, healed, 1, 'heal');
            }
            createExplosion(p.x, p.y, '#bef264', 10);
            audio.playSmoke();
            continue;
        }
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
    // Um ponto fixo ao lado do herói (atrás e à esquerda): o lobo não persegue um alvo que gira, senão treme parado
    const a = 2.5 + (i / count) * 6.283 + w.seed * 0.3;
    return { x: player.x + Math.cos(a) * M.homeRadius, y: player.y + Math.sin(a) * M.homeRadius * 0.7 + 6 };
}

function wolfMaxHp(level, evolved) {
    const E = EVOLUTIONS.spiritWolves;
    return (evolved ? E.levels.hp * (1 + E.healthBonus) : level.hp) * (1 + mod('wolfPower'));
}

function newWolf(level, evolved, index) {
    const a = Math.random() * 6.283;
    const hp = wolfMaxHp(level, evolved);
    return { x: player.x + Math.cos(a) * 30, y: player.y + Math.sin(a) * 30, angle: a, mode: 'roam', prey: null, following: false, cool: 0.4 + index * 0.4, seed: index * 2.1, age: 0, lift: 0, trail: [], bit: 0, moving: false, hp, maxHp: hp, dead: false, respawn: 0, hurt: 0 };
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
    while (wolves.length < 1) {
        wolves.push(newWolf(level, evolved, wolves.length));
        createExplosion(player.x, player.y, COLOR, 8);
    }
    wolves.length = 1;
    const t = state.runTime;
    const E = EVOLUTIONS.spiritWolves;
    const run = M.runSpeed * (evolved ? 1 + E.speedBonus : 1);
    const bodyRadius = M.bodyRadius;
    const biteDamage = (evolved ? E.levels.damage * (1 + E.damageBonus) : level.damage) * (1 + mod('wolfPower'));
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
            if (Math.hypot(e.x - w.x, e.y - w.y) > bodyRadius + e.radius * 0.9) continue;
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
                dealDamage(prey, getSpellDamage() * biteDamage * rooted, { noCrit: true, style: 'spell', kbX: Math.cos(w.angle) * 70, kbY: Math.sin(w.angle) * 70 });
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

        // Sem presa (ou longe demais do herói): fica perto do herói e se cura devagar. Histerese: só se mexe quando o herói se
        // afasta (começa a seguir passando de followFar, para ao chegar a followNear); parado, fica quieto e olha o monstro
        // mais perto (ou o herói), virando devagar. Antes ele corria atrás de um ponto que girava e tremia parado.
        const dx = home.x - w.x;
        const dy = home.y - w.y;
        const d = Math.hypot(dx, dy);
        if (d > M.followFar || tooFar) w.following = true;
        else if (d < M.followNear) w.following = false;
        if (!tooFar) w.hp = Math.min(w.maxHp, w.hp + w.maxHp * M.regen * dt);
        let want;
        if (w.following) {
            w.mode = 'return';
            w.moving = true;
            const speed = Math.min(run, 70 + d * 3.2);
            const step = Math.min(d, speed * dt);
            w.x += (dx / d) * step;
            w.y += (dy / d) * step;
            want = Math.atan2(dy, dx);
        } else {
            w.mode = 'roam';
            w.moving = false;
            const away = nearestEnemy(player.x, player.y, M.huntRange);
            want = away ? Math.atan2(away.y - w.y, away.x - w.x) : Math.atan2(player.y - w.y, player.x - w.x);
        }
        // Vira devagar, pelo caminho mais curto (nunca de um quadro para o outro)
        const turn = Math.atan2(Math.sin(want - w.angle), Math.cos(want - w.angle));
        w.angle += turn * Math.min(1, dt * (w.following ? 14 : 5));
    });
    for (let i = N.claws.length - 1; i >= 0; i--) {
        N.claws[i].age += dt;
        if (N.claws[i].age > 0.3) N.claws.splice(i, 1);
    }
}

// --- DARK ROSES (só o Rowan) ---
// A rosa negra que acerta MARCA o monstro (e.roseMark, em segundos). Se ele morrer marcado, rosas de espinho brotam onde caiu
// (state.nature.thorns) e ferem e desaceleram o que passar por cima por alguns segundos. O desenho: js/render/nature.js.
export function markWithRose(e) {
    if (e.hp <= 0) return;
    if (!(e.roseMark > 0)) createExplosion(e.x, e.y - 10, '#a78bfa', 5);
    e.roseMark = THORN_ROSES.markSeconds;
}

function updateRoseThorns(dt) {
    for (const e of state.enemies) if (e.roseMark > 0) e.roseMark -= dt;
    for (let i = N.thorns.length - 1; i >= 0; i--) {
        const p = N.thorns[i];
        p.age += dt;
        if (p.age >= THORN_ROSES.patchSeconds) {
            N.thorns.splice(i, 1);
            continue;
        }
        p.tick -= dt;
        const tick = p.tick <= 0;
        if (tick) p.tick += THORN_ROSES.tickSeconds;
        const damage = getKnifeDamage() * THORN_ROSES.damage;
        for (const e of state.enemies) {
            if (e.hp <= 0 || Math.hypot(e.x - p.x, e.y - p.y) > THORN_ROSES.radius + e.radius * 0.6) continue;
            e.slow = Math.max(e.slow ?? 0, THORN_ROSES.slow);
            if (tick) dealDamage(e, damage, { noCrit: true, quiet: true, style: 'spell' });
        }
    }
}

// --- MORTE DE UM MONSTRO (chamado por js/systems/powers.js, onEnemyKilled) ---
export function onNatureKill(e) {
    // Cada monstro morto (de qualquer jeito) adianta o crescimento das mudas e das árvores pequenas (a anterior à semente nova)
    for (const oak of N.oaks) if (oak.stage !== 'elder') oak.growthAge += POWER_MODELS.shelterOak.killGrowthSeconds * (1 + mod('oakGrowth'));
    // Dark Roses: morreu marcado, rosas de espinho brotam onde caiu
    if (e.roseMark > 0 && N.thorns.length < 14) {
        N.thorns.push({ x: e.x, y: e.y, age: 0, tick: 0.2, variant: Math.floor(Math.random() * 3) });
        createExplosion(e.x, e.y, '#a78bfa', 10);
        audio.playSummon?.();
    }
    const seeded = N.seeds.findIndex(seed => seed.target === e);
    if (seeded >= 0) {
        const level = getPowerLevel(powers.shelterOak);
        N.seeds.splice(seeded, 1);
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
    updateSporePods(dt);
    updateSpiritWolves(dt);
    updateRoseThorns(dt);
}

// Virada da hora: o campo fica limpo
// all: começo de noite ou fim de jogo (a árvore NÃO sobrevive à noite); sem all (virada de onda) a árvore fica e recupera parte da vida
export function clearNatureSkills(all = false) {
    if (all) N.oaks.length = 0;
    else for (const oak of N.oaks) oak.hp = Math.min(oak.maxHp, oak.hp + oak.maxHp * POWER_MODELS.shelterOak.waveHealRatio);
    N.seeds.length = 0;
    N.pods.length = 0;
    N.clouds.length = 0;
    N.claws.length = 0;
    N.thorns.length = 0;
    N.lure = null;
    // Na virada da hora a matilha se refaz: quem caiu volta com a vida cheia
    for (const w of N.wolves) {
        w.prey = null;
        w.mode = 'roam';
        w.dead = false;
        w.hp = w.maxHp;
    }
}
