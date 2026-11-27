import { TURN_DIFFICULTY, getTurnDifficulty } from '../../data_model/difficulty.js';
import { screenOf } from '../../data_model/screens/index.js';
import { rollElite } from '../../data_model/elites.js';
import { DARKNESS, HOUR_EVENTS, NIGHT, rollHourHordes } from '../../data_model/night.js';
import { save } from '../core/save.js';
import { BOSS_MODELS, BOSS_SPAWNING, chooseBossType, createBoss, hasDuel, isBossTurn } from '../../data_model/bosses.js';
import { MONSTER_MODELS, MONSTER_SPAWNING, chooseMonsterType, createMonster } from '../../data_model/monsters.js';
import { TENSION_CURVE, waveProgress, waveTension } from '../../data_model/difficulty.js';
import { audio, player, state } from '../core/state.js';
import { showBanner, showToast } from '../ui/banner.js';
import { playDuelDialogue, whenHunting } from '../ui/dialogue.js';
import { updateHUD } from '../ui/hud.js';
import { addShockwave, screenFlash, shakeScreen, slowMotion } from './effects.js';
import { getHero, mod } from './modifiers.js';
import { clearSkillEffects } from './skills.js';
import { getSceneryId } from '../render/scenery.js';
import { effectiveTurn } from '../../data_model/campaign.js';
import { spawnDefOf } from '../../library/monsters/25d/spawn.js';
import { pickBossSpawnPoint, pickSpawnPoint, zoneMonsterTypes } from './spawn_zones.js';

const MIN_HORDE = 3;

// --- SPAWNER DE INIMIGOS ---
// Monstros nascem SOMENTE nas zonas verdes do cenário (spawn_zones.js); não existe mais nascimento pela borda do mundo

// Aplica Escuridão e presságios a um monstro recém-criado
// Chefe: a Escuridão já entrou em createBoss (BOSS_DARKNESS, em bosses.js); aqui só os outros modificadores (presságios, juramentos), sem contar a Escuridão duas vezes
function applyBossMods(e) {
    const dark = Math.max(0, save.darkness - 1);
    const factor = (key, perLevel) => Math.max(0.1, 1 + mod(key) - perLevel * dark);
    e.hp = e.maxHp = Math.max(1, Math.round(e.hp * factor('enemyHp', DARKNESS.enemyHpPerLevel)));
    e.damage *= factor('enemyDamage', DARKNESS.enemyDamagePerLevel);
    e.speed *= factor('enemySpeed', DARKNESS.enemySpeedPerLevel);
    return e;
}

function applyEnemyMods(e) {
    e.hp = e.maxHp = Math.max(1, Math.round(e.hp * (1 + mod('enemyHp'))));
    e.damage *= 1 + mod('enemyDamage');
    e.speed *= 1 + mod('enemySpeed');
    return e;
}

// Todo monstro entra por aqui (spawner, invocações, hordas)
// opts.emerge: o monstro NASCE à vista (zona de nascimento do cenário): o efeito e a pose vêm de library/monsters/25d/spawn.js, e enquanto
// nasce ele não anda nem ataca (js/systems/enemies.js)
export function addMonster(type, x, y, opts = {}) {
    const e = applyEnemyMods(createMonster(type, state.turn, x, y));
    const def = opts.emerge ? spawnDefOf(type) : null;
    if (def) e.emerge = { age: 0, seconds: def.seconds, def };
    state.enemies.push(e);
    return e;
}

// Onde nasce um monstro deste tipo: SEMPRE numa zona verde do cenário (Ateliê). Sem zona nenhuma (ou todas bloqueadas), ele não nasce:
// o jogo avisa no console (uma vez por cenário) e o cenário precisa de uma zona verde. Nunca pela borda.
const warned = new Set();
export function spawnSpotFor(type) { return spawnSpot(type); }
function spawnSpot(type) {
    const zone = pickSpawnPoint(type);
    if (zone) return { ...zone, emerge: true };
    const id = getSceneryId();
    if (!warned.has(id)) {
        warned.add(id);
        console.warn(`[spawner] O cenário "${id}" não tem zona verde de nascimento para ${type}: nenhum monstro nasce. Desenhe uma no Ateliê de cenários.`);
    }
    return null;
}

function spawnRegular() {
    if (state.enemies.length >= TURN_DIFFICULTY.maxAliveEnemies) return;
    let type = chooseMonsterType(state.turn, Math.random, getSceneryId(), zoneMonsterTypes());
    // Alguns tipos têm limite em campo (o cavaleiro): passado dele, nasce um esqueleto
    const cap = MONSTER_MODELS[type].maxAlive;
    if (cap && state.enemies.filter(e => e.type === type).length >= cap) type = 'SKELETON';
    const spot = spawnSpot(type);
    if (!spot) return;
    const e = addMonster(type, spot.x, spot.y, { emerge: spot.emerge });
    const arrival = MONSTER_MODELS[type].arrival;
    if (arrival) {
        showBanner('', arrival.title, arrival.sub, 'danger');
        audio.playBossRoar();
        shakeScreen(10);
    }
    return e;
}

