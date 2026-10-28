import { CHARACTER_MODEL, createPlayerState } from '../data_model/character.js';
import { CORE_MODEL } from '../data_model/core.js';
import { BLADE_SKILL, FRENZY_NOVA_SKILL, POWERUP_MODELS, createAttributes } from '../data_model/skills.js';
import {
    MONSTER_MODELS,
    MONSTER_SPAWNING,
    chooseMonsterType,
    createMonster,
    createSplitterChild,
    rollMonsterGold
} from '../data_model/monsters.js';
import { SoundEngine } from './sound-engine.js';

const audio = new SoundEngine();
const attributes = createAttributes();

// --- VARIÁVEIS DE ESTADO ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'START';
let width = 0, height = 0;
let lastTime = performance.now();

// Screen Shake
let shakeIntensity = 0;

// Dados de Progresso
let turn = 1;
let scoreTurn = 0;
let targetScore = 500;
let totalScore = 0;
let coins = 0;

// Level & XP
let playerLevel = 1;
let playerXp = 0;
let playerMaxXp = CHARACTER_MODEL.xpToNextLevel;

// Carga da Skill Ult (Frenzy Nova)
let ultEnergy = 0;
const maxUltEnergy = FRENZY_NOVA_SKILL.maximumEnergy;
let frenzyActiveTimer = 0;

// Vida Núcleo
let coreHpMax = CORE_MODEL.initialHp;
let coreHp = CORE_MODEL.initialHp;
let coreX = 0, coreY = 0;

// Teclas pressionadas
const keys = {};

// Heroi & Light Trail
const player = createPlayerState();

// Entidades
let enemies = [];
let particles = [];
let bladeSlashes = [];
let enemyProjectiles = [];
let powerups = [];
let currentBoss = null;

let spawnTimer = 0;

// --- RESIZE ---
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    coreX = width / 2;
    coreY = height / 2;

    if (gameState === 'START') {
        player.x = coreX;
        player.y = coreY + CHARACTER_MODEL.initialPositionOffsetY;
        player.targetX = player.x;
        player.targetY = player.y;
    }
}
window.addEventListener('resize', resize);
resize();

// --- FÓRMULAS DE ATRIBUTOS ---
function getAtkDamage() { 
    let base = BLADE_SKILL.baseDamage
        + (attributes.damage.lvl - 1) * BLADE_SKILL.damagePerUpgrade
        + (playerLevel - 1) * BLADE_SKILL.damagePerCharacterLevel;
    if (player.doubleDmgTimer > 0) base *= 2;
    if (frenzyActiveTimer > 0) base *= 1 + attributes.frenzyNova.lvl * FRENZY_NOVA_SKILL.damageBonusPerUpgradeLevel;
    return base;
}
function getAtkRadius() {
    return Math.min(
        width * BLADE_SKILL.maxRadiusScreenRatio,
        BLADE_SKILL.baseRadius
            + (attributes.radius.lvl - 1) * BLADE_SKILL.radiusPerUpgrade
            + (playerLevel - 1) * BLADE_SKILL.radiusPerCharacterLevel
    );
}

// Retorna a amplitude do corte em radianos (Nv 1: ~40° -> Nv 6: 180° = Math.PI radianos)
function getSlashArcRadian() {
    const minDeg = BLADE_SKILL.minimumSlashArcDegrees;
    const maxDeg = BLADE_SKILL.maximumSlashArcDegrees;
    const currentDeg = minDeg + (attributes.slashArc.lvl - 1) * ((maxDeg - minDeg) / (attributes.slashArc.maxLvl - 1));
    return (currentDeg * Math.PI) / 180;
}
function getSlashArcDegree() {
    return Math.round((getSlashArcRadian() * 180) / Math.PI);
}

