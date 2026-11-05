import { TEXTS } from '../../data_model/texts.js';
import { syncMusic } from '../audio/music.js';
import { initAudio, playSound } from '../audio/sound.js';
import { keys } from '../core/input.js';
import { saveSettings, settings } from '../core/settings.js';
import { state } from '../core/state.js';
import { showGameOverMenu, startMatch } from '../systems/match.js';
import { buildTouchControls, isTouch, touchControls } from './touch_controls.js';

// --- PAINEL DE CONFIGURAÇÕES ---
export const screenSettings = document.getElementById('screenSettings');
export const setSize = document.getElementById('setSize');
export const setMusic = document.getElementById('setMusic');
export const setSfx = document.getElementById('setSfx');
export const setOffX = document.getElementById('setOffX');
export const setOffY = document.getElementById('setOffY');
export const setSwap = document.getElementById('setSwap');

export function applySettings() {
    document.documentElement.style.setProperty('--cs', settings.size);
    document.documentElement.style.setProperty('--cx', settings.offX + 'px');
    document.documentElement.style.setProperty('--cy', settings.offY + 'px');
    setSize.value = settings.size;
    setOffX.value = settings.offX;
    setOffY.value = settings.offY;
    setSwap.innerText = settings.swap ? TEXTS.right : TEXTS.left;
    setMusic.innerText = settings.music ? TEXTS.on : TEXTS.off;
    setMusic.classList.toggle('off', !settings.music);
    setSfx.innerText = settings.sfx ? TEXTS.on : TEXTS.off;
    setSfx.classList.toggle('off', !settings.sfx);
    syncMusic();
}

export function openSettings() {
    if (state.paused) return;
    initAudio();
    state.paused = true;
    Object.keys(keys).forEach(k => keys[k] = false);
    touchControls.classList.add('hidden');
    // o tamanho só importa em aparelhos de toque
    document.querySelectorAll('.touch-only').forEach(r => r.classList.toggle('hidden', !isTouch));
    document.getElementById('rowSwap').classList.toggle('hidden', !isTouch || !state.isBotMatch);
    screenSettings.classList.remove('hidden');
}

export function closeSettings() {
    state.paused = false;
    screenSettings.classList.add('hidden');
}

// Enquanto arrasta um slider, o painel some e os joysticks aparecem para ver o resultado
[[setSize, 'size'], [setOffX, 'offX'], [setOffY, 'offY']].forEach(([el, key]) => {
    el.addEventListener('input', () => { settings[key] = parseFloat(el.value); applySettings(); saveSettings(); });
    el.addEventListener('pointerdown', () => {
        el.closest('.set-row').classList.add('active');
        screenSettings.classList.add('peek');
        if (isTouch) touchControls.classList.remove('hidden');
    });
    ['pointerup', 'pointercancel'].forEach(t => el.addEventListener(t, () => {
        el.closest('.set-row').classList.remove('active');
        screenSettings.classList.remove('peek');
        touchControls.classList.add('hidden');
    }));
});
setSwap.addEventListener('click', () => { settings.swap = !settings.swap; applySettings(); saveSettings(); buildTouchControls(); });
setMusic.addEventListener('click', () => { settings.music = !settings.music; applySettings(); saveSettings(); });
setSfx.addEventListener('click', () => { settings.sfx = !settings.sfx; applySettings(); saveSettings(); if (settings.sfx) playSound('coin'); });
document.getElementById('btnGear').addEventListener('click', () => state.paused ? closeSettings() : openSettings());
document.getElementById('btnResume').addEventListener('click', closeSettings);
document.getElementById('btnRestart').addEventListener('click', () => { closeSettings(); startMatch(state.isBotMatch); });
document.getElementById('btnQuit').addEventListener('click', () => {
    closeSettings();
    showGameOverMenu(TEXTS.quitTitle, TEXTS.quitSub);
});
// Aba escondida (trocou de aba, minimizou o app, anúncio na frente): a luta pausa no painel e o som cala.
// Ao voltar, o som volta e o jogador decide quando continuar (RESUME).
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (state.gameState !== 'MENU') openSettings();
        state.audioCtx?.suspend();
    } else {
        state.audioCtx?.resume();
    }
});
window.addEventListener('keydown', e => {
    if (e.code === 'Escape' && state.gameState !== 'MENU') state.paused ? closeSettings() : openSettings();
});


