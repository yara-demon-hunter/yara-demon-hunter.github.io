import { TURN_DIFFICULTY, getTurnDifficulty } from '../../data_model/difficulty.js';
import { ELITE_TYPES, rollElite } from '../../data_model/elites.js';
import { HOUR_EVENTS, NIGHT, rollHourHordes } from '../../data_model/night.js';
import { BOSS_MODELS, BOSS_SPAWNING, chooseBossType, createBoss, hasDuel, isBossTurn } from '../../data_model/bosses.js';
import { MONSTER_MODELS, MONSTER_SPAWNING, chooseMonsterType, createMonster } from '../../data_model/monsters.js';
import { isMonsterUnlocked } from '../../data_model/difficulty.js';
import { audio, player, state } from '../core/state.js';
import { showBanner, showToast } from '../ui/banner.js';
import { playDuelDialogue, whenHunting } from '../ui/dialogue.js';
import { updateHUD } from '../ui/hud.js';
import { addShockwave, screenFlash, shakeScreen, slowMotion } from './effects.js';
import { getHero, mod } from './modifiers.js';
import { clearSkillEffects } from './skills.js';

const MIN_HORDE = 3;

// --- SPAWNER DE INIMIGOS ---
// Monstros nascem logo fora da tela, em qualquer ponto da borda do mundo
function edgePoint() {
    const { width: w, height: h } = state;
    const m = MONSTER_SPAWNING.edgeMargin;
    let p = Math.random() * 2 * (w + h);
    if (p < w) return { x: p, y: -m };
    p -= w;
    if (p < h) return { x: w + m, y: p };
    p -= h;
    if (p < w) return { x: p, y: h + m };
    p -= w;
    return { x: -m, y: p };
}

// Aplica Escuridão e presságios a um monstro recém-criado
function applyEnemyMods(e) {
    e.hp = e.maxHp = Math.max(1, Math.round(e.hp * (1 + mod('enemyHp'))));
    e.damage *= 1 + mod('enemyDamage');
    e.speed *= 1 + mod('enemySpeed');
    return e;
}

// Todo monstro entra por aqui (spawner, invocações, hordas)
export function addMonster(type, x, y) {
    const e = applyEnemyMods(createMonster(type, state.turn, x, y));
    state.enemies.push(e);
    return e;
}

function spawnRegular() {
    if (state.enemies.length >= TURN_DIFFICULTY.maxAliveEnemies) return;
    const { x, y } = edgePoint();
    let type = chooseMonsterType(state.turn);
    // Alguns tipos têm limite em campo (o cavaleiro): passado dele, nasce um esqueleto
    const cap = MONSTER_MODELS[type].maxAlive;
    if (cap && state.enemies.filter(e => e.type === type).length >= cap) type = 'SKELETON';
    const e = addMonster(type, x, y);
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
    const types = ELITE_TYPES.filter(type => isMonsterUnlocked(type, state.turn));
    const { x, y } = edgePoint();
    const e = addMonster(types[Math.floor(Math.random() * types.length)], x, y);
    const elite = rollElite();
    e.elite = elite;
    e.hp = e.maxHp = Math.round(e.maxHp * elite.hp);
    e.speed *= elite.speed;
    e.radius *= elite.radiusScale;
    e.damage *= elite.damage;
    e.knockbackResist = Math.max(e.knockbackResist ?? 0, elite.knockbackResist);   // nunca menos do que o monstro já tinha
    showToast('💀', `${elite.label} monster in the fog`, 'It carries treasure');
    audio.playHorn();
}

function spawnRing(h) {
    const R = 430;
    for (let i = 0; i < h.count; i++) {
        const a = (i / h.count) * Math.PI * 2;
        addMonster(h.type, player.x + Math.cos(a) * R, player.y + Math.sin(a) * R);
    }
}

