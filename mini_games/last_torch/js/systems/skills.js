import { PASSIVE_SKILL_MODELS } from '../../data_model/passives.js';
import { OATH_VISUALS } from '../../data_model/visuals/characters/oath_visual.js';
import { audio, player, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { addShockwave, createExplosion, screenFlash, shakeScreen, slowMotion } from './effects.js';
import { startMove, updateCast, updateMove } from './moves.js';
import { clearBladeSkills, updateBladeSkills, updateCracks } from './skills_blade.js';
import { clearCurseSkills, updateCurseSkills } from './skills_curse.js';
import { updateFlameSkills } from './skills_flame.js';
import { clearShadowSkills, updateShadowSkills } from './skills_shadow.js';

// --- SKILLS DOS QUATRO RAMOS ---
// Ponto único: o que anda a cada quadro (cada ramo no seu arquivo), o que limpa entre as horas e o Juramento.
export function updateSkills(dt) {
    updateMove(dt);
    updateCast(dt);
    updateBladeSkills(dt);
    updateShadowSkills(dt);
    updateFlameSkills(dt);
    updateCurseSkills(dt);
    updateCracks(dt);
    if (state.oathCeremony) playOathCeremony();
}

// Efeitos no campo: somem na virada da hora
export function clearSkillEffects() {
    clearBladeSkills();
    clearShadowSkills();
    clearCurseSkills();
    state.phoenixFx = null;
}

// Começo de noite: nada do herói da noite anterior sobrevive
export function resetSkills() {
    clearSkillEffects();
    state.oath = null;
    state.oathCeremony = null;
    state.oathAnnounced = false;
    state.bloodlust.stacks = 0;
    state.bloodlust.timer = 0;
    state.warCryTimer = 0;
    state.phoenixSpent = false;
    player.move = null;
    player.castAge = -1;
    player.stillTime = 0;
    player.vigilStance = false;
    player.shield = 0;
    player.shieldCooldown = 0;
    player.smokeX = 0;
    player.smokeY = 0;
}

// --- JURAMENTO ---
// Comprado na tela de pausa: a transformação acontece no primeiro quadro de volta à partida, com o jogador vendo
function playOathCeremony() {
    const key = state.oathCeremony;
    state.oathCeremony = null;
    const oath = PASSIVE_SKILL_MODELS[key];
    const color = OATH_VISUALS[oath.gear].aura;
    startMove('oath');
    player.iFrames = Math.max(player.iFrames, 1.4);
    showBanner('', oath.name.toUpperCase(), oath.tagline, 'gold');
    screenFlash(color, 0.55);
    shakeScreen(12);
    slowMotion(0.45, 0.7);
    addShockwave(player.x, player.y, { radius: 320, color, width: 12, seconds: 0.8 });
    addShockwave(player.x, player.y, { radius: 180, color: '#ffffff', width: 5, seconds: 0.5 });
    createExplosion(player.x, player.y, color, 30);
    audio.playOath();
}
