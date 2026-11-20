import { audio } from '../core/state.js';

// --- NOVO RECORDE ---
// Confete e um selo dourado "NEW RECORD" pulam por cima da tela final (mesmo confete do prêmio de herói, css/components/record.css).
// Não bloqueia nada: os botões continuam clicáveis, e some sozinho em alguns segundos (ou ao tocar).
const CONFETTI = 40;
const SHOW_MS = 3600;
let root = null;

export function celebrateRecord({ score, rank }) {
    if (root) return;
    setTimeout(() => {
        if (root) return;
        root = document.createElement('div');
        root.className = 'record-burst';
        const confetti = document.createElement('div');
        confetti.className = 'hu-confetti';
        for (let i = 0; i < CONFETTI; i++) {
            const piece = document.createElement('span');
            piece.style.setProperty('--x', `${Math.round(Math.random() * 100)}%`);
            piece.style.setProperty('--delay', `${(Math.random() * 1.2).toFixed(2)}s`);
            piece.style.setProperty('--fall', `${(2.2 + Math.random() * 2).toFixed(2)}s`);
            piece.style.setProperty('--hue', `${Math.round(30 + Math.random() * 40)}`);
            piece.style.setProperty('--spin', `${Math.round(240 + Math.random() * 600)}deg`);
            confetti.appendChild(piece);
        }
        const badge = document.createElement('div');
        badge.className = 'record-badge';
        badge.innerHTML = '<div class="record-trophy">🏆</div><div class="record-title">NEW RECORD!</div><div class="record-score"></div><div class="record-rank"></div>';
        badge.querySelector('.record-score').textContent = score.toLocaleString('en-US');
        badge.querySelector('.record-rank').textContent = rank ? `Best night #${rank}` : '';
        root.append(confetti, badge);
        document.body.appendChild(root);
        audio.playLevelUp();
        setTimeout(() => audio.playChest?.(), 300);
        requestAnimationFrame(() => root?.classList.add('is-in'));
        const gone = root;
        const end = () => { gone.classList.add('is-out'); setTimeout(() => { gone.remove(); if (root === gone) root = null; }, 400); };
        gone.addEventListener('click', end);
        setTimeout(end, SHOW_MS);
    }, 700);
}