function spawnWall(h) {
    const { width: w, height: h2 } = state;
    const m = MONSTER_SPAWNING.edgeMargin;
    const horizontal = Math.random() < 0.5;
    const far = Math.random() < 0.5;
    for (let i = 0; i < h.count; i++) {
        const k = (i + 0.5) / h.count;
        addMonster(h.type, horizontal ? (far ? w + m : -m) : w * k, horizontal ? h2 * k : (far ? h2 + m : -m));
    }
}

function spawnSwarm(h) {
    const { x, y } = edgePoint();
    for (let i = 0; i < h.count; i++) {
        addMonster(h.type, x + (Math.random() - 0.5) * 90, y + (Math.random() - 0.5) * 90);
    }
}

// Covas: círculos no chão perto do herói; o monstro levanta quando o aviso acaba
function spawnGraves(h) {
    for (let i = 0; i < h.count; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = 130 + Math.random() * 170;
        state.telegraphs.push({
            kind: 'grave',
            x: Math.max(30, Math.min(state.width - 30, player.x + Math.cos(a) * d)),
            y: Math.max(30, Math.min(state.height - 30, player.y + Math.sin(a) * d)),
            radius: 20,
            age: -i * 0.06,
            seconds: 0.95,
            monsterType: h.type
        });
    }
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

    state.currentBoss = applyEnemyMods(createBoss(type, state.turn, x, y));
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

export function updateSpawner(dt) {
    // Relógio da onda: conta toda a caçada, até o último monstro (não o acampamento)
    if (state.phase === 'HUNT') {
        state.waveTime += dt;
        updateWaveEta(dt);
    }
    if (state.phase !== 'HUNT' || state.lastStand) return;

    if (state.bossPending > 0) {
        state.bossPending -= dt;
        if (state.bossPending <= 0) spawnBoss();
        return;
    }

    const plan = state.hourPlan;
    const progress = state.scoreTurn / state.targetScore;
    plan.hordes.forEach(h => {
        if (!h.fired && progress >= h.at) {
            h.fired = true;
            spawnHorde(h);
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
        const interval = difficulty.spawnIntervalSeconds / (1 + mod('spawnRate'));
        state.spawnTimer = state.currentBoss ? interval * TURN_DIFFICULTY.bossSpawnIntervalMultiplier : interval;
    }
}

// Plano da hora: quantas hordas e elites e, nas horas de boss, quem chega no fim da onda (bossCalled: já chamado)
export function buildHourPlan(hour) {
    const boss = isBossTurn(hour, getHero().model) ? chooseBossType(hour, getHero().model) : null;
    const elites = [];
    if (hour >= HOUR_EVENTS.firstEliteHour) elites.push({ at: HOUR_EVENTS.eliteMoment, fired: false });
    if (hour >= HOUR_EVENTS.secondEliteHour) elites.push({ at: HOUR_EVENTS.secondEliteMoment, fired: false });
    return { boss, bossCalled: false, hordes: rollHourHordes(hour), elites };
}

// Monstros do início da hora, já perto: a ação começa na hora
export function spawnOpening() {
    for (let i = 0; i < NIGHT.openingMonsters; i++) {
        const a = Math.random() * Math.PI * 2;
        const R = NIGHT.openingRadius + Math.random() * 120;
        addMonster(chooseMonsterType(state.turn), state.coreX + Math.cos(a) * R * 1.5, state.coreY + Math.sin(a) * R);
    }
}

// Novo turno: a tela é limpa (monstros, tiros, efeitos e moedas) e os monstros voltam a aparecer
// depois de uma pequena pausa, já com a dificuldade do turno novo.
export function resetFieldForNewTurn() {
    state.enemies.length = 0;
    state.enemyProjectiles.length = 0;
    state.particles.length = 0;
    state.bladeSlashes.length = 0;
    state.knives.length = 0;
    state.knifePending = null;
    state.goldDrops.length = 0;
    state.pickups.length = 0;
    state.telegraphs.length = 0;
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
