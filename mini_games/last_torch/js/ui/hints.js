import { save, persist } from '../core/save.js';
import { state } from '../core/state.js';
import { showToast } from './banner.js';

// --- PRIMEIRA NOITE ---
// Dicas curtas e espaçadas, só na primeira partida do jogador.
const touch = () => window.matchMedia('(pointer: coarse)').matches;

// No computador os dois cliques ficam no lembrete do mouse: estas duas dicas são só do toque
const HINTS = [
    { at: 1.8, icon: '🕹️', title: () => (touch() ? 'Left thumb moves' : 'Move with the mouse or WASD'), sub: 'Your blade strikes on its own' },
    { at: 8, icon: '🗡️', title: () => 'Right button throws a dagger', sub: '', touchOnly: true },
    { at: 15, icon: '💨', title: () => 'Small button dashes', sub: '', touchOnly: true }
];

let timers = [];

// Toda partida, no começo da hora 1. Reiniciar a partida recomeça a animação
function showMouseHint() {
    if (touch()) return;
    const hint = document.getElementById('mouseHint');
    hint.classList.remove('is-showing');
    void hint.offsetWidth;
    hint.classList.add('is-showing');
    hint.onanimationend = (e) => {
        if (e.target === hint) hint.classList.remove('is-showing');
    };
}

export function startHints() {
    showMouseHint();
    timers.forEach(clearTimeout);
    timers = [];
    if (save.seenTutorial) return;
    HINTS.filter(hint => touch() || !hint.touchOnly).forEach(hint => {
        timers.push(setTimeout(() => {
            if (state.gameState === 'PLAYING') showToast(hint.icon, hint.title(), hint.sub);
        }, hint.at * 1000));
    });
    save.seenTutorial = true;
    persist();
}
