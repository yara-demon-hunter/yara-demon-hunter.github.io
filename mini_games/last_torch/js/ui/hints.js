import { save, persist } from '../core/save.js';
import { state } from '../core/state.js';
import { showToast } from './banner.js';

// --- PRIMEIRA NOITE ---
// Dicas curtas e espaçadas, só na primeira partida do jogador.
const touch = () => window.matchMedia('(pointer: coarse)').matches;

const HINTS = [
    { at: 1.5, icon: '🕹️', title: () => (touch() ? 'Left thumb moves' : 'WASD or mouse to move'), sub: 'Your blade strikes on its own.' },
    { at: 9, icon: '🗡️', title: () => (touch() ? 'Right button throws a dagger' : 'Click to throw a dagger'), sub: 'Hit what your blade cannot reach.' },
    { at: 17, icon: '💨', title: () => (touch() ? 'Small button dashes' : 'Space or right-click to dash'), sub: 'You cannot be hurt while dashing.' },
    { at: 28, icon: '🔥', title: () => 'Guard the torch', sub: 'If the flame dies, the night is over. Stand close to heal.' }
];

let timers = [];

export function startHints() {
    timers.forEach(clearTimeout);
    timers = [];
    if (save.seenTutorial) return;
    HINTS.forEach(hint => {
        timers.push(setTimeout(() => {
            if (state.gameState === 'PLAYING') showToast(hint.icon, hint.title(), hint.sub);
        }, hint.at * 1000));
    });
    save.seenTutorial = true;
    persist();
}
