import { maxUltEnergy, player, state } from '../core/state.js';

// --- BARRA DE FÚRIA ---
// Carregando: enche conforme os golpes acertam (mostra %). Ativa: esvazia mostrando os segundos restantes.
// Só escreve no DOM quando o texto muda (é chamada a cada quadro).
const furyShown = { width: '', text: '', label: '', active: false };

function setIfChanged(key, value, apply) {
    if (furyShown[key] !== value) {
        furyShown[key] = value;
        apply(value);
    }
}

export function updateFuryBar() {
    const { ultEnergy, frenzyActiveTimer, frenzyDuration } = state;
    const active = frenzyActiveTimer > 0;

    const ratio = active ? frenzyActiveTimer / Math.max(0.01, frenzyDuration) : ultEnergy / maxUltEnergy;
    setIfChanged('width', `${Math.max(0, Math.min(100, ratio * 100)).toFixed(1)}%`,
        v => { document.getElementById('ultBar').style.width = v; });
    setIfChanged('text', active ? `${frenzyActiveTimer.toFixed(1)}s` : `${Math.floor(ultEnergy)}%`,
        v => { document.getElementById('ultText').innerText = v; });
    setIfChanged('label', active ? '🔥 ACTIVE!' : '🔥 FURY',
        v => { document.getElementById('furyLabel').innerText = v; });
    setIfChanged('active', active,
        v => { document.getElementById('heroCard').classList.toggle('fury-active', v); });
}

// --- HUD ---
export function updateHUD() {
    const { coreHp, coreHpMax, playerLevel, playerXp, playerMaxXp, ultEnergy, currentBoss } = state;

    document.getElementById('hpText').innerText = `${Math.ceil(coreHp)}/${coreHpMax}`;
    document.getElementById('hpBar').style.width = `${Math.max(0, (coreHp / coreHpMax) * 100)}%`;

    document.getElementById('playerHpText').innerText = `${Math.ceil(player.hp)}/${player.maxHp}`;
    document.getElementById('playerHpBar').style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;

    document.getElementById('levelText').innerText = `LV ${playerLevel}`;
    document.getElementById('xpText').innerText = `${playerXp}/${playerMaxXp} XP`;

    updateFuryBar();
    document.getElementById('skillPointsHud').innerText = state.skillPoints;

    document.getElementById('turnLabel').innerText = `TURN ${state.turn}`;
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
    document.getElementById('statusLevel').innerText = `LEVEL ${playerLevel}`;
}
