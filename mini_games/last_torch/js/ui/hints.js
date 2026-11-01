import { save, persist } from '../core/save.js';
import { state } from '../core/state.js';
import { showToast } from './banner.js';

// --- PRIMEIRA NOITE ---
// Dicas curtas e espaçadas, só na primeira partida do jogador.
const touch = () => window.matchMedia('(pointer: coarse)').matches;

const HINTS = [
    { at: 1.8, icon: '🕹️', title: () => (touch() ? 'Left thumb moves' : 'Move with the mouse or WASD'), sub: 'Your blade strikes on its own' },
    { at: 8, icon: '🗡️', title: () => (touch() ? 'Right button throws a dagger' : 'Click to throw a dagger'), sub: '' },
    { at: 15, icon: '💨', title: () => (touch() ? 'Small button dashes' : 'Space to dash'), sub: '' }
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
