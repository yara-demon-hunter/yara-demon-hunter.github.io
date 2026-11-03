import { COMBAT } from '../../data_model/combat.js';
import { MATCH } from '../../data_model/match.js';
import { TEXTS } from '../../data_model/texts.js';
import { playSound } from '../audio/sound.js';
import { H, W } from '../core/canvas.js';
import { state } from '../core/state.js';
import { otherPlayer, players } from '../entities/player.js';
import { showBanner } from './effects.js';
import { endRound } from './round.js';
import { updateScoreHUD } from '../ui/hud.js';

export function triggerKO(loser) {
    if (state.gameState !== 'PLAYING') return;
    playSound('ko');
    state.cameraShake = COMBAT.shake.ko;
    state.koWinner = otherPlayer(loser);
    state.koLoserIndex = players.indexOf(loser);
    state.koWinner.matchCoins += COMBAT.koBonusCoins;
    updateScoreHUD();
    showBanner(TEXTS.ko, '#ff4757', 900, true);
    state.replayFrames = state.history.slice(-COMBAT.replayFrames);
    state.gameState = 'KO';
    state.stateFrames = MATCH.koFrames;
}

export function startReplay() {
    if (state.replayFrames.length < 20) return finishReplay();
    state.gameState = 'REPLAY';
    state.replayIndex = 0;
    state.replayCam = { x: W / 2, y: H / 2, z: 1 };
}

export function finishReplay() {
    if (state.gameState !== 'REPLAY' && state.gameState !== 'KO') return;
    endRound(state.koWinner, 'ko');
}

export function stepReplay() {
    state.replayIndex += COMBAT.replaySpeed;
    if (state.replayIndex >= state.replayFrames.length - 1) return finishReplay();
    const s = state.replayFrames[Math.floor(state.replayIndex)][state.koLoserIndex];
    const z = COMBAT.replayZoom;
    state.replayCam.z += (z - state.replayCam.z) * 0.08;
    const hw = W / (2 * state.replayCam.z);
    const hh = H / (2 * state.replayCam.z);
    const tx = Math.max(hw, Math.min(W - hw, s.x));
    const ty = Math.max(hh, Math.min(H - hh, s.y));
    state.replayCam.x += (tx - state.replayCam.x) * 0.12;
    state.replayCam.y += (ty - state.replayCam.y) * 0.12;
}