// Elite: maior, mais duro, solta um baú ao morrer
export function spawnElite() {
    const screen = screenOf(getSceneryId());
    const here = zoneMonsterTypes();
    const fit = screen.elites.filter(t => !here.length || here.includes(t));
    const types = fit.length ? fit : screen.elites;
    const type = types[Math.floor(Math.random() * types.length)];
    const spot = spawnSpot(type);
    if (!spot) return;
    const { x, y, emerge } = spot;
    const e = addMonster(type, x, y, { emerge });
    const elite = rollElite();
    e.elite = elite;
    e.hp = e.maxHp = Math.round(e.maxHp * elite.hp);
    e.speed *= elite.speed;
    e.radius *= elite.radiusScale;
    e.damage *= elite.damage;
    e.knockbackResist = Math.max(e.knockbackResist ?? 0, elite.knockbackResist);   // nunca menos do que o monstro já tinha
    showToast('💀', `${elite.label} monster in the fog`, 'It carries treasure');
    audio.playElite();
}

function spawnRing(h) {
    for (let i = 0; i < h.count; i++) {
        const spot = spawnSpot(h.type);
        if (spot) addMonster(h.type, spot.x, spot.y, { emerge: spot.emerge });
    }
}

function spawnWall(h) {
    for (let i = 0; i < h.count; i++) {
        const spot = spawnSpot(h.type);
        if (spot) addMonster(h.type, spot.x, spot.y, { emerge: spot.emerge });
    }
}

function spawnSwarm(h) {
    const spot = spawnSpot(h.type);
    if (!spot) return;
    const { x, y, emerge } = spot;
    for (let i = 0; i < h.count; i++) {
        addMonster(h.type, x + (Math.random() - 0.5) * 90, y + (Math.random() - 0.5) * 90, { emerge });
    }
}

// Covas: círculos no chão perto do herói; o monstro levanta quando o aviso acaba
function spawnGraves(h) {
    for (let i = 0; i < h.count; i++) {
        const spot = spawnSpot(h.type);
        if (!spot) continue;
        state.telegraphs.push({
            kind: 'grave',
            x: spot.x, y: spot.y,
            radius: 20,
            age: -i * 0.06,
            seconds: 0.95,
            monsterType: h.type
        });
    }
}

// A horda usa só monstros da tela de agora: se o tipo sorteado não é daqui, troca por um da lista `hordes` da tela
function fitHordeToScreen(h) {
    const screen = screenOf(getSceneryId());
    const here = zoneMonsterTypes();
    if (here.length ? here.includes(h.type) : screen.monsters.some(m => m.type === h.type)) return h;
    const ok = screen.hordes.filter(t => !here.length || here.includes(t));
    const pool = ok.length ? ok : here.length ? here : screen.hordes;
    return { ...h, type: pool[Math.floor(Math.random() * pool.length)] };
}

const HORDE_SPAWNERS = { ring: spawnRing, wall: spawnWall, swarm: spawnSwarm, grave: spawnGraves };

function spawnHorde(h) {
    // A horda respeita o limite de monstros, mas sempre chega com alguma força
    const room = TURN_DIFFICULTY.maxAliveEnemies - state.enemies.length;
    h.count = Math.min(h.count, Math.max(MIN_HORDE, room));
    HORDE_SPAWNERS[h.kind](h);
    showBanner('', h.banner, '', 'warn');
    audio.playHorn();
}

function bossSpawnPoint() {
    const zone = pickBossSpawnPoint();            // zona de chefe do cenário: o círculo de invocação aparece ali (o nascimento dele continua o de sempre)
    if (zone) return { x: zone.x, y: zone.y };        // exatamente onde o usuário desenhou (o HUD não empurra o ponto)
    const a = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(state.width, state.height) * BOSS_SPAWNING.spawnScreenRatio;
    return {
        x: Math.max(60, Math.min(state.width - 60, state.coreX + Math.cos(a) * spawnDist)),
        y: Math.max(150, Math.min(state.height - 60, state.coreY + Math.sin(a) * spawnDist))   // abaixo do HUD: o círculo de invocação aparece inteiro
    };
}

// Escolhe onde o boss vai surgir e marca o chão com o círculo de invocação, que cresce até ele chegar
export function prepareBossSummon(model, seconds) {
    const at = bossSpawnPoint();
    state.bossSpawnAt = at;
    state.telegraphs.push({ kind: 'summon', x: at.x, y: at.y, radius: model.radius * 2.2, age: 0, seconds, color: model.color });
}

