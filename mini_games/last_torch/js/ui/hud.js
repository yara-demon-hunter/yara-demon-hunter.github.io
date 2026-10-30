import { NIGHT, getHourName } from '../../data_model/night.js';
import { STREAK } from '../../data_model/streak.js';
import { isBossTurn } from '../../data_model/bosses.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { passives, player, powers, state } from '../core/state.js';
import { getDashCooldown, getKnifeCooldown } from '../systems/stats.js';

// --- FÚRIA NO CARTÃO DO HERÓI ---
// A carga fica no filete embaixo da vida do herói (js/render/arena.js); aqui só o cartão pulsa enquanto ela dura.
// Só escreve no DOM quando muda (é chamada a cada quadro).
let furyCardActive = false;

export function updateFuryCard() {
    const active = state.frenzyActiveTimer > 0;
    if (furyCardActive === active) return;
    furyCardActive = active;
    document.getElementById('heroCard').classList.toggle('fury-active', active);
    document.getElementById('screenFx').classList.toggle('fx-fury', active);
}

// --- BOTÃO DA ADAGA (telas de toque) ---
// Anel de recarga (--cd: 1 logo após o arremesso, 0 = pronto) e brilho quando está pronto.
// Também só escreve no DOM quando muda.
const knifeButton = document.getElementById('knifeButton');
const knifeShown = { cd: '', ready: null };

