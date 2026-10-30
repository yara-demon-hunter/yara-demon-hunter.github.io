// --- LAST TORCH: DEMON HUNTER ---
// Ponto de entrada: importa os motores e roda o game loop.
// Dados (balanceamento) ficam em ../data_model/; o estado da partida em ./core/state.js.
import { setupInput } from './core/input.js';
import { resize, setupResize } from './core/resize.js';
import { state } from './core/state.js';
import { render } from './render/renderer.js';
import { updateTelegraphs } from './systems/boss_ai.js';
import { updateAutoAttack } from './systems/combat.js';
import { updateDash } from './systems/dash.js';
import { advanceTime, updateEffects, updateRealTimeEffects } from './systems/effects.js';
import { updateEnemies, updateEnemyProjectiles } from './systems/enemies.js';
import { updateGold } from './systems/gold.js';
import { updateKnives } from './systems/knives.js';
import { updateNight } from './systems/night.js';
import { updatePickups } from './systems/pickups.js';
import { updatePlayer } from './systems/player.js';
import { updatePowers } from './systems/powers.js';
import { updateShadowClone } from './systems/shadow_clone.js';
import { updateSpawner } from './systems/spawner.js';
import { updateStreak } from './systems/streak.js';
import { updateTorch } from './systems/torch.js';
import { setupButtons } from './ui/buttons.js';
import { openCards } from './ui/cards.js';
import { updateDashButton, updateFuryCard, updateKnifeButton } from './ui/hud.js';
import { isPhonePortrait } from './ui/orientation.js';
import { setupScreens } from './ui/screens.js';

const MIN_FRAME_MS = 12;
// Fora da partida (menu, loja, game over, aviso de girar) só o cenário se mexe atrás da tela:
// ~15 FPS bastam e poupam GPU/bateria
const IDLE_FRAME_MS = 66;
let lastTime = performance.now();
let lastRender = 0;

// Qualidade adaptativa: abaixo de ~40 FPS seguidos, troca detalhe por fluidez uma vez e fica assim.
// Em ação rápida, jogar liso vale mais que resolução.
const SLOW_FRAME_MS = 25;
const SLOW_FRAMES_TO_SWITCH = 90;
let frameAverage = 16;
let slowFrames = 0;

function detectSlowDevice(frameMs) {
    if (state.lowQuality) return;
    frameAverage += (Math.min(frameMs, 100) - frameAverage) * 0.05;
    slowFrames = frameAverage > SLOW_FRAME_MS ? slowFrames + 1 : Math.max(0, slowFrames - 2);
    if (slowFrames >= SLOW_FRAMES_TO_SWITCH) {
        state.lowQuality = true;
        resize();
    }
}

function isIdle() {
    return state.gameState !== 'PLAYING' || isPhonePortrait();
}

// --- UPDATE LOOP ---
export function update(dt) {
    if (state.gameState !== 'PLAYING') return;
    // Celular em pé: o aviso de virar o aparelho de lado cobre a tela e a partida fica parada
    if (isPhonePortrait()) return;
    dt = Math.min(dt, 0.05);

    // Hit stop e câmera lenta: a lógica anda com o dt do efeito; tremor e clarão seguem no tempo real
    updateRealTimeEffects(dt);
    dt = advanceTime(dt);
    if (dt <= 0) return;
    state.runTime += dt;

    updateNight(dt);
    if (state.phase === 'DYING') {
        updateEffects(dt);
        return;
    }
    if (state.gameState !== 'PLAYING') return;

    updatePlayer(dt);
    updateDash(dt);
    updateTorch(dt);
    updateAutoAttack(dt);
    updateShadowClone(dt);
    updateKnives(dt);
    updatePowers(dt);
    updateSpawner(dt);

    updateEnemies(dt);
    if (state.gameState !== 'PLAYING') return;

    updateEnemyProjectiles(dt);
    updateTelegraphs(dt);

    updateGold(dt);
    updatePickups(dt);
    updateStreak(dt);
    updateFuryCard();
    updateKnifeButton();
    updateDashButton();
    updateEffects(dt);

    // Level up ou baú: o quadro termina antes da escolha de cartas abrir
    if (state.phase === 'HUNT' && state.gameState === 'PLAYING' && state.pendingCards.length > 0) openCards();
}

// --- GAME LOOP ---
function gameLoop(timestamp) {
    // Limita a ~60 FPS (monitores de 120/144 Hz desenhariam o dobro sem ganho real)
    if (timestamp - lastTime < MIN_FRAME_MS) {
        requestAnimationFrame(gameLoop);
        return;
    }
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!isIdle()) detectSlowDevice(dt * 1000);
    update(dt);
    if (!isIdle() || timestamp - lastRender >= IDLE_FRAME_MS) {
        render();
        lastRender = timestamp;
    }

    requestAnimationFrame(gameLoop);
}

setupResize();
setupInput();
setupButtons();
setupScreens();
requestAnimationFrame(gameLoop);
