import { attributes, maxUltEnergy, player, state } from '../core/state.js';
import {
    getAtkCooldown,
    getAtkDamage,
    getAtkRadius,
    getPlayerMaxSpeed,
    getSlashArcDegree
} from '../systems/stats.js';

// --- HUD ---
export function updateHUD() {
    const { coreHp, coreHpMax, playerLevel, playerXp, playerMaxXp, ultEnergy, currentBoss } = state;

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

    document.getElementById('turnLabel').innerText = `TURNO ${state.turn}`;
    document.getElementById('scoreText').innerText = `${state.scoreTurn} / ${state.targetScore} PTS`;
    document.getElementById('scoreBar').style.width = `${Math.min(100, (state.scoreTurn / state.targetScore) * 100)}%`;

    document.getElementById('coinsText').innerText = state.coins;

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