export function updateKnifeButton() {
    if (!knifeButton) return;
    const ratio = Math.min(1, state.knifeTimer / getKnifeCooldown());
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

// --- BOTÃO DO DASH (telas de toque) ---
const dashButton = document.getElementById('dashButton');
const dashShown = { cd: '', charges: -1 };

export function updateDashButton() {
    if (!dashButton) return;
    const ratio = player.dashCharges > 0 ? 0 : Math.min(1, Math.max(0, player.dashRecharge) / getDashCooldown());
    const cd = ratio.toFixed(2);
    if (dashShown.cd !== cd) {
        dashShown.cd = cd;
        dashButton.style.setProperty('--cd', cd);
    }
    if (dashShown.charges !== player.dashCharges) {
        dashShown.charges = player.dashCharges;
        dashButton.classList.toggle('is-ready', player.dashCharges > 0);
        document.getElementById('dashCharges').innerText = player.dashCharges > 1 ? player.dashCharges : '';
    }
}

// Level up: o nível no cartão do herói pulsa (reinicia a animação se já estiver rodando)
export function pulseLevel() {
    const level = document.getElementById('levelText');
    level.classList.remove('level-gain');
    void level.offsetWidth;
    level.classList.add('level-gain');
}

// --- SEQUÊNCIA DE MORTES ---
const streakShown = { count: -1, visible: false, bar: '' };

export function updateStreakHud() {
    const visible = state.streak >= STREAK.showFrom;
    const box = document.getElementById('hudStreak');
    if (streakShown.visible !== visible) {
        streakShown.visible = visible;
        box.classList.toggle('is-visible', visible);
    }
    if (!visible) {
        streakShown.count = -1;
        return;
    }
    if (streakShown.count !== state.streak) {
        streakShown.count = state.streak;
        const number = document.getElementById('streakCount');
        number.innerText = state.streak;
        number.classList.remove('streak-bump');
        void number.offsetWidth;
        number.classList.add('streak-bump');
        const tier = [...STREAK.tiers].reverse().find(t => state.streak >= t.at);
        box.style.setProperty('--tone', tier ? tier.color : '#e2e8f0');
    }
    const bar = (state.streakTimer / STREAK.windowSeconds).toFixed(2);
    if (streakShown.bar !== bar) {
        streakShown.bar = bar;
        document.getElementById('streakBar').style.transform = `scaleX(${bar})`;
    }
}

// --- VIDA BAIXA ---
const dangerShown = { hero: null, torch: null };

function updateDangerFx() {
    const heroLow = player.hp > 0 && player.hp < player.maxHp * 0.3;
    const torchLow = state.coreHp > 0 && state.coreHp < state.coreHpMax * CORE_MODEL.lowHpRatio;
    if (dangerShown.hero !== heroLow) {
        dangerShown.hero = heroLow;
        document.getElementById('screenFx').classList.toggle('fx-danger', heroLow);
    }
    if (dangerShown.torch !== torchLow) {
        dangerShown.torch = torchLow;
        document.getElementById('screenFx').classList.toggle('fx-torch', torchLow);
    }
}

// --- PROGRESSO DA NOITE ---
// Uma marca por hora: passadas, a atual e as com boss (caveira).
function updateNightPips() {
    const pips = document.getElementById('nightPips');
    const total = Math.max(NIGHT.hours, state.endless ? state.turn : 0);
    if (pips.childElementCount !== total) {
        pips.innerHTML = '';
        for (let h = 1; h <= total; h++) {
            const pip = document.createElement('i');
            if (isBossTurn(h)) pip.className = 'is-boss';
            pips.appendChild(pip);
        }
    }
    [...pips.children].forEach((pip, i) => {
        const hour = i + 1;
        pip.classList.toggle('is-done', hour < state.turn);
        pip.classList.toggle('is-now', hour === state.turn);
    });
}

// Barra de vida do boss: sincronizada a cada golpe (js/systems/damage.js)
export function syncBossBar() {
    const boss = state.currentBoss;
    if (!boss) return;
    document.getElementById('bossHpText').innerText = `${Math.max(0, Math.ceil(boss.hp))}`;
    document.getElementById('bossHpBar').style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
}

// --- BARRA DE PODERES E RELÍQUIAS ---
// Faixa de ícones abaixo do cartão do herói: a build crescendo durante a partida.
export function updateBuildStrip() {
    const strip = document.getElementById('buildStrip');
    strip.innerHTML = '';
    const add = (icon, level, evolved) => {
        const item = document.createElement('span');
        item.className = evolved ? 'build-item is-evolved' : 'build-item';
        item.textContent = icon;
        if (level) {
            const lv = document.createElement('i');
            lv.textContent = level;
            item.appendChild(lv);
        }
        strip.appendChild(item);
    };
    Object.values(powers).forEach(p => { if (p.lvl > 0) add(p.icon, p.lvl, p.evolved); });
    Object.values(passives).forEach(p => { if (p.lvl > 0) add(p.icon, 0, false); });
}

// --- HUD ---
export function updateHUD() {
    const { playerLevel, playerXp, playerMaxXp, currentBoss } = state;

    document.getElementById('levelText').innerText = `LV ${playerLevel}`;
    document.getElementById('xpText').innerText = `${Math.floor(playerXp)}/${playerMaxXp} XP`;
    document.getElementById('xpBar').style.width = `${Math.min(100, (playerXp / playerMaxXp) * 100)}%`;

    updateFuryCard();
    updateDangerFx();
    document.getElementById('killsHud').innerText = state.run.kills;
    document.getElementById('coinsText').innerText = state.coins;
    document.getElementById('hudScore').innerText = state.totalScore.toLocaleString('en-US');

    const hour = state.turn;
    document.getElementById('turnLabel').innerText = `HOUR ${hour}`;
    document.getElementById('hourName').innerText = getHourName(hour);
    const progress = state.hourPlan?.boss ? 1 : state.scoreTurn / Math.max(1, state.targetScore);
    document.getElementById('scoreBar').style.width = `${Math.min(100, progress * 100)}%`;
    updateNightPips();

    // Boss HUD
    if (currentBoss) {
        document.getElementById('bossHpContainer').classList.remove('hidden');
        document.getElementById('bossNameText').innerText = `☠️ ${currentBoss.name.toUpperCase()}`;
        syncBossBar();
    } else {
        document.getElementById('bossHpContainer').classList.add('hidden');
    }
}
