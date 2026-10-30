import { KNIFE_SKILL } from '../../data_model/skills.js';
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

// --- BOTÃO DA ADAGA (telas de toque) ---
// Anel de recarga (--cd: 1 logo após o arremesso, 0 = pronto) e brilho quando está pronto.
// Também só escreve no DOM quando muda.
const knifeButton = document.getElementById('knifeButton');
const knifeShown = { cd: '', ready: null };

export function updateKnifeButton() {
    if (!knifeButton) return;
    const ratio = Math.min(1, state.knifeTimer / KNIFE_SKILL.cooldownSeconds);
    const cd = ratio.toFixed(2);
    if (knifeShown.cd !== cd) {
        knifeShown.cd = cd;
        knifeButton.style.setProperty('--cd', cd);
    }
    const ready = ratio <= 0;
    if (knifeShown.ready !== ready) {
        knifeShown.ready = ready;
        knifeButton.classList.toggle('is-ready', ready);
    }
}

// Destaca o contador de pontos de skill no cartão do herói (reinicia a animação se já estiver rodando)
export function pulseSkillPoints() {
    const chip = document.getElementById('skillPointsHud').parentElement;
    chip.classList.remove('sp-gain');
    void chip.offsetWidth;
    chip.classList.add('sp-gain');
}

// --- HUD ---
export function updateHUD() {
    const { playerLevel, playerXp, playerMaxXp, ultEnergy, currentBoss } = state;

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
        document.getElementById('bossNameText').innerText = `☠️ ${currentBoss.name.toUpperCase()}`;
        document.getElementById('bossHpText').innerText = `${Math.ceil(currentBoss.hp)}/${currentBoss.maxHp}`;
        document.getElementById('bossHpBar').style.width = `${Math.max(0, (currentBoss.hp / currentBoss.maxHp) * 100)}%`;
    } else {
        document.getElementById('bossHpContainer').classList.add('hidden');
    }

    // Status Panel
    document.getElementById('statusLevel').innerText = `LEVEL ${playerLevel}`;
}
