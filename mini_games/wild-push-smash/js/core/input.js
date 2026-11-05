import { KEYS } from '../../data_model/controls.js';
import { state } from './state.js';
import { finishReplay } from '../systems/replay.js';
import { handleSelectKey } from '../ui/character_select.js';

export const keys = {};
// Teclas do jogo não fazem nada na página: setas e espaço rolariam o iframe e a "/" abre a busca rápida do Firefox
const GAME_KEYS = new Set(['Space', ...KEYS.flatMap(Object.values)]);
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code.startsWith('Arrow') || GAME_KEYS.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    if (state.paused) return;
    if (state.gameState === 'REPLAY') finishReplay();
    else if (state.gameState === 'MENU') handleSelectKey(e.code);
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
// Clicou fora do jogo (ex.: fora do iframe) com uma tecla apertada: o keyup não chega, então solta tudo
window.addEventListener('blur', () => Object.keys(keys).forEach(k => { keys[k] = false; }));

