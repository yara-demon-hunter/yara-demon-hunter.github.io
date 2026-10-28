import { createAttributes, createPlayerState } from './models.js';
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
let playerMaxXp = 100;

// Carga da Skill Ult (Frenzy Nova)
let ultEnergy = 0;
const maxUltEnergy = 100;
let frenzyActiveTimer = 0;

// Vida Núcleo
let coreHpMax = 100;
let coreHp = 100;
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
        player.y = coreY - 60;
        player.targetX = player.x;
        player.targetY = player.y;
    }
}
window.addEventListener('resize', resize);
resize();

// --- FÓRMULAS DE ATRIBUTOS ---
function getAtkDamage() { 
    let base = (25 + (attributes.damage.lvl - 1) * 15 + (playerLevel - 1) * 10); 
    if (player.doubleDmgTimer > 0) base *= 2;
    if (frenzyActiveTimer > 0) base *= (1 + attributes.frenzyNova.lvl * 0.2);
    return base;
}
function getAtkRadius() { return Math.min(width * 0.38, 75 + (attributes.radius.lvl - 1) * 14 + (playerLevel - 1) * 4); }

// Retorna a amplitude do corte em radianos (Nv 1: ~40° -> Nv 6: 180° = Math.PI radianos)
function getSlashArcRadian() {
    const minDeg = 40;
    const maxDeg = 180;
    const currentDeg = minDeg + (attributes.slashArc.lvl - 1) * ((maxDeg - minDeg) / (attributes.slashArc.maxLvl - 1));
    return (currentDeg * Math.PI) / 180;
}
function getSlashArcDegree() {
    return Math.round((getSlashArcRadian() * 180) / Math.PI);
}

function getAtkCooldown() { 
    let cd = 0.45 - (attributes.atkSpeed.lvl - 1) * 0.04 - (playerLevel - 1) * 0.02;
    if (frenzyActiveTimer > 0) cd *= 0.25; // Alta cadência no Frenzy Nova
    return Math.max(0.07, cd); 
}
function getPlayerMaxSpeed() { return 220 + (attributes.moveSpeed.lvl - 1) * 55 + (playerLevel - 1) * 12; }
function getKnockback() { return 180 + (attributes.knockback.lvl - 1) * 65; }
function getMaxPlayerHp() { return 100 + (attributes.playerHp.lvl - 1) * 25 + (playerLevel - 1) * 20; }
function getFrenzyDuration() { return 3.0 + attributes.frenzyNova.lvl * 0.5; }

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
    playerMaxXp = 100;
    ultEnergy = 0;
    frenzyActiveTimer = 0;

    Object.keys(attributes).forEach(k => attributes[k].lvl = 1);

    coreHpMax = 100;
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
    player.y = coreY - 60;
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
        playerMaxXp = Math.floor(playerMaxXp * 1.35);

        player.maxHp = getMaxPlayerHp();
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.3);

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
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        executeBladeSlash(player.x, player.y, angle, getAtkRadius() * 1.3, 3);
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
        const dashDist = 35;
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
    if (turn % 5 === 0 && !currentBoss && enemies.length < 3) {
        spawnBoss();
        return;
    }

    const spawnDist = Math.max(width, height) * 0.6 + 50;
    const angle = Math.random() * Math.PI * 2;
    const x = coreX + Math.cos(angle) * spawnDist;
    const y = coreY + Math.sin(angle) * spawnDist;

    const r = Math.random();
    let type = 'NORMAL', hp = 30 + turn * 10, speed = 55 + Math.random() * 30, radius = 14, color = '#f43f5e', damage = 15;

    if (r < 0.22) {
        type = 'FAST'; hp = 20 + turn * 5; speed = 105 + Math.random() * 35; radius = 10; color = '#38bdf8'; damage = 10;
    } else if (r < 0.40) {
        type = 'SPLITTER'; hp = 55 + turn * 15; speed = 45; radius = 18; color = '#a855f7'; damage = 20;
    } else if (r < 0.58) {
        type = 'SHOOTER'; hp = 40 + turn * 8; speed = 40; radius = 13; color = '#f59e0b'; damage = 12;
    }

    enemies.push({ x, y, vx: 0, vy: 0, hp, maxHp: hp, speed, radius, color, type, damage, shootTimer: 2.0 });
}

function spawnBoss() {
    const spawnDist = Math.max(width, height) * 0.5;
    const angle = Math.random() * Math.PI * 2;
    const x = coreX + Math.cos(angle) * spawnDist;
    const y = coreY + Math.sin(angle) * spawnDist;
    const hp = 350 + turn * 150;

    currentBoss = {
        x, y, vx: 0, vy: 0,
        hp, maxHp: hp,
        speed: 35,
        radius: 32,
        color: '#ec4899',
        type: 'BOSS',
        damage: 30,
        shootTimer: 1.5
    };
    enemies.push(currentBoss);
    updateHUD();
    shakeScreen(12);
}

