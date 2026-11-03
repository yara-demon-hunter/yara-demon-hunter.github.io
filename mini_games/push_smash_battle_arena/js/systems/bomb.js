import { COMBAT } from '../../data_model/combat.js';
import { BOMB } from '../../data_model/match.js';
import { PHYSICS } from '../../data_model/physics.js';
import { TEXTS } from '../../data_model/texts.js';
import { playSound } from '../audio/sound.js';
import { W } from '../core/canvas.js';
import { state } from '../core/state.js';
import { createParticles, showBanner } from './effects.js';
import { spawnMassBlobs } from './mass.js';

// --- BOMBA QUENTE ---
export function giveBomb(p) {
    state.bombHolder = p;
    state.bombTimer = BOMB.fuseFrames;
    state.bombPassCd = BOMB.passCooldownFrames;
    showBanner(TEXTS.hotBomb, '#ff7f50', 1200);
}

export function updateBomb() {
    if (!state.bombHolder) return;
    if (!state.bombHolder.isAlive) { state.bombHolder = null; return; }
    if (state.bombPassCd > 0) state.bombPassCd--;
    state.bombTimer--;
    if (state.bombTimer <= BOMB.beepFromFrames && state.bombTimer % 30 === 0) playSound('beep');
    if (state.bombTimer <= 0) explodeBomb();
}

export function explodeBomb() {
    const p = state.bombHolder;
    state.bombHolder = null;
    const dir = p.x >= W / 2 ? 1 : -1; // joga pra fora da arena
    p.isPounding = false;
    if (p.hasShield) {
        p.hasShield = false;
        p.vx = dir * BOMB.shieldedBlastSpeed;
        p.vy = -5;
    } else {
        p.vx = dir * BOMB.blastSpeed / Math.sqrt(p.effMass);
        p.vy = -BOMB.blastLift;
        const loss = Math.min(BOMB.massLoss, p.mass - PHYSICS.minMass);
        p.addMass(-loss);
        if (loss > 0.01) spawnMassBlobs(p, loss);
    }
    state.cameraShake = COMBAT.shake.bomb;
    state.hitStop = COMBAT.hitStopFrames.bomb;
    playSound('boom');
    createParticles(p.x, p.y, '#ff7f50', 36, 16);
    createParticles(p.x, p.y, '#ffd32a', 20, 12);
    showBanner(TEXTS.kaboom, '#ff7f50', 900);
}