export function spawnBoss() {
    const type = chooseBossType(state.turn, getHero().model);
    const model = BOSS_MODELS[type];
    const { x, y } = state.bossSpawnAt ?? bossSpawnPoint();
    state.bossSpawnAt = null;

    state.currentBoss = applyBossMods(createBoss(type, state.turn, x, y, Math.random, save.darkness));
    state.enemies.push(state.currentBoss);
    updateHUD();
    shakeScreen(16);
    screenFlash(model.color, 0.4);
    slowMotion(0.45, 0.9);
    addShockwave(x, y, { radius: 260, color: model.color, width: 9, seconds: 0.7 });
    audio.playBossRoar();
    audio.setMood('boss');
    // Rival: os dois conversam antes da luta (depois da entrada dele aparecer)
    if (hasDuel(model)) {
        const boss = state.currentBoss;
        setTimeout(() => whenHunting(() => {
            if (state.currentBoss === boss) playDuelDialogue(boss.type, 'before', () => {});
        }), RIVAL_INTRO_DELAY_MS);
    }
}
const RIVAL_INTRO_DELAY_MS = 700;

// A música acompanha a curva de tensão da onda: o andamento e o brilho (library/sounds/core/music.js, intensity) sobem aos poucos no aperto, caem no
// respiro e sobem de novo até o pico. Suavizado (~2 s) para o andamento não dar tranco. Chefe e acampamento têm a música própria (mood).
const MUSIC_TENSION = { floor: 0.08, wave: 0.25, tension: 0.67, followPerSecond: 0.5 };
function updateTensionMusic(dt) {
    if (state.currentBoss || state.bossPending > 0 || state.hourPlan?.bossCalled) return;
    const lo = TENSION_CURVE[0][1], hi = Math.max(...TENSION_CURVE.map(p => p[1]));
    const base = (state.turn - 1) / Math.max(1, NIGHT.hours - 1);
    const progress = waveProgress(state.scoreTurn, state.targetScore, state.waveTime);
    const felt = state.lastStand ? 0 : (waveTension(progress) - lo) / (hi - lo);       // sobrou só limpar: a música desce
    const target = Math.min(1, MUSIC_TENSION.floor + MUSIC_TENSION.wave * base + MUSIC_TENSION.tension * felt);
    const now = audio.music?.intensity ?? target;
    if (Math.abs(target - now) > 0.004) audio.setIntensity(now + (target - now) * Math.min(1, dt * MUSIC_TENSION.followPerSecond));
}

export function updateSpawner(dt) {
    // Relógio da onda: conta toda a caçada, até o último monstro (não o acampamento)
    if (state.phase === 'HUNT') {
        state.waveTime += dt;
        updateWaveEta(dt);
        updateTensionMusic(dt);
    }
    if (state.phase !== 'HUNT' || state.lastStand || state.bossSlain) return;

    if (state.bossPending > 0) {
        state.bossPending -= dt;
        if (state.bossPending <= 0) spawnBoss();
        return;
    }
    // Boss em campo: nenhum monstro comum nasce (só o que o próprio boss invoca). Ao cair, a onda fecha (js/systems/night.js > afterBoss)
    if (state.currentBoss) return;

    const plan = state.hourPlan;
    const progress = waveProgress(state.scoreTurn, state.targetScore, state.waveTime);
    plan.hordes.forEach(h => {
        if (!h.fired && progress >= h.at) {
            h.fired = true;
            spawnHorde(h);
            state.spawnTimer = Math.max(state.spawnTimer, TURN_DIFFICULTY.hordeLullSeconds);     // a horda é o pico; depois dela, um respiro
        }
    });
    plan.elites.forEach(moment => {
        if (!moment.fired && progress >= moment.at) {
            moment.fired = true;
            spawnElite();
        }
    });

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
        spawnRegular();
        const difficulty = getTurnDifficulty(state.turn);
        const interval = difficulty.spawnIntervalSeconds / (1 + mod('spawnRate')) / waveTension(progress);
        state.spawnTimer = state.currentBoss ? interval * TURN_DIFFICULTY.bossSpawnIntervalMultiplier : interval;
    }
}

// Plano da hora: quantas hordas e elites e, nas horas de boss, quem chega no fim da onda (bossCalled: já chamado)
export function buildHourPlan(hour) {
    const boss = isBossTurn(hour, getHero().model) ? chooseBossType(hour, getHero().model) : null;
    const elites = [];
    const curve = effectiveTurn(hour);          // hordas e elites seguem a curva de 12 ondas esticada para 30 (data_model/campaign.js)
    if (curve >= HOUR_EVENTS.firstEliteHour) elites.push({ at: HOUR_EVENTS.eliteMoment, fired: false });
    if (curve >= HOUR_EVENTS.secondEliteHour) elites.push({ at: HOUR_EVENTS.secondEliteMoment, fired: false });
    return { boss, bossCalled: false, hordes: rollHourHordes(curve).map(fitHordeToScreen), elites };
}

