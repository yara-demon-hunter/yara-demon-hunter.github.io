import { getTurnDifficulty } from '../../data_model/difficulty.js';
import { BOSS_MODELS, hasDuel } from '../../data_model/bosses.js';
import { NIGHT, getHourName, rollOmen } from '../../data_model/night.js';
import { save, persist } from '../core/save.js';
import { audio, player, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { openCamp } from '../ui/camp.js';
import { updateHUD } from '../ui/hud.js';
import { triggerGameOver } from '../ui/screens.js';
import { addGibs, addShockwave, createExplosion, hitStop, screenFlash, shakeScreen, slowMotion, zoomPunch } from './effects.js';
import { purgeEnemy } from './enemies.js';
import { refreshModifiers } from './modifiers.js';
import { collectAllPickups } from './pickups.js';
import { bumpStat } from './sanctuary.js';
import { resetStreak } from './streak.js';
import { hasBossIntro, playBossIntro, playDuelDialogue, whenHunting } from '../ui/dialogue.js';
import { buildHourPlan, prepareBossSummon, resetFieldForNewTurn, spawnOpening } from './spawner.js';

// --- A NOITE ---
// Fases de uma hora: HUNT (caçada) -> CLEAR (onda de fogo, ouro vem todo, tempo para pegar os itens) ->
// acampamento -> próxima. Fechada a cota (ou morto o boss), a HUNT continua em lastStand: nada mais nasce e o
// jogador mata o que sobrou. Continua sendo HUNT porque os monstros que restam seguem perigosos, e é possível
// morrer aqui. Na última hora, matar o boss leva ao amanhecer (DAWN). Morrer leva a DYING -> tela final.
const DEATH_SLOW = 0.28;

export function startHour() {
    const hour = state.turn;
    resetStreak();
    state.phase = 'HUNT';
    state.scoreTurn = 0;
    state.targetScore = getTurnDifficulty(hour).targetScore;
    state.omen = state.nextOmen;
    state.nextOmen = null;
    refreshModifiers();
    state.hourPlan = buildHourPlan(hour);
    state.goldVacuum = false;
    state.lastStand = false;
    state.hourHit = false;
    state.clearWaveRadius = 0;
    state.phoenixSpent = false;
    resetFieldForNewTurn();

    // Hora de boss também começa com a onda normal: o boss só chega quando a cota fecha (callBoss)
    const plan = state.hourPlan;
    const bossNote = plan.boss ? `☠️ ${BOSS_MODELS[plan.boss].name} awaits at the end` : '';
    spawnOpening();
    // A primeira faixa da noite diz o objetivo; as outras, a hora e o presságio (ou o boss que espera no fim)
    if (hour === 1) showBanner(`WAVE 1 OF ${NIGHT.hours}`, 'PROTECT THE TORCH', bossNote || 'Survive until dawn', 'hour');
    else showBanner(`WAVE ${hour} OF ${NIGHT.hours}`, getHourName(hour).toUpperCase(), bossNote || (state.omen ? `${state.omen.icon} ${state.omen.name}` : ''), 'hour');
    audio.setMood('hunt');
    audio.setIntensity(Math.min(1, (hour - 1) / (NIGHT.hours - 1)));
    updateHUD();
}

// Cota fechada: hora comum vai para o fim (lastStand); hora de boss chama o boss, e a hora só fecha com ele morto
export function checkHourEnd() {
    const plan = state.hourPlan;
    if (state.phase !== 'HUNT' || state.lastStand || plan.bossCalled) return;
    if (state.scoreTurn < state.targetScore) return;
    if (plan.boss) callBoss(plan);
    else beginLastStand();
}

// Fim da onda numa hora de boss. Sequência:
// 1. silêncio e um respiro (o último golpe assenta; nada mais nasce: bossPending fica segurando o spawner);
// 2. bosses que não são o rival: a caçada congela e o rival provoca (playBossIntro, faixas de cinema);
// 3. nome do boss na faixa, aviso sonoro e o círculo de invocação crescendo no chão onde ele vai surgir;
// 4. NIGHT.bossDelaySeconds depois ele surge do círculo (spawnBoss em js/systems/spawner.js).
// O duelo com o rival tem a própria conversa, depois que ele surge.
function callBoss(plan) {
    plan.bossCalled = true;
    audio.setMood('silent');
    updateHUD();
    if (hasDuel(BOSS_MODELS[plan.boss]) || !hasBossIntro(plan.boss)) {
        announceBoss(plan);
        return;
    }
    state.bossPending = Infinity;
    setTimeout(() => whenHunting(() => {
        if (state.hourPlan !== plan) return;     // a partida mudou no meio do respiro
        playBossIntro(plan.boss, () => announceBoss(plan));
    }), BOSS_INTRO_DELAY_MS);
}
const BOSS_INTRO_DELAY_MS = 800;

function announceBoss(plan) {
    const boss = BOSS_MODELS[plan.boss];
    state.bossPending = NIGHT.bossDelaySeconds;
    prepareBossSummon(boss, NIGHT.bossDelaySeconds);
    showBanner(`WAVE ${state.turn}`, boss.name.toUpperCase(), boss.title, 'danger');
    audio.playBossWarning();
    updateHUD();
}

function beginLastStand() {
    if (state.enemies.length === 0) {
        beginClear();
        return;
    }
    state.lastStand = true;
    // Covas que ainda iam abrir contam como monstros novos
    state.telegraphs = state.telegraphs.filter(t => t.kind !== 'grave');
    showBanner('', 'FINISH THEM', 'No more will come', 'warn');
    updateHUD();
}

// A hora só fecha com a tela limpa, sem limite de tempo: nenhum monstro foge, então dá sempre para alcançá-los.
// Checado a cada quadro porque o último monstro pode morrer sozinho, consumido pela tocha.
function updateLastStand() {
    if (state.enemies.length === 0) beginClear();
}

function beginClear() {
    state.phase = 'CLEAR';
    state.lastStand = false;
    state.phaseTimer = NIGHT.clearSeconds;
    state.clearWaveRadius = 0;
    state.goldVacuum = true;
    state.enemyProjectiles.length = 0;
    state.telegraphs.length = 0;
    state.streakTimer = Math.max(state.streakTimer, NIGHT.clearSeconds);

    screenFlash('#fed7aa', 0.5);
    zoomPunch(0.03);
    shakeScreen(13);
    const untouched = !state.hourHit;
    if (untouched) bumpStat('flawlessHours');
    const sub = [untouched ? 'Untouched' : '', state.pickups.length > 0 ? 'Grab what is left' : ''].filter(Boolean).join(' · ');
    showBanner('', `WAVE ${state.turn} SURVIVED`, sub, 'gold');
    audio.playHourClear();
    updateHUD();
}

// Tela limpa: a onda de fogo sai da tocha só para comemorar, e sobra um tempo para pegar os itens
function updateClear(dt) {
    state.clearWaveRadius += NIGHT.clearWaveSpeed * dt;
    state.phaseTimer -= dt;
    const nothingLeft = state.pickups.length === 0 && state.goldDrops.length === 0;
    if (state.phaseTimer <= 0 || (nothingLeft && state.phaseTimer <= NIGHT.clearSeconds - NIGHT.clearMinSeconds)) finishHour();
}

function finishHour() {
    state.goldVacuum = false;
    collectAllPickups();
    state.turn++;
    save.stats.bestHour = Math.max(save.stats.bestHour, state.turn);
    persist();
    state.nextOmen = rollOmen(state.turn);
    openCamp();
}

// --- BOSS MORTO ---
export function onBossKilled(e, model) {
    hitStop(0.14);
    slowMotion(0.22, 1);
    shakeScreen(22);
    zoomPunch(0.05);
    screenFlash('#ffffff', 0.75);
    addShockwave(e.x, e.y, { radius: 420, color: model.color, width: 12, seconds: 0.8 });
    addShockwave(e.x, e.y, { radius: 240, color: '#fde68a', width: 7, seconds: 0.55 });
    createExplosion(e.x, e.y, model.color, 40);
    audio.playBossDeath();

    const key = `boss_${e.type}`;
    save.stats[key] = (save.stats[key] ?? 0) + 1;
    bumpStat('bosses');

    // Rival: os ataques dele somem já, e a conversa entre os dois vem antes de a noite seguir
    if (hasDuel(model)) {
        state.enemyProjectiles.length = 0;
        state.telegraphs.length = 0;
        setTimeout(() => whenHunting(() => playDuelDialogue(e.type, 'after', afterBoss)), DUEL_DIALOGUE_DELAY_MS);
        return;
    }
    afterBoss();
}

// O golpe final ainda aparece (câmera lenta, explosão) antes de a conversa congelar a tela
const DUEL_DIALOGUE_DELAY_MS = 900;

function afterBoss() {
    if (state.turn === NIGHT.hours && !state.endless) {
        beginDawn();
        return;
    }
    // Os ataques do boss morrem com ele; os monstros que ele trouxe, não
    state.enemyProjectiles.length = 0;
    state.telegraphs.length = 0;
    beginLastStand();
}

// --- AMANHECER ---
function beginDawn() {
    state.phase = 'DAWN';
    state.phaseTimer = NIGHT.dawnSeconds;
    state.dawn = 0;
    state.run.victory = true;
    state.clearWaveRadius = 0;
    state.goldVacuum = true;
    state.enemyProjectiles.length = 0;
    state.telegraphs.length = 0;
    showBanner('', 'DAWN', 'The torch survived the night', 'gold');
    audio.setMood('dawn');
}

function updateDawn(dt) {
    state.dawn = Math.min(1, state.dawn + dt / NIGHT.dawnSeconds);
    state.clearWaveRadius += NIGHT.clearWaveSpeed * 0.3 * dt;
    const { enemies, coreX, coreY } = state;
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (Math.hypot(enemies[i].x - coreX, enemies[i].y - coreY) < state.clearWaveRadius) purgeEnemy(i);
    }
    state.phaseTimer -= dt;
    if (state.phaseTimer <= 0) {
        collectAllPickups();
        triggerGameOver('DAWN');
    }
}

