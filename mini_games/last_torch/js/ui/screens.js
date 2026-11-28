import { placeHeroAtSpawn } from '../systems/player.js';
import { CHARACTER_MODEL, getXpToNextLevel } from '../../data_model/character.js';
import { TOTAL_WAVES } from '../../data_model/campaign.js';
import { ACHIEVEMENTS, achievementValue } from '../../data_model/sanctuary.js';
import { EVOLUTIONS } from '../../data_model/powers.js';
import { preloadTreeImages, treeImageFor, paintIcon } from '../../data_model/tree_images.js';
import { DARKNESS, getHourName, startingSkillPoints } from '../../data_model/night.js';
import { START } from '../../data_model/start.js';
import { ALTAR, ALTAR_KEYS, affordableCount, altarCost, altarLevel, altarStartPoints, emberBreakdown, emberTotal } from '../../data_model/embers.js';
import { save, persist } from '../core/save.js';
import { clearRun, loadRun, runPlace, saveRun, syncRunAccounting } from '../core/run_save.js';
import { HEROES } from '../../data_model/heroes.js';
import { OMENS } from '../../data_model/night.js';
import { openCamp } from './camp.js';
import { resetFieldForNewTurn } from '../systems/spawner.js';
import { preparePhoenix } from '../render/phoenix.js';
import { prepareRaven } from '../render/raven.js';
import { prepareShackle } from '../render/shackle.js';
import { getTorchMaxHp } from '../systems/torch.js';
import { attributes, audio, passives, player, powers, state } from '../core/state.js';
import { checkAchievements, pushStats, recordNight, rewardText } from '../systems/sanctuary.js';
import { celebrateRecord } from './record_celebration.js';
import { flushHeroUnlocks } from './hero_unlock.js';
import { getOwnedPowers, getSpentSkillPoints, hasBuyableNode, respecSkills } from '../systems/tree.js';
import { resetDash } from '../systems/dash.js';
import { resetQuake } from '../systems/quake.js';
import { resetFury } from '../systems/fury.js';
import { resetDruid } from '../systems/druid.js';
import { resetConversion } from '../systems/conversion.js';
import { resetArcane } from '../systems/arcane.js';
import { getHero, mod, refreshModifiers } from '../systems/modifiers.js';
import { enterScreenForTurn, startHour } from '../systems/night.js';
import { platform } from '../platform/platform.js';
import { getMaxPlayerHp } from '../systems/stats.js';
import { resetTorch } from '../systems/torch.js';
import { prepareCore } from '../render/arena.js';
import { getSceneryId, prepareScenery } from '../render/scenery.js';
import { ensureMonsterSprites, scheduleMonsterSprites, warmSceneryMonsters } from '../render/monster_sprites.js';
import { showToast } from './banner.js';
import { resetSkills } from '../systems/skills.js';
import { hideTreeHand, startHints } from './hints.js';
import { heroOffer, isOwned, renderHeroPicker } from './heroes.js';
import { previewHero, renderHeroStats, unlockProgressLabel } from './hero_stats.js';
import { TREE_BRANCHES } from '../../data_model/skill_tree/index.js';
import { dailyStatus } from '../../data_model/daily.js';
import { resetQuickPick } from './quick_pick.js';
import { updateHUD } from './hud.js';
import { renderDaily, setupDaily } from './daily.js';
import { showVictory } from './victory.js';

// Retrato do herói: arte própria (portraitImage) ou a do Caçador com o filtro de cor dele
export function paintHeroPortrait(node, hero) {
    const image = hero.portraitImage;
    node.style.filter = image ? '' : hero.portrait;
    node.style.backgroundImage = image ? `url('${image}')` : '';
    node.style.backgroundSize = image ? 'cover' : '';
    node.style.backgroundPosition = image ? 'center' : '';
}

