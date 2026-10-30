import { CHARACTER_MODEL, getXpToNextLevel } from '../../data_model/character.js';
import { ACHIEVEMENTS, EMBER_REWARDS, META_UPGRADES, getMetaUpgradeCost } from '../../data_model/meta.js';
import { DARKNESS, getHourName } from '../../data_model/night.js';
import { HEROES } from '../../data_model/heroes.js';
import { POWER_MODELS } from '../../data_model/powers.js';
import { save, persist } from '../core/save.js';
import { attributes, audio, passives, player, powers, state } from '../core/state.js';
import { getOwnedPowers } from '../systems/cards.js';
import { resetDash } from '../systems/dash.js';
import { getHero, mod, refreshModifiers } from '../systems/modifiers.js';
import { continueEndless, startHour } from '../systems/night.js';
import { getMaxPlayerHp } from '../systems/stats.js';
import { resetTorch } from '../systems/torch.js';
import { prepareForest } from '../render/forest.js';
import { ensureMonsterSprites, scheduleMonsterSprites } from '../render/monster_sprites.js';
import { showToast } from './banner.js';
import { startHints } from './hints.js';
import { updateBuildStrip, updateHUD } from './hud.js';

// --- INÍCIO DE PARTIDA ---
export function startGame() {
    audio.init();
    prepareForest();
    ensureMonsterSprites();
    state.turn = 1;
    state.scoreTurn = 0;
    state.totalScore = 0;
    state.coins = 0;
    state.endless = false;
    state.dawn = 0;
    state.omen = null;
    state.nextOmen = null;
    state.bossPending = 0;
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

    state.run = { kills: 0, damage: 0, bestStreak: 0, bosses: 0, elites: 0, goldEarned: 0, evolutions: 0, victory: false, revivesUsed: 0, embersBanked: 0 };
    state.streak = 0;
    state.streakTimer = 0;
    state.pendingCards = [];
    state.campPending = false;
    state.pickupPity = 0;

    Object.keys(attributes).forEach(k => attributes[k].lvl = 1);
    Object.keys(passives).forEach(k => passives[k].lvl = 0);
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
    state.knifePending = null;
    state.knifeInput.stick.fire = false;
    state.goldDrops = [];
    state.pickups = [];
    state.gibs = [];
    state.stains = [];
    state.shockwaves = [];
    state.floaters = [];
    state.telegraphs = [];
    state.dashGhosts = [];
    state.groundFires = [];
    state.lightning = [];
    state.bolts = [];
    state.stars = [];
    state.powerTimers = {};
    state.orbitAngle = 0;
    state.trailDistance = 0;
    state.magnetTimer = 0;
    state.goldVacuum = false;
    state.currentBoss = null;
    state.levelUpFx = null;

    refreshModifiers();
    state.rerolls = mod('rerolls');
    state.revives = mod('revives');
    resetTorch();

    player.maxHp = getMaxPlayerHp();
    player.hp = player.maxHp;
    player.iFrames = 0;
    player.reflectTimer = 0;
    player.reflectTime = -100000;
    player.trail = [];
    player.hidden = false;
    player.mouseFollow = true;
    resetDash();

    player.x = state.coreX;
    player.y = state.coreY + CHARACTER_MODEL.initialPositionOffsetY;
    player.targetX = player.x;
    player.targetY = player.y;
    player.comboStep = 1;

    document.querySelector('#heroName span').innerText = hero.name.toUpperCase();
    document.getElementById('heroPortrait').style.filter = hero.portrait;

    state.gameState = 'PLAYING';
    ['startScreen', 'gameOverScreen', 'shopScreen', 'cardScreen', 'campScreen', 'hearthScreen'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    startHour();
    updateBuildStrip();
    updateHUD();
    startHints();
}

// --- PROGRESSO ---
// Soma a partida no histórico do jogador. Chamado no acampamento e ao fim da noite.
function pushStats() {
    const { stats } = save;
    stats.bestHour = Math.max(stats.bestHour, state.turn);
    stats.bestStreak = Math.max(stats.bestStreak, state.run.bestStreak);
    stats.bestScore = Math.max(stats.bestScore, state.totalScore);
}

function unlockReward(a) {
    const r = a.reward;
    if (r.embers) save.embers += r.embers;
    if (r.power && !save.unlockedPowers.includes(r.power)) save.unlockedPowers.push(r.power);
    if (r.hero && !save.unlockedHeroes.includes(r.hero)) save.unlockedHeroes.push(r.hero);
}

function rewardText(a) {
    const r = a.reward;
    const parts = [];
    if (r.embers) parts.push(`+${r.embers} 🔥`);
    if (r.power) parts.push(`New power: ${POWER_MODELS[r.power].name}`);
    if (r.hero) parts.push(`New hero: ${HEROES[r.hero].name}`);
    return parts.join(' · ');
}

// Trials completados agora (com a recompensa já entregue)
function checkAchievements() {
    const done = [];
    ACHIEVEMENTS.forEach(a => {
        if (save.achievements[a.id] || (save.stats[a.stat] ?? 0) < a.target) return;
        save.achievements[a.id] = true;
        unlockReward(a);
        done.push(a);
    });
    return done;
}

// Durante a partida (acampamento): avisa do que foi conquistado
export function reportProgress() {
    pushStats();
    checkAchievements().forEach(a => showToast('🏆', a.name, rewardText(a)));
    persist();
}

// --- BRASAS ---
function computeEmberLines() {
    const { run } = state;
    const hours = Math.max(0, state.turn - 1);
    const lines = [
        { label: `Hours survived (${hours})`, value: hours * EMBER_REWARDS.perHour },
        { label: `Kills (${run.kills})`, value: Math.floor(run.kills * EMBER_REWARDS.perKills) },
        { label: `Best streak (${run.bestStreak})`, value: Math.floor(run.bestStreak * EMBER_REWARDS.perStreak) },
        { label: `Bosses slain (${run.bosses})`, value: run.bosses * EMBER_REWARDS.perBoss }
    ];
    if (run.victory) lines.push({ label: 'Survived until dawn', value: EMBER_REWARDS.victory });
    return lines.filter(l => l.value > 0);
}

// Número subindo aos poucos, com um tique de som
function countUp(el, to, ms = 800) {
    const start = performance.now();
    const step = (now) => {
        const k = Math.min(1, (now - start) / ms);
        el.innerText = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// O objetivo mais próximo: é o que faz "só mais uma" parecer razoável
function nearestGoal() {
    let best = null;
    ACHIEVEMENTS.forEach(a => {
        if (save.achievements[a.id]) return;
        const progress = Math.min(0.999, (save.stats[a.stat] ?? 0) / a.target);
        if (!best || progress > best.progress) best = { a, progress };
    });
    return best;
}

function nearestUpgrade() {
    let best = null;
    Object.entries(META_UPGRADES).forEach(([key, model]) => {
        const lvl = save.upgrades[key] ?? 0;
        if (lvl >= model.maxLvl) return;
        const cost = getMetaUpgradeCost(model, lvl);
        if (!best || cost < best.cost) best = { model, cost };
    });
    return best;
}

function renderGoal() {
    const box = document.getElementById('summaryGoal');
    const upgrade = nearestUpgrade();
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
    if (upgrade) {
        const can = save.embers >= upgrade.cost;
        add(`${upgrade.model.icon} ${upgrade.model.name}`, can ? 'READY TO BUY' : `${upgrade.cost - save.embers} 🔥 to go`, Math.min(1, save.embers / upgrade.cost));
    }
    if (goal) add(`🏆 ${goal.a.name}`, goal.a.desc, goal.progress);
}

const END_TEXTS = {
    PLAYER: { title: 'THE HUNTER FELL', sub: 'The fog closes over the clearing.' },
    CORE: { title: 'THE LAST LIGHT DIED', sub: 'The torch went out, and the dark came in.' },
    DAWN: { title: 'DAWN', sub: 'You kept the flame alive through the long night.' }
};

// --- FIM DA NOITE ---
export function triggerGameOver(reason) {
    state.gameState = 'GAMEOVER';
    const { run } = state;
    const newRecord = state.totalScore > save.stats.bestScore && save.stats.bestScore > 0;

    // A noite sem fim continua a mesma partida: conta uma vez só
    if (!run.counted) save.stats.runs++;
    run.counted = true;
    save.stats.kills += run.kills - (run.killsBanked ?? 0);
    save.stats.elites += run.elites - (run.elitesBanked ?? 0);
    run.killsBanked = run.kills;
    run.elitesBanked = run.elites;
    if (reason === 'DAWN') {
        save.stats.victories++;
        save.stats.bestDarknessWon = Math.max(save.stats.bestDarknessWon, save.darkness);
        save.maxDarkness = Math.min(DARKNESS.maxLevel, Math.max(save.maxDarkness, save.darkness + 1));
    }
    pushStats();

    const lines = computeEmberLines();
    const base = lines.reduce((sum, l) => sum + l.value, 0);
    const earned = Math.max(0, Math.round(base * (1 + mod('embers'))) - run.embersBanked);
    run.embersBanked += earned;
    save.embers += earned;

    const unlocked = checkAchievements();
    persist();

    // Tela final
    const text = END_TEXTS[reason];
    const screen = document.getElementById('gameOverScreen');
    screen.classList.toggle('is-victory', reason === 'DAWN');
    document.getElementById('gameOverTitle').innerText = text.title;
    document.getElementById('gameOverSub').innerText = text.sub;
    document.getElementById('finalHour').innerText = `Hour ${state.turn}`;
    document.getElementById('finalHourName').innerText = getHourName(state.turn);
    document.getElementById('finalLevel').innerText = state.playerLevel;
    document.getElementById('finalKills').innerText = run.kills;
    document.getElementById('finalStreak').innerText = run.bestStreak;
    document.getElementById('finalScoreLabel').innerText = newRecord ? 'NEW RECORD' : 'Score';
    document.getElementById('finalScoreLabel').classList.toggle('is-record', newRecord);
    countUp(document.getElementById('finalScore'), state.totalScore);

    const breakdown = document.getElementById('emberLines');
    breakdown.innerHTML = '';
    lines.forEach(l => {
        const row = document.createElement('div');
        row.innerHTML = '<span></span><b></b>';
        row.querySelector('span').textContent = l.label;
        row.querySelector('b').textContent = `+${l.value}`;
        breakdown.appendChild(row);
    });
    countUp(document.getElementById('emberEarned'), earned, 1100);
    document.getElementById('emberTotal').innerText = save.embers;

    const build = document.getElementById('finalBuild');
    build.innerHTML = '';
    [...getOwnedPowers().map(p => p.icon), ...Object.values(passives).filter(p => p.lvl > 0).map(p => p.icon)].forEach(icon => {
        const item = document.createElement('span');
        item.textContent = icon;
        build.appendChild(item);
    });

    const unlocks = document.getElementById('summaryUnlocks');
    unlocks.innerHTML = '';
    unlocked.forEach(a => {
        const item = document.createElement('div');
        item.className = 'unlock-row';
        item.innerHTML = '<b></b><span></span>';
        item.querySelector('b').textContent = `🏆 ${a.name}`;
        item.querySelector('span').textContent = rewardText(a);
        unlocks.appendChild(item);
    });

    renderGoal();
    document.getElementById('btnEndless').classList.toggle('hidden', reason !== 'DAWN');
    screen.classList.remove('hidden');
    audio.setMood(reason === 'DAWN' ? 'dawn' : 'menu');
    if (reason !== 'DAWN') audio.playGameOver();
}

// Resultado para compartilhar: traz gente nova para o jogo
export async function shareResult() {
    const text = state.run.victory
        ? `I kept the last torch alive until dawn on Last Torch: ${state.totalScore.toLocaleString('en-US')} points. Can you survive the night?`
        : `I reached Hour ${state.turn} of 12 on Last Torch: ${state.totalScore.toLocaleString('en-US')} points. Can you survive the night?`;
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

export function keepHunting() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    continueEndless();
}

// --- TELA INICIAL ---
export function renderStartScreen() {
    const { stats } = save;
    const veteran = stats.runs > 0;
    document.getElementById('startTips').classList.toggle('hidden', veteran);
    document.getElementById('startRecords').classList.toggle('hidden', !veteran);
    document.getElementById('recordHour').innerText = stats.bestHour;
    document.getElementById('recordScore').innerText = stats.bestScore.toLocaleString('en-US');
    document.getElementById('recordStreak').innerText = stats.bestStreak;
    document.getElementById('startEmbers').innerText = save.embers;

    const canAfford = Object.entries(META_UPGRADES).some(([key, model]) => {
        const lvl = save.upgrades[key] ?? 0;
        return lvl < model.maxLvl && save.embers >= getMetaUpgradeCost(model, lvl);
    });
    document.getElementById('btnHearth').classList.toggle('can-buy', canAfford);
    document.getElementById('btnHearthSummary').classList.toggle('can-buy', canAfford);

    const hero = getHero();
    document.getElementById('startHeroName').innerText = hero.name;
    const dark = document.getElementById('darknessPicker');
    dark.classList.toggle('hidden', save.maxDarkness <= 1);
    document.getElementById('darknessValue').innerText = save.darkness;
    document.getElementById('heroPortrait').style.filter = hero.portrait;
}

export function changeDarkness(step) {
    save.darkness = Math.max(1, Math.min(save.maxDarkness, save.darkness + step));
    persist();
    renderStartScreen();
}

export function returnToMenu() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('shopScreen').classList.add('hidden');
    document.getElementById('hearthScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    state.gameState = 'START';
    audio.setPaused(false);
    renderStartScreen();
    audio.setMood('menu');
}

export function setupScreens() {
    audio.applySettings();
    renderStartScreen();
    scheduleMonsterSprites();
}
