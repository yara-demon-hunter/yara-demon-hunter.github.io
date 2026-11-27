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

// Os 7 dias, cada um com o valor em Brasas embaixo: feito (✔), hoje/amanhã em destaque e o dia 7 (baú grande) maior, para a pessoa ver o que vai ganhar
function days(status) {
    return DAILY_REWARDS.map((reward, i) => {
        const day = i + 1;
        const done = status.claimed ? day <= status.day : day < status.day;
        const current = !status.claimed && day === status.day;           // o que abre agora
        const next = status.claimed && day === status.nextDay;           // o de amanhã
        const label = current ? 'TODAY' : next ? 'NEXT' : `DAY ${day}`;
        const icon = done ? '✔' : '🔥';
        const cls = ['daily-day', done && 'is-done', current && 'is-today', next && 'is-next', day === 7 && 'is-big'].filter(Boolean).join(' ');
        return `<div class="${cls}"><small>${label}</small><span class="daily-day-icon" aria-hidden="true">${icon}</span><b>${reward.toLocaleString('en-US')}</b></div>`;
    }).join('');
}

function paint(box) {
    const status = dailyStatus(save);
    box.classList.toggle('is-ready', !status.claimed);
    box.classList.remove('hidden');
    if (!status.claimed) {
        const label = status.lost ? 'Streak lost · back to day 1' : `Day ${status.day} of 7 · tap to collect`;
        box.innerHTML = `<button class="daily-card daily-open" type="button">
            <span class="daily-head">
                <span class="daily-icon" aria-hidden="true">🎁</span>
                <span class="daily-text"><b>DAILY CHEST</b><em>${label}</em></span>
                <span class="daily-reward">COLLECT 🔥 ${status.reward.toLocaleString('en-US')}</span>
            </span>
            <span class="daily-days">${days(status)}</span>
        </button>`;
        return;
    }
    const big = status.nextDay === 7 && DAILY_REWARDS[6] > DAILY_REWARDS[0] ? ' · the BIG chest' : '';       // só se o dia 7 pagar mais que o dia 1
    box.innerHTML = `<div class="daily-card daily-done">
        <div class="daily-head">
            <span class="daily-icon" aria-hidden="true">🎁</span>
            <span class="daily-text"><b>COME BACK TOMORROW</b><em>Day ${status.nextDay}: 🔥 ${status.reward.toLocaleString('en-US')}${big}</em></span>
            <span class="daily-timer" title="Time until the next chest">⏳ ${hoursToMidnight()}h</span>
        </div>
        <div class="daily-days">${days(status)}</div>
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
    showToast('🎁', `Day ${status.nextDay} chest: +${gained} embers`, status.nextDay === 7 ? 'Seven days in a row!' : `Come back tomorrow for ${DAILY_REWARDS[status.nextDay % 7]} more`);
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
