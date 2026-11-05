import { ARENA, MATCH } from '../../data_model/match.js';
import { PLAYERS } from '../../data_model/players.js';
import { STAGES } from '../../data_model/stages.js';
import { TEXTS } from '../../data_model/texts.js';
import { syncMusic } from '../audio/music.js';
import { platform, setTerrain } from '../core/arena.js';
import { W } from '../core/canvas.js';
import { keys } from '../core/input.js';
import { state } from '../core/state.js';
import { players } from '../entities/player.js';
import { updateHeartsHUD, updateWinsHUD } from '../ui/hud.js';
import { setBotHint } from '../ui/controls_hint.js';
import { btnRematch, menuSub, menuTitle, screenMenu } from '../ui/menu.js';
import { buildTouchControls } from '../ui/touch_controls.js';
import { getSelection, refreshStars } from '../ui/character_select.js';
import { keepCharacterAtlases } from '../render/character_sprites.js';

export function startMatch(isBot) {
    state.isBotMatch = isBot;
    const pick = getSelection();
    players.forEach((p, i) => p.setCharacter(pick.chars[i]));
    keepCharacterAtlases(pick.chars);
    state.stage = pick.stage;
    state.botLevel = pick.level;
    setTerrain(STAGES[pick.stage].terrain);
    players.forEach(p => p.resetMatch());
    state.roundNumber = 1;
    updateWinsHUD();
    players[1].controls.isBot = isBot;
    players[1].name = isBot ? PLAYERS[1].botName : PLAYERS[1].name;
    setBotHint(isBot);
    buildTouchControls();
    screenMenu.classList.add('hidden');
    startRound();
    syncMusic();
}

export function startRound() {
    platform.width = ARENA.platform.fullWidth;
    platform.x = (W - platform.width) / 2;
    state.particles = [];
    state.bursts = [];
    state.rings = [];
    state.popups = [];
    state.blasts = [];
    state.comics = [];
    state.history = [];
    state.hitCooldown = 0;
    state.hitStop = 0;
    state.matchTimer = MATCH.roundTime;
    state.roundFrames = 0;
    Object.keys(keys).forEach(k => keys[k] = false);
    document.querySelectorAll('.tbtn.on').forEach(b => b.classList.remove('on'));
    document.getElementById('timerDisplay').innerText = state.matchTimer;
    document.getElementById('roundLabel').innerText = TEXTS.roundLabel(state.roundNumber);
    players.forEach(p => p.reset());
    updateHeartsHUD();
    state.countdownFrames = MATCH.countdownFrames;
    state.lastCount = 0;
    state.gameState = 'COUNTDOWN';
}

export function showGameOverMenu(winnerText, subText) {
    state.gameState = 'MENU';
    syncMusic();
    menuTitle.innerText = winnerText;
    menuSub.innerText = subText;
    btnRematch.classList.remove('hidden');
    refreshStars();
    screenMenu.classList.remove('hidden');
}