// Continua na noite sem fim depois da tela de vitória
export function continueEndless() {
    state.endless = true;
    state.dawn = 0;
    state.turn++;
    state.nextOmen = rollOmen(state.turn);
    state.gameState = 'PLAYING';
    startHour();
}

// --- MORTE ---
export function beginDeath(reason) {
    if (state.phase === 'DYING') return;
    state.phase = 'DYING';
    state.phaseTimer = 1.4 * DEATH_SLOW;
    state.gameOverReason = reason;
    slowMotion(DEATH_SLOW, 2);
    shakeScreen(20);
    audio.setMood('silent');
    audio.playDeath();

    if (reason === 'PLAYER') {
        player.hidden = true;
        addGibs('HERO', player.x, player.y);
        createExplosion(player.x, player.y, '#38bdf8', 34);
        addShockwave(player.x, player.y, { radius: 260, color: '#38bdf8', width: 9, seconds: 0.8 });
        screenFlash('#0f172a', 0.8);
    } else {
        createExplosion(state.coreX, state.coreY, '#fb923c', 40);
        addShockwave(state.coreX, state.coreY, { radius: 360, color: '#fb923c', width: 12, seconds: 0.9 });
        screenFlash('#000000', 0.85);
    }
}

function updateDeath(dt) {
    state.phaseTimer -= dt;
    if (state.phaseTimer <= 0) triggerGameOver(state.gameOverReason);
}

export function updateNight(dt) {
    if (state.lastStand && state.phase === 'HUNT') updateLastStand();
    else if (state.phase === 'CLEAR') updateClear(dt);
    else if (state.phase === 'DAWN') updateDawn(dt);
    else if (state.phase === 'DYING') updateDeath(dt);
}
