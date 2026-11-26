import { audio } from '../core/state.js';

// --- RESULTADO DA ONDA ---
// Ao chegar no acampamento: cada número da onda conta subindo, com o "tic" da moeda (o mesmo som que sobe de tom a cada moeda),
// vira pontos, a pontuação total sobe, as 5 estrelas carimbam uma a uma e o prêmio aparece. O recorde daquela onda fica ao lado:
// bater é NEW BEST. Um toque pula para o fim; outro fecha (fecha sozinho pouco depois). Os números e as metas: js/ui/camp.js e
// data_model/night.js > WAVE_SPOILS. Não pausa nada: o acampamento já está parado atrás.
const ROW_SECONDS = 0.45;
const SCORE_SECONDS = 0.55;
const STAR_SECONDS = 0.2;
const CLOSE_AFTER_SECONDS = 8;          // tempo para ler o resultado antes de sumir sozinho (um toque fecha antes)
const TICK_SECONDS = 0.07;

const fmt = (n) => Math.round(n).toLocaleString('en-US');
const ease = (k) => 1 - (1 - k) ** 3;

// O cartão está na tela? (o amanhecer espera ele fechar antes de mostrar o resumo da noite: uma tela de cada vez)
export const isWaveResultsOpen = () => !!document.querySelector('.wave-results');

export function showWaveResults({ wave, rows, stars, score, best, spoilsGold, points, onClose, practice = false }) {
    document.querySelector('.wave-results')?.remove();
    const root = document.createElement('div');
    root.className = 'wave-results';
    root.innerHTML = `
      <div class="wr-card" role="dialog" aria-label="Wave results">
        <p class="wr-eyebrow">WAVE ${wave} ${practice ? 'PRACTICE' : 'RESULTS'}</p>
        <div class="wr-rows">${rows.map((r, i) => `
          <div class="wr-row" data-i="${i}">
            <span class="wr-label">${r.goals ? `<i class="wr-goal">${'<b class="is-met">★</b>'.repeat(r.stars)}${'★'.repeat(r.goals - r.stars)}</i>` : ''}${r.label}${r.need ? `<small class="wr-need">${r.need}</small>` : ''}</span>
            <b class="wr-value">0${r.suffix ?? ''}</b>
            <em class="wr-points">+0</em>
          </div>`).join('')}
        </div>
        <div class="wr-total"><span>SCORE</span><b class="wr-score">0</b></div>
        <p class="wr-best">${best ? `Best on this wave: ${fmt(best.score)}` : 'First time on this wave'}</p>
        <div class="wr-stars">${[0, 1, 2].map(() => '<span class="wr-star">★</span>').join('')}</div>
        <p class="wr-spoils"></p>
        <p class="wr-hint">tap to continue</p>
      </div>`;
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('is-in'));

    const rowEls = [...root.querySelectorAll('.wr-row')];
    const starEls = [...root.querySelectorAll('.wr-star')];
    const scoreEl = root.querySelector('.wr-score');
    // Linha do tempo: as linhas, o total, as estrelas (só as ganhas acendem), o prêmio
    const rowsEnd = rows.length * ROW_SECONDS;
    const scoreEnd = rowsEnd + SCORE_SECONDS;
    const starsEnd = scoreEnd + 3 * STAR_SECONDS;
    const newBest = !!best && score > best.score;
    let start = performance.now();
    let lastTick = -1;
    let stamped = 0;
    let finished = false;
    let closeTimer = null;

    function paint(t) {
        rows.forEach((r, i) => {
            const k = Math.max(0, Math.min(1, (t - i * ROW_SECONDS) / ROW_SECONDS));
            const el = rowEls[i];
            el.classList.toggle('is-on', k > 0);
            el.querySelector('.wr-value').textContent = `${fmt(r.value * ease(k))}${r.suffix ?? ''}`;
            el.querySelector('.wr-points').textContent = `+${fmt(r.points * ease(k))}`;
        });
        const ks = Math.max(0, Math.min(1, (t - rowsEnd) / SCORE_SECONDS));
        scoreEl.textContent = fmt(rows.reduce((sum, r) => sum + r.points, 0) * (t < rowsEnd ? 0 : ease(ks)));
        const due = Math.max(0, Math.min(3, Math.floor((t - scoreEnd) / STAR_SECONDS) + 1));
        while (stamped < due) {
            const lit = stamped < stars;
            starEls[stamped].classList.add(lit ? 'is-lit' : 'is-off');
            if (lit && !finished) audio.playPurchase();
            stamped++;
        }
    }

    function finish() {
        if (finished) return;
        finished = true;
        paint(starsEnd + 1);
        root.querySelector('.wr-spoils').innerHTML = practice ? (spoilsGold || points ? `Record beaten! +${fmt(spoilsGold)} 🪙${points ? ` &nbsp; +${points} ⚡ skill point` : ''}` : 'Practice: no gold or XP') : `+${fmt(spoilsGold)} 🪙${points ? ` &nbsp; +${points} ⚡ skill point` : ''}`;
        root.querySelector('.wr-spoils').classList.add('is-on');
        if (newBest) {
            root.querySelector('.wr-best').innerHTML = `<span class="wr-new">NEW BEST!</span> was ${fmt(best.score)}`;
            audio.playLevelUp();
        }
        closeTimer = setTimeout(close, CLOSE_AFTER_SECONDS * 1000);
    }

    function frame(now) {
        if (finished || !root.isConnected) return;
        const t = (now - start) / 1000;
        // O "tic" da contagem: um a cada TICK_SECONDS enquanto algum número sobe
        if (t < scoreEnd && Math.floor(t / TICK_SECONDS) !== lastTick) {
            lastTick = Math.floor(t / TICK_SECONDS);
            audio.playCoin();
        }
        paint(t);
        if (t >= starsEnd) finish();
        else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function close() {
        clearTimeout(closeTimer);
        document.removeEventListener('keydown', onKey, true);
        root.classList.remove('is-in');
        setTimeout(() => root.remove(), 250);
        onClose?.();                       // o fim da onda de uma tela segue para o mapa depois do resultado
    }
    // Primeiro toque: pula para o resultado; o segundo fecha
    const advance = () => (finished ? close() : finish());
    function onKey(e) {
        if (e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'Escape') return;
        e.preventDefault();
        e.stopPropagation();
        advance();
    }
    root.addEventListener('pointerdown', (e) => { e.preventDefault(); advance(); });
    document.addEventListener('keydown', onKey, true);
}
