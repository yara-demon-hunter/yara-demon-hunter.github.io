import { CHARACTER_MODEL } from '../../data_model/character.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { MONSTER_MODELS, MONSTER_SPAWNING, createGoblinChild, rollMonsterGold } from '../../data_model/monsters.js';
import { audio, player, state } from '../core/state.js';
import { updateHUD } from '../ui/hud.js';
import { triggerGameOver } from '../ui/screens.js';
import { openShop } from '../ui/shop.js';
import { createExplosion, registerPlayerHit, shakeScreen } from './effects.js';
import { gainXp } from './progression.js';
import { dropGold } from './gold.js';

// --- INIMIGOS ---
export function updateEnemies(dt) {
    const { enemies } = state;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= MONSTER_SPAWNING.movementDamping;
        e.vy *= MONSTER_SPAWNING.movementDamping;

        const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        const targetX = distToPlayer < MONSTER_SPAWNING.targetPlayerDistance ? player.x : state.coreX;
        const targetY = distToPlayer < MONSTER_SPAWNING.targetPlayerDistance ? player.y : state.coreY;

        const toTargetAngle = Math.atan2(targetY - e.y, targetX - e.x);
        e.angle = toTargetAngle;
        e.x += Math.cos(toTargetAngle) * e.speed * dt;
        e.y += Math.sin(toTargetAngle) * e.speed * dt;

        // WITCH / BOSS
        if (e.type === 'WITCH' || e.type === 'BOSS') {
            e.shootTimer -= dt;
            if (e.shootTimer <= 0) {
                const model = MONSTER_MODELS[e.type];
                e.shootTimer = model.shootCooldownSeconds;
                state.enemyProjectiles.push({
                    owner: e.type,          // quem atirou (só muda o desenho do projétil)
                    x: e.x, y: e.y,
                    vx: Math.cos(toTargetAngle) * model.projectileSpeed,
                    vy: Math.sin(toTargetAngle) * model.projectileSpeed,
                    radius: model.projectileRadius,
                    damage: e.damage * model.projectileDamageMultiplier
                });
            }
        }

        // Colisão com Herói
        if (distToPlayer < e.radius + CHARACTER_MODEL.collisionRadius && player.iFrames <= 0) {
            player.hp -= e.damage;
            shakeScreen(6);
            audio.playHurt();

            player.iFrames = CHARACTER_MODEL.invulnerabilitySeconds;
            registerPlayerHit(e.x, e.y);
            createExplosion(player.x, player.y, '#f43f5e', 12);
            updateHUD();

            const pushAngle = Math.atan2(e.y - player.y, e.x - player.x);
            e.vx += Math.cos(pushAngle) * MONSTER_SPAWNING.contactKnockback;
            e.vy += Math.sin(pushAngle) * MONSTER_SPAWNING.contactKnockback;

            if (player.hp <= 0) {
                triggerGameOver('PLAYER');
                return;
            }
        }

        // Colisão com Núcleo
        const distCore = Math.hypot(state.coreX - e.x, state.coreY - e.y);
        if (distCore < e.radius + CORE_MODEL.collisionRadius) {
            state.coreHp -= CORE_MODEL.damageTakenPerMonster;
            shakeScreen(8);
            audio.playExplode();
            createExplosion(e.x, e.y, '#f43f5e', 14);

            if (e === state.currentBoss) state.currentBoss = null;
            enemies.splice(i, 1);
            updateHUD();

            if (state.coreHp <= 0) {
                triggerGameOver('CORE');
                return;
            }
            continue;
        }

        // Morte
        if (e.hp <= 0) {
            audio.playExplode();
            createExplosion(e.x, e.y, e.color, 12);

            const monsterModel = MONSTER_MODELS[e.type];
            const pts = monsterModel.scoreReward;
            state.scoreTurn += pts;
            state.totalScore += pts;

            // XP é direto; o ouro cai em moedas que voam até o herói
            const gainedXp = monsterModel.xpRewardBase + state.turn * monsterModel.xpRewardPerTurn;
            gainXp(gainedXp);
            dropGold(e.x, e.y, rollMonsterGold(e.type));

            if (e.type === 'GOBLIN') {
                for (let s = 0; s < monsterModel.splitCount; s++) {
                    enemies.push(createGoblinChild(e.x, e.y));
                }
            }

            if (e === state.currentBoss) state.currentBoss = null;
            enemies.splice(i, 1);
            updateHUD();

            if (state.scoreTurn >= state.targetScore && !state.currentBoss) {
                state.turn++;
                state.scoreTurn = 0;
                state.targetScore = Math.floor(500 * Math.pow(1.35, state.turn - 1));
                openShop();
                break;
            }
        }
    }
}

// --- PROJÉTEIS INIMIGOS ---
export function updateEnemyProjectiles(dt) {
    const { enemyProjectiles } = state;

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (Math.hypot(player.x - p.x, player.y - p.y) < p.radius + CHARACTER_MODEL.collisionRadius && player.iFrames <= 0) {
            player.hp -= p.damage;
            audio.playHurt();
            player.iFrames = CHARACTER_MODEL.projectileInvulnerabilitySeconds;
            registerPlayerHit(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
            updateHUD();
            enemyProjectiles.splice(i, 1);
            if (player.hp <= 0) { triggerGameOver('PLAYER'); return; }
            continue;
        }

        if (p.x < 0 || p.x > state.width || p.y < 0 || p.y > state.height) {
            enemyProjectiles.splice(i, 1);
        }
    }
}
