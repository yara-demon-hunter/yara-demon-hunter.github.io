import { CHARACTER_MODEL } from '../../data_model/character.js';
import { BOSS_MODELS } from '../../data_model/bosses.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { MONSTER_MODELS, MONSTER_SPAWNING, createVampireBat, rollMonsterGold } from '../../data_model/monsters.js';
import { MIRROR_WARD } from '../../data_model/passives.js';
import { audio, passives, player, shadowClone, state } from '../core/state.js';
import { updateHUD } from '../ui/hud.js';
import { updateBossAI } from './boss_ai.js';
import { dealDamage } from './damage.js';
import { addGibs, addShockwave, addStain, createExplosion, hitStop, shakeScreen, zoomPunch } from './effects.js';
import { dropGold } from './gold.js';
import { mod } from './modifiers.js';
import { checkHourEnd, onBossKilled } from './night.js';
import { dropChest, maybeDropPickup } from './pickups.js';
import { hurtPlayer } from './player.js';
import { addHostileFire, onEnemyKilled } from './powers.js';
import { gainXp } from './progression.js';
import { damageShadowClone } from './shadow_clone.js';

import { addStreakKill, getScoreMultiplier, getStreakGoldBonus } from './streak.js';
import { lerpAngle } from '../render/fx/easing.js';
import { getAtkDamage } from './stats.js';
import { hurtTorch } from './torch.js';

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
            if (!a.isBoss) { a.x -= nx; a.y -= ny; }
            if (!b.isBoss) { b.x += nx; b.y += ny; }
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
        state.telegraphs.push({
            kind: 'line', x: e.x, y: e.y, angle, owner: e,
            length: L.speed * L.seconds + 24, age: 0, seconds: L.aimSeconds
        });
        return true;
    }
    return false;
}