function spawnPowerup(x, y) {
    const types = ['SHIELD', 'DOUBLE_DMG', 'BOMB'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerups.push({ x, y, type, life: 10.0 });
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
    if (player.trail.length > 12) {
        player.trail.pop();
    }
    player.trail.forEach(t => t.alpha -= dt * 4);

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

            const dmg = getAtkDamage() * (player.comboStep === 3 ? 1.5 : 1.0);
            const kbForce = getKnockback() * (player.comboStep === 3 ? 1.4 : 1.0);

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
                        chargeUlt(5);

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
        spawnTimer = Math.max(0.2, 1.5 - turn * 0.1);
    }

    // Inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= 0.88;
        e.vy *= 0.88;

        const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        const targetX = distToPlayer < 240 ? player.x : coreX;
        const targetY = distToPlayer < 240 ? player.y : coreY;

        const toTargetAngle = Math.atan2(targetY - e.y, targetX - e.x);
        e.x += Math.cos(toTargetAngle) * e.speed * dt;
        e.y += Math.sin(toTargetAngle) * e.speed * dt;

        // SHOOTER / BOSS
        if (e.type === 'SHOOTER' || e.type === 'BOSS') {
            e.shootTimer -= dt;
            if (e.shootTimer <= 0) {
                e.shootTimer = e.type === 'BOSS' ? 1.0 : 2.5;
                enemyProjectiles.push({
                    x: e.x, y: e.y,
                    vx: Math.cos(toTargetAngle) * 160,
                    vy: Math.sin(toTargetAngle) * 160,
                    radius: 5,
                    damage: e.damage * 0.8
                });
            }
        }

        // Colisão com Herói
        if (distToPlayer < e.radius + 12 && player.iFrames <= 0) {
            if (player.shieldTimer <= 0) {
                player.hp -= e.damage;
                shakeScreen(6);
                audio.playHurt();
            } else {
                audio.playExplode();
            }

            player.iFrames = 0.5;
            createExplosion(player.x, player.y, '#f43f5e', 12);
            updateHUD();

            const pushAngle = Math.atan2(e.y - player.y, e.x - player.x);
            e.vx += Math.cos(pushAngle) * 220;
            e.vy += Math.sin(pushAngle) * 220;

            if (player.hp <= 0) {
                triggerGameOver('PLAYER');
                return;
            }
        }

        // Colisão com Núcleo
        const distCore = Math.hypot(coreX - e.x, coreY - e.y);
        if (distCore < e.radius + 22) {
            coreHp -= 10;
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

            const pts = e.type === 'BOSS' ? 250 : e.type === 'SPLITTER' ? 40 : 20;
            scoreTurn += pts;
            totalScore += pts;

            // Concessão direta de recompensa de Moedas e XP ao eliminar (Sem itens dropados no chão)
            const gainedCoins = e.type === 'BOSS' ? 10 : 1 + Math.floor(Math.random() * 2);
            const gainedXp = 20 + turn * 3;
            coins += gainedCoins;
            gainXp(gainedXp);
            audio.playCoin();

            if (Math.random() < 0.15 || e.type === 'BOSS') {
                spawnPowerup(e.x, e.y);
            }

            if (e.type === 'SPLITTER') {
                for (let s = 0; s < 2; s++) {
                    enemies.push({
                        x: e.x + (Math.random() - 0.5) * 20,
                        y: e.y + (Math.random() - 0.5) * 20,
                        vx: (Math.random() - 0.5) * 100,
                        vy: (Math.random() - 0.5) * 100,
                        hp: 15, maxHp: 15, speed: 95, radius: 8, color: '#38bdf8', type: 'FAST', damage: 8
                    });
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

        if (Math.hypot(player.x - p.x, player.y - p.y) < p.radius + 12 && player.iFrames <= 0) {
            if (player.shieldTimer <= 0) {
                player.hp -= p.damage;
                audio.playHurt();
            }
            player.iFrames = 0.4;
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

        if (Math.hypot(player.x - pw.x, player.y - pw.y) < 22) {
            audio.playPowerup();
            if (pw.type === 'SHIELD') player.shieldTimer = 6.0;
            else if (pw.type === 'DOUBLE_DMG') player.doubleDmgTimer = 8.0;
            else if (pw.type === 'BOMB') {
                shakeScreen(16);
                enemies.forEach(e => {
                    e.hp -= 150;
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
    ctx.arc(coreX, coreY, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Anéis de energia no núcleo
    const pulse = Math.sin(performance.now() * 0.005) * 6;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(coreX, coreY, 32 + pulse, 0, Math.PI * 2);
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
        ctx.shadowColor = pw.type === 'SHIELD' ? '#38bdf8' : pw.type === 'DOUBLE_DMG' ? '#f59e0b' : '#ef4444';
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
    ctx.fillStyle = player.iFrames > 0 && Math.floor(performance.now() / 50) % 2 === 0 ? '#ffffff' : ctx.shadowColor;

    ctx.beginPath();
    ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Escudo Visual
    if (player.shieldTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
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
