import { DAILY_REWARDS, claimDaily, dailyStatus, hoursToMidnight } from '../../data_model/daily.js';
import { save, persist } from '../core/save.js';
import { audio } from '../core/state.js';
import { showToast } from './banner.js';

// --- BAÚ DIÁRIO (faixa) ---
// A mesma faixa aparece na tela inicial (#startDaily) e na tela final (#summaryDaily). Baú fechado: brilha e abre com um
// toque. Baú aberto: mostra o que o de amanhã paga e quantas horas faltam, que é o gancho para voltar no dia seguinte.
// Regras e prêmios em data_model/daily.js.

const BOXES = ['startDaily', 'summaryDaily'];
let onClaim = null;            // quem chama refaz o que depende das Brasas (botão do Altar, "You can buy")

function pips(status) {
    return DAILY_REWARDS.map((_, i) => {
        const day = i + 1;
        const done = status.claimed ? day <= status.day : day < status.day;
        return `<i class="${done ? 'is-done' : ''}${day === status.day && !status.claimed ? ' is-today' : ''}${day === 7 ? ' is-big' : ''}"></i>`;
    }).join('');
}

function paint(box) {
    const status = dailyStatus(save);
    box.classList.toggle('is-ready', !status.claimed);
    box.classList.remove('hidden');
    if (!status.claimed) {
        const label = status.lost ? 'Streak lost · back to day 1' : `Day ${status.day} of 7`;
        box.innerHTML = `<button class="daily-open" type="button">
            <span class="daily-icon" aria-hidden="true">🎁</span>
            <span class="daily-text"><b>DAILY CHEST</b><em>${label}</em></span>
            <span class="daily-pips">${pips(status)}</span>
            <span class="daily-reward">OPEN · 🔥 ${status.reward}</span>
        </button>`;
        return;
    }
    const big = status.nextDay === 7 ? ' · BIG CHEST' : '';
    box.innerHTML = `<div class="daily-done">
        <span class="daily-icon" aria-hidden="true">🎁</span>
        <span class="daily-text"><b>COME BACK TOMORROW</b><em>Day ${status.nextDay} chest: 🔥 ${status.reward}${big} · in ${hoursToMidnight()}h</em></span>
        <span class="daily-pips">${pips(status)}</span>
    </div>`;
}

export function renderDaily() {
    BOXES.forEach(id => {
        const box = document.getElementById(id);
        if (box) paint(box);
    });
}

function claim() {
    const status = dailyStatus(save);
    const gained = claimDaily(save);
    if (!gained) return;
    persist();
    audio.init();
    audio.playLevelUp?.();
    showToast('🎁', `Day ${status.nextDay} chest: +${gained} embers`, status.nextDay === 7 ? 'Seven days in a row!' : 'Come back tomorrow for a bigger one');
    renderDaily();
    onClaim?.();
}

export function setupDaily(refresh) {
    onClaim = refresh;
    BOXES.forEach(id => document.getElementById(id)?.addEventListener('click', (e) => {
        if (e.target.closest('.daily-open')) claim();
    }));
    renderDaily();
}
