import { CHARACTER_MODEL } from '../../data_model/character.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { attributes, audio, passives, player, state } from '../core/state.js';
import { getMaxPlayerHp } from '../systems/stats.js';
import { updateHUD } from './hud.js';

// --- INÍCIO DE PARTIDA ---
export function startGame() {
    audio.init();
    state.turn = 1;
    state.scoreTurn = 0;
    state.targetScore = 500;
    state.totalScore = 0;
    state.coins = 0;

    state.playerLevel = 1;
    state.playerXp = 0;
    state.playerMaxXp = CHARACTER_MODEL.xpToNextLevel;
    state.ultEnergy = 0;
    state.frenzyActiveTimer = 0;
    state.frenzyDuration = 0;

    Object.keys(attributes).forEach(k => attributes[k].lvl = 1);
    Object.keys(passives).forEach(k => passives[k].lvl = 0);
    state.skillPoints = 0;

    state.coreHpMax = CORE_MODEL.initialHp;
    state.coreHp = state.coreHpMax;

    player.maxHp = getMaxPlayerHp();
    player.hp = player.maxHp;
    player.iFrames = 0;
    player.reflectTimer = 0;
    player.reflectTime = -100000;
    player.trail = [];

    state.enemies = [];
    state.particles = [];
    state.bladeSlashes = [];
    state.enemyProjectiles = [];
    state.knives = [];
    state.knifeTimer = 0;
    state.knifePending = null;
    state.goldDrops = [];
    state.currentBoss = null;

    player.x = state.coreX;
    player.y = state.coreY + CHARACTER_MODEL.initialPositionOffsetY;
    player.targetX = player.x;
    player.targetY = player.y;
    player.comboStep = 1;

    state.gameState = 'PLAYING';
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('shopScreen').classList.add('hidden');
    document.getElementById('bossHpContainer').classList.add('hidden');
    updateHUD();
}

// --- GAME OVER ---
export function triggerGameOver(reason) {
    state.gameState = 'GAMEOVER';
    document.getElementById('finalLevel').innerText = `Lv. ${state.playerLevel}`;
    document.getElementById('finalTurn').innerText = state.turn;
    document.getElementById('finalScore').innerText = state.totalScore;

    if (reason === 'PLAYER') {
        document.getElementById('gameOverTitle').innerText = 'DEMON HUNTER DEFEATED';
        document.getElementById('gameOverSub').innerText = 'You were destroyed in the neon arena.';
    } else {
        document.getElementById('gameOverTitle').innerText = 'TORCH DESTROYED';
        document.getElementById('gameOverSub').innerText = 'The torch at the center went out.';
    }

    document.getElementById('gameOverScreen').classList.remove('hidden');
}