function getAtkCooldown() { 
    let cd = BLADE_SKILL.baseCooldownSeconds
        - (attributes.atkSpeed.lvl - 1) * BLADE_SKILL.cooldownReductionPerUpgrade
        - (playerLevel - 1) * BLADE_SKILL.cooldownReductionPerCharacterLevel;
    if (frenzyActiveTimer > 0) cd *= BLADE_SKILL.frenzyCooldownMultiplier;
    return Math.max(BLADE_SKILL.minimumCooldownSeconds, cd);
}
function getPlayerMaxSpeed() {
    return CHARACTER_MODEL.initialMoveSpeed
        + (attributes.moveSpeed.lvl - 1) * CHARACTER_MODEL.moveSpeedPerUpgrade
        + (playerLevel - 1) * CHARACTER_MODEL.moveSpeedPerLevel;
}
function getKnockback() {
    return BLADE_SKILL.baseKnockback
        + (attributes.knockback.lvl - 1) * BLADE_SKILL.knockbackPerUpgrade;
}
function getMaxPlayerHp() {
    return CHARACTER_MODEL.baseHp
        + (attributes.playerHp.lvl - 1) * CHARACTER_MODEL.hpPerUpgrade
        + (playerLevel - 1) * CHARACTER_MODEL.hpPerLevel;
}
function getFrenzyDuration() {
    return FRENZY_NOVA_SKILL.baseDurationSeconds
        + attributes.frenzyNova.lvl * FRENZY_NOVA_SKILL.durationPerUpgradeLevelSeconds;
}

// --- INPUTS CONTROLS ---
function setTarget(x, y) {
    player.targetX = x;
    player.targetY = y;
}

window.addEventListener('mousemove', (e) => {
    if (gameState === 'PLAYING') setTarget(e.clientX, e.clientY);
});

let activeTouchId = null;
canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || gameState !== 'PLAYING') return;
    activeTouchId = e.pointerId;
    canvas.setPointerCapture(e.pointerId);
    setTarget(e.clientX, e.clientY);
});
canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' && e.pointerId === activeTouchId && gameState === 'PLAYING') {
        setTarget(e.clientX, e.clientY);
    }
});
const endTouchMovement = (e) => {
    if (e.pointerId === activeTouchId) activeTouchId = null;
};
canvas.addEventListener('pointerup', endTouchMovement);
canvas.addEventListener('pointercancel', endTouchMovement);

window.addEventListener('keydown', (e) => {
    if (gameState === 'PLAYING' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
    keys[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});
window.addEventListener('blur', () => {
    Object.keys(keys).forEach((key) => { keys[key] = false; });
});

window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) audio.init();
}, { passive: true });

document.getElementById('btnSound').addEventListener('click', () => {
    const isMuted = audio.toggleMute();
    document.getElementById('btnSound').innerText = isMuted ? '🔇' : '🔊';
});

// --- EVENTOS DA INTERFACE (BOTOES) ---
document.getElementById('btnStart').addEventListener('click', startGame);
document.getElementById('btnRestart').addEventListener('click', startGame);
document.getElementById('btnPause').addEventListener('click', openShop);
document.getElementById('btnCloseShop').addEventListener('click', resumeGame);
document.getElementById('btnResume').addEventListener('click', resumeGame);
document.getElementById('shopList').addEventListener('click', (e) => {
    const button = e.target.closest('button[data-upgrade]');
    if (button && !button.disabled) buyUpgrade(button.dataset.upgrade);
});

function resumeGame() {
    document.getElementById('shopScreen').classList.add('hidden');
    gameState = 'PLAYING';
}

// --- SISTEMA DE GAMEPLAY ---
function startGame() {
    audio.init();
    turn = 1;
    scoreTurn = 0;
    targetScore = 500;
    totalScore = 0;
    coins = 0;

    playerLevel = 1;
    playerXp = 0;
    playerMaxXp = CHARACTER_MODEL.xpToNextLevel;
    ultEnergy = 0;
    frenzyActiveTimer = 0;

    Object.keys(attributes).forEach(k => attributes[k].lvl = 1);

    coreHpMax = CORE_MODEL.initialHp;
    coreHp = coreHpMax;

    player.maxHp = getMaxPlayerHp();
    player.hp = player.maxHp;
    player.iFrames = 0;
    player.shieldTimer = 0;
    player.doubleDmgTimer = 0;
    player.trail = [];

    enemies = [];
    particles = [];
    bladeSlashes = [];
    enemyProjectiles = [];
    powerups = [];
    currentBoss = null;

    player.x = coreX;
    player.y = coreY + CHARACTER_MODEL.initialPositionOffsetY;
    player.targetX = player.x;
    player.targetY = player.y;
    player.comboStep = 1;

    gameState = 'PLAYING';
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('shopScreen').classList.add('hidden');
    document.getElementById('bossHpContainer').classList.add('hidden');
    updateHUD();
}

