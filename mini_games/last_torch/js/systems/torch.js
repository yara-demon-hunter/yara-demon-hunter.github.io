import { CORE_MODEL } from '../../data_model/core.js';
import { learnedWarmth } from '../ui/hints.js';
import { audio, player, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { updateHUD } from '../ui/hud.js';
import { addNumber, createExplosion, screenFlash, shakeScreen } from './effects.js';
import { mod } from './modifiers.js';
import { beginDeath } from './night.js';
import { getMaxPlayerHp, getWarmthHeal, getWarmthRadius } from './stats.js';

// --- TOCHA ---
// A segunda vida da partida: apagou, acabou. Regenera com relíquias, óleo e no acampamento.
// Por perto, o calor dela cura o herói aos poucos.
let warmthFloat = 0;
let warmthTimer = 0;
let warmthFromTorch = false;
const WARMTH_NUMBER_SECONDS = 2;      // de quantos em quantos segundos aparece o número verde da cura (junta o que curou nesse tempo)
let warnedLow = false;

export function getTorchMaxHp() {
    return CORE_MODEL.initialHp + mod('torchHp');
}

export function hurtTorch(amount, x, y) {
    if (state.phase !== 'HUNT') return;
    amount *= 1 - mod('torchGuard');
    state.coreHp = Math.max(0, state.coreHp - amount);
    shakeScreen(8);
    audio.playTorchHit();
    screenFlash('#fb923c', 0.16);
    createExplosion(x, y, '#f43f5e', 14);
    addNumber(state.coreX, state.coreY - 72, amount, -1, 'torch');

    if (!warnedLow && state.coreHp > 0 && state.coreHp < state.coreHpMax * CORE_MODEL.lowHpRatio) {
        warnedLow = true;
        showBanner('', 'THE TORCH IS DYING', 'Get back to the flame', 'danger');
        audio.playAlarm();
    }
    updateHUD();
    if (state.coreHp <= 0) beginDeath('CORE');
}

export function feedTorch(amount) {
    state.coreHp = Math.min(state.coreHpMax, state.coreHp + amount);
    if (state.coreHp >= state.coreHpMax * CORE_MODEL.lowHpRatio) warnedLow = false;
    updateHUD();
}

// Vida máxima da tocha mudou (árvore): a diferença entra na vida atual
export function syncTorchMax() {
    const oldMax = state.coreHpMax;
    state.coreHpMax = getTorchMaxHp();
    state.coreHp = Math.min(state.coreHpMax, state.coreHp + Math.max(0, state.coreHpMax - oldMax));
}

export function resetTorch() {
    warnedLow = false;
    warmthFloat = 0;
    warmthTimer = 0;
    warmthFromTorch = false;
    state.coreHpMax = getTorchMaxHp();
    state.coreHp = state.coreHpMax;
}

export function updateTorch(dt) {
    const regen = mod('torchRegen');
    if (regen > 0 && state.coreHp < state.coreHpMax) feedTorch(regen * dt);

    // Calor: cura o herói que fica perto da chama
    const warmed = Math.hypot(player.x - state.coreX, player.y - state.coreY) < getWarmthRadius();
    if (warmed && player.hp < player.maxHp) {
        const heal = Math.min(player.maxHp - player.hp, getWarmthHeal() * dt);
        player.hp += heal;
        noteAmbientHeal(heal, true);
    }
    // O número verde junta, a cada WARMTH_NUMBER_SECONDS, tudo o que as curas de ambiente deram nesse tempo (tocha e árvore)
    if (warmthFloat > 0) {
        warmthTimer += dt;
        if (warmthTimer >= WARMTH_NUMBER_SECONDS) {
            addNumber(player.x, player.y - 40, warmthFloat, 1, 'heal');
            if (warmthFromTorch) learnedWarmth();          // viu o número verde subir: aprendeu que a tocha cura
            warmthFloat = 0;
            warmthTimer = 0;
            warmthFromTorch = false;
        }
    } else {
        warmthTimer = 0;
    }
}

// Cura de ambiente (o calor da tocha e o círculo verde da árvore): entra na vida na hora e alimenta o número verde acima do herói
export function noteAmbientHeal(amount, fromTorch = false) {
    if (amount <= 0) return;
    warmthFloat += amount;
    if (fromTorch) warmthFromTorch = true;
}

// Vida máxima mudou (carta, relíquia): mantém a mesma diferença até o máximo
export function syncMaxHp() {
    const oldMax = player.maxHp;
    player.maxHp = getMaxPlayerHp();
    player.hp = Math.min(player.maxHp, Math.max(1, player.hp + Math.max(0, player.maxHp - oldMax)));
}
