// --- TELA DE VITÓRIA (o jogador zerou a noite) ---
// No lugar do resumo comum (HUNT AGAIN / STAY IN THE DARK): um final de verdade. O herói em destaque com os números da noite
// (pontos, mortes, nível, skills, bosses, Brasas, tempo, estrelas), as 12 ondas com as estrelas tiradas em cada uma e um botão
// só, MENU. Aparece depois do cartão de resultado da onda 12 (o amanhecer espera ele fechar). Estilo: css/components/victory.css.
import { audio } from '../core/state.js';

const HUNTER_ART = 'images/characters/demon-hunter-small.webp';
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function showVictory({ hero, darkness, waves, stats, rank, onMenu }) {
    document.getElementById('victoryScreen')?.remove();
    const root = document.createElement('div');
    root.id = 'victoryScreen';
    root.className = 'victory';
    const totalStars = waves.reduce((sum, w) => sum + (w ?? 0), 0);
    const tiles = [
        ['🏆', 'Score', stats.score],
        ['💀', 'Kills', stats.kills],
        ['⭐', 'Max level', stats.level],
        ['✨', 'Skills learned', stats.skills],
        ['👑', 'Bosses', stats.bosses],
        ['🔥', 'Embers', stats.embers],
        ['⚡', 'Best streak', stats.streak],
        ['⏱️', 'Time', null, clock(stats.seconds)]
    ];
    root.innerHTML = `
      <div class="vic-card" role="dialog" aria-label="Victory">
        <p class="vic-eyebrow">THE NIGHT IS OVER${darkness > 1 ? ` · DARKNESS ${darkness}` : ''}</p>
        <h2 class="vic-title">DAWN</h2>
        <div class="vic-body">
          <div class="vic-hero">
            <div class="vic-art"><img alt="" src="${hero.portraitImage ?? HUNTER_ART}"></div>
            <b class="vic-name">${hero.name.toUpperCase()}</b>
            <span class="vic-sub">kept the last torch alive until dawn</span>
            ${rank ? `<span class="vic-rank">🏆 #${rank} BEST NIGHT</span>` : ''}
          </div>
          <div class="vic-side">
            <div class="vic-stats">${tiles.map(([icon, label, value, text]) => `
              <div class="vic-stat"><span class="vic-ico">${icon}</span><b data-to="${value ?? ''}">${text ?? '0'}</b><em>${label}</em></div>`).join('')}
            </div>
            <p class="vic-waves-title">YOUR NIGHT · ${totalStars}/${waves.length * 5} ★</p>
            <div class="vic-waves">${waves.map((s, i) => `
              <div class="vic-wave${s >= 5 ? ' is-perfect' : ''}" style="--d:${i * 0.07}s"><i>Wave ${i + 1}</i><span><b>${'★'.repeat(s ?? 0)}</b>${'★'.repeat(5 - (s ?? 0))}</span></div>`).join('')}
            </div>
          </div>
        </div>
        <button class="vic-menu start-btn" type="button">MENU</button>
      </div>`;
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('is-in'));
    audio.playLevelUp?.();

    // Os números sobem contando
    const start = performance.now();
    const counters = [...root.querySelectorAll('.vic-stat b[data-to]')].filter(b => b.dataset.to !== '');
    const step = (now) => {
        if (!root.isConnected) return;
        const k = Math.min(1, (now - start) / 1400);
        const e = 1 - (1 - k) ** 3;
        counters.forEach(b => { b.textContent = fmt(+b.dataset.to * e); });
        if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    root.querySelector('.vic-menu').addEventListener('click', () => {
        root.classList.remove('is-in');
        setTimeout(() => root.remove(), 250);
        onMenu();
    });
}