function updateHUD() {
    document.getElementById('hpText').innerText = `${Math.ceil(coreHp)}/${coreHpMax}`;
    document.getElementById('hpBar').style.width = `${Math.max(0, (coreHp / coreHpMax) * 100)}%`;

    document.getElementById('playerHpText').innerText = `${Math.ceil(player.hp)}/${player.maxHp}`;
    document.getElementById('playerHpBar').style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;

    document.getElementById('levelText').innerText = `⚡ NV. ${playerLevel}`;
    document.getElementById('xpText').innerText = `${playerXp}/${playerMaxXp} XP`;
    document.getElementById('xpBar').style.width = `${Math.min(100, (playerXp / playerMaxXp) * 100)}%`;

    // Ult HUD Bar
    document.getElementById('ultBar').style.width = `${Math.min(100, (ultEnergy / maxUltEnergy) * 100)}%`;
    document.getElementById('ultText').innerText = ultEnergy >= maxUltEnergy ? 'DISPARANDO!' : `${Math.floor(ultEnergy)}%`;

    document.getElementById('turnLabel').innerText = `TURNO ${turn}`;
    document.getElementById('scoreText').innerText = `${scoreTurn} / ${targetScore} PTS`;
    document.getElementById('scoreBar').style.width = `${Math.min(100, (scoreTurn / targetScore) * 100)}%`;

    document.getElementById('coinsText').innerText = coins;

    // Boss HUD
    if (currentBoss) {
        document.getElementById('bossHpContainer').classList.remove('hidden');
        document.getElementById('bossHpText').innerText = `${Math.ceil(currentBoss.hp)}/${currentBoss.maxHp}`;
        document.getElementById('bossHpBar').style.width = `${Math.max(0, (currentBoss.hp / currentBoss.maxHp) * 100)}%`;
    } else {
        document.getElementById('bossHpContainer').classList.add('hidden');
    }

    // Status Panel
    document.getElementById('statusLevel').innerText = `NÍVEL ${playerLevel}`;
    document.getElementById('statDmg').innerText = getAtkDamage();
    document.getElementById('statRad').innerText = `${Math.round(getAtkRadius())}px`;
    document.getElementById('statArc').innerText = `${getSlashArcDegree()}°`;
    document.getElementById('statSpeed').innerText = `${getAtkCooldown().toFixed(2)}s`;
    document.getElementById('statMove').innerText = Math.round(getPlayerMaxSpeed());
    document.getElementById('statUlt').innerText = `Nv. ${attributes.frenzyNova.lvl}`;
}

function gainXp(amount) {
    playerXp += amount;
    if (playerXp >= playerMaxXp) {
        playerXp -= playerMaxXp;
        playerLevel++;
        playerMaxXp = Math.floor(playerMaxXp * CHARACTER_MODEL.xpGrowthMultiplier);

        player.maxHp = getMaxPlayerHp();
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * CHARACTER_MODEL.levelUpHealRatio);

        createExplosion(player.x, player.y, '#38bdf8', 30);
        shakeScreen(8);
    }
    updateHUD();
}

function chargeUlt(amount) {
    if (ultEnergy < maxUltEnergy) {
        ultEnergy = Math.min(maxUltEnergy, ultEnergy + amount);
        updateHUD();

        // Ativação Automática do Especial ao Carregar
        if (ultEnergy >= maxUltEnergy && frenzyActiveTimer <= 0) {
            triggerFrenzyUlt();
        }
    }
}

// Ativação Automática da Skill Frenzy Nova
function triggerFrenzyUlt() {
    ultEnergy = 0;
    frenzyActiveTimer = getFrenzyDuration();
    audio.playUltSound();
    shakeScreen(15);

    // Disparo de ondas de lâminas em várias direções no momento de ativação
    for (let i = 0; i < FRENZY_NOVA_SKILL.slashCount; i++) {
        const angle = (Math.PI * 2 / FRENZY_NOVA_SKILL.slashCount) * i;
        executeBladeSlash(
            player.x,
            player.y,
            angle,
            getAtkRadius() * FRENZY_NOVA_SKILL.slashRadiusMultiplier,
            3
        );
    }

    updateHUD();
}

function shakeScreen(intensity) {
    shakeIntensity = Math.max(shakeIntensity, intensity);
}

