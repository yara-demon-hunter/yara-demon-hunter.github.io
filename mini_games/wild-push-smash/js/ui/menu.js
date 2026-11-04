import { initAudio } from '../audio/sound.js';
import { lockLandscape } from './orientation.js';
import { startMatch } from '../systems/match.js';

// --- MENU ---
export const screenMenu = document.getElementById('screenMenu');
export const menuTitle = document.getElementById('menuTitle');
export const menuSub = document.getElementById('menuSub');
export const btn1Player = document.getElementById('btn1Player');
export const btn2Players = document.getElementById('btn2Players');
export const hintP2 = document.getElementById('hintP2');
export const hintP2Human = hintP2.innerText;


btn1Player.addEventListener('click', () => { initAudio(); lockLandscape(); startMatch(true); });
btn2Players.addEventListener('click', () => { initAudio(); lockLandscape(); startMatch(false); });