// --- INÍCIO DE PARTIDA ---
export function startGame(keepSavedRun = false) {
    platform.gameplayStart();
    if (!keepSavedRun) clearRun();          // outra partida com este herói: o registro de CONTINUAR dele não vale mais (o CONTINUE passa true)
    audio.init();
    audio.playRunStart();
    state.turn = 1;
    enterScreenForTurn(1);                  // a partida começa na primeira tela do mapa (a anterior pode ter acabado no Castle)
    prepareScenery();
    prepareCore();
    ensureMonsterSprites();
    warmSceneryMonsters(getSceneryId());
    state.turn = 1;
    state.scoreTurn = 0;
    state.totalScore = 0;
    state.coins = 0;
    state.dawn = 0;
    state.omen = null;
    state.nextOmen = null;
    state.bossPending = 0;
    state.bossSpawnAt = null;
    state.runTime = 0;
    state.hitStop = 0;
    state.slowMoTimer = 0;
    state.zoomPunch = 0;
    state.flash.alpha = 0;
    state.shakeIntensity = 0;

    state.playerLevel = 1;
    state.playerXp = 0;
    state.playerMaxXp = getXpToNextLevel(1);
    state.ultEnergy = 0;
    state.frenzyActiveTimer = 0;
    state.frenzyDuration = 0;

    state.run = { kills: 0, damage: 0, bestStreak: 0, bosses: 0, elites: 0, goldEarned: 0, evolutions: 0, victory: false, revivesUsed: 0, stars: 0,
        // recordes antes desta noite: a tela final mostra NEW BEST no que for batido
        startBests: { hour: save.stats.bestHour, kills: save.stats.bestNightKills ?? 0, stars: save.stats.bestNightStars ?? 0, embers: save.stats.bestNightEmbers ?? 0, streak: save.stats.bestStreak ?? 0 } };
    state.streak = 0;
    state.rushPaid = {};
    state.streakTimer = 0;
    state.multiKill = 0;
    state.multiTimer = 0;
    // Cada nível de Escuridão rende 2 pontos de skill inicial (Escuridão 1 = 2, 2 = 4, 3 = 6, ...): só no começo (DARKNESS.startPointsPerLevel)
    state.skillPoints = startingSkillPoints(save.darkness) + altarStartPoints(save);
    state.levelPointsCarry = 0;
    state.tree = {};
    state.pickupPity = 0;

    Object.keys(attributes).forEach(k => attributes[k].lvl = 1);
    Object.keys(passives).forEach(k => { passives[k].lvl = 0; passives[k].evolved = false; });
    Object.values(powers).forEach(p => {
        p.lvl = 0;
        p.evolved = false;
    });
    const hero = getHero();
    if (hero.startPower) powers[hero.startPower].lvl = 1;

    state.enemies = [];
    state.particles = [];
    state.bladeSlashes = [];
    state.enemyProjectiles = [];
    state.knives = [];
    state.knifeTimer = 0;
    resetQuake();
    resetFury();
    resetDruid();
    resetConversion();
    resetArcane();
    state.knifePending = null;
    state.knifeCharge = 0;
    state.knifeInput.stick.fire = false;
    state.goldDrops = [];
    state.pickups = [];
    state.gibs = [];
    state.corpses = [];
    state.stains = [];
    state.shockwaves = [];
    state.floaters = [];
    state.telegraphs = [];
    state.bossFx = state.bossZone = state.bossShackle = null;
    player.shackledTimer = 0;
    player.rootedTimer = 0;
    state.dashGhosts = [];
    state.groundFires = [];
    state.lightning = [];
    state.skulls = [];
    state.runeShield.count = 0;
    state.bolts = [];
    state.stars = [];
    state.powerTimers = {};
    state.spectralBlade = { left: 0, angle: 0, age: 0 };
    state.icePatches = [];
    state.trailDistance = 0;
    state.magnetTimer = 0;
    state.goldVacuum = false;
    state.currentBoss = null;
    state.levelUpFx = null;
    resetSkills();
    resetQuickPick();

    refreshModifiers();
    state.revives = mod('revives');
    state.secondWind = altarLevel(save, 'torchCall') > 0;       // só quem comprou o Torch's Call no Altar (CORE_MODEL.secondWind)
    resetTorch();

    player.maxHp = getMaxPlayerHp();
    player.hp = player.maxHp;
    player.iFrames = 0;
    player.knockbackX = 0;
    player.knockbackY = 0;
    player.reflectTimer = 0;
    player.reflectTime = -100000;
    player.trail = [];
    player.hidden = false;
    player.mouseFollow = true;
    resetDash();

    placeHeroAtSpawn();                 // o ponto fixo logo abaixo da tocha (CHARACTER_MODEL.heroSpawn)
    player.comboStep = 1;

    document.querySelector('#heroName span').innerText = hero.name.toUpperCase();
    paintHeroPortrait(document.getElementById('heroPortrait'), hero);

    state.gameState = 'PLAYING';
    ['startScreen', 'gameOverScreen', 'shopScreen', 'pickScreen', 'campScreen', 'sanctuaryScreen', 'heroScreen', 'altarScreen'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    startHour();
    // A partida já nasce guardada (onda 1): sair no meio da primeira onda também deixa um CONTINUE
    if (!keepSavedRun) saveRun('hunt');
    updateHUD();
    startHints();
}

// --- CONTINUAR ---
// Recomeça do registro mais recente (js/core/run_save.js): começa uma partida normal, joga por cima tudo o que estava
// guardado e abre o acampamento (se parou nele) ou o começo da hora.
export function continueRun(respec = false) {
    const snap = loadRun();
    if (!snap) return false;
    if (!HEROES[snap.hero] || HEROES[snap.hero].shelved) {
        clearRun();
        return false;
    }
    save.hero = snap.hero;
    save.darkness = Math.min(save.maxDarkness, snap.darkness);
    startGame(true);               // zera tudo e já começa a hora 1: o que vem a seguir sobrescreve (e o registro do herói fica)
    resetFieldForNewTurn();
    state.turn = snap.turn;
    state.totalScore = snap.totalScore;
    state.coins = snap.coins;
    state.skillPoints = snap.skillPoints;
    state.levelPointsCarry = snap.levelPointsCarry;
    state.playerLevel = snap.playerLevel;
    state.playerXp = snap.playerXp;
    state.playerMaxXp = snap.playerMaxXp;
    // Partida guardada antes do renome frenzyNova -> furySkill (a skill Fury): leva o nível para o nome novo
    for (const bag of [snap.attributes, snap.tree]) if (bag && bag.frenzyNova !== undefined) { bag.furySkill ??= bag.frenzyNova; delete bag.frenzyNova; }
    state.tree = { ...snap.tree };
    for (const [key, lvl] of Object.entries(snap.attributes)) if (attributes[key]) attributes[key].lvl = lvl;
    for (const [key, p] of Object.entries(snap.passives)) if (passives[key]) Object.assign(passives[key], p);
    for (const [key, p] of Object.entries(snap.powers)) if (powers[key]) Object.assign(powers[key], p);
    state.oath = snap.oath;
    state.oathAnnounced = snap.oathAnnounced;
    state.oathCeremony = null;
    state.secondWind = snap.secondWind;
    state.run = { ...state.run, ...snap.run };
    state.nextOmen = snap.omen ? Object.values(OMENS).find(o => o.name === snap.omen) ?? null : null;
    refreshModifiers();
    state.revives = snap.revives;
    // Recomeçar com outra build: a árvore é zerada e todos os pontos gastos voltam (js/systems/tree.js > respecSkills)
    if (respec) respecSkills();
    state.coreHpMax = getTorchMaxHp();
    state.coreHp = Math.min(state.coreHpMax, snap.coreHp);
    player.maxHp = getMaxPlayerHp();
    player.hp = Math.min(player.maxHp, snap.hp);
    resetDash();
    // Sprites que levam um instante para montar, melhor agora do que no meio da luta
    if (passives.phoenixPact.lvl > 0) preparePhoenix();
    if (passives.shadowRaven.lvl > 0) prepareRaven();
    if (passives.shadowShackle.lvl > 0) prepareShackle();
    // Com a árvore zerada, ele volta ao acampamento da onda: um lugar calmo para montar a build antes de caçar (na onda 1 não há acampamento)
    if (snap.kind === 'camp' || (respec && snap.turn > 1)) openCamp(true);
    else {
        startHour();
        saveRun('hunt');
    }
    updateHUD();
    return true;
}

// --- PROGRESSO ---
// Durante a partida (acampamento): avisa do que foi conquistado
export function reportProgress() {
    pushStats();
    checkAchievements();
    persist();
    flushHeroUnlocks();             // um herói liberado durante a caçada espera até aqui
}

// Número subindo aos poucos, com um tique de som
function countUp(el, to, ms = 800, prefix = '') {
    const start = performance.now();
    const step = (now) => {
        const k = Math.min(1, (now - start) / ms);
        el.innerText = prefix + Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// Fim da noite: a conta das Brasas linha por linha, contando com o "tic" da moeda (o mesmo do resultado da onda), o total,
// os recordes da noite batidos (NEW BEST) e o que dá para comprar no Altar (o botão leva até lá)
const EMBER_ROW_MS = 420;
let nightRank = null;            // posição da noite que acabou no top 10 (js/systems/sanctuary.js > recordNight)
function renderEmbers(earned) {
    const box = document.getElementById('summaryEmbers');
    const { run } = state;
    const rows = emberBreakdown(run, state.turn, Boolean(run.victory));
    // Recordes de uma noite (o anterior veio de run.startBests; quem continuou uma noite salva pode não ter)
    const before = run.startBests ?? {};
    const stats = save.stats;
    const records = [
        ['Wave', state.turn, before.hour],
        ['Kills', run.kills, before.kills],
        ['Stars', run.stars ?? 0, before.stars],
        ['Embers', earned, before.embers],
        ['Streak', run.bestStreak, before.streak]
    ].filter(([, now, old]) => old !== undefined && now > old && old > 0);
    stats.bestNightKills = Math.max(stats.bestNightKills ?? 0, run.kills);
    stats.bestNightStars = Math.max(stats.bestNightStars ?? 0, run.stars ?? 0);
    stats.bestNightEmbers = Math.max(stats.bestNightEmbers ?? 0, earned);
    persist();
    box.innerHTML = `<div class="embers-gain"><span>🔥 EMBERS</span><b>+0</b></div>
        <div class="embers-rows">${rows.map(r => `<div class="embers-row"><span>${r.label}</span><em>${r.detail}</em><b>+0</b></div>`).join('')}</div>
        <p class="embers-records"></p><p class="embers-total"></p>`;
    const rowEls = [...box.querySelectorAll('.embers-row')];
    const totalEl = box.querySelector('.embers-gain b');
    const start = performance.now();
    let lastTick = -1;
    const end = rows.length * EMBER_ROW_MS;
    const step = (now) => {
        if (!box.isConnected) return;
        const t = now - start;
        let sum = 0;
        rows.forEach((r, i) => {
            const k = Math.max(0, Math.min(1, (t - i * EMBER_ROW_MS) / EMBER_ROW_MS));
            const v = Math.round(r.embers * (1 - Math.pow(1 - k, 3)));
            rowEls[i].classList.toggle('is-on', k > 0);
            rowEls[i].querySelector('b').innerText = `+${v}`;
            sum += v;
        });
        totalEl.innerText = `+${Math.min(sum, earned)}`;
        if (t < end && Math.floor(t / 70) !== lastTick) {
            lastTick = Math.floor(t / 70);
            audio.playCoin();
        }
        if (t < end) requestAnimationFrame(step);
        else {
            totalEl.innerText = `+${earned}`;
            const rankTag = nightRank ? `<span class="embers-new is-rank">🏆 #${nightRank} BEST NIGHT</span>` : '';
            if (records.length || rankTag) {
                box.querySelector('.embers-records').innerHTML = rankTag + records.map(([name, now]) => `<span class="embers-new">NEW BEST · ${name} ${now}</span>`).join('');
                audio.playLevelUp();
            }
        }
    };
    requestAnimationFrame(step);
    renderEmberWallet();
}

// "You have N" da tela final: refeito também quando o baú diário é aberto ali (e a bolinha do Altar acompanha)
function renderEmberWallet() {
    const box = document.getElementById('summaryEmbers');
    if (!box.querySelector('.embers-total')) return;
    const buyable = ALTAR_KEYS.filter(key => altarCost(save, key) !== null && altarCost(save, key) <= save.embers);
    box.querySelector('.embers-total').textContent = `You have ${save.embers}`;
    box.classList.toggle('can-buy', buyable.length > 0);
    renderSummaryActions(state.gameOverReason);
}

// Botões do fim da noite: CONTINUE (verde, só quando há noite salva), HUNT AGAIN (laranja), ALTAR (laranja) e MENU (roxo).
// O Altar nunca abre sozinho: o botão ALTAR pulsa e diz quantas melhorias dá para comprar com as Brasas.
function renderSummaryActions(reason) {
    // Com CONTINUE na tela, HUNT AGAIN some (quem quer recomeçar usa o Altar > HUNT AGAIN ou o menu); sem noite salva ele é o botão principal
    const hasContinue = !document.getElementById('btnDeathContinue').classList.contains('hidden');
    document.getElementById('btnRestart').classList.toggle('hidden', hasContinue);
    const altar = document.getElementById('btnSummaryAltar');
    const ready = reason === 'DAWN' ? 0 : affordableCount(save);
    altar.classList.toggle('is-ready', ready > 0);
    document.getElementById('summaryAltarHint').textContent = ready > 0 ? String(ready) : '';
}

// Brasas no topo e as bolinhas da barra de navegação (presente pronto, compra no Altar, troféu novo no Santuário)
function renderAltarLink() {
    document.getElementById('startEmbers').innerText = save.embers.toLocaleString('en-US');
    document.getElementById('btnAltar').classList.toggle('is-ready', affordableCount(save) > 0);
    renderNavDots();
}

const earnedTrophies = () => ACHIEVEMENTS.filter(a => save.achievements[a.id]).length;
export function renderNavDots() {
    const dot = (id, on) => document.querySelector(`#${id} .nav-dot`)?.classList.toggle('hidden', !on);
    dot('btnGift', !dailyStatus(save).claimed);
    dot('btnAltar', affordableCount(save) > 0);
    dot('btnSanctuary', earnedTrophies() > (save.sanctuarySeen ?? 0));
}

// --- PRESENTE (baú diário numa janela) ---
// Abre sozinho uma vez por visita ao menu quando o baú está pronto (menos na primeira visita: aí o jogador vai direto ao PLAY)
let giftShown = false;
export function openGift() {
    renderDaily();
    document.getElementById('giftPopup').classList.remove('hidden');
}
export function closeGift() {
    document.getElementById('giftPopup').classList.add('hidden');
}
function maybeAutoGift() {
    if (giftShown || save.stats.runs === 0 || dailyStatus(save).claimed) return;
    giftShown = true;
    setTimeout(() => { if (state.gameState === 'START') openGift(); }, 450);
}

// --- VITRINE DO HERÓI ---
// O escolhido (ou o bloqueado que o jogador tocou) em destaque: retrato grande, nome e o papel (ramo de afinidade)
const HUNTER_ART = 'images/characters/demon-hunter-small.webp';
function renderShowcase() {
    const key = previewHero() ?? (isOwned(save.hero) ? save.hero : 'hunter');
    const hero = HEROES[key];
    const locked = !isOwned(key);
    const img = document.getElementById('heroShowImg');
    const src = hero.portraitImage ?? HUNTER_ART;
    if (img.getAttribute('src') !== src) img.src = src;
    img.alt = hero.name;
    document.getElementById('heroShowcase').classList.toggle('is-locked', locked);
    document.getElementById('heroShowLock').classList.toggle('hidden', !locked);
    document.getElementById('heroShowName').textContent = hero.name.toUpperCase();
    const role = hero.affinity ? `${TREE_BRANCHES[hero.affinity].style.split(':')[0]} · ${TREE_BRANCHES[hero.affinity].name.toLowerCase()}` : 'Hunter · every path';
    document.getElementById('heroShowTag').textContent = locked ? (hero.emberPrice ? `For sale · 🔥 ${hero.emberPrice}` : (unlockProgressLabel(key)?.text ?? 'Locked')) : role;
}


// O objetivo mais próximo: é o que faz "só mais uma" parecer razoável
function nearestGoal() {
    let best = null;
    ACHIEVEMENTS.forEach(a => {
        if (save.achievements[a.id]) return;
        const progress = Math.min(0.999, achievementValue(a, save) / a.target);
        if (!best || progress > best.progress) best = { a, progress };
    });
    return best;
}

function renderGoal() {
    const box = document.getElementById('summaryGoal');
    const goal = nearestGoal();
    box.innerHTML = '';
    const add = (title, value, ratio) => {
        const row = document.createElement('div');
        row.className = 'goal-row';
        row.innerHTML = '<span></span><b></b><i><u></u></i>';
        row.querySelector('span').textContent = title;
        row.querySelector('b').textContent = value;
        row.querySelector('u').style.width = `${Math.round(ratio * 100)}%`;
        box.appendChild(row);
    };
    // Herói à venda por Brasas: quanto falta (a meta de médio prazo das Brasas, ao lado do Altar)
    // Uma meta só (a mais perto de sair): o herói à venda mais próximo ou a conquista mais próxima
    const offers = Object.keys(HEROES).map(key => ({ key, offer: heroOffer(key) })).filter(o => o.offer)
        .sort((a, b) => b.offer.have / b.offer.price - a.offer.have / a.offer.price);
    const best = offers[0];
    if (best && (!goal || best.offer.have / best.offer.price >= goal.progress)) {
        add(`🔥 ${HEROES[best.key].name}`, best.offer.ready ? 'Ready to unlock in the menu!' : `${best.offer.price - best.offer.have} embers to go`, Math.min(1, best.offer.have / best.offer.price));
    } else if (goal) add(`${goal.a.icon} ${goal.a.name}`, goal.a.desc, goal.progress);
}

const END_TEXTS = {
    PLAYER: { title: 'THE HUNTER FELL', sub: 'Tip: dash out of trouble, and stand by the fire to heal.' },
    CORE: { title: 'THE LAST LIGHT DIED', sub: 'Tip: kill monsters before they reach the flame.' },
    DAWN: { title: 'DAWN', sub: 'You kept the flame alive through the long night.' }
};

// Soma a partida no histórico: a noite sem fim continua a mesma partida, então conta uma vez só
function bankRun() {
    const { run } = state;
    if (!run.counted) save.stats.runs++;
    run.counted = true;
    save.stats.kills += run.kills - (run.killsBanked ?? 0);
    save.stats.elites += run.elites - (run.elitesBanked ?? 0);
    run.killsBanked = run.kills;
    run.elitesBanked = run.elites;
    return payEmbers();
}

// Brasas da noite (data_model/embers.js): paga o que ainda não foi pago, então sair no meio e continuar não duplica
function payEmbers() {
    const { run } = state;
    const total = emberTotal(run, state.turn, Boolean(run.victory));
    const earned = Math.max(0, total - (run.embersBanked ?? 0));
    run.embersBanked = (run.embersBanked ?? 0) + earned;
    save.embers += earned;
    return earned;
}

// Sair para o menu no meio da noite: o que foi feito fica guardado, a caçada se perde
export function quitToMenu() {
    hideTreeHand();
    bankRun();
    pushStats();
    checkAchievements({ toast: false, announce: true, flush: false });      // o prêmio do herói aparece no menu, logo abaixo
    persist();
    ['settingsScreen', 'shopScreen', 'pickScreen', 'confirmScreen'].forEach(id => document.getElementById(id).classList.add('hidden'));
    state.knifeInput.stick.fire = false;
    returnToMenu();
    setTimeout(flushHeroUnlocks, 500);
}

// --- FIM DA NOITE ---
export function triggerGameOver(reason) {
    platform.gameplayStop();
    state.gameState = 'GAMEOVER';
    const { run } = state;
    platform.gameResult({ victory: !!run.victory, score: state.totalScore, night: state.turn });
    const newRecord = state.totalScore > save.stats.bestScore && save.stats.bestScore > 0;

    hideTreeHand();                // o HUD para de atualizar na tela final: a mãozinha do medalhão precisa sumir aqui
    const embersEarned = bankRun();
    // Ranks: a noite entra no top 10 e no recorde do herói (a posição aparece na tela final)
    nightRank = recordNight({ score: state.totalScore, wave: state.turn, hero: save.hero, kills: run.kills, victory: reason === 'DAWN', darkness: save.darkness });
    // Amanheceu: nada para continuar. Morreu: o registro do herói fica (CONTINUE recomeça a onda), com a contabilidade em dia
    if (reason === 'DAWN') clearRun();
    else syncRunAccounting();
    if (reason === 'DAWN') {
        save.stats.victories++;
        save.stats.bestDarknessWon = Math.max(save.stats.bestDarknessWon, save.darkness);
        save.maxDarkness = Math.min(DARKNESS.maxLevel, Math.max(save.maxDarkness, save.darkness + 1));
    }
    pushStats();

    const unlocked = checkAchievements({ toast: false, announce: true, flush: false });
    persist();

    // CONTINUE depois de morrer: o mesmo herói recomeça a onda em que caiu (quem amanheceu não tem o que continuar)
    const saved = loadRun();
    const deathContinue = document.getElementById('btnDeathContinue');
    deathContinue.classList.toggle('hidden', !saved);
    if (saved) deathContinue.innerHTML = `▶ CONTINUE<em>${runPlace(saved)}</em>`;

    // Tela final
    const text = END_TEXTS[reason];
    const screen = document.getElementById('gameOverScreen');
    screen.classList.toggle('is-victory', reason === 'DAWN');
    document.getElementById('gameOverTitle').innerText = text.title;
    const unspent = reason !== 'DAWN' && hasBuyableNode();
    document.getElementById('gameOverSub').innerText = unspent ? `Tip: ${state.skillPoints} skill points went unused. Tap the medal at the top to spend them.` : text.sub;
    document.getElementById('finalHour').innerText = `Wave ${state.turn}`;
    document.getElementById('finalHourName').innerText = getHourName(state.turn);
    document.getElementById('finalLevel').innerText = state.playerLevel;
    document.getElementById('finalKills').innerText = run.kills;
    document.getElementById('finalKillsTotal').innerText = `${save.stats.kills.toLocaleString('en-US')} total`;
    document.getElementById('finalStreak').innerText = run.bestStreak;
    document.getElementById('finalScoreLabel').innerText = newRecord ? 'NEW RECORD' : 'Score';
    document.getElementById('finalScoreLabel').classList.toggle('is-record', newRecord);
    countUp(document.getElementById('finalScore'), state.totalScore);
    if (newRecord) celebrateRecord({ score: state.totalScore, rank: nightRank });

    const build = document.getElementById('finalBuild');
    build.innerHTML = '';
    const owned = [...getOwnedPowers(), ...Object.values(passives).filter(p => p.lvl > 0)];
    document.getElementById('finalSkills').innerText = getSpentSkillPoints() + state.skillPoints;       // total de pontos de skill ganhos na noite (gastos + os que sobraram)
    owned.forEach(p => {
        const item = document.createElement('span');
        paintIcon(item, treeImageFor(p.key, p.evolved), p.evolved && EVOLUTIONS[p.key] ? EVOLUTIONS[p.key].icon : p.icon);
        build.appendChild(item);
    });

    const unlocks = document.getElementById('summaryUnlocks');
    unlocks.innerHTML = '';
    // Pouca informação para quem perdeu: no máximo 2 troféus novos na tela (o resto vira uma linha "+N more", e está no Santuário)
    const MAX_UNLOCKS = 2;
    unlocked.slice(0, MAX_UNLOCKS).forEach(a => {
        const item = document.createElement('div');
        item.className = 'unlock-row';
        item.innerHTML = '<b></b><span></span>';
        item.querySelector('b').textContent = `${a.icon} ${a.name}`;
        item.querySelector('span').textContent = rewardText(a);
        unlocks.appendChild(item);
    });
    if (unlocked.length > MAX_UNLOCKS) {
        const more = document.createElement('div');
        more.className = 'unlock-row unlock-more';
        more.textContent = `+${unlocked.length - MAX_UNLOCKS} more trophies in the Sanctuary`;
        unlocks.appendChild(more);
    }

    renderEmbers(embersEarned);
    renderDaily();
    renderGoal();
    renderSummaryActions(reason);
    // Zerou a noite: um final de verdade (o herói, os números e as 18 ondas com as estrelas) no lugar do resumo, só com MENU
    if (reason === 'DAWN') {
        showVictory({
            hero: getHero(),
            darkness: save.darkness,
            waves: Array.from({ length: TOTAL_WAVES }, (_, i) => run.waveStars?.[i + 1] ?? 0),
            stats: { score: state.totalScore, kills: run.kills, level: state.playerLevel, skillPoints: getSpentSkillPoints() + state.skillPoints, bosses: run.bosses, embers: embersEarned, streak: run.bestStreak, seconds: state.runTime },
            rank: nightRank,
            // MENU depois do amanhecer: anúncio entre partidas, depois o menu
            onMenu: () => platform.showInterstitial().finally(returnToMenu)
        });
        audio.setMood('dawn');
        flushHeroUnlocks();
        return;
    }
    screen.classList.remove('hidden');
    audio.setMood(reason === 'DAWN' ? 'dawn' : 'menu');
    if (reason !== 'DAWN') audio.playGameOver();
    flushHeroUnlocks();             // o prêmio de um herói novo vem depois do resumo da noite
}

// Resultado para compartilhar: traz gente nova para o jogo
export async function shareResult() {
    const text = state.run.victory
        ? `I kept the last torch alive until dawn on Last Torch: ${state.totalScore.toLocaleString('en-US')} points. Can you survive the night?`
        : `I reached Wave ${state.turn} of ${TOTAL_WAVES} on Last Torch: ${state.totalScore.toLocaleString('en-US')} points. Can you survive the night?`;
    const url = location.href.split('?')[0];
    try {
        if (navigator.share) await navigator.share({ title: 'Last Torch', text, url });
        else {
            await navigator.clipboard.writeText(`${text} ${url}`);
            showToast('📋', 'Copied to clipboard', 'Paste it anywhere');
        }
    } catch {
        // Jogador cancelou o compartilhamento
    }
}

// --- TELA INICIAL ---
export function renderStartScreen() {
    const hero = getHero();
    renderAltarLink();
    renderDaily();
    renderHeroPicker();
    renderHeroStats();
    renderShowcase();
    maybeAutoGift();
    const dark = document.getElementById('darknessPicker');
    // O seletor aparece depois da primeira vitória, ou antes se o Altar já dá pontos iniciais (aí só mostra o total, sem setas)
    dark.classList.toggle('hidden', save.maxDarkness <= 1 && altarStartPoints(save) === 0);
    dark.classList.toggle('no-arrows', save.maxDarkness <= 1);
    // CONTINUE: aparece se há uma noite guardada, dizendo em que onda ela parou
    const run = loadRun();
    const resumable = run && HEROES[run.hero] && !HEROES[run.hero].shelved;
    const btnContinue = document.getElementById('btnContinue');
    btnContinue.classList.toggle('hidden', !resumable);
    if (resumable) btnContinue.innerHTML = `▶ CONTINUE<em>${HEROES[run.hero].name} · ${runPlace(run)}</em>`;
    document.getElementById('darknessValue').innerText = save.darkness;
    const startPoints = startingSkillPoints(save.darkness) + altarStartPoints(save);
    dark.title = `Start with ${startPoints} skill point${startPoints === 1 ? '' : 's'}`;
    document.getElementById('darknessPoints').innerText = `(${startPoints} skill pt${startPoints === 1 ? '' : 's'})`;
    paintHeroPortrait(document.getElementById('heroPortrait'), hero);
}

export function changeDarkness(step) {
    save.darkness = Math.max(1, Math.min(save.maxDarkness, save.darkness + step));
    persist();
    renderStartScreen();
}

export function returnToMenu() {
    platform.gameplayStop();
    hideTreeHand();
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('shopScreen').classList.add('hidden');
    document.getElementById('sanctuaryScreen').classList.add('hidden');
    document.getElementById('heroScreen').classList.add('hidden');
    document.getElementById('altarScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    state.gameState = 'START';
    audio.setPaused(false);
    renderStartScreen();
    audio.setMood('menu');
}

export function setupScreens() {
    audio.applySettings();
    // Reconcilia recompensas antigas antes de montar os cartões do menu.
    checkAchievements({ toast: false });
    setupDaily(() => {
        renderAltarLink();
        renderEmberWallet();
    });
    document.getElementById('btnGift').addEventListener('click', openGift);
    document.getElementById('btnCloseGift').addEventListener('click', closeGift);
    document.getElementById('giftPopup').addEventListener('click', (e) => { if (e.target.id === 'giftPopup') closeGift(); });
    document.getElementById('btnEmbers').addEventListener('click', () => import('./altar.js').then(m => m.openAltar()));
    renderStartScreen();
    scheduleMonsterSprites();
    // Os ~70 ícones da árvore (650 KB) só começam a baixar depois que a caçada já roda: no 4G eles disputavam a banda
    // com o que o primeiro minuto precisa. O primeiro ponto de skill chega por volta dos 15 s, e eles já estarão a caminho.
    setTimeout(preloadTreeImages, 4000);
    const play = document.getElementById('btnStart');
    play.textContent = '▶ PLAY';
    play.disabled = false;
    window.finishLoading?.();
    platform.init();
    platform.loadingDone();
    // Quem fechou a aba no meio da primeira noite ainda tem runs === 0, mas tem uma noite guardada: vê o menu com o CONTINUE
    if (START.skipMenuOnFirstVisit && save.stats.runs === 0 && !loadRun()) startFirstVisit();
}

// Primeira visita: a caçada começa sozinha. O navegador só libera o som depois de um toque, clique ou tecla,
// então o som liga no primeiro gesto do jogador.
function startFirstVisit() {
    startGame();
    const unlockAudio = () => {
        audio.init();
        ['pointerdown', 'keydown'].forEach(type => window.removeEventListener(type, unlockAudio, true));
    };
    ['pointerdown', 'keydown'].forEach(type => window.addEventListener(type, unlockAudio, true));
}