function triggerGameOver(reason) {
    gameState = 'GAMEOVER';
    document.getElementById('finalLevel').innerText = `Nv. ${playerLevel}`;
    document.getElementById('finalTurn').innerText = turn;
    document.getElementById('finalScore').innerText = totalScore;

    if (reason === 'PLAYER') {
        document.getElementById('gameOverTitle').innerText = 'HERÓI DERROTADO';
        document.getElementById('gameOverSub').innerText = 'Você foi destruído na arena neon.';
    } else {
        document.getElementById('gameOverTitle').innerText = 'NÚCLEO DESTRUÍDO';
        document.getElementById('gameOverSub').innerText = 'A tocha do centro apagou-se.';
    }

    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function openShop() {
    gameState = 'SHOP';
    document.getElementById('shopCoinsText').innerText = coins;
    renderShopItems();
    updateHUD();
    document.getElementById('shopScreen').classList.remove('hidden');
}

function renderShopItems() {
    const list = document.getElementById('shopList');
    list.innerHTML = '';

    Object.keys(attributes).forEach(key => {
        const attr = attributes[key];
        const isMax = attr.lvl >= attr.maxLvl;
        const cost = isMax ? 0 : Math.floor(attr.baseCost * Math.pow(attr.costMult, attr.lvl - 1));

        const item = document.createElement('div');
        item.className = 'bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl flex items-center justify-between gap-2';
        item.innerHTML = `
            <div class="flex items-center gap-2.5">
                <span class="text-xl">${attr.icon}</span>
                <div>
                    <div class="font-bold text-xs text-cyan-300">${attr.name} <span class="text-amber-400">${isMax ? 'MAX' : 'Nv. ' + attr.lvl}</span></div>
                    <div class="text-[10px] text-slate-400">${attr.desc}</div>
                </div>
            </div>
            <button data-upgrade="${key}" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow" ${isMax || coins < cost ? 'disabled' : ''}>
                ${isMax ? 'MÁXIMO' : `<span>⚡</span> ${cost}`}
            </button>
        `;
        list.appendChild(item);
    });
}

function buyUpgrade(key) {
    const attr = attributes[key];
    if (!attr || attr.lvl >= attr.maxLvl) return;

    const cost = Math.floor(attr.baseCost * Math.pow(attr.costMult, attr.lvl - 1));

    if (coins >= cost) {
        coins -= cost;
        attr.lvl++;

        if (key === 'playerHp') {
            const oldMax = player.maxHp;
            player.maxHp = getMaxPlayerHp();
            player.hp += (player.maxHp - oldMax);
        }

        document.getElementById('shopCoinsText').innerText = coins;
        updateHUD();
        renderShopItems();
        audio.playCoin();
    }
}

// --- SISTEMA DE CORTE COM A LÂMINA ---
// Amplitude configurável via upgrade (getSlashArcRadian)
function executeBladeSlash(x, y, angle, radius, comboStep) {
    const currentArc = getSlashArcRadian();

    bladeSlashes.push({
        x, y, angle, radius, comboStep,
        arcWidth: currentArc, 
        life: 0.12, maxLife: 0.12
    });

    audio.playSwordSlash(comboStep);

    // Pequeno avanço (dash) direcional no 3º ataque
    if (comboStep === 3) {
        const dashDist = BLADE_SKILL.comboDashDistance;
        player.x += Math.cos(angle) * dashDist;
        player.y += Math.sin(angle) * dashDist;
        createExplosion(player.x, player.y, '#c084fc', 12);
    }
}

function createExplosion(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 160;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.2 + Math.random() * 0.3,
            maxLife: 0.5,
            color,
            size: 2 + Math.random() * 3
        });
    }
}

// --- SPAWNER DE INIMIGOS ---
function spawnEnemy() {
    if (turn % MONSTER_SPAWNING.bossEveryTurns === 0
        && !currentBoss
        && enemies.length < MONSTER_SPAWNING.maximumEnemiesBeforeBoss) {
        spawnBoss();
        return;
    }

    const spawnDist = Math.max(width, height) * MONSTER_SPAWNING.regularSpawnScreenRatio
        + MONSTER_SPAWNING.regularSpawnOffset;
    const angle = Math.random() * Math.PI * 2;
    const x = coreX + Math.cos(angle) * spawnDist;
    const y = coreY + Math.sin(angle) * spawnDist;
    const type = chooseMonsterType();
    enemies.push(createMonster(type, turn, x, y));
}