// Bruxa: tiro no alvo; acerta a tocha também
function shoot(e, model, angle) {
    state.enemyProjectiles.push({
        owner: e.type,          // quem atirou (só muda o desenho do projétil)
        color: model.color,
        x: e.x, y: e.y,
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

function updateAttacks(e, model, angle, dt) {
    if (e.isBoss) {
        updateBossAI(e, model, dt);
        return;
    }
    if (e.type !== 'WITCH' && !model.summon) return;
    e.shootTimer -= dt;
    if (e.shootTimer > 0) return;
    e.shootTimer = model.shootCooldownSeconds;
    if (!model.summon) shoot(e, model, angle);
    else if (!state.lastStand) raiseDead(e, model);
}

// Inchado: estoura ferindo o herói e os monstros em volta
function burst(e, model) {
    const X = model.explosion;
    const scale = e.radius / model.radius;
    const radius = X.radius * scale;
    if (Math.hypot(player.x - e.x, player.y - e.y) < radius) {
        hurtPlayer(X.damage * (e.damage / model.damage), e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
    }
    state.enemies.forEach(o => {
        if (o !== e && Math.hypot(o.x - e.x, o.y - e.y) < radius + o.radius) {
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
    if (e.isBoss) {
        addGibs('BOSS', e.x, e.y);
        addStain('BOSS', e.x, e.y, e.radius * 1.6);
        return;
    }
    addGibs(e.type, e.x, e.y, scale);
    addStain(e.type, e.x, e.y, e.radius * 1.1);
}

function removeEnemy(i, e) {
    if (e === state.currentBoss) state.currentBoss = null;
    state.enemies.splice(i, 1);
}

// Morte com recompensa: pontos, XP, ouro, itens e os gatilhos dos poderes
function killEnemy(i, e, model) {
    deathEffects(e, model);
    addStreakKill();
    audio.playKill(state.streak);

    const pts = model.scoreReward * (e.elite ? 4 : 1);
    state.scoreTurn += pts;
    state.totalScore += Math.round(pts * getScoreMultiplier());
    state.run.kills++;
    state.run.killsByType[e.type] = (state.run.killsByType[e.type] ?? 0) + 1;

    // XP é direto; o ouro cai em moedas no chão
    gainXp((model.xpRewardBase + state.turn * model.xpRewardPerTurn) * (e.elite ? 5 : 1) * (1 + mod('xp')));
    const gold = rollMonsterGold(model) * (e.elite ? 6 : 1) * (1 + mod('gold')) * (1 + getStreakGoldBonus());
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
    } else {
        maybeDropPickup(e.x, e.y);
    }

    const wasBoss = e.isBoss;
    removeEnemy(i, e);
    if (wasBoss) {
        state.run.bosses++;
        dropChest(e.x, e.y);
        onBossKilled(e, model);
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

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const model = getEnemyModel(e.type);

        if (e.hitFlash > 0) e.hitFlash -= dt;
        if (e.orbitCd > 0) e.orbitCd -= dt;

        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= damping;
        e.vy *= damping;

        const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        const huntsPlayer = !model.ignoresPlayer && distToPlayer < MONSTER_SPAWNING.targetPlayerDistance;
        const targetX = huntsPlayer ? player.x : state.coreX;
        const targetY = huntsPlayer ? player.y : state.coreY;
        const distToTarget = Math.hypot(targetX - e.x, targetY - e.y);
        const distCore = Math.hypot(state.coreX - e.x, state.coreY - e.y);

        const toTargetAngle = Math.atan2(targetY - e.y, targetX - e.x);
        const slow = e.slow ?? 0;
        e.slow = 0;

        if (e.frozen > 0) {
            e.frozen -= dt;
        } else {
            e.angle = toTargetAngle;
            e.facing = lerpAngle(e.facing ?? e.angle, e.angle, Math.min(1, dt * FACING_SMOOTHING));
            const lunging = model.lunge && hunting && updateLunge(e, model.lunge, distToTarget, toTargetAngle, dt);
            const holdsDistance = model.keepDistance && distToTarget < model.keepDistance;
            const blockedByTorch = e.isBoss && distCore < CORE_MODEL.bossStopDistance + e.radius;

            if (!lunging && !holdsDistance && !blockedByTorch) {
                const speed = e.speed * (1 - slow);
                e.x += Math.cos(toTargetAngle) * speed * dt;
                e.y += Math.sin(toTargetAngle) * speed * dt;
            }

            if (hunting) {
                updateAttacks(e, model, toTargetAngle, dt);

                // Boss na tocha: não se joga na chama, fica mordendo até ser expulso ou morto
                if (blockedByTorch) {
                    e.torchHitTimer = (e.torchHitTimer ?? 0) - dt;
                    if (e.torchHitTimer <= 0) {
                        e.torchHitTimer = CORE_MODEL.bossHitSeconds;
                        hurtTorch(CORE_MODEL.bossHitDamage, e.x, e.y);
                        if (state.phase !== 'HUNT') return;
                    }
                }
            }
        }

        // Boss andando: o chão treme de tempos em tempos (não a cada passo)
        if (e.isBoss && model.walkShakeIntensity) {
            e.walkShakeTimer = (e.walkShakeTimer ?? model.walkShakeIntervalSeconds) - dt;
            if (e.walkShakeTimer <= 0) {
                e.walkShakeTimer = model.walkShakeIntervalSeconds;
                shakeScreen(model.walkShakeIntensity);
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

        // Colisão com Herói
        if (hunting && distToPlayer < e.radius + CHARACTER_MODEL.collisionRadius && player.iFrames <= 0) {
            hurtPlayer(e.damage, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
            if (state.phase !== 'HUNT') return;

            const pushAngle = Math.atan2(e.y - player.y, e.x - player.x);
            e.vx += Math.cos(pushAngle) * MONSTER_SPAWNING.contactKnockback;
            e.vy += Math.sin(pushAngle) * MONSTER_SPAWNING.contactKnockback;
            if (mod('thorns') > 0) dealDamage(e, getAtkDamage() * mod('thorns'), { noCrit: true });
        }

        // Colisão com o Shadow Clone (passiva): ele também se machuca
        if (hunting && shadowClone.active && shadowClone.iFrames <= 0
            && Math.hypot(shadowClone.x - e.x, shadowClone.y - e.y) < e.radius + CHARACTER_MODEL.collisionRadius) {
            damageShadowClone(e.damage, e.x, e.y, CHARACTER_MODEL.invulnerabilitySeconds);
            const pushAngle = Math.atan2(e.y - shadowClone.y, e.x - shadowClone.x);
            e.vx += Math.cos(pushAngle) * MONSTER_SPAWNING.contactKnockback;
            e.vy += Math.sin(pushAngle) * MONSTER_SPAWNING.contactKnockback;
        }

        // Morte
        if (e.hp <= 0) {
            killEnemy(i, e, model);
            if (state.gameState !== 'PLAYING') return;
            continue;
        }

        // Quem está caçando o herói contorna a chama: atrair monstros é o que protege a tocha
        const touchesCore = distCore < e.radius + CORE_MODEL.collisionRadius;
        if (touchesCore && huntsPlayer) {
            const a = Math.atan2(e.y - state.coreY, e.x - state.coreX);
            e.x = state.coreX + Math.cos(a) * (e.radius + CORE_MODEL.collisionRadius);
            e.y = state.coreY + Math.sin(a) * (e.radius + CORE_MODEL.collisionRadius);
        }

        // Colisão com Núcleo: o monstro se consome na chama e leva um pedaço dela
        if (hunting && !e.isBoss && touchesCore && !huntsPlayer) {
            const damage = (model.torchDamage ?? CORE_MODEL.damageTakenPerMonster) * (e.elite ? 2 : 1);
            if (model.explosion) burst(e, model);
            createExplosion(e.x, e.y, e.color, 8);
            removeEnemy(i, e);
            hurtTorch(damage, e.x, e.y);
            if (state.phase !== 'HUNT') return;
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
            createExplosion(p.x, p.y, '#7dd3fc', 12);
            audio.playExplode();
            enemyProjectiles.splice(i, 1);
            return;
        }
    }
    if (p.x < 0 || p.x > state.width || p.y < 0 || p.y > state.height) enemyProjectiles.splice(i, 1);
}

export function updateEnemyProjectiles(dt) {
    const { enemyProjectiles } = state;
    player.reflectTimer = Math.max(0, player.reflectTimer - dt);
    if (state.phase !== 'HUNT') return;

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        if (p.reflected) {
            updateReflectedProjectile(p, i, dt);
            continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

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

        if (shadowClone.active && shadowClone.iFrames <= 0
            && Math.hypot(shadowClone.x - p.x, shadowClone.y - p.y) < p.radius + CHARACTER_MODEL.collisionRadius) {
            damageShadowClone(p.damage, p.x - p.vx * 0.05, p.y - p.vy * 0.05, CHARACTER_MODEL.projectileInvulnerabilitySeconds);
            enemyProjectiles.splice(i, 1);
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
