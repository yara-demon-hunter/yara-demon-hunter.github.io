import { state } from './state.js';
import { finishReplay } from '../systems/replay.js';

export const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    if (e.repeat) return;
    if (state.paused) return;
    if (state.gameState === 'REPLAY') finishReplay();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

