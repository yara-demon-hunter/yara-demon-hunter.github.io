import { persist, save } from '../core/save.js';
import { audio, keys, player, state } from '../core/state.js';

// --- CONFIGURAÇÕES ---
// O 🎮 do HUD pausa a partida e abre som, efeitos e controles. data-invert mostra o contrário
// do valor guardado (o botão "Sound" fica aceso quando muted é false).
function renderSettings() {
    const { settings } = save;
    document.querySelectorAll('[data-setting]').forEach(button => {
        const value = Boolean(settings[button.dataset.setting]);
        button.classList.toggle('is-on', button.hasAttribute('data-invert') ? !value : value);
    });
}

export function openSettings() {
    if (state.gameState !== 'PLAYING') return;
    state.gameState = 'PAUSED';
    renderSettings();
    document.getElementById('settingsScreen').classList.remove('hidden');
    audio.setPaused(true);
}

export function toggleSetting(key) {
    save.settings[key] = !save.settings[key];
    if (key === 'keyboard') {
        // Voltou ao mouse: o herói volta a seguir o cursor e nenhuma tecla fica presa
        Object.keys(keys).forEach((code) => { keys[code] = false; });
        player.mouseFollow = true;
        player.targetX = player.x;
        player.targetY = player.y;
    }
    persist();
    audio.applySettings();
    renderSettings();
}
