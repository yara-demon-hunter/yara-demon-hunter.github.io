import { audio } from '../core/state.js';
import { startGame } from './screens.js';
import { buyUpgrade, openShop, resumeGame } from './shop.js';

// --- EVENTOS DA INTERFACE (BOTOES) ---
export function setupButtons() {
    document.getElementById('btnSound').addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        document.getElementById('btnSound').innerText = isMuted ? '🔇' : '🔊';
    });

    document.getElementById('btnStart').addEventListener('click', startGame);
    document.getElementById('btnRestart').addEventListener('click', startGame);
    document.getElementById('btnPause').addEventListener('click', openShop);
    document.getElementById('btnCloseShop').addEventListener('click', resumeGame);
    document.getElementById('btnResume').addEventListener('click', resumeGame);
    document.getElementById('shopList').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-upgrade]');
        if (button && !button.disabled) buyUpgrade(button.dataset.upgrade);
    });
}
