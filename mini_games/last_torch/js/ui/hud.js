import { KNIFE_SKILL, STAT_UPGRADE_COST } from '../../data_model/skills.js';
import { attributes, passives, state } from '../core/state.js';

// --- FÚRIA NO CARTÃO DO HERÓI ---
// A carga fica no filete embaixo da vida do herói (js/render/arena.js); aqui só o cartão pulsa enquanto ela dura.
// Só escreve no DOM quando muda (é chamada a cada quadro).
let furyCardActive = false;

export function updateFuryCard() {
    const active = state.frenzyActiveTimer > 0;
    if (furyCardActive === active) return;
    furyCardActive = active;
    document.getElementById('heroCard').classList.toggle('fury-active', active);
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

// --- MEDALHÃO DE STATUS ---
// Alerta em vermelho quando há algo para melhorar: pontos de skill (selo com a quantidade) ou ouro para uma passiva (!).
function updateStatusButton() {
    const canUpgrade = state.skillPoints >= STAT_UPGRADE_COST && Object.values(attributes).some(a => a.lvl < a.maxLvl);
    const canBuy = Object.values(passives).some(sk => sk.lvl < sk.maxLvl && state.coins >= sk.cost);

    const button = document.getElementById('btnPause');
    button.classList.toggle('can-upgrade', canUpgrade || canBuy);
    document.getElementById('statusBadge').innerText = canUpgrade ? `+${state.skillPoints}` : canBuy ? '!' : '';
}

// --- HUD ---
export function updateHUD() {
    const { playerLevel, playerXp, playerMaxXp, ultEnergy, currentBoss } = state;

    document.getElementById('levelText').innerText = `LV ${playerLevel}`;
    document.getElementById('xpText').innerText = `${playerXp}/${playerMaxXp} XP`;
    document.getElementById('xpBar').style.width = `${Math.min(100, (playerXp / playerMaxXp) * 100)}%`;

    updateFuryCard();
    document.getElementById('skillPointsHud').innerText = state.skillPoints;

    document.getElementById('turnLabel').innerText = `TURN ${state.turn}`;
    document.getElementById('scoreText').innerText = `${state.scoreTurn} / ${state.targetScore} PTS`;
    document.getElementById('scoreBar').style.width = `${Math.min(100, (state.scoreTurn / state.targetScore) * 100)}%`;

    document.getElementById('coinsText').innerText = state.coins;
    updateStatusButton();

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
