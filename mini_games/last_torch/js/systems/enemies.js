import { ROSE_SKILL } from '../../data_model/skills.js';
import { CHARACTER_MODEL } from '../../data_model/character.js';
import { BOSS_MODELS } from '../../data_model/bosses.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { MONSTER_MODELS, MONSTER_SPAWNING, createVampireBat, rollMonsterGold } from '../../data_model/monsters.js';
import { MIRROR_WARD } from '../../data_model/passives.js';
import { POWER_MODELS } from '../../data_model/powers.js';
import { audio, passives, player, shadowClones, state } from '../core/state.js';
import { updateHUD } from '../ui/hud.js';
import { addSlam, bossTarget, updateBossAI, updateShadowAI } from './boss_ai.js';
import { dealDamage } from './damage.js';
import { addCorpse, addGibs, addShockwave, addStain, createExplosion, hitStop, screenFlash, shakeScreen, zoomPunch } from './effects.js';
import { dropGold, dropTreasureGold } from './gold.js';
import { WAVE_EVENTS } from '../../data_model/wave_events.js';
import { effectiveTurn } from '../../data_model/campaign.js';
import { showToast } from '../ui/banner.js';
import { GOLD_ECONOMY } from '../../data_model/gold.js';
import { mod } from './modifiers.js';
import { checkHourEnd, onBossKilled } from './night.js';
import { dropChest, maybeDropPickup } from './pickups.js';
import { hurtPlayer, knockbackPlayer } from './player.js';
import { damageShadowClone } from './shadow_clone.js';
import { damageAngel, hitAngelWithShot, liveAngel, provokingAngel } from './skills_light.js';
import { hurtOaks } from './skills_nature.js';
import { addHostileFire, onEnemyKilled } from './powers.js';
import { spreadBurn, wardSpendForShot, wardTorch } from './skills_flame.js';
import { gainXp } from './progression.js';

import { recordBeast } from './sanctuary.js';
import { addStreakKill, getScoreMultiplier, getStreakGoldBonus } from './streak.js';
import { lerpAngle } from '../../library/core/easing.js';
import { knightHeadOf } from '../core/monster_art.js';
import { getAtkDamage } from './stats.js';
import { hurtTorch } from './torch.js';
import { hurtConvert, provokingConvert } from './conversion.js';
import { CONVERSION } from '../../data_model/passives.js';

// Modelo de dados do inimigo (monstro comum ou boss)
const getEnemyModel = type => MONSTER_MODELS[type] || BOSS_MODELS[type];

// Explosões em cadeia por quadro (data: js/systems/damage.js)
const MAX_BLASTS_PER_FRAME = 6;
const FACING_SMOOTHING = 8;
let separationTick = 0;

