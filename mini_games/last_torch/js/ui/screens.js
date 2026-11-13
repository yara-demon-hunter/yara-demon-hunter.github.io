import { CHARACTER_MODEL, getXpToNextLevel } from '../../data_model/character.js';
import { ACHIEVEMENTS } from '../../data_model/sanctuary.js';
import { EVOLUTIONS } from '../../data_model/powers.js';
import { preloadTreeImages, treeImageFor, paintIcon } from '../../data_model/tree_images.js';
import { DARKNESS, getHourName } from '../../data_model/night.js';
import { START } from '../../data_model/start.js';
import { save, persist } from '../core/save.js';
import { attributes, audio, passives, player, powers, state } from '../core/state.js';
import { checkAchievements, pushStats, rewardText } from '../systems/sanctuary.js';
import { getOwnedPowers, hasBuyableNode } from '../systems/tree.js';
import { resetDash } from '../systems/dash.js';
import { resetQuake } from '../systems/quake.js';
import { resetFury } from '../systems/fury.js';
import { getHero, mod, refreshModifiers } from '../systems/modifiers.js';
import { continueEndless, startHour } from '../systems/night.js';
import { getMaxPlayerHp } from '../systems/stats.js';
import { resetTorch } from '../systems/torch.js';
import { prepareCore } from '../render/arena.js';
import { prepareScenery } from '../render/scenery.js';
import { ensureMonsterSprites, scheduleMonsterSprites } from '../render/monster_sprites.js';
import { showToast } from './banner.js';
import { resetSkills } from '../systems/skills.js';
import { startHints } from './hints.js';
import { renderHeroPicker } from './heroes.js';
import { renderHeroStats } from './hero_stats.js';
import { resetQuickPick } from './quick_pick.js';
import { updateHUD } from './hud.js';

// Retrato do herói: arte própria (portraitImage) ou a do Caçador com o filtro de cor dele
export function paintHeroPortrait(node, hero) {
    const image = hero.portraitImage;
    node.style.filter = image ? '' : hero.portrait;
    node.style.backgroundImage = image ? `url('${image}')` : '';
    node.style.backgroundSize = image ? 'cover' : '';
    node.style.backgroundPosition = image ? 'center' : '';
}

// --- INÍCIO DE PARTIDA ---
export function startGame() {
    audio.init();
    prepareScenery();
    prepareCore();
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

    state.run = { kills: 0, damage: 0, bestStreak: 0, bosses: 0, elites: 0, goldEarned: 0, evolutions: 0, victory: false, revivesUsed: 0 };
    state.streak = 0;
    state.streakTimer = 0;
    state.multiKill = 0;
    state.multiTimer = 0;
    state.skillPoints = 0;
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
    state.knifePending = null;
    state.knifeCharge = 0;
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
    resetSkills();
    resetQuickPick();

    refreshModifiers();
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
    paintHeroPortrait(document.getElementById('heroPortrait'), hero);

    state.gameState = 'PLAYING';
    ['startScreen', 'gameOverScreen', 'shopScreen', 'pickScreen', 'campScreen', 'sanctuaryScreen', 'heroScreen'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    startHour();
    updateHUD();
    startHints();
}

// --- PROGRESSO ---
// Durante a partida (acampamento): avisa do que foi conquistado
export function reportProgress() {
    pushStats();
    checkAchievements();
    persist();
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
    if (goal) add(`${goal.a.icon} ${goal.a.name}`, goal.a.desc, goal.progress);
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
}

// Sair para o menu no meio da noite: o que foi feito fica guardado, a caçada se perde
export function quitToMenu() {
    bankRun();
    pushStats();
    checkAchievements({ toast: false });
    persist();
    ['settingsScreen', 'shopScreen', 'pickScreen', 'confirmScreen'].forEach(id => document.getElementById(id).classList.add('hidden'));
    state.knifeInput.stick.fire = false;
    returnToMenu();
}

// --- FIM DA NOITE ---
export function triggerGameOver(reason) {
    state.gameState = 'GAMEOVER';
    const { run } = state;
    const newRecord = state.totalScore > save.stats.bestScore && save.stats.bestScore > 0;

    bankRun();
    if (reason === 'DAWN') {
        save.stats.victories++;
        save.stats.bestDarknessWon = Math.max(save.stats.bestDarknessWon, save.darkness);
        save.maxDarkness = Math.min(DARKNESS.maxLevel, Math.max(save.maxDarkness, save.darkness + 1));
    }
    pushStats();

    const unlocked = checkAchievements({ toast: false });
    persist();

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
    document.getElementById('finalStreak').innerText = run.bestStreak;
    document.getElementById('finalScoreLabel').innerText = newRecord ? 'NEW RECORD' : 'Score';
    document.getElementById('finalScoreLabel').classList.toggle('is-record', newRecord);
    countUp(document.getElementById('finalScore'), state.totalScore);

    const build = document.getElementById('finalBuild');
    build.innerHTML = '';
    [...getOwnedPowers(), ...Object.values(passives).filter(p => p.lvl > 0)].forEach(p => {
        const item = document.createElement('span');
        paintIcon(item, treeImageFor(p.key, p.evolved), p.evolved && EVOLUTIONS[p.key] ? EVOLUTIONS[p.key].icon : p.icon);
        build.appendChild(item);
    });

    const unlocks = document.getElementById('summaryUnlocks');
    unlocks.innerHTML = '';
    unlocked.forEach(a => {
        const item = document.createElement('div');
        item.className = 'unlock-row';
        item.innerHTML = '<b></b><span></span>';
        item.querySelector('b').textContent = `${a.icon} ${a.name}`;
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
        : `I reached Wave ${state.turn} of 12 on Last Torch: ${state.totalScore.toLocaleString('en-US')} points. Can you survive the night?`;
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
    // Recorde ainda sem dado aparece como "-"
    const record = (value) => (value > 0 ? value.toLocaleString('en-US') : '-');
    document.getElementById('recordHour').innerText = record(stats.bestHour);
    document.getElementById('recordScore').innerText = record(stats.bestScore);
    document.getElementById('recordStreak').innerText = record(stats.bestStreak);

    const hero = getHero();
    document.getElementById('startSanctuaryCount').innerText = `${ACHIEVEMENTS.filter(a => save.achievements[a.id]).length}/${ACHIEVEMENTS.length} earned`;
    renderHeroPicker();
    renderHeroStats();
    const dark = document.getElementById('darknessPicker');
    dark.classList.toggle('hidden', save.maxDarkness <= 1);
    document.getElementById('darknessValue').innerText = save.darkness;
    paintHeroPortrait(document.getElementById('heroPortrait'), hero);
}

export function changeDarkness(step) {
    save.darkness = Math.max(1, Math.min(save.maxDarkness, save.darkness + step));
    persist();
    renderStartScreen();
}

export function returnToMenu() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('shopScreen').classList.add('hidden');
    document.getElementById('sanctuaryScreen').classList.add('hidden');
    document.getElementById('heroScreen').classList.add('hidden');
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
    renderStartScreen();
    scheduleMonsterSprites();
    preloadTreeImages();
    const play = document.getElementById('btnStart');
    play.textContent = 'PLAY';
    play.disabled = false;
    window.finishLoading?.();
    if (START.skipMenuOnFirstVisit && save.stats.runs === 0) startFirstVisit();
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