// Monstros do início da hora, já perto: a ação começa na hora
export function spawnOpening() {
    for (let i = 0; i < NIGHT.openingMonsters; i++) {
        const type = chooseMonsterType(state.turn, Math.random, getSceneryId(), zoneMonsterTypes());
        const spot = spawnSpot(type);
        if (spot) addMonster(type, spot.x, spot.y, { emerge: spot.emerge });
    }
}

// Novo turno: a tela é limpa (monstros, tiros, efeitos e moedas) e os monstros voltam a aparecer
// depois de uma pequena pausa, já com a dificuldade do turno novo.
// Efeitos da onda que acabou (morte do chefe explodindo, pedaços, respingos, MANCHAS, corpos, anéis, números, avisos no chão) não atravessam para o
// acampamento nem para a próxima tela: a mancha verde do Slizork aparecia no Graveyard. Chamado ao abrir o acampamento, ao trocar de tela e ao começar a onda
export function clearBattleEffects() {
    state.gibs.length = 0;
    state.corpses.length = 0;
    state.stains.length = 0;
    state.shockwaves.length = 0;
    state.floaters.length = 0;
    state.telegraphs.length = 0;
    state.enemyProjectiles.length = 0;
    player.rootGoo = false;
    player.reflectTimer = 0;
}

export function resetFieldForNewTurn() {
    state.enemies.length = 0;
    state.enemyProjectiles.length = 0;
    state.particles.length = 0;
    state.bladeSlashes.length = 0;
    state.knives.length = 0;
    state.arcaneBolts.length = 0;
    state.knifePending = null;
    state.goldDrops.length = 0;
    state.pickups.length = 0;
    state.telegraphs.length = 0;
    state.bossFx = state.bossZone = state.bossShackle = null;
    player.shackledTimer = 0;
    player.rootedTimer = 0;
    clearBattleEffects();
    state.groundFires.length = 0;
    state.lightning.length = 0;
    state.bolts.length = 0;
    state.stars.length = 0;
    clearSkillEffects();
    state.currentBoss = null;
    state.spawnTimer = TURN_DIFFICULTY.turnStartGraceSeconds;
    state.waveTime = 0;             // o relógio da onda recomeça
    state.waveEta = -1;             // e a estimativa também (-1 = ainda sem ritmo para estimar)
    eta.rate = 0;
    eta.samples = 0;
    eta.timer = 0;
    eta.lastScore = 0;
}

// --- TEMPO ESTIMADO DA ONDA ---
// (O contador do HUD foi tirado por enquanto: confundia. A estimativa continua calculada em state.waveEta, pronta para voltar.)
// A onda fecha pela pontuação (scoreTurn chega a targetScore), não pelo tempo. A contagem regressiva do HUD é uma ESTIMATIVA:
// o que falta da cota dividido pelo ritmo em que o jogador pontua. O ritmo mistura a média da onda inteira (estável) com a do
// último trecho (reage quando a horda aperta ou afrouxa); o número mostrado desce um segundo por segundo e só corrige aos poucos,
// para não saltar na tela.
const ETA = {
    sampleSeconds: 1,           // de quanto em quanto tempo mede o ritmo
    recentWeight: 0.25,         // peso de cada medida nova na média recente
    minSamples: 5,              // medidas antes de mostrar um número (antes disso: --:--)
    correction: 0.35            // quão rápido o número mostrado corrige para a estimativa nova (por segundo)
};
const eta = { rate: 0, samples: 0, timer: 0, lastScore: 0 };

function updateWaveEta(dt) {
    const plan = state.hourPlan;
    if (state.lastStand || plan?.bossCalled) {
        state.waveEta = 0;
        return;
    }
    eta.timer += dt;
    if (eta.timer >= ETA.sampleSeconds) {
        eta.timer -= ETA.sampleSeconds;
        const gained = (state.scoreTurn - eta.lastScore) / ETA.sampleSeconds;
        eta.lastScore = state.scoreTurn;
        eta.rate = eta.samples === 0 ? gained : eta.rate + (gained - eta.rate) * ETA.recentWeight;
        eta.samples++;
    }
    const average = state.scoreTurn / Math.max(1, state.waveTime);
    const rate = (average + eta.rate) / 2;
    if (eta.samples < ETA.minSamples || rate <= 0.01) {
        state.waveEta = -1;
        return;
    }
    const target = Math.max(0, (state.targetScore - state.scoreTurn) / rate);
    if (state.waveEta < 0) state.waveEta = target;
    else {
        state.waveEta = Math.max(0, state.waveEta - dt);
        state.waveEta += (target - state.waveEta) * Math.min(1, dt * ETA.correction);
    }
}
