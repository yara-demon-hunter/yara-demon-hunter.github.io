import { audio } from '../core/state.js';
import { buyPassiveSkill } from './passives.js';
import { lockPortrait } from './orientation.js';
import { startGame } from './screens.js';
import { buyUpgrade, openShop, resumeGame } from './shop.js';

// --- EVENTOS DA INTERFACE (BOTOES) ---
export function setupButtons() {
    document.getElementById('btnSound').addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        document.getElementById('btnSound').innerText = isMuted ? '🔇' : '🔊';
    });

    // No celular: tela cheia travada em retrato (precisa de um toque do jogador para ser permitido)
    const start = () => {
        lockPortrait();
        startGame();
    };
    document.getElementById('btnStart').addEventListener('click', start);
    document.getElementById('btnRestart').addEventListener('click', start);
    document.getElementById('btnPause').addEventListener('click', openShop);
    document.getElementById('btnCloseShop').addEventListener('click', resumeGame);
    document.getElementById('btnResume').addEventListener('click', resumeGame);
    document.getElementById('shopList').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-upgrade]');
        if (button && !button.disabled) buyUpgrade(button.dataset.upgrade);
    });
    document.getElementById('passiveList').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-passive]');
        if (button && !button.disabled) buyPassiveSkill(button.dataset.passive);
    });
}
