import { initAudio } from '../audio/sound.js';
import { lockLandscape } from './orientation.js';
import { TEXTS } from '../../data_model/texts.js';
import { state } from '../core/state.js';
import { startMatch } from '../systems/match.js';

// --- MENU ---
export const screenMenu = document.getElementById('screenMenu');
export const menuTitle = document.getElementById('menuTitle');
export const menuSub = document.getElementById('menuSub');
export const btn1Player = document.getElementById('btn1Player');
export const btn2Players = document.getElementById('btn2Players');
export const btnRematch = document.getElementById('btnRematch');
btnRematch.innerHTML = `<span>${TEXTS.rematch}</span><small>${TEXTS.rematchSub}</small>`;
menuTitle.innerText = TEXTS.menuTitle;
menuSub.innerText = TEXTS.menuIntro;


btn1Player.addEventListener('click', () => { initAudio(); lockLandscape(); startMatch(true); });
btn2Players.addEventListener('click', () => { initAudio(); lockLandscape(); startMatch(false); });
btnRematch.addEventListener('click', () => { initAudio(); lockLandscape(); startMatch(state.isBotMatch); });