// --- SEPARAÇÃO ---
// Monstros se empurram de leve para a horda ocupar espaço. Boss não é empurrado. Com poucas dezenas
// de monstros, comparar pares direto é mais rápido que qualquer grade e não gera lixo. Quadros alternados.
function separateEnemies(dt) {
    const { enemies } = state;
    const strength = MONSTER_SPAWNING.separationStrength * dt;
    for (let i = 0; i < enemies.length; i++) {
        const a = enemies[i];
        for (let j = i + 1; j < enemies.length; j++) {
            const b = enemies[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const min = (a.radius + b.radius) * 0.9;
            const dist2 = dx * dx + dy * dy;
            if (dist2 >= min * min || dist2 < 0.01) continue;
            const dist = Math.sqrt(dist2);
            const force = ((min - dist) / min) * strength;
            const nx = (dx / dist) * force;
            const ny = (dy / dist) * force;
            if (!a.isBoss && !a.immovable) { a.x -= nx; a.y -= ny; }
            if (!b.isBoss && !b.immovable) { b.x += nx; b.y += ny; }
        }
    }
}

// Espectro: para, mira (linha no chão) e dispara em linha reta. true = ele controla o movimento agora.
function updateLunge(e, L, dist, angle, dt) {
    if (e.lungeState === 2) {
        e.x += e.lungeX * L.speed * dt;
        e.y += e.lungeY * L.speed * dt;
        e.lungeTimer -= dt;
        if (e.lungeTimer <= 0) {
            e.lungeState = 0;
            e.lungeTimer = L.cooldownSeconds;
        }
        return true;
    }
    if (e.lungeState === 1) {
        e.lungeTimer -= dt;
        if (e.lungeTimer <= 0) {
            e.lungeState = 2;
            e.lungeTimer = L.seconds;
            audio.playDash();
        }
        return true;
    }
    e.lungeTimer = (e.lungeTimer ?? L.cooldownSeconds * Math.random()) - dt;
    if (e.lungeTimer <= 0 && dist < L.triggerDistance) {
        e.lungeState = 1;
        e.lungeTimer = L.aimSeconds;
        e.lungeX = Math.cos(angle);
        e.lungeY = Math.sin(angle);
        // Aviso no chão: uma risca vermelha na direção do dash durante a mira (dá para sair da frente)
        state.telegraphs.push({ kind: 'line', owner: e, x: e.x, y: e.y, angle, length: L.speed * L.seconds, age: 0, seconds: L.aimSeconds, red: true, dashed: true });
        return true;
    }
    return false;
}

// Golpe de arma dos monstros com espada, machado ou lança (model.melee): ao chegar no alcance o monstro PARA, prepara (ergue a arma), golpeia e recolhe.
// e.atk (0 a 1) é o andamento, que a arte lê (library/monsters/25d/melee25d.js). O dano sai no começo do golpe, no leque da frente (alcance + abertura).
function updateMelee(e, M, dist, angle, dt) {
    e.atkCooldown ??= 0.6 + Math.random() * 0.8;
    if (e.atkState === 1) {
        e.atkTimer -= dt;
        e.atkAngle = angle;                                             // segue o alvo enquanto prepara
        e.atk = 0.45 * (1 - Math.max(0, e.atkTimer) / M.windupSeconds);
        if (e.atkTimer <= 0) {
            e.atkState = 2;
            e.atkTimer = M.strikeSeconds;
            const inArc = (x, y, r = 0) => {
                const dx = x - e.x, dy = y - e.y;
                const diff = Math.atan2(Math.sin(Math.atan2(dy, dx) - e.atkAngle), Math.cos(Math.atan2(dy, dx) - e.atkAngle));
                return Math.hypot(dx, dy) <= M.reach + r && Math.abs(diff) <= M.halfAngle;
            };
            if (inArc(player.x, player.y, CHARACTER_MODEL.collisionRadius)) hurtPlayer(e.damage * M.damageMultiplier, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds, e);
            for (const clone of shadowClones) {
                if (clone.active && inArc(clone.x, clone.y, CHARACTER_MODEL.collisionRadius)) damageShadowClone(clone, e.damage * M.damageMultiplier, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
            }
            const angelA = liveAngel();
            if (angelA && inArc(angelA.x, angelA.y, angelA.radius)) damageAngel(e.damage * M.damageMultiplier);
            // A árvore do druida também leva o corte: o tronco dentro do leque é ferido
            for (const oak of state.nature.oaks) if (inArc(oak.x, oak.y, POWER_MODELS.shelterOak.trunkRadius)) { oak.hp -= e.damage * M.damageMultiplier; oak.shake = 0.18; }
            audio.playSlice();
        }
        return true;
    }
    if (e.atkState === 2) {
        e.atkTimer -= dt;
        e.atk = 0.45 + 0.2 * (1 - Math.max(0, e.atkTimer) / M.strikeSeconds);
        if (e.atkTimer <= 0) { e.atkState = 3; e.atkTimer = M.recoverySeconds; }
        return true;
    }
    if (e.atkState === 3) {
        e.atkTimer -= dt;
        e.atk = 0.65 + 0.35 * (1 - Math.max(0, e.atkTimer) / M.recoverySeconds);
        if (e.atkTimer <= 0) { e.atkState = 0; e.atk = 0; }
        return true;
    }
    e.atk = 0;
    e.atkCooldown -= dt;
    if (dist > M.range || e.atkCooldown > 0) return false;
    e.atkState = 1;
    e.atkTimer = M.windupSeconds;
    e.atkAngle = angle;
    e.atkCooldown = M.cooldownSeconds;
    return true;
}

// Língua do Sapo do Pântano (model.tongue): para, mira (linha de aviso no chão, desenhada em render/entities.js), solta a língua em linha reta e recolhe.
// Quem estiver na linha (até `range`, com a largura `width`) leva o dano no começo do golpe.
function updateTongue(e, T, dist, angle, dt) {
    e.tongueCooldown ??= 0.8 + Math.random() * 1.2;
    if (e.tongueState === 1) {
        e.tongueTimer -= dt;
        e.tongueAngle = angle;
        if (e.tongueTimer <= 0) {
            e.tongueState = 2;
            e.tongueTimer = T.strikeSeconds;
            const cx = Math.cos(e.tongueAngle), cy = Math.sin(e.tongueAngle);
            const near = (x, y, r) => {
                const dx = x - e.x, dy = y - e.y;
                const along = dx * cx + dy * cy;
                const side = Math.abs(-dx * cy + dy * cx);
                return along > 0 && along <= T.range + r && side <= T.width / 2 + r;
            };
            if (near(player.x, player.y, CHARACTER_MODEL.collisionRadius)) hurtPlayer(e.damage * T.damageMultiplier, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds, e);
            for (const clone of shadowClones) {
                if (clone.active && near(clone.x, clone.y, CHARACTER_MODEL.collisionRadius)) damageShadowClone(clone, e.damage * T.damageMultiplier, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
            }
            const angelT = liveAngel();
            if (angelT && near(angelT.x, angelT.y, angelT.radius)) damageAngel(e.damage * T.damageMultiplier);
            audio.playSlice();
        }
        return true;
    }
    if (e.tongueState === 2) {
        e.tongueTimer -= dt;
        if (e.tongueTimer <= 0) { e.tongueState = 3; e.tongueTimer = T.recoverySeconds; }
        return true;
    }
    if (e.tongueState === 3) {
        e.tongueTimer -= dt;
        if (e.tongueTimer <= 0) e.tongueState = 0;
        return true;
    }
    e.tongueCooldown -= dt;
    if (dist > T.range * 0.95 || e.tongueCooldown > 0) return false;
    e.tongueState = 1;
    e.tongueTimer = T.windupSeconds;
    e.tongueAngle = angle;
    e.tongueDef = T;
    e.tongueCooldown = T.cooldownSeconds;
    return true;
}

// O Treant para e ergue os braços antes do soco; sem marca no chão, como os golpes dos bosses.
function updateTreantPunch(e, P, dist, angle, dt) {
    e.punchCooldown ??= 1.6;
    if (e.punchState === 1) {
        e.punchTimer -= dt;
        e.swing = 1 - Math.max(0, e.punchTimer) / P.windupSeconds;
        if (e.punchTimer <= 0 && P.area) {
            // Golem: bate as duas mãos no chão. O dano em volta (e na tocha) vem do aviso no chão, que estoura agora; aqui só os clones
            e.punchState = 2;
            e.punchTimer = P.strikeSeconds;
            e.slamHit = true;
            e.slamTele = null;
            for (const clone of shadowClones) {
                if (clone.active && Math.hypot(clone.x - e.x, clone.y - e.y) < P.areaRadius + CHARACTER_MODEL.collisionRadius) {
                    damageShadowClone(clone, e.damage * P.damageMultiplier, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
                }
            }
            const angelG = liveAngel();
            if (angelG && Math.hypot(angelG.x - e.x, angelG.y - e.y) < P.areaRadius + angelG.radius) damageAngel(e.damage * P.damageMultiplier);
            shakeScreen(7);
            audio.playSlam(0.9);
        } else if (e.punchTimer <= 0 && P.root) {
            // Treant: as raízes estouram no ponto marcado; quem ainda está lá fica preso
            e.punchState = 2;
            e.punchTimer = P.strikeSeconds;
            e.rootWarn = false;
            if (Math.hypot(player.x - e.rootX, player.y - e.rootY) <= P.root.radius + CHARACTER_MODEL.collisionRadius) {
                player.rootedTimer = Math.max(player.rootedTimer ?? 0, P.root.seconds);
                player.rootGoo = false;
                player.rootedMax = player.rootedTimer;
                player.dashTimer = 0;
                audio.playShackle(true);
            }
            createExplosion(e.rootX, e.rootY, '#4ade80', 8);
            addShockwave(e.rootX, e.rootY, { radius: P.root.radius, color: '#4ade80', width: 4, seconds: 0.3 });
            shakeScreen(3);
        } else if (e.punchTimer <= 0) {
            e.punchState = 2;
            e.punchTimer = P.strikeSeconds;
            const hits = (x, y, radius = 0) => {
                const dx = x - e.x, dy = y - e.y;
                const d = Math.hypot(dx, dy);
                const diff = Math.atan2(Math.sin(Math.atan2(dy, dx) - e.punchAngle), Math.cos(Math.atan2(dy, dx) - e.punchAngle));
                return d <= P.range + radius && Math.abs(diff) <= P.halfAngle;
            };
            if (hits(player.x, player.y, CHARACTER_MODEL.collisionRadius)) {
                hurtPlayer(e.damage * P.damageMultiplier, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds, e);
            }
            for (const clone of shadowClones) {
                if (clone.active && hits(clone.x, clone.y, CHARACTER_MODEL.collisionRadius)) {
                    damageShadowClone(clone, e.damage * P.damageMultiplier, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
                }
            }
            const angelP = liveAngel();
            if (angelP && hits(angelP.x, angelP.y, angelP.radius)) damageAngel(e.damage * P.damageMultiplier);
            createExplosion(e.x + Math.cos(e.punchAngle) * 28, e.y + Math.sin(e.punchAngle) * 28, e.color, 10);
            addShockwave(e.x + Math.cos(e.punchAngle) * 26, e.y + Math.sin(e.punchAngle) * 26, { radius: 28, color: '#a3e635', width: 5, seconds: 0.3 });
            shakeScreen(4);
            audio.playSlam(0.65);
        }
        return true;
    }
    if (e.punchState === 2) {
        e.punchTimer -= dt;
        e.swing = 1;
        if (e.punchTimer <= 0) {
            e.punchState = 3;
            e.punchTimer = P.recoverySeconds;
            e.slamHit = false;
        }
        return true;
    }
    if (e.punchState === 3) {
        e.punchTimer -= dt;
        e.swing = Math.max(0, e.punchTimer / P.recoverySeconds);
        if (e.punchTimer <= 0) e.punchState = 0;
        return true;
    }
    e.swing = 0;
    e.punchCooldown -= dt;
    if (dist > P.range || e.punchCooldown > 0) return false;
    e.punchAngle = angle;
    if (P.root) { e.rootX = player.x; e.rootY = player.y; e.rootWarn = true; e.rootWindup = P.windupSeconds; e.rootR = P.root.radius; }       // o ponto das raízes fica marcado no começo: dá tempo de sair
    e.punchState = 1;
    e.punchTimer = P.windupSeconds;
    e.punchCooldown = P.cooldownSeconds;
    e.swing = 0;
    // Golpe em área: o círculo no chão avisa onde vai pegar e estoura quando as mãos batem (junto do fim da preparação)
    if (P.area) e.slamTele = addSlam(e.x, e.y, P.areaRadius, P.windupSeconds, e.damage * P.damageMultiplier, null, P.torchDamage ?? 0, '#a8a29e');
    return true;
}

// O golpe do Colosso varre um leque: da direita dele até a frente, na direção da tocha
function inSlamSweep(e, sweep, x, y) {
    if (Math.hypot(x - e.x, y - e.y) > sweep.radius + CHARACTER_MODEL.collisionRadius) return false;
    const a = Math.atan2(y - e.y, x - e.x) - Math.atan2(state.coreY - e.y, state.coreX - e.x);
    const relative = Math.atan2(Math.sin(a), Math.cos(a));
    return relative >= sweep.fromAngle && relative <= sweep.toAngle;
}

// Colosso de Ossos: para perto da tocha, prepara o golpe (slamState 1), desce a espada (2) e o dano sai quando
// a lâmina chega na chama. true = plantado, golpeando.
function updateTorchSlam(e, S, distCore, dt) {
    if (e.slamRecover > 0) e.slamRecover -= dt;
    if (e.slamState) {
        e.slamTimer -= dt;
        if (e.slamTimer > 0) return true;
        if (e.slamState === 1) {
            e.slamState = 2;
            e.slamTimer = S.strikeSeconds;
            audio.playDash();
            return true;
        }
        e.slamState = 0;
        e.slamTimer = S.cooldownSeconds;
        e.slamRecover = S.recoverSeconds;
        const ratio = e.slams ? S.repeatRatio : S.firstRatio;
        e.slams = (e.slams ?? 0) + 1;
        addShockwave(state.coreX, state.coreY, { radius: 200, color: e.color, width: 10, seconds: 0.6 });
        createExplosion(state.coreX, state.coreY, e.color, 16);
        hitStop(0.12);
        shakeScreen(22);
        if (inSlamSweep(e, S.sweep, player.x, player.y)) hurtPlayer(e.damage, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
        for (const c of shadowClones) {
            if (c.active && inSlamSweep(e, S.sweep, c.x, c.y)) damageShadowClone(c, e.damage, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
        }
        {
            const angelS = liveAngel();
            if (angelS && inSlamSweep(e, S.sweep, angelS.x, angelS.y)) damageAngel(e.damage);
        }
        hurtTorch(state.coreHpMax * ratio, state.coreX, state.coreY);
        return true;
    }
    e.planted = distCore <= S.range + e.radius;
    if (!e.planted) return false;
    e.slamTimer = (e.slamTimer ?? 0) - dt;
    if (e.slamTimer <= 0) {
        e.slamState = 1;
        e.slamTimer = S.windupSeconds;
        audio.playHorn();
    }
    return true;
}

// Bruxa: tiro no alvo; acerta a tocha também
function shoot(e, model, angle) {
    // O Cavaleiro Sem Cabeça atira com a cabeça, que flutua de lado
    const from = e.type === 'HEADLESS_KNIGHT' ? knightHeadOf(e) : e;
    state.enemyProjectiles.push({
        owner: e.type,          // quem atirou (só muda o desenho do projétil)
        color: model.projectileColor ?? model.color,
        x: from.x, y: from.y,
        vx: Math.cos(angle) * model.projectileSpeed,
        vy: Math.sin(angle) * model.projectileSpeed,
        radius: model.projectileRadius,
        damage: e.damage * model.projectileDamageMultiplier,
        torchDamage: model.projectileTorchDamage ?? 0
    });
}

// Necromante: levanta mortos em volta dele
function raiseDead(e, model) {
    const S = model.summon;
    for (let i = 0; i < S.count; i++) {
        const a = Math.random() * Math.PI * 2;
        state.telegraphs.push({
            kind: 'grave', radius: 18, age: 0, seconds: 0.7, monsterType: S.type,
            x: e.x + Math.cos(a) * S.spread, y: e.y + Math.sin(a) * S.spread
        });
    }
}

function updateAttacks(e, model, angle, dt, distToTarget) {
    if (model.isShadow) {
        updateShadowAI(e, model, dt);
        return;
    }
    if (e.isBoss) {
        updateBossAI(e, model, dt);
        return;
    }
    if (e.release > 0) e.release -= dt;
    if (!model.projectileSpeed && !model.summon) return;
    // Fora do alcance (longe demais, ou perto demais: shootMinRange) o relógio espera: ao entrar no alcance ainda sobra o tempo do aviso
    // (o brilho do elmo, os braços do golem erguendo)
    if ((model.shootRange && distToTarget > model.shootRange) || (model.shootMinRange && distToTarget < model.shootMinRange)) {
        e.shootTimer = Math.max(e.shootTimer, 0.6);
        e.aim = 0;
        e.holdAim = false;
        e.outOfRange = true;           // a arte não mostra a carga: o tempo fica parado, e o brilho ficaria preso sem tiro nenhum
        if (model.throwWindup) e.throwArm = 0;
        return;
    }
    e.outOfRange = false;
    e.shootTimer -= dt;
    // Golem: uma mão sobe nos últimos throwWindup segundos antes da pedra (e.throwArm, 0..1)
    if (model.throwWindup) e.throwArm = e.shootTimer < model.throwWindup ? 1 - Math.max(0, e.shootTimer) / model.throwWindup : 0;
    // Arqueiro: nos últimos aimSeconds PARA e puxa a corda (e.aim, 0 a 1); depois do tiro a corda vibra por releaseSeconds (e.release)
    if (model.aimSeconds) {
        e.aim = e.shootTimer < model.aimSeconds ? 1 - Math.max(0, e.shootTimer) / model.aimSeconds : 0;
        e.holdAim = e.aim > 0;
        if (e.holdAim) e.angle = angle;
    }
    if (e.shootTimer > 0) return;
    e.shootTimer = model.shootCooldownSeconds;
    e.throwArm = 0;
    if (model.aimSeconds) { e.aim = 0; e.holdAim = false; e.release = model.releaseSeconds; audio.playDash(); }
    // Necromante: levanta mortos (menos com a hora fechada) e atira uma alma no mesmo feitiço
    if (model.summon && (!state.lastStand || state.sandbox)) raiseDead(e, model);
    if (model.projectileSpeed) shoot(e, model, angle);
}

// Inchado: estoura ferindo o herói e os monstros em volta. O boss fica de fora: o dano é uma fração da
// vida máxima, e dois estouros bastariam para matá-lo de vida cheia.
function burst(e, model) {
    const X = model.explosion;
    const scale = e.radius / model.radius;
    const radius = X.radius * scale;
    if (Math.hypot(player.x - e.x, player.y - e.y) < radius) {
        hurtPlayer(X.damage * (e.damage / model.damage), e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
    }
    state.enemies.forEach(o => {
        if (o !== e && !o.isBoss && Math.hypot(o.x - e.x, o.y - e.y) < radius + o.radius) {
            const a = Math.atan2(o.y - e.y, o.x - e.x);
            dealDamage(o, o.maxHp * X.monsterDamageRatio, { kbX: Math.cos(a) * 320, kbY: Math.sin(a) * 320, noCrit: true });
        }
    });
    addShockwave(e.x, e.y, { radius, color: model.color, width: 7, seconds: 0.35 });
    createExplosion(e.x, e.y, model.color, 20);
    shakeScreen(7);
    audio.playBlast();
}

// Aparência e som da morte (com ou sem recompensa)
function deathEffects(e, model) {
    const scale = e.radius / model.radius;
    createExplosion(e.x, e.y, e.color, 10);
    // Sombra do rival: some numa nuvem violeta, sem restos no chão
    if (model.isShadow) {
        createExplosion(e.x, e.y, '#7c3aed', 14);
        return;
    }
    if (e.isBoss) {
        const dt = model.deathType ?? 'BOSS';          // chefes com morte própria (Slizork explode em bolhas)
        addGibs(dt, e.x, e.y, dt === 'BOSS' ? 1 : 1.6);
        addStain(dt, e.x, e.y, e.radius * 1.6);
        if (model.deathFx === 'water') riverSpiritBurst(e);
        return;
    }
    addGibs(e.type, e.x, e.y, scale);
    addStain(e.type, e.x, e.y, e.radius * 1.1);
    addCorpse(e);
}

function removeEnemy(i, e) {
    if (e === state.currentBoss) state.currentBoss = null;
    // Golem morto no meio da pancada: o aviso no chão some junto (não estoura sozinho)
    if (e.slamTele) {
        const t = state.telegraphs.indexOf(e.slamTele);
        if (t >= 0) state.telegraphs.splice(t, 1);
    }
    state.enemies.splice(i, 1);
}

// Morte com recompensa: pontos, XP, ouro, itens e os gatilhos dos poderes
// Morte do River Spirit: o chão molhado ESTOURA. Anéis de água se abrem em sequência, jatos de gotas sobem em volta dela um depois do outro
// (cada ponto estoura em respingos), clarão azul, tremor e uma poça enorme. As peças e as gotas: library/monsters/25d/death.js (river_spirit e river_spirit_splash)
function riverSpiritBurst(e) {
    const turn = state.turn;
    const later = (ms, fn) => setTimeout(() => { if (state.turn === turn && state.gameState !== 'START') fn(); }, ms);
    hitStop(0.16);
    shakeScreen(18);
    zoomPunch(0.04);
    screenFlash('#7dd3fc', 0.4);
    [0, 110, 230, 370].forEach((ms, i) => later(ms, () => {
        addShockwave(e.x, e.y, { radius: 100 + i * 75, color: i % 2 ? '#e0f2fe' : '#38bdf8', width: 10 - i * 2, seconds: 0.5 + i * 0.1 });
        shakeScreen(10 - i * 2);
    }));
    // Jatos em círculo: o chão rebenta ao redor, do perto para o longe
    for (let ring = 0; ring < 2; ring++) {
        const n = 8 + ring * 4;
        for (let k = 0; k < n; k++) {
            const a = (k / n) * Math.PI * 2 + ring * 0.4;
            const d = e.radius * (1.5 + ring * 1.6);
            later(90 + ring * 180 + k * 30, () => {
                const x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d;
                addGibs('RIVER_SPIRIT_SPLASH', x, y, 0.9);
                createExplosion(x, y, '#7dd3fc', 8);
                addShockwave(x, y, { radius: 38, color: '#bae6fd', width: 3, seconds: 0.3 });
            });
        }
    }
    later(200, () => addGibs('RIVER_SPIRIT', e.x, e.y, 1.2));       // segunda onda de bolhas
    addStain('RIVER_SPIRIT', e.x, e.y, e.radius * 3.2);
}

function killEnemy(i, e, model) {
    spreadBurn(e);
    deathEffects(e, model);
    addStreakKill();
    if (!model.isShadow) recordBeast(e.type);
    audio.playKill(state.streak);

    const pts = model.scoreReward * (e.elite ? 4 : 1);
    state.scoreTurn += pts;
    state.totalScore += Math.round(pts * getScoreMultiplier());
    state.run.kills++;
    if (state.oath === 'oathWhispers') state.whisperKills++;

    // XP é direto; o ouro cai em moedas no chão
    gainXp((model.xpRewardBase + state.turn * model.xpRewardPerTurn) * (e.elite ? 5 : 1) * (1 + mod('xp')));
    const gold = (rollMonsterGold(model) + mod('killGold')) * (e.elite ? 6 : 1) * (1 + mod('gold')) * (1 + getStreakGoldBonus()) * GOLD_ECONOMY.killGoldScale;
    dropGold(e.x, e.y, Math.max(1, Math.round(gold)));

    if (model.explosion) burst(e, model);
    if (e.type === 'VAMPIRE') {
        for (let s = 0; s < model.splitCount; s++) {
            const bat = createVampireBat(e.x, e.y, state.turn);
            bat.damage *= 1 + mod('enemyDamage');
            state.enemies.push(bat);
        }
    }
    onEnemyKilled(e);

    if (e.elite) {
        state.run.elites++;
        dropChest(e.x, e.y);
        addShockwave(e.x, e.y, { radius: 130, color: e.elite.color, width: 7, seconds: 0.45 });
        hitStop(0.09);
        shakeScreen(9);
        zoomPunch(0.02);
    } else if (e.dropsChest) {
        // Goblin do Baú: o baú das costas cai no chão (2 pontos de skill garantidos) e uma chuva de moedas voa para todo lado
        const T = WAVE_EVENTS.goblin.treasure;
        dropChest(e.x, e.y, T.skillPoints);
        dropTreasureGold(e.x, e.y, Math.round(T.goldBase + T.goldPerCurveTurn * effectiveTurn(state.turn)), T.coins, T.scatterSpeed);
        showToast('💰', 'THE GOBLIN DROPPED HIS TREASURE', 'Grab the chest and the coins!');
        addShockwave(e.x, e.y, { radius: 130, color: '#fbbf24', width: 7, seconds: 0.45 });
        audio.playGiggle?.();
        hitStop(0.06);
    } else {
        maybeDropPickup(e.x, e.y);
    }

    const wasBoss = e.isBoss;
    removeEnemy(i, e);
    if (wasBoss) {
        state.run.bosses++;
        dropChest(e.x, e.y);
        onBossKilled(e, model);
        // As sombras dele somem junto
        for (let j = state.enemies.length - 1; j >= 0; j--) {
            if (state.enemies[j].shadowOwner === e) purgeEnemy(j);
        }
    }
    updateHUD();
    checkHourEnd();
}

// Fim da hora: a onda de fogo apaga o que sobrou, sem recompensa
export function purgeEnemy(i) {
    const e = state.enemies[i];
    deathEffects(e, getEnemyModel(e.type));
    removeEnemy(i, e);
}

// --- INIMIGOS ---
export function updateEnemies(dt) {
    const { enemies } = state;
    state.blastBudget = MAX_BLASTS_PER_FRAME;

    separationTick++;
    if (separationTick % 2 === 0) separateEnemies(dt * 2);

    const damping = Math.pow(MONSTER_SPAWNING.movementDamping, dt * 60);
    const hunting = state.phase === 'HUNT';
    // Provoke e Oath of Slaughter: o herói chama a horda de mais longe
    const provoked = MONSTER_SPAWNING.targetPlayerDistance * (1 + mod('provoke'));
    const lure = state.nature.lure ?? state.decoy;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e) continue;                 // algo removeu monstros no meio do laço (a morte de um chefe leva as sombras dele): o índice pode ter passado do fim
        const model = getEnemyModel(e.type);

        // Nascendo (zona de nascimento do cenário): fica parado e não ataca até o efeito acabar (library/monsters/25d/spawn.js)
        if (e.emerge) {
            e.emerge.age += dt;
            if (e.emerge.age >= e.emerge.seconds) e.emerge = null;
            else { e.vx = e.vy = 0; continue; }
        }

        if (e.hitFlash > 0) e.hitFlash -= dt;
        if (e.orbitCd > 0) e.orbitCd -= dt;
        if (e.marked > 0) e.marked -= dt;
        if (e.ravenMark > 0) e.ravenMark -= dt;
        if (e.rooted > 0) e.rooted -= dt;
        if (e.blessed > 0) e.blessed -= dt;

        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= damping;
        e.vy *= damping;

        const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        // Arbusto da emboscada: com o herói escondido, o monstro comum não o vê e segue para a tocha. Carvalho acordado: o
        // monstro por perto vai bater nele. Boss não se deixa enganar
        const lured = lure && !e.isBoss && !model.ignoresPlayer && Math.hypot(lure.x - e.x, lure.y - e.y) < lure.lures;
        // O chefe SEMPRE caça o herói (de qualquer distância): antes ele só vinha dentro do raio de provocação dos monstros comuns e, fora dele, ia para a tocha
        const huntsPlayer = !model.ignoresPlayer && !e.torchOnly && (e.isBoss || distToPlayer < provoked);
        // Convertido do Avgustino por perto (Conversion): provoca o monstro comum, que vai bater nele. Boss não se deixa provocar
        const ally = !lured && !e.isBoss && !e.shadowOwner && !model.ignoresPlayer ? (provokingConvert(e) ?? provokingAngel(e)) : null;
        // Chefe: vira para a sombra que o provoca (perto dele e mais perto que o herói); senão, o herói
        const bossT = e.isBoss && huntsPlayer ? bossTarget(e) : null;
        const targetX = lured ? lure.x : ally ? ally.x : bossT ? bossT.x : huntsPlayer ? player.x : state.coreX;
        const targetY = lured ? lure.y : ally ? ally.y : bossT ? bossT.y : huntsPlayer ? player.y : state.coreY;
        const distToTarget = Math.hypot(targetX - e.x, targetY - e.y);
        const distCore = Math.hypot(state.coreX - e.x, state.coreY - e.y);

        const toTargetAngle = Math.atan2(targetY - e.y, targetX - e.x);
        // Imparável (Captain Brutos): nada o atrasa
        // Lentidão com tempo (a rosa do druida): enquanto durar, vale como a lentidão de qualquer outro efeito
        if (e.roseSlowTimer > 0) {
            e.roseSlowTimer -= dt;
            e.slow = Math.max(e.slow ?? 0, ROSE_SKILL.slow);
        }
        const slow = e.unstoppable ? 0 : (e.slow ?? 0);
        e.slow = 0;

        if (e.frozen > 0) {
            e.frozen -= dt;
        } else if (e.stunned > 0) {
            e.stunned -= dt;
        } else {
            e.angle = toTargetAngle;
            e.facing = lerpAngle(e.facing ?? e.angle, e.angle, Math.min(1, dt * FACING_SMOOTHING));
            const lunging = model.lunge && hunting && !e.chained && !(e.rooted > 0) && updateLunge(e, model.lunge, distToTarget, toTargetAngle, dt);
            // Só mantém distância dentro do campo e antes da reta final: parado fora do mapa, ninguém o alcançaria e a hora não fecharia
            const inField = e.x > e.radius && e.x < state.width - e.radius && e.y > e.radius && e.y < state.height - e.radius;
            const holdsDistance = model.keepDistance && inField && !state.lastStand && distToTarget < model.keepDistance;
            const slamming = model.torchSlam && hunting && updateTorchSlam(e, model.torchSlam, distCore, dt);
            const punching = model.punch && hunting && updateTreantPunch(e, model.punch, distToTarget, toTargetAngle, dt);
            // Chefe com melee (Grave King): o corte é o de boss_ai.js (updateBossMelee, outras chaves). Este é o dos monstros comuns: num chefe o temporizador virava NaN e ele parava de andar para sempre
            const meleeing = model.melee && !e.isBoss && hunting && !e.chained && !(e.rooted > 0) && updateMelee(e, model.melee, distToTarget, toTargetAngle, dt);
            const tonguing = model.tongue && hunting && !(e.rooted > 0) && updateTongue(e, model.tongue, distToTarget, toTargetAngle, dt);
            if (state.phase !== 'HUNT' && hunting) return;
            const blockedByTorch = e.isBoss && distCore < CORE_MODEL.bossStopDistance + e.radius;

            // Preso por raízes (Natureza): não anda, mas continua atacando o que estiver ao alcance
            // Provocado por um convertido: para encostado nele (sem isso todos entravam no meio dele e pareciam travados)
            const touchingAlly = ally && distToTarget < ally.radius + e.radius + 2;
            if (!lunging && !holdsDistance && !blockedByTorch && !slamming && !punching && !meleeing && !tonguing && !e.holdAim && !touchingAlly && !(e.rooted > 0)) {
                const speed = e.speed * (1 - slow);
                e.x += Math.cos(toTargetAngle) * speed * dt;
                e.y += Math.sin(toTargetAngle) * speed * dt;
            }

            if (hunting) {
                updateAttacks(e, model, toTargetAngle, dt, distToTarget);

                // Boss na tocha: não se joga na chama, fica mordendo até ser expulso ou morto
                if (blockedByTorch) {
                    e.torchHitTimer = (e.torchHitTimer ?? 0) - dt;
                    if (e.torchHitTimer <= 0) {
                        e.torchHitTimer = CORE_MODEL.bossHitSeconds;
                        // Rival: o boneco golpeia a tocha com a espada
                        if (e.comboStep) e.comboStep = (e.comboStep % 3) + 1;
                        hurtTorch(CORE_MODEL.bossHitDamage, e.x, e.y);
                        if (state.phase !== 'HUNT') return;
                    }
                }
            }
        }

        // Boss andando: o chão treme de tempos em tempos (não a cada passo)
        if (e.isBoss && model.walkShakeIntensity && !e.chained) {
            e.walkShakeTimer = (e.walkShakeTimer ?? model.walkShakeIntervalSeconds) - dt;
            if (e.walkShakeTimer <= 0) {
                e.walkShakeTimer = model.walkShakeIntervalSeconds;
                shakeScreen(model.walkShakeIntensity);
            }
        }

        // Monstro pesado: cada passo faz o chão tremer
        if (model.stepShake && !e.chained) {
            e.stepTimer = (e.stepTimer ?? model.stepShake.intervalSeconds) - dt;
            if (e.stepTimer <= 0) {
                e.stepTimer = model.stepShake.intervalSeconds;
                shakeScreen(model.stepShake.intensity);
            }
        }

        // Elite em chamas: deixa fogo pelo caminho
        if (e.elite?.flameTrail) {
            e.flameTimer = (e.flameTimer ?? 0) - dt;
            if (e.flameTimer <= 0) {
                e.flameTimer = 0.4;
                addHostileFire(e.x, e.y);
            }
        }

        // Golpe no convertido que o provocou (no contato, com intervalo próprio)
        if (e.allyHitCd > 0) e.allyHitCd -= dt;
        if (hunting && ally && !(e.allyHitCd > 0) && Math.hypot(ally.x - e.x, ally.y - e.y) < ally.radius + e.radius + 4) {
            e.allyHitCd = CONVERSION.enemyHitSeconds;
            hurtConvert(ally, e.damage);
        }

        // Colisão com Herói
        if (hunting && distToPlayer < e.radius + CHARACTER_MODEL.collisionRadius && player.iFrames <= 0) {
            const hit = hurtPlayer(e.damage, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds, e);
            if (state.phase !== 'HUNT') return;

            const pushAngle = Math.atan2(e.y - player.y, e.x - player.x);
            const contactImpulse = MONSTER_SPAWNING.contactKnockback * (1 - (e.knockbackResist ?? 0));
            e.vx += Math.cos(pushAngle) * contactImpulse;
            e.vy += Math.sin(pushAngle) * contactImpulse;
            if (hit && model.contactKnockback) knockbackPlayer(e.x, e.y, model.contactKnockback);
            if (mod('thorns') > 0) dealDamage(e, getAtkDamage() * mod('thorns'), { noCrit: true });
        }

        // Sombras do Shadow Clone: o monstro não corre atrás delas, mas quem esbarra nelas as machuca
        if (hunting) {
            for (const c of shadowClones) {
                if (!c.active || c.iFrames > 0 || Math.hypot(c.x - e.x, c.y - e.y) >= e.radius + CHARACTER_MODEL.collisionRadius) continue;
                damageShadowClone(c, e.damage, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
                const pushAngle = Math.atan2(e.y - c.y, e.x - c.x);
                const contactImpulse = MONSTER_SPAWNING.contactKnockback * (1 - (e.knockbackResist ?? 0));
                e.vx += Math.cos(pushAngle) * contactImpulse;
                e.vy += Math.sin(pushAngle) * contactImpulse;
            }
        }

        // Morte
        if (e.hp <= 0) {
            killEnemy(i, e, model);
            if (state.gameState !== 'PLAYING') return;
            continue;
        }

        // Quem está caçando o herói contorna a chama: atrair monstros é o que protege a tocha
        const touchesCore = distCore < e.radius + CORE_MODEL.collisionRadius;
        if (touchesCore && huntsPlayer && !(e.dashTimer > 0)) {          // no meio do avanço o chefe atravessa a tocha (e a fere, em boss_ai.js)
            const a = Math.atan2(e.y - state.coreY, e.x - state.coreX);
            e.x = state.coreX + Math.cos(a) * (e.radius + CORE_MODEL.collisionRadius);
            e.y = state.coreY + Math.sin(a) * (e.radius + CORE_MODEL.collisionRadius);
        }

        // Colisão com Núcleo: o monstro se consome na chama e leva um pedaço dela
        if (hunting && !e.isBoss && !model.torchSlam && touchesCore && !huntsPlayer) {
            // Torch Ward: o escudo repele o monstro (e os vizinhos) em vez de deixar a chama ser consumida
            if (wardTorch(e)) continue;
            const damage = (model.torchDamage ?? CORE_MODEL.damageTakenPerMonster) * (e.elite ? 2 : 1);
            if (model.explosion) burst(e, model);
            createExplosion(e.x, e.y, e.color, 8);
            removeEnemy(i, e);
            state.waveStats.consumed++;                    // para a estrela "nenhum monstro consumido pela tocha"
            hurtTorch(damage, e.x, e.y);
            if (state.phase !== 'HUNT') return;
            continue;
        }

        // Shadow Shackle: vale por último para desfazer tudo que tentou mover o monstro (passos, empurrões, Rift, separação)
        if (e.chained || e.holdStill > 0) {
            e.x = e.chainX;
            e.y = e.chainY;
            e.vx = 0;
            e.vy = 0;
        }
    }
}

// --- PROJÉTEIS INIMIGOS ---
// Mirror Ward: rebate o tiro para o monstro mais próximo (null se não houver alvo)
function tryReflect(p) {
    let target = null;
    let best = Infinity;
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < best) { best = d; target = e; }
    });
    if (!target) return false;

    const angle = Math.atan2(target.y - p.y, target.x - p.x);
    const speed = Math.hypot(p.vx, p.vy) * MIRROR_WARD.speedMultiplier;
    p.reflected = true;
    p.target = target;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.damage = Math.max(MIRROR_WARD.minimumDamage, p.damage * MIRROR_WARD.damageMultiplier);

    player.reflectTimer = MIRROR_WARD.cooldownSeconds;
    player.reflectTime = performance.now();
    player.reflectAngle = Math.atan2(p.y - player.y, p.x - player.x);
    audio.playReflect();
    createExplosion(p.x, p.y, '#7dd3fc', 8);
    shakeScreen(3);
    return true;
}

// Torch Ward: vira o tiro contra o monstro mais próximo (como o Mirror Ward, mas a favor da tocha)
function reflectAtMonsters(p) {
    let target = null;
    let best = Infinity;
    for (const e of state.enemies) {
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < best) { best = d; target = e; }
    }
    if (!target) return false;
    const angle = Math.atan2(target.y - p.y, target.x - p.x);
    const speed = Math.hypot(p.vx, p.vy) * MIRROR_WARD.speedMultiplier;
    p.reflected = true;
    p.target = target;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.damage = Math.max(MIRROR_WARD.minimumDamage, p.damage * MIRROR_WARD.damageMultiplier);
    audio.playReflect();
    createExplosion(p.x, p.y, '#fde68a', 8);
    return true;
}

// Tiro rebatido: curva suave até o alvo e machuca monstros (nunca o herói)
function updateReflectedProjectile(p, i, dt) {
    const { enemyProjectiles, enemies } = state;
    if (p.target && enemies.includes(p.target)) {
        const speed = Math.hypot(p.vx, p.vy);
        const current = Math.atan2(p.vy, p.vx);
        let diff = Math.atan2(p.target.y - p.y, p.target.x - p.x) - current;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turned = current + Math.max(-1, Math.min(1, diff)) * Math.min(Math.abs(diff), MIRROR_WARD.homingTurnRate * dt);
        p.vx = Math.cos(turned) * speed;
        p.vy = Math.sin(turned) * speed;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    for (const e of enemies) {
        if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + p.radius) {
            dealDamage(e, p.damage, { kbX: p.vx * 0.4, kbY: p.vy * 0.4 });
            createExplosion(p.x, p.y, p.hitColor ?? '#7dd3fc', 12);
            audio.playExplode();
            enemyProjectiles.splice(i, 1);
            return;
        }
    }
    if (p.x < 0 || p.x > state.width || p.y < 0 || p.y > state.height) enemyProjectiles.splice(i, 1);
}

// Bolha do Slizork: persegue o herói devagar (vira suavemente) e estoura ao fim da vida ou ao encostar nele
function updateBubble(p, i, dt) {
    const { enemyProjectiles } = state;
    p.age += dt;
    const dx = player.x - p.x, dy = player.y - p.y, d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, dt * 2.2);
    p.vx += ((dx / d) * p.speed - p.vx) * k;
    p.vy += ((dy / d) * p.speed - p.vy) * k;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    // Encostar só estoura com o herói vulnerável (como os outros tiros): no dash (ou logo depois de levar um golpe) ela o atravessa e segue perseguindo,
    // em vez de estourar de graça e sumir. O fim da vida dela continua estourando.
    const touching = d < p.radius + CHARACTER_MODEL.collisionRadius && player.iFrames <= 0;
    if (p.age >= p.life || touching) {
        enemyProjectiles.splice(i, 1);
        addShockwave(p.x, p.y, { radius: p.burstRadius, color: p.burstColor ?? '#86efac', width: 5, seconds: 0.3 });
        createExplosion(p.x, p.y, p.burstColor ?? '#86efac', 16);
        if (p.skull) shakeScreen(5);
        audio.playBlast();
        if (Math.hypot(player.x - p.x, player.y - p.y) < p.burstRadius + CHARACTER_MODEL.collisionRadius) {
            hurtPlayer(p.damage, p.x, p.y, CHARACTER_MODEL.projectileInvulnerabilitySeconds);
        }
        hurtOaks(p.x, p.y, p.burstRadius, p.damage);
        for (const c of shadowClones) if (c.active && Math.hypot(c.x - p.x, c.y - p.y) < p.burstRadius + 12) damageShadowClone(c, p.damage, p.x, p.y, 0.5);
        const angelB = liveAngel();
        if (angelB && Math.hypot(angelB.x - p.x, angelB.y - p.y) < p.burstRadius + angelB.radius) damageAngel(p.damage, 0.5);
    }
}

export function updateEnemyProjectiles(dt) {
    const { enemyProjectiles } = state;
    player.reflectTimer = Math.max(0, player.reflectTimer - dt);
    if (state.phase !== 'HUNT') return;

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        if (p.bubble) {
            updateBubble(p, i, dt);
            if (state.phase !== 'HUNT') return;
            continue;
        }
        if (p.reflected) {
            updateReflectedProjectile(p, i, dt);
            continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Tiro com alcance máximo (adagas do Azael): some ao percorrer a distância
        if (p.range) {
            p.travelled += Math.hypot(p.vx, p.vy) * dt;
            if (p.travelled >= p.range) {
                enemyProjectiles.splice(i, 1);
                continue;
            }
        }

        // A árvore do druida (carvalho) também leva o tiro: a magia da bruxa passava reto por ela. O tronco absorve o tiro e perde vida
        const oak = state.nature.oaks.find(o => Math.hypot(o.x - p.x, o.y - p.y) < POWER_MODELS.shelterOak.trunkRadius + p.radius);
        if (oak) {
            oak.hp -= p.damage;
            oak.shake = 0.18;
            createExplosion(p.x, p.y, p.color ?? '#a16207', 6);
            enemyProjectiles.splice(i, 1);
            continue;
        }

        if (passives.mirrorWard.lvl > 0 && player.reflectTimer <= 0
            && Math.hypot(player.x - p.x, player.y - p.y) < p.radius + MIRROR_WARD.catchRadius
            && tryReflect(p)) {
            continue;
        }

        if (Math.hypot(player.x - p.x, player.y - p.y) < p.radius + CHARACTER_MODEL.collisionRadius && player.iFrames <= 0) {
            enemyProjectiles.splice(i, 1);
            hurtPlayer(p.damage, p.x - p.vx * 0.05, p.y - p.vy * 0.05, CHARACTER_MODEL.projectileInvulnerabilitySeconds);
            // Morreu, ou reviveu (o revive limpa os tiros da tela)
            if (state.phase !== 'HUNT' || enemyProjectiles.length === 0) return;
            continue;
        }

        // O anjo guardião também absorve o tiro (e leva o dano)
        if (hitAngelWithShot(p)) {
            createExplosion(p.x, p.y, '#fef9c3', 5);
            enemyProjectiles.splice(i, 1);
            continue;
        }

        // A sombra ABSORVE o tiro mesmo enquanto está invulnerável (logo depois de levar um): antes os tiros seguintes de uma rajada passavam reto por ela e
        // iam no herói; agora só o primeiro causa dano, e os outros somem na sombra sem feri-la
        const hitClone = shadowClones.find(c => c.active && Math.hypot(c.x - p.x, c.y - p.y) < p.radius + CHARACTER_MODEL.collisionRadius);
        if (hitClone) {
            if (hitClone.iFrames <= 0) damageShadowClone(hitClone, p.damage, p.x - p.vx * 0.05, p.y - p.vy * 0.05, CHARACTER_MODEL.projectileInvulnerabilitySeconds);
            else createExplosion(p.x, p.y, '#a78bfa', 4);
            enemyProjectiles.splice(i, 1);
            continue;
        }

        // Torch Ward: o escudo da tocha devolve o tiro que vinha para ela
        if (p.torchDamage && Math.hypot(state.coreX - p.x, state.coreY - p.y) < p.radius + CORE_MODEL.collisionRadius + 26
            && state.torchWard.charges > 0 && reflectAtMonsters(p) && wardSpendForShot(p.x, p.y)) {
            continue;
        }

        // Tiros também ferem a tocha: atiradores de longe precisam ser caçados
        if (p.torchDamage && Math.hypot(state.coreX - p.x, state.coreY - p.y) < p.radius + CORE_MODEL.collisionRadius) {
            enemyProjectiles.splice(i, 1);
            hurtTorch(p.torchDamage, p.x, p.y);
            if (state.phase !== 'HUNT') return;
            continue;
        }

        if (p.x < 0 || p.x > state.width || p.y < 0 || p.y > state.height) {
            enemyProjectiles.splice(i, 1);
        }
    }
}