function spawnBoss() {
    const spawnDist = Math.max(width, height) * MONSTER_SPAWNING.bossSpawnScreenRatio;
    const angle = Math.random() * Math.PI * 2;
    const x = coreX + Math.cos(angle) * spawnDist;
    const y = coreY + Math.sin(angle) * spawnDist;

    currentBoss = createMonster('BOSS', turn, x, y);
    enemies.push(currentBoss);
    updateHUD();
    shakeScreen(12);
}

function spawnPowerup(x, y) {
    const types = Object.keys(POWERUP_MODELS);
    const type = types[Math.floor(Math.random() * types.length)];
    powerups.push({ x, y, type, life: POWERUP_MODELS[type].lifeSeconds });
}

// --- UPDATE LOOP ---
function update(dt) {
    if (gameState !== 'PLAYING') return;
    dt = Math.min(dt, 0.05);

    // Timers
    if (shakeIntensity > 0) shakeIntensity -= dt * 30;
    if (player.iFrames > 0) player.iFrames -= dt;
    if (player.shieldTimer > 0) player.shieldTimer -= dt;
    if (player.doubleDmgTimer > 0) player.doubleDmgTimer -= dt;
    if (frenzyActiveTimer > 0) frenzyActiveTimer -= dt;

    // Movimentação
    let moveX = 0;
    let moveY = 0;

    if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    const speed = getPlayerMaxSpeed();

    if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        player.x += (moveX / len) * speed * dt;
        player.y += (moveY / len) * speed * dt;
        player.targetX = player.x;
        player.targetY = player.y;
    } else {
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3) {
            const step = speed * dt;
            const moveDist = Math.min(dist, step);
            player.x += (dx / dist) * moveDist;
            player.y += (dy / dist) * moveDist;
        }
    }

    player.x = Math.max(15, Math.min(width - 15, player.x));
    player.y = Math.max(15, Math.min(height - 15, player.y));

    // Atualizar rastro de luz de movimento do herói
    player.trail.unshift({ x: player.x, y: player.y, alpha: 1.0 });
    if (player.trail.length > CHARACTER_MODEL.trailLength) {
        player.trail.pop();
    }
    player.trail.forEach(t => t.alpha -= dt * CHARACTER_MODEL.trailFadePerSecond);

    // Ataque Direcional Direto
    player.attackTimer -= dt;
    const attackRad = getAtkRadius();
    const currentArcHalf = getSlashArcRadian() / 2;

    if (player.attackTimer <= 0) {
        let targetEnemy = null;
        let minDist = attackRad;

        enemies.forEach(e => {
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < minDist) {
                minDist = d;
                targetEnemy = e;
            }
        });

        if (targetEnemy) {
            player.attackTimer = getAtkCooldown();
            const atkAngle = Math.atan2(targetEnemy.y - player.y, targetEnemy.x - player.x);
            player.angle = atkAngle;
            
            executeBladeSlash(player.x, player.y, atkAngle, attackRad, player.comboStep);

            const dmg = getAtkDamage() * (player.comboStep === 3 ? BLADE_SKILL.comboDamageMultiplier : 1.0);
            const kbForce = getKnockback() * (player.comboStep === 3 ? BLADE_SKILL.comboKnockbackMultiplier : 1.0);

            // Colisão de dano no arco do golpe
            enemies.forEach(e => {
                const d = Math.hypot(e.x - player.x, e.y - player.y);
                if (d <= attackRad + e.radius) {
                    const enemyAngle = Math.atan2(e.y - player.y, e.x - player.x);
                    let diffAngle = Math.abs(atkAngle - enemyAngle);
                    while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
                    diffAngle = Math.abs(diffAngle);

                    // Aplica dano se o inimigo está dentro da abertura angular atual do corte
                    if (diffAngle <= currentArcHalf + 0.1 || frenzyActiveTimer > 0) {
                        e.hp -= dmg;
                        chargeUlt(FRENZY_NOVA_SKILL.chargePerHit);

                        const pushAngle = Math.atan2(e.y - player.y, e.x - player.x);
                        e.vx += Math.cos(pushAngle) * kbForce;
                        e.vy += Math.sin(pushAngle) * kbForce;
                        createExplosion(e.x, e.y, e.color, 4);
                    }
                }
            });

            player.comboStep = player.comboStep >= 3 ? 1 : player.comboStep + 1;
        }
    }

    // Spawns Inimigos
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnEnemy();
        spawnTimer = Math.max(
            MONSTER_SPAWNING.minimumIntervalSeconds,
            MONSTER_SPAWNING.initialIntervalSeconds
                - turn * MONSTER_SPAWNING.intervalReductionPerTurnSeconds
        );
    }

    // Inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= MONSTER_SPAWNING.movementDamping;
        e.vy *= MONSTER_SPAWNING.movementDamping;

        const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        const targetX = distToPlayer < MONSTER_SPAWNING.targetPlayerDistance ? player.x : coreX;
        const targetY = distToPlayer < MONSTER_SPAWNING.targetPlayerDistance ? player.y : coreY;

        const toTargetAngle = Math.atan2(targetY - e.y, targetX - e.x);
        e.x += Math.cos(toTargetAngle) * e.speed * dt;
        e.y += Math.sin(toTargetAngle) * e.speed * dt;

        // SHOOTER / BOSS
        if (e.type === 'SHOOTER' || e.type === 'BOSS') {
            e.shootTimer -= dt;
            if (e.shootTimer <= 0) {
                const model = MONSTER_MODELS[e.type];
                e.shootTimer = model.shootCooldownSeconds;
                enemyProjectiles.push({
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
            if (player.shieldTimer <= 0) {
                player.hp -= e.damage;
                shakeScreen(6);
                audio.playHurt();
            } else {
                audio.playExplode();
            }

            player.iFrames = CHARACTER_MODEL.invulnerabilitySeconds;
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
        const distCore = Math.hypot(coreX - e.x, coreY - e.y);
        if (distCore < e.radius + CORE_MODEL.collisionRadius) {
            coreHp -= CORE_MODEL.damageTakenPerMonster;
            shakeScreen(8);
            audio.playExplode();
            createExplosion(e.x, e.y, '#f43f5e', 14);

            if (e === currentBoss) currentBoss = null;
            enemies.splice(i, 1);
            updateHUD();

            if (coreHp <= 0) {
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
            scoreTurn += pts;
            totalScore += pts;

            // Concessão direta de recompensa de Moedas e XP ao eliminar (Sem itens dropados no chão)
            const gainedCoins = rollMonsterGold(e.type);
            const gainedXp = monsterModel.xpRewardBase + turn * monsterModel.xpRewardPerTurn;
            coins += gainedCoins;
            gainXp(gainedXp);
            audio.playCoin();

            if (Math.random() < monsterModel.powerupDropChance) {
                spawnPowerup(e.x, e.y);
            }

            if (e.type === 'SPLITTER') {
                for (let s = 0; s < monsterModel.splitCount; s++) {
                    enemies.push(createSplitterChild(e.x, e.y));
                }
            }

            if (e === currentBoss) currentBoss = null;
            enemies.splice(i, 1);
            updateHUD();

            if (scoreTurn >= targetScore && !currentBoss) {
                turn++;
                scoreTurn = 0;
                targetScore = Math.floor(500 * Math.pow(1.35, turn - 1));
                openShop();
                break;
            }
        }
    }

    // Projéteis Inimigos
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (Math.hypot(player.x - p.x, player.y - p.y) < p.radius + CHARACTER_MODEL.collisionRadius && player.iFrames <= 0) {
            if (player.shieldTimer <= 0) {
                player.hp -= p.damage;
                audio.playHurt();
            }
            player.iFrames = CHARACTER_MODEL.projectileInvulnerabilitySeconds;
            updateHUD();
            enemyProjectiles.splice(i, 1);
            if (player.hp <= 0) { triggerGameOver('PLAYER'); return; }
            continue;
        }

        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            enemyProjectiles.splice(i, 1);
        }
    }

    // Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        const pw = powerups[i];
        pw.life -= dt;
        if (pw.life <= 0) { powerups.splice(i, 1); continue; }

        if (Math.hypot(player.x - pw.x, player.y - pw.y) < CHARACTER_MODEL.powerupPickupRadius) {
            audio.playPowerup();
            if (pw.type === 'SHIELD') player.shieldTimer = POWERUP_MODELS.SHIELD.durationSeconds;
            else if (pw.type === 'DOUBLE_DMG') player.doubleDmgTimer = POWERUP_MODELS.DOUBLE_DMG.durationSeconds;
            else if (pw.type === 'BOMB') {
                shakeScreen(16);
                enemies.forEach(e => {
                    e.hp -= POWERUP_MODELS.BOMB.damage;
                    createExplosion(e.x, e.y, '#f43f5e', 8);
                });
            }
            powerups.splice(i, 1);
        }
    }

    // Blade Slashes animación
    for (let i = bladeSlashes.length - 1; i >= 0; i--) {
        const s = bladeSlashes[i];
        s.life -= dt;
        if (s.life <= 0) bladeSlashes.splice(i, 1);
    }

    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// --- RENDER LOOP ---
function render() {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Screen Shake offset
    if (shakeIntensity > 0) {
        const rx = (Math.random() - 0.5) * shakeIntensity;
        const ry = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(rx, ry);
    }

    // Fundo com Grade Neon
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Núcleo (Center Tower)
    ctx.save();
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#f43f5e';
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(coreX, coreY, CORE_MODEL.visualRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Anéis de energia no núcleo
    const pulse = Math.sin(performance.now() * CORE_MODEL.pulseFrequency) * CORE_MODEL.pulseAmplitude;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(coreX, coreY, CORE_MODEL.pulseRadius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Raio de Alcance do herói: Círculo Vermelho com Linhas Tracejadas
    ctx.save();
    ctx.strokeStyle = frenzyActiveTimer > 0 ? 'rgba(236, 72, 153, 0.7)' : 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]); // Linha tracejada
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(player.x, player.y, getAtkRadius(), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Powerups na arena
    powerups.forEach(pw => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = POWERUP_MODELS[pw.type].color;
        ctx.fillStyle = ctx.shadowColor;
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // Slashes de Espada (Golpes de Arco Direcional em Estilo Neon Cyan/Purple)
    bladeSlashes.forEach(s => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        const progress = 1 - (s.life / s.maxLife);
        const currentArc = s.arcWidth;
        const startAngle = -currentArc / 2;
        const endAngle = currentArc / 2;

        // Arco Neon distintivo
        ctx.shadowBlur = frenzyActiveTimer > 0 ? 30 : 22;
        ctx.shadowColor = frenzyActiveTimer > 0 ? '#f0abfc' : s.comboStep === 3 ? '#a855f7' : '#06b6d4';
        ctx.strokeStyle = ctx.shadowColor;
        ctx.lineWidth = frenzyActiveTimer > 0 ? 12 : s.comboStep === 3 ? 9 : 7;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(0, 0, s.radius * (0.85 + progress * 0.15), startAngle, endAngle);
        ctx.stroke();

        // Rastro interno brilhante (Branco Neon)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, s.radius * (0.85 + progress * 0.15), startAngle, endAngle);
        ctx.stroke();

        ctx.restore();
    });

    // Projéteis Inimigos
    enemyProjectiles.forEach(p => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // Inimigos
    enemies.forEach(e => {
        ctx.save();
        ctx.shadowBlur = e.type === 'BOSS' ? 25 : 12;
        ctx.shadowColor = e.color;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();

        // Barra de vida simples acima do inimigo
        if (e.hp < e.maxHp) {
            const bw = e.radius * 2;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(e.x - bw / 2, e.y - e.radius - 8, bw, 4);
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x - bw / 2, e.y - e.radius - 8, bw * (e.hp / e.maxHp), 4);
        }

        ctx.restore();
    });

    // Render do Rastro de Luz de Movimento do Herói
    for (let i = 0; i < player.trail.length; i++) {
        const pt = player.trail[i];
        if (pt.alpha <= 0) continue;
        ctx.save();
        const trailRadius = Math.max(2, 11 * (1 - i / player.trail.length));
        ctx.globalAlpha = Math.max(0, pt.alpha * (1 - i / player.trail.length) * 0.5);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, trailRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Herói
    ctx.save();
    ctx.shadowBlur = frenzyActiveTimer > 0 ? 25 : 15;
    ctx.shadowColor = frenzyActiveTimer > 0 ? '#e879f9' : player.doubleDmgTimer > 0 ? '#f59e0b' : '#38bdf8';
    ctx.fillStyle = player.iFrames > 0
        && Math.floor(performance.now() / CHARACTER_MODEL.damageImmunityFlashIntervalMs) % 2 === 0
        ? '#ffffff'
        : ctx.shadowColor;

    ctx.beginPath();
    ctx.arc(player.x, player.y, CHARACTER_MODEL.collisionRadius, 0, Math.PI * 2);
    ctx.fill();

    // Escudo Visual
    if (player.shieldTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, CHARACTER_MODEL.shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();

    // Partículas
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    ctx.restore();
}

// --- GAME LOOP ---
function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
