import { getTurnDifficulty, waveProgress } from '../../data_model/difficulty.js';
import { BOSS_MODELS, hasDuel } from '../../data_model/bosses.js';
import { NIGHT, getHourName, rollOmen } from '../../data_model/night.js';
import { save, persist } from '../core/save.js';
import { audio, player, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { grantWaveSpoils, openCamp, practiceBonus } from '../ui/camp.js';
import { isWaveResultsOpen } from '../ui/wave_results.js';
import { updateHUD } from '../ui/hud.js';
import { triggerGameOver } from '../ui/screens.js';
import { addGibs, addShockwave, createExplosion, hitStop, screenFlash, shakeScreen, slowMotion, zoomPunch } from './effects.js';
import { purgeEnemy } from './enemies.js';
import { refreshModifiers } from './modifiers.js';
import { collectAllPickups } from './pickups.js';
import { collectAllGold } from './gold.js';
import { bumpStat } from './sanctuary.js';
import { resetStreak } from './streak.js';
import { resetFury } from './fury.js';
import { clearSkillEffects } from './skills.js';
import { clearNatureSkills } from './skills_nature.js';
import { hasBossIntro, playBossIntro, playDuelDialogue, whenHunting } from '../ui/dialogue.js';
import { CAMPAIGN_RUNTIME, screenIndexOf, screenOfTurn, startsNewScreen } from '../../data_model/campaign.js';
import { showMapTransition } from '../ui/map_screen.js';
import { getSceneryId, prepareScenery, setScenery } from '../render/scenery.js';
import { warmSceneryMonsters } from '../render/monster_sprites.js';
import { rollWaveEvent } from './wave_events.js';
import { buildHourPlan, clearBattleEffects, prepareBossSummon, resetFieldForNewTurn, spawnOpening } from './spawner.js';

// --- A NOITE ---
// Fases de uma hora: HUNT (caçada) -> CLEAR (onda de fogo, ouro vem todo, tempo para pegar os itens) ->
// acampamento -> próxima. Fechada a cota (ou morto o boss), a HUNT continua em lastStand: nada mais nasce e o
// jogador mata o que sobrou. Continua sendo HUNT porque os monstros que restam seguem perigosos, e é possível
// morrer aqui. Na última hora, matar o boss leva ao amanhecer (DAWN). Morrer leva a DYING -> tela final.
const DEATH_SLOW = 0.28;

// A tela (cenário) da onda: muda quando a onda abre uma tela nova do mapa (data_model/campaign.js). O sandbox escolhe o cenário à mão e desliga isto.
export function enterScreenForTurn(turn) {
    if (!CAMPAIGN_RUNTIME.enabled) return;
    const screen = screenOfTurn(turn);
    if (getSceneryId() === screen.id) return;
    clearNatureSkills(true);                       // a árvore do druida recomeça como muda a cada tela (de 3 em 3 ondas); entre ondas da mesma tela ela fica
    clearBattleEffects();                          // nada da tela anterior (mancha do chefe, respingos, pedaços) fica na nova
    setScenery(screen.id);
    prepareScenery();
    warmSceneryMonsters(screen.id);                // os monstros dessa tela já ficam prontos (sem travar quando o primeiro nascer)
}

export function startHour() {
    enterScreenForTurn(state.turn);
    state.bossSlain = false;
    const hour = state.turn;
    resetStreak();
    state.phase = 'HUNT';
    state.scoreTurn = 0;
    state.targetScore = getTurnDifficulty(hour).targetScore;
    state.omen = state.nextOmen;
    state.nextOmen = null;
    refreshModifiers();
    state.hourPlan = buildHourPlan(hour);
    state.hourPlan.event = rollWaveEvent(hour);       // 2ª onda de cada tela: um evento que muda a regra (data_model/wave_events.js)
    state.goldVacuum = false;
    state.lastStand = false;
    state.hourHit = false;
    state.waveStats = { kills0: state.run.kills, gold0: state.run.goldEarned, rush: 0, torchDamage: 0, heroDamage: 0, consumed: 0 };
    state.clearWaveRadius = 0;
    state.phoenixSpent = false;
    state.frenzyActiveTimer = 0;       // segurança: a Fúria nunca atravessa a virada de onda
    resetFury();
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
    if (hour > 1) audio.playWaveStart((hour - 1) / (NIGHT.hours - 1));     // a primeira onda já tem o som de início de partida
    updateHUD();
}

// Cota fechada: hora comum vai para o fim (lastStand); hora de boss chama o boss, e a hora só fecha com ele morto
export function checkHourEnd() {
    const plan = state.hourPlan;
    if (state.phase !== 'HUNT' || state.lastStand || plan.bossCalled) return;
    if (waveProgress(state.scoreTurn, state.targetScore, state.waveTime) < 1) return;
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
const BOSS_INTRO_DELAY_MS = 300;

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
    // A Fúria acaba junto com a onda: não passa para a onda seguinte (nem fica parada no acampamento)
    state.frenzyActiveTimer = 0;
    resetFury();
    clearSkillEffects();               // e os golpes longos dos especiais (tornado, fênix, lâminas, lobos no ar...) também: nada continua na onda seguinte
    state.phase = 'CLEAR';
    state.lastStand = false;
    state.phaseTimer = NIGHT.clearSeconds;
    state.clearWaveRadius = 0;
    state.goldVacuum = true;
    state.enemyProjectiles.length = 0;
    state.telegraphs.length = 0;
    state.bossFx = state.bossZone = state.bossShackle = null;
    player.shackledTimer = 0;
    player.rootedTimer = 0;
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
    if (state.replay) { endWaveReplay(true); return; }
    state.goldVacuum = false;
    collectAllPickups();
    state.turn++;
    save.stats.bestHour = Math.max(save.stats.bestHour, state.turn);
    persist();
    state.nextOmen = rollOmen(state.turn);
    // Terminou as 5 ondas da tela (o chefe caiu): o mapa aparece e o herói anda até a tela seguinte; depois vem o resultado e o acampamento, já lá
    if (CAMPAIGN_RUNTIME.enabled && startsNewScreen(state.turn)) {
        state.gameState = 'MAP';                              // a partida espera (sem isto o fim da onda rodaria de novo a cada quadro)
        // Primeiro o resultado da onda (as estrelas), depois o mapa (que mostra as estrelas de cada onda), depois o acampamento já na tela nova.
        // O cenário novo só entra com o mapa já cobrindo a tela: antes, o fundo do cartão de estrelas já mostrava a tela seguinte (adiantava o capítulo)
        collectAllGold();
        let entered = false;
        const enterNewScreen = () => { if (!entered) { entered = true; enterScreenForTurn(state.turn); } };
        const stars = grantWaveSpoils(state.turn - 1, () => {
            showMapTransition(screenIndexOf(state.turn - 1), screenIndexOf(state.turn), () => { enterNewScreen(); openCamp(false, stars); });
            enterNewScreen();                                 // o mapa já está na tela (showMapTransition o mostra na hora): o cenário novo se monta por trás dele
        });
        return;
    }
    openCamp();
}

// --- JOGAR A ONDA DE NOVO (treino) ---
// Pelo mapa, no acampamento: joga de novo uma onda já vencida só para tentar as 3 estrelas. Não dá ouro, experiência nem pontos de skill
// (gold.js e progression.js ignoram state.replay), e ao fim tudo volta ao que era antes: só o recorde de estrelas da onda pode subir.
// Perder também volta ao acampamento, sem perder a noite.
const BACK_KEYS = ['turn', 'nextOmen', 'coins', 'skillPoints', 'playerXp', 'playerMaxXp', 'playerLevel', 'levelPointsCarry', 'totalScore', 'revives', 'secondWind', 'rushPaid'];
export function startWaveReplay(wave) {
    return false;       // TREINO DESLIGADO (nov/2026, ver canReplay em js/ui/map_screen.js): apague esta linha para voltar. O resto do código do treino segue aqui, intacto
    // No acampamento, ou no meio da caçada (o mapa também abre na batalha): neste caso a onda em andamento recomeça quando o treino acaba
    const fromHunt = state.gameState === 'PLAYING' && state.phase === 'HUNT';
    if ((state.gameState !== 'CAMP' && !fromHunt) || state.replay || !(wave >= 1 && wave < state.turn)) return false;
    const back = { hp: player.hp, coreHp: state.coreHp, restart: fromHunt, omen: state.omen, run: { ...state.run, waveStars: { ...state.run.waveStars } } };
    for (const key of BACK_KEYS) back[key] = state[key] && typeof state[key] === 'object' ? { ...state[key] } : state[key];
    state.replay = { wave, back };
    document.getElementById('campScreen').classList.add('hidden');
    state.knifeInput.stick.fire = false;
    state.turn = wave;
    state.gameState = 'PLAYING';
    startHour();
    player.hp = player.maxHp;                                   // treino justo: vida e tocha cheias (voltam ao que eram no fim)
    state.coreHp = state.coreHpMax;
    document.getElementById('practiceBadge')?.classList.remove('hidden');
    updateHUD();
    return true;
}

function endWaveReplay(won) {
    const { wave, back } = state.replay;
    if (won) grantWaveSpoils(wave, null, true);                 // antes de restaurar: conta as mortes e o dano desta onda e grava o recorde de estrelas
    state.replay = null;
    document.getElementById('practiceBadge')?.classList.add('hidden');
    for (const key of BACK_KEYS) state[key] = back[key];
    state.run = back.run;
    if (won) {                                                  // só bater o recorde de estrelas rende o extra (ouro e ponto de skill)
        state.coins += practiceBonus.gold;
        state.run.goldEarned += practiceBonus.gold;
        state.skillPoints += practiceBonus.points;
    }
    player.hp = back.hp;
    player.hidden = false;
    state.coreHp = back.coreHp;
    resetFieldForNewTurn();
    state.phase = 'CLEAR';
    state.lastStand = false;
    if (back.restart) {                                         // veio da batalha: a onda interrompida começa de novo, com o mesmo presságio
        state.nextOmen = back.omen;
        state.gameState = 'PLAYING';
        startHour();
        return;
    }
    openCamp(true);
    if (!won) showBanner('PRACTICE OVER', `WAVE ${wave}`, 'Nothing lost. Try again from the map', 'hour');
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

    if (!state.replay) {                       // treino: o boss de novo não conta de novo
        const key = `boss_${e.type}`;
        save.stats[key] = (save.stats[key] ?? 0) + 1;
        bumpStat('bosses');
    }

    // Rival: os ataques dele somem já, e a conversa entre os dois vem antes de a noite seguir
    if (hasDuel(model)) {
        // Boss caído: nada mais nasce e o que estava em campo explode já (antes, na pausa até a conversa, o spawner soltava hordas novas)
        state.bossSlain = true;
        purgeMonsters();
        state.enemyProjectiles.length = 0;
        state.telegraphs.length = 0;
    state.bossFx = state.bossZone = state.bossShackle = null;
    player.shackledTimer = 0;
    player.rootedTimer = 0;
        setTimeout(() => whenHunting(() => playDuelDialogue(e.type, 'after', afterBoss)), DUEL_DIALOGUE_DELAY_MS);
        return;
    }
    afterBoss();
}

// O golpe final ainda aparece (câmera lenta, explosão) antes de a conversa congelar a tela
const DUEL_DIALOGUE_DELAY_MS = 400;

function afterBoss() {
    if (state.turn === NIGHT.hours && !state.replay) {
        beginDawn();
        return;
    }
    // Boss morto (e a conversa, se houver, acabou): a onda acaba na hora. Os ataques somem e todo monstro que sobrou explode;
    // ninguém precisa caçar os últimos nem esperar mais nenhum nascer. Sem ouro nem XP por eles (o prêmio foi o boss).
    state.enemyProjectiles.length = 0;
    state.telegraphs.length = 0;
    state.bossFx = state.bossZone = state.bossShackle = null;
    player.shackledTimer = 0;
    player.rootedTimer = 0;
    purgeMonsters();
    beginClear();
}

// Todos os monstros em campo explodem de uma vez (fim da onda depois do boss)
function purgeMonsters() {
    for (const e of state.enemies) {
        createExplosion(e.x, e.y, '#fb923c', 10);
        addShockwave(e.x, e.y, { radius: e.radius * 2.6, color: '#fde68a', width: 4, seconds: 0.35 });
    }
    state.enemies.length = 0;
    state.currentBoss = null;
    shakeScreen(10);
}

// --- AMANHECER ---
function beginDawn() {
    state.phase = 'DAWN';
    state.phaseTimer = NIGHT.dawnSeconds;
    state.dawn = 0;
    state.run.victory = true;
    // A última onda também tem resultado (estrelas, pontos, recorde da onda): sem isto a onda 12 nunca ganhava estrelas e as conquistas
    // de estrelas em todas as ondas eram impossíveis. O cartão aparece durante o amanhecer.
    grantWaveSpoils(state.turn);
    state.clearWaveRadius = 0;
    state.goldVacuum = true;
    state.enemyProjectiles.length = 0;
    state.telegraphs.length = 0;
    state.bossFx = state.bossZone = state.bossShackle = null;
    player.shackledTimer = 0;
    player.rootedTimer = 0;
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
    // Uma tela de cada vez: primeiro o resultado da onda 12 (estrelas), depois o resumo da noite (Brasas). O amanhecer espera o cartão fechar
    if (state.phaseTimer <= 0 && !isWaveResultsOpen()) {
        collectAllPickups();
        triggerGameOver('DAWN');
    }
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
    if (state.phaseTimer <= 0) {
        if (state.replay) endWaveReplay(false);          // caiu no treino: volta ao acampamento, nada se perde
        else triggerGameOver(state.gameOverReason);
    }
}

export function updateNight(dt) {
    if (state.lastStand && state.phase === 'HUNT') updateLastStand();
    else if (state.phase === 'CLEAR') updateClear(dt);
    else if (state.phase === 'DAWN') updateDawn(dt);
    else if (state.phase === 'DYING') updateDeath(dt);
}
