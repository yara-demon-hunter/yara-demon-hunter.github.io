import { AD_REWARD_COINS, COINS_STORAGE_KEY } from '../../data_model/controls.js';
import { TEXTS } from '../../data_model/texts.js';
import { initAudio } from '../audio/sound.js';
import { state } from '../core/state.js';
import { startMatch } from '../systems/match.js';

// --- MENU ---
export const screenMenu = document.getElementById('screenMenu');
export const menuTitle = document.getElementById('menuTitle');
export const menuSub = document.getElementById('menuSub');
export const btn1Player = document.getElementById('btn1Player');
export const btn2Players = document.getElementById('btn2Players');
export const btnReward = document.getElementById('btnReward');
export const hintP2 = document.getElementById('hintP2');
export const hintP2Human = hintP2.innerText;


btn1Player.addEventListener('click', () => { initAudio(); startMatch(true); });
btn2Players.addEventListener('click', () => { initAudio(); startMatch(false); });
btnReward.addEventListener('click', () => {
    state.coins += AD_REWARD_COINS;
    localStorage.setItem(COINS_STORAGE_KEY, state.coins);
    document.getElementById('coinsCount').innerText = state.coins;
    alert(TEXTS.adDone);
    btnReward.classList.add('hidden');
});


