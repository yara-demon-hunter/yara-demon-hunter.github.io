import './core/resize.js';
import './ui/character_select.js';
import { MATCH } from '../data_model/match.js';
import { TEXTS } from '../data_model/texts.js';
import { playSound, stopAllLoops } from './audio/sound.js';
import { state } from './core/state.js';
import { players } from './entities/player.js';
import { snap } from './render/blob.js';
import { render } from './render/renderer.js';
import { resolvePlayerCollisions } from './systems/collisions.js';
import { showBanner, updateEffects } from './systems/effects.js';
import { startReplay, stepReplay } from './systems/replay.js';
import { afterRoundEnd, updateRoundTimer } from './systems/round.js';
import { updateHeartsHUD, updateWinsHUD } from './ui/hud.js';
import { applySettings } from './ui/settings_panel.js';
import { isPhonePortrait } from './ui/orientation.js';
import { isTouch, touchControls } from './ui/touch_controls.js';

// --- LOOP PRINCIPAL (passo fixo de 60 fps) ---
export function step() {
    state.frameCount++;
    if (state.paused || state.gameState !== 'PLAYING') stopAllLoops(); // assobio do SKY DROP
    // Celular em pé: o aviso de virar o aparelho cobre a tela e a partida fica parada
    if (state.paused || isPhonePortrait()) return;
    if (state.hitStop > 0) { state.hitStop--; return; }
    if (state.hitCooldown > 0) state.hitCooldown--;
    updateEffects();
    state.cameraShake *= 0.85;

    if (state.gameState === 'COUNTDOWN') {
        state.countdownFrames--;
        const n = Math.ceil(state.countdownFrames / MATCH.countdownStep);
        if (n !== state.lastCount && n > 0) {
            state.lastCount = n;
            showBanner(String(n), '#45f3df', 600, true);
            playSound('beep');
        }
        if (state.countdownFrames <= 0) {
            state.gameState = 'PLAYING';
            showBanner(TEXTS.go, '#ffd32a', 700, true);
            playSound('go');
        }
    } else if (state.gameState === 'PLAYING') {
        players.forEach(p => p.update());
        resolvePlayerCollisions();
        if (state.gameState === 'PLAYING') updateRoundTimer();
        state.history.push(players.map(snap));
        if (state.history.length > 150) state.history.shift();
    } else if (state.gameState === 'KO') {
        if (--state.stateFrames <= 0) startReplay();
    } else if (state.gameState === 'REPLAY') {
        stepReplay();
    } else if (state.gameState === 'ROUND_END') {
        if (--state.stateFrames <= 0) afterRoundEnd();
    }

    const showTouch = isTouch && (state.gameState === 'COUNTDOWN' || state.gameState === 'PLAYING');
    touchControls.classList.toggle('hidden', !showTouch);
}

export const STEP_MS = 1000 / 60;
export let lastTime = performance.now();
export let acc = 0;
export function gameLoop(now) {
    acc += Math.min(100, now - lastTime);
    lastTime = now;
    while (acc >= STEP_MS) {
        step();
        acc -= STEP_MS;
    }
    render();
    requestAnimationFrame(gameLoop);
}


applySettings();
updateWinsHUD();
updateHeartsHUD();
requestAnimationFrame(gameLoop);

