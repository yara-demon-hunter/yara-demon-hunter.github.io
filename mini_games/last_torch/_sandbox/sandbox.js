// Arena de testes do Last Torch: escolhe herói e boss e começa a luta na hora.
// Roda por cima do jogo de verdade (mesmos módulos, mesmas URLs), sem alterar nenhum arquivo dele.
import { BOSS_MODELS, BOSS_SPAWNING } from '/data_model/bosses.js';
import { CORE_MODEL } from '/data_model/core.js';
import { MONSTER_MODELS } from '/data_model/monsters.js';
import { ACTIVE_HEROES, HEROES } from '/data_model/heroes.js';
import { save } from '/js/core/save.js';
import { passives, player, powers, state } from '/js/core/state.js';
import { POWER_MODELS } from '/data_model/powers.js';
import { addMonster, spawnBoss } from '/js/systems/spawner.js';
import { startHour } from '/js/systems/night.js';
import { startGame } from '/js/ui/screens.js';
import { setScenery, showColliders } from '/js/render/scenery.js';
import { WORLD } from '/data_model/world.js';
import { CAMPAIGN_RUNTIME } from '/data_model/campaign.js';
import { createScenery, sceneryIds } from '/library/scenery/index.js';
import { flushHeroUnlocks, queueHeroUnlock } from '/js/ui/hero_unlock.js';
import { ACHIEVEMENTS } from '/data_model/sanctuary.js';
import { mountTuner } from '/_sandbox/tuner.js';
import { mountFastRun } from '/_sandbox/fastrun.js';
import { mountScreens } from '/_sandbox/screens.js';
import { mountBossMoves } from '/_sandbox/bossmoves.js';
import { mountDialogues } from '/_sandbox/dialogues.js';

CAMPAIGN_RUNTIME.enabled = false;           // o sandbox escolhe o cenário à mão: a troca automática por tela da campanha fica desligada
const choice = { hero: ACTIVE_HEROES[0], boss: 'AZAEL' };
let arenaOn = false;                    // as travas de modo deus só valem numa luta da Arena (nunca na aba Fast run)
const picked = new Set();               // monstros escolhidos para a luta (vários, clicando)
// Buddies (companheiros): cada um liga a skill que o faz existir (nível máximo), como se o herói a tivesse comprado
const BUDDIES = [
    { key: 'phoenixPact', label: '🔥 Phoenix', sub: 'Phoenix Pact', on: () => { passives.phoenixPact.lvl = 1; } },
    { key: 'hearthPhoenix', label: '🔥 Flaming Phoenix', sub: 'circles the torch', on: () => { passives.hearthPhoenix.lvl = 1; } },
    { key: 'blueTorch', label: '🔵 Blue Torch phoenix', sub: 'needs Flaming Phoenix', on: () => { passives.hearthPhoenix.lvl = 1; passives.blueTorch.lvl = 1; } },
    { key: 'shadowRaven', label: '🐦‍⬛ Shadow Raven', sub: 'raven', on: () => { passives.shadowRaven.lvl = 1; } },
    { key: 'graveWisp', label: '💀 Grave Wisp', sub: 'flying skull', on: () => { powers.graveWisp.lvl = powers.graveWisp.maxLvl ?? 5; } },
    { key: 'shadowWolf', label: '🐺 Shadow Wolf', sub: 'Rowan\'s wolf', on: () => { powers.spiritWolves.lvl = 5; } },
    { key: 'whiteWolf', label: '🌕 The White Wolf', sub: 'evolved wolf', on: () => { powers.spiritWolves.lvl = 5; powers.spiritWolves.evolved = true; } }
];
const OAK_STAGES = [
    { key: '', label: 'No tree' },
    { key: 'sapling', label: '🌱 Sapling' },
    { key: 'young', label: '🌿 Young tree' },
    { key: 'adult', label: '🌳 Wicked Oak (adult)' },
    { key: 'elder', label: '🌲 Ancient Grove (evolved)' }
];
const buddyPicked = new Set();
const oakChoice = { stage: '' };
const heroMods = new Map();            // mods originais dos heróis, para o modo deus não vazar para a próxima luta

const bosses = Object.entries(BOSS_MODELS)
    .filter(([, model]) => !model.isShadow)
    .map(([key, model]) => ({ key, label: model.name + (model.hidden ? ' (rematch)' : ''), sub: model.title ?? '' }));

const monsters = Object.entries(MONSTER_MODELS)
    .filter(([key]) => key !== 'VAMPIRE_BAT')      // só nasce como invocação do boss Vampire e não tem desenho próprio
    .map(([key, model]) => ({ key, label: (model.name ?? key.replace(/_/g, ' ').toLowerCase()).replace(/^\w/, c => c.toUpperCase()) }));

const panel = document.createElement('div');
panel.id = 'sbPanel';
panel.innerHTML = `
  <div class="card">
    <h2>🧪 Last Torch Sandbox</h2>
    <p class="note">Test arena: nothing here touches the game or its save.</p>
    <div class="sb-format"><label>Screen format (all tabs): <select id="sbFormat"><option value="desktop">Desktop (full window)</option><option value="landscape">Phone · landscape 844×390</option><option value="portrait">Phone · portrait 390×844</option></select></label></div>
    <div class="sb-tabs"><button data-tab="arena" class="on">⚔️ Arena</button><button data-tab="tuner">📐 HUD tuner</button><button data-tab="fast">⏩ Fast run</button><button data-tab="screens">🖼️ Screens</button><button data-tab="moves">🗡️ Boss moves</button><button data-tab="dialogues">💬 Dialogues</button></div>
    <div id="sbArena">
    <h3>Scenery <small>(applies right away, even mid-fight)</small></h3><div class="sb-row" id="sbScenery"></div>
    <h3>Hero</h3><div class="sb-row" id="sbHeroes"></div>
    <h3>Boss <small>(click again to unselect: monsters only)</small></h3><div class="sb-row" id="sbBosses"></div>
    <h3>Monsters <small>(click to add to the fight)</small></h3><div class="sb-row" id="sbMonsters"></div>
    <h3>Buddies <small>(click to add: each one turns on its skill)</small></h3><div class="sb-row" id="sbBuddies"></div>
    <h3>Druid tree <small>(Wicked Oak stage; Ancient Grove = evolved skill)</small></h3><div class="sb-row" id="sbOak"></div>
    <label class="sb-field">Keep the tree at that stage (no growing) <input id="sbFreezeOak" type="checkbox" checked></label>
    <h3>Options</h3>
    <label class="sb-field">How many of each monster <input id="sbCount" type="number" min="1" max="30" value="4"></label>
    <label class="sb-field">Hour (boss strength) <input id="sbHour" type="number" min="1" max="18" value="1"></label>
    <label class="sb-field">Skill points to start with <input id="sbPoints" type="number" min="0" max="999" value="100"></label>
    <label class="sb-field">Only the boss (no other monsters) <input id="sbAlone" type="checkbox" checked></label>
    <label class="sb-field">Show contact areas (red; the ones drawn in the scenery editor) <input id="sbAreas" type="checkbox"></label>
    <label class="sb-field">God mode: hero (never dies) <input id="sbGod" type="checkbox" checked></label>
    <label class="sb-field">God mode: boss (never dies) <input id="sbGodBoss" type="checkbox" checked></label>
    <label class="sb-field">God mode: torch (never goes out) <input id="sbGodTorch" type="checkbox" checked></label>
    <label class="sb-field">God mode: monsters (never die) <input id="sbGodMonsters" type="checkbox" checked></label>
    <button id="sbGo">⚔️ Start fight</button>
    <h3>Preview: hero unlocked <small>(the real reward screen)</small></h3>
    <div class="sb-row" id="sbUnlocks"></div>
    <label class="sb-field">As seen mid-run, at camp (no PLAY AS button) <input id="sbUnlockCamp" type="checkbox"></label>
    </div>
    <div id="sbTuner" class="hidden"></div>
    <div id="sbFast" class="hidden"></div>
    <div id="sbScreens" class="hidden"></div>
    <div id="sbMoves" class="hidden"></div>
    <div id="sbDialogues" class="hidden"></div>
  </div>`;
document.body.appendChild(panel);

const toggle = document.createElement('button');
toggle.id = 'sbToggle';
toggle.textContent = '🧪 Sandbox';
document.body.appendChild(toggle);

function fill(id, items, key) {
    const host = panel.querySelector(id);
    host.innerHTML = '';
    items.forEach(item => {
        const b = document.createElement('button');
        b.className = 'sb-opt' + (choice[key] === item.key ? ' on' : '');
        b.innerHTML = `${item.label}${item.sub ? `<small>${item.sub}</small>` : ''}`;
        // Clicar de novo no que está escolhido desmarca (boss: sem boss, só monstros)
        b.onclick = () => { choice[key] = key === 'boss' && choice[key] === item.key ? '' : item.key; fill(id, items, key); };
        host.appendChild(b);
    });
}
// Cenário: troca na hora (o jogo real só lê WORLD.scenery; aqui o sandbox lembra a última escolha)
const sceneryChoice = { scenery: (() => { try { return localStorage.getItem('sbScenery'); } catch { return null; } })() };
if (!sceneryIds().includes(sceneryChoice.scenery)) sceneryChoice.scenery = WORLD.scenery;
function fillScenery() {
    const host = panel.querySelector('#sbScenery');
    host.innerHTML = '';
    sceneryIds().forEach(id => {
        const b = document.createElement('button');
        b.className = 'sb-opt' + (sceneryChoice.scenery === id ? ' on' : '');
        b.innerHTML = `${createScenery(id).name}<small>${id}${id === WORLD.scenery ? ' · game default' : ''}</small>`;
        b.onclick = () => {
            sceneryChoice.scenery = id;
            try { localStorage.setItem('sbScenery', id); } catch { /* sem armazenamento: só não lembra */ }
            setScenery(id);
            fillScenery();
        };
        host.appendChild(b);
    });
}
setScenery(sceneryChoice.scenery);
fillScenery();
fill('#sbHeroes', ACTIVE_HEROES.map(k => ({ key: k, label: HEROES[k].name, sub: HEROES[k].tagline })), 'hero');
fill('#sbBosses', bosses.map(b => ({ key: b.key, label: b.label, sub: b.sub })), 'boss');

function fillMonsters() {
    const host = panel.querySelector('#sbMonsters');
    host.innerHTML = '';
    monsters.forEach(m => {
        const b = document.createElement('button');
        b.className = 'sb-opt' + (picked.has(m.key) ? ' on' : '');
        b.textContent = m.label;
        b.onclick = () => { picked.has(m.key) ? picked.delete(m.key) : picked.add(m.key); fillMonsters(); };
        host.appendChild(b);
    });
}
fillMonsters();

function fillBuddies() {
    const host = panel.querySelector('#sbBuddies');
    host.innerHTML = '';
    BUDDIES.forEach(b => {
        const el = document.createElement('button');
        el.className = 'sb-opt' + (buddyPicked.has(b.key) ? ' on' : '');
        el.innerHTML = `${b.label}<small>${b.sub}</small>`;
        el.onclick = () => { buddyPicked.has(b.key) ? buddyPicked.delete(b.key) : buddyPicked.add(b.key); fillBuddies(); };
        host.appendChild(el);
    });
    const oak = panel.querySelector('#sbOak');
    oak.innerHTML = '';
    OAK_STAGES.forEach(o => {
        const el = document.createElement('button');
        el.className = 'sb-opt' + (oakChoice.stage === o.key ? ' on' : '');
        el.textContent = o.label;
        el.onclick = () => { oakChoice.stage = o.key; fillBuddies(); };
        oak.appendChild(el);
    });
}
fillBuddies();

// A árvore do druida nasce já no estágio escolhido, perto do herói (os mesmos campos de growOak em js/systems/skills_nature.js)
function plantOak(stage) {
    const M = POWER_MODELS.shelterOak;
    powers.shelterOak.lvl = 5;
    powers.shelterOak.evolved = stage === 'elder';
    const level = M.levels[4];
    const growth = { sapling: 0, young: M.saplingSeconds, adult: M.adultSeconds, elder: M.adultSeconds }[stage];
    state.nature.oaks.length = 0;
    state.nature.oaks.push({
        x: player.x + 110, y: player.y - 40, stage, growthAge: growth, age: stage === 'sapling' || stage === 'young' ? 0 : 99, seconds: level.seconds, transition: 0,
        healRadius: M.healingRadius, hp: level.hp, maxHp: level.hp, reach: level.reach, damage: level.damage, lashSeconds: level.lashSeconds, lash: 0,
        awake: 0, awakeGoal: 0, shake: 0, lures: M.lureRadius, swipes: [], faceX: 0, faceY: 1, walkPhase: 0, atkAge: 99, walkK: 0,
        evolved: stage === 'elder'
    });
}

// Prévia do prêmio de personagem liberado: o mesmo evento do jogo (js/ui/hero_unlock.js), para qualquer herói
function previewUnlock(key) {
    const before = state.gameState;
    state.gameState = value('#sbUnlockCamp').checked ? 'CAMP' : 'START';     // CAMP = visto no meio da noite
    panel.classList.add('hidden');
    queueHeroUnlock(key, ACHIEVEMENTS.find(a => a.hero === key));
    flushHeroUnlocks();
    const watch = new MutationObserver(() => {
        if (document.querySelector('.hero-unlock')) return;
        watch.disconnect();
        state.gameState = before;
        panel.classList.remove('hidden');
    });
    watch.observe(document.body, { childList: true });
}
const unlockHost = panel.querySelector('#sbUnlocks');
Object.entries(HEROES).filter(([, h]) => !h.shelved).forEach(([key, hero]) => {
    const b = document.createElement('button');
    b.className = 'sb-opt';
    b.textContent = hero.name;
    b.onclick = () => previewUnlock(key);
    unlockHost.appendChild(b);
});

function value(id) { return panel.querySelector(id); }

function fight() {
    arenaOn = true;
    CAMPAIGN_RUNTIME.enabled = false;                      // a arena escolhe o cenário à mão
    const hour = Math.max(1, Math.min(18, +value('#sbHour').value || 1));
    // Herói: só na memória desta página (save não é gravado)
    if (!save.unlockedHeroes.includes(choice.hero)) save.unlockedHeroes.push(choice.hero);
    save.hero = choice.hero;
    heroMods.forEach((mods, key) => { HEROES[key].mods = mods; });
    heroMods.clear();
    if (value('#sbGod').checked) {
        const h = HEROES[choice.hero];
        heroMods.set(choice.hero, h.mods);
        h.mods = { ...h.mods, damageTaken: -0.9 };
    }

    startGame();
    state.turn = hour;
    const withBoss = choice.boss !== '';
    if (withBoss) BOSS_SPAWNING.schedule[hour] = choice.boss;
    startHour();
    state.enemies.length = 0;
    state.telegraphs.length = 0;
    state.enemyProjectiles.length = 0;
    state.hourPlan.hordes = [];
    state.hourPlan.elites = [];
    state.hourPlan.boss = withBoss ? choice.boss : null;
    state.hourPlan.bossCalled = true;
    state.skillPoints = Math.max(0, +value('#sbPoints').value || 0);
    state.sandbox = true;                                         // o necromante levanta mortos mesmo com a hora fechada (no jogo ele para)
    if (value('#sbAlone').checked) state.lastStand = true;       // nada mais nasce
    state.bossSpawnAt = null;
    if (withBoss) spawnBoss();
    // Monstros escolhidos: em círculo em volta do herói, fora do alcance imediato
    const each = Math.max(1, Math.min(30, +value('#sbCount').value || 1));
    const types = [...picked];
    types.forEach((type, ti) => {
        for (let i = 0; i < each; i++) {
            const a = ((i + ti * 0.5) / each) * Math.PI * 2;
            const r = 200 + ti * 30;
            addMonster(type, player.x + Math.cos(a) * r, player.y + Math.sin(a) * r);
        }
    });
    // Buddies e árvore escolhidos (depois do startGame, que zera as skills)
    BUDDIES.filter(b => buddyPicked.has(b.key)).forEach(b => b.on());
    if (oakChoice.stage) plantOak(oakChoice.stage);
    player.hp = player.maxHp;
    panel.classList.add('hidden');
}

// Modo deus ao vivo: as caixas valem na hora, mesmo no meio da luta (só nesta página).
// Monstros e boss: a vida fica travada em no mínimo 1 (nenhum golpe mata, nem num quadro só); herói e tocha: vida cheia a cada quadro
function lockHp(e, isOn) {
    if (e._sbLock) return;
    let hp = e.hp;
    Object.defineProperty(e, 'hp', {
        configurable: true,
        enumerable: true,
        get: () => hp,
        set: v => { hp = isOn() && v < 1 ? 1 : v; }
    });
    e._sbLock = true;
}
const RIM = 28;
// Segunda trava: se mesmo assim um monstro vivo for removido por contato com a tocha, a remoção é ignorada
let guarded = null;
function guardEnemies() {
    if (guarded === state.enemies) return;
    guarded = state.enemies;
    const splice = guarded.splice.bind(guarded);
    guarded.splice = (i, n, ...items) => {
        const target = guarded[i];
        if (arenaOn && target && !target.isBoss && target.hp > 0 && n === 1 && Math.hypot(target.x - state.coreX, target.y - state.coreY) < target.radius + CORE_MODEL.collisionRadius + RIM + 4) return [];
        return splice(i, n, ...items);
    };
}
const bossGod = () => value('#sbGodBoss').checked;
const monsterGod = () => value('#sbGodMonsters').checked;
function godLoop() {
    guardEnemies();
    if (arenaOn && state.phase === 'HUNT') {
        if (value('#sbGod').checked && player.hp > 0) player.hp = player.maxHp;
        if (value('#sbGodTorch').checked && state.coreHp > 0) state.coreHp = state.coreHpMax;
        if (value('#sbFreezeOak').checked) {
            for (const oak of state.nature.oaks) {
                if (oak.stage === 'sapling') oak.growthAge = 0;
                else if (oak.stage === 'young') oak.growthAge = POWER_MODELS.shelterOak.saplingSeconds;
            }
        }
        for (const e of state.enemies) {
            lockHp(e, e.isBoss ? bossGod : monsterGod);
            const god = e.isBoss ? bossGod() : monsterGod();
            if (e.hp > 0 && god) e.hp = e.maxHp;
            // O jogo remove o monstro que encosta na tocha (ele bate nela e some). Na arena isso não acontece nunca:
            // todo monstro é mantido na borda da tocha, tenha o modo deus ligado ou não
            if (!e.isBoss) {
                const dx = e.x - state.coreX;
                const dy = e.y - state.coreY;
                const d = Math.hypot(dx, dy) || 1;
                const rim = e.radius + CORE_MODEL.collisionRadius + RIM;
                if (d < rim) {
                    e.x = state.coreX + (dx / d) * rim;
                    e.y = state.coreY + (dy / d) * rim;
                    if (e.vx !== undefined) { e.vx = 0; e.vy = 0; }
                }
            }
        }
    }
    requestAnimationFrame(godLoop);
}
requestAnimationFrame(godLoop);

// Abas: Arena (luta de teste), HUD tuner (carrega o jogo num iframe só na primeira vez que a aba abre) e Fast run (partida acelerada)
let tuner = null;
let fast = null;
let screens = null;
let moves = null;
let dialogues = null;
// Demonstração de golpes: só o boss escolhido, sem monstros, com todos os modos deus ligados (o painel esconde na hora)
function startBossDemo(key) {
    ['#sbAlone', '#sbGod', '#sbGodBoss', '#sbGodTorch', '#sbGodMonsters'].forEach(id => { value(id).checked = true; });
    const previous = [...picked];
    picked.clear();
    choice.boss = key;
    fight();
    previous.forEach(k => picked.add(k));
}
panel.querySelectorAll('.sb-tabs button').forEach(button => {
    button.onclick = () => {
        const tab = button.dataset.tab;
        panel.querySelectorAll('.sb-tabs button').forEach(b => b.classList.toggle('on', b === button));
        panel.querySelector('#sbArena').classList.toggle('hidden', tab !== 'arena');
        panel.querySelector('#sbTuner').classList.toggle('hidden', tab !== 'tuner');
        panel.querySelector('#sbFast').classList.toggle('hidden', tab !== 'fast');
        panel.querySelector('#sbScreens').classList.toggle('hidden', tab !== 'screens');
        panel.querySelector('#sbMoves').classList.toggle('hidden', tab !== 'moves');
        panel.querySelector('#sbDialogues').classList.toggle('hidden', tab !== 'dialogues');
        if (tab === 'dialogues') dialogues ??= mountDialogues(panel.querySelector('#sbDialogues'), { hidePanel: () => panel.classList.add('hidden'), showPanel: () => panel.classList.remove('hidden') });
        if (tab === 'moves') moves ??= mountBossMoves(panel.querySelector('#sbMoves'), {
            bosses, startDemo: startBossDemo, showPanel: () => panel.classList.remove('hidden')
        });
        if (tab === 'screens') screens ??= mountScreens(panel.querySelector('#sbScreens'), { hidePanel: () => panel.classList.add('hidden'), showPanel: () => panel.classList.remove('hidden') });
        panel.querySelector('.card').classList.toggle('is-wide', tab === 'tuner');
        if (tab === 'fast') fast ??= mountFastRun(panel.querySelector('#sbFast'), {
            hidePanel: () => panel.classList.add('hidden'),
            showPanel: () => panel.classList.remove('hidden'),
            onStart: () => { arenaOn = false; CAMPAIGN_RUNTIME.enabled = true;       // a partida acelerada é uma partida normal: segue a campanha (troca de tela e mapa)
             heroMods.forEach((mods, key) => { HEROES[key].mods = mods; }); heroMods.clear(); }
        });
        if (tab === 'tuner') { tuner ??= mountTuner(panel.querySelector('#sbTuner')); tuner.show(); } else tuner?.hide();
    };
});

// Formato de tela do sandbox inteiro: o servidor lê o cookie e, nos formatos de celular, entrega a página dentro de uma moldura do tamanho do aparelho
{
    const current = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith('sbx_format='))?.split('=')[1] ?? 'desktop';
    const select = value('#sbFormat');
    select.value = ['landscape', 'portrait'].includes(current) ? current : 'desktop';
    select.onchange = () => {
        document.cookie = `sbx_format=${select.value}; path=/; max-age=31536000; SameSite=Lax`;
        window.top.location.href = '/';
    };
}

value('#sbAreas').onchange = (e) => showColliders(e.target.checked);
value('#sbGo').onclick = fight;
toggle.onclick = () => panel.classList.toggle('hidden');
if (location.hash.startsWith('#bug')) {
    const [, q] = location.hash.split('=');
    const [heroIdx, god, maxMin] = (q ?? '0,1,40').split(',').map(Number);
    const errs = [];
    const add = (t) => { if (errs.length < 60 && !errs.includes(t)) errs.push(t); };
    window.addEventListener('error', (e) => add(`ERR ${e.message} @${(e.filename ?? '').split('/').slice(-2).join('/')}:${e.lineno}`));
    window.addEventListener('unhandledrejection', (e) => add(`REJ ${e.reason?.message ?? e.reason}`));
    const ce = console.error.bind(console); console.error = (...a) => { add('CONSOLE.ERROR ' + a.map(String).join(' ').slice(0, 200)); ce(...a); };
    const pre = document.createElement('pre'); pre.id = 'bugrep'; document.body.appendChild(pre);
    const { state, player, joystick } = await import('/js/core/state.js');
    const { ACTIVE_HEROES, HEROES } = await import('/data_model/heroes.js');
    const { save } = await import('/js/core/save.js');
    const { update } = await import('/js/game.js');
    const { startGame } = await import('/js/ui/screens.js');
    const { leaveCamp } = await import('/js/ui/camp.js');
    const { buyNode, getBuyableNodes } = await import('/js/systems/tree.js');
    let renderFn = null;
    try { const R = await import('/js/render/renderer.js'); renderFn = R.render ?? R.renderGame ?? Object.values(R).find(f => typeof f === 'function' && /^render$/i.test(f.name)); } catch (e) { add('no renderer import ' + e.message); }
    const heroKey = ACTIVE_HEROES[heroIdx % ACTIVE_HEROES.length];
    if (!save.unlockedHeroes.includes(heroKey)) save.unlockedHeroes.push(heroKey);
    save.hero = heroKey;
    if (god) HEROES[heroKey].mods = { ...HEROES[heroKey].mods, damageTaken: -0.9 };
    startGame();
    const STEP = 1 / 60;
    const trail = []; window.__tl = [];
    let t = 0, lastKey = '', stuck = 0, frames = 0, kills0 = 0;
    const seenBosses = new Set(), seenScenery = new Set();
    const spend = (n) => { for (let i = 0; i < n && state.skillPoints > 0; i++) { const o = getBuyableNodes(); if (!o.length) return; buyNode(o[Math.floor(Math.random() * o.length)].id); } };
    const pilot = () => {
        if (document.getElementById('dialogue') || state.gameState === 'DIALOGUE') { document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true, cancelable: true })); document.getElementById('dialogue')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return; }
        if (state.gameState === 'CAMP') { ui(); if (document.querySelector('.wave-results, .hero-unlock')) return; spend(40); try { leaveCamp(); } catch (e) { add('leaveCamp ' + e.message); } return; }
        if (state.gameState !== 'PLAYING') return;
        let best = null, bd = 1e9;
        for (const e of state.enemies) { const d = Math.hypot(e.x - state.coreX, e.y - state.coreY); if (e.hp > 0 && d < bd) { bd = d; best = e; } }
        const tx = best && bd < 260 ? best.x : state.coreX, ty = best && bd < 260 ? best.y : state.coreY;
        const dx = tx - player.x, dy = ty - player.y, d = Math.hypot(dx, dy) || 1, near = best && bd < 260;
        joystick.x = d > (near ? 70 : 60) ? dx / d : 0; joystick.y = d > (near ? 70 : 60) ? dy / d : 0;
    };
    var ui = () => {
        // fecha o que bloqueia: cartão de resultado, mapa, prêmio de herói, banners
        document.querySelectorAll('.wave-results button, .hu-later, .vic-btn').forEach(b => { if (b.offsetParent !== null) b.click(); });
        const wr = document.querySelector('.wave-results'); if (wr) { for (let k = 0; k < 2; k++) document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true, cancelable: true })); }
        const map = document.getElementById('mapScreen');
        if (map && !map.classList.contains('hidden')) { const go = document.getElementById('btnMapContinue'); if (go && !go.disabled) go.click(); }
    };
    const finish = (why) => {
        pre.textContent = `DONE ${why}\nhero=${heroKey} god=${god} gameSec=${Math.round(t)} turn=${state.turn} gs=${state.gameState} bosses=[${[...seenBosses]}] sceneries=[${[...seenScenery]}]\nrun.kills=${state.run?.kills} stars=${JSON.stringify(state.run?.waveStars)}\ntrail: ${trail.join(' | ')}\ntimeline: ${window.__tl.join(' | ')}\nerrors(${errs.length}):\n${errs.join('\n')}`;
        document.title = 'FINISHED';
    };
    const chunk = async () => {
        for (let i = 0; i < 12; i++) {
            if (state.gameState === 'GAMEOVER') return finish('gameover');
            pilot();
            if (god && state.gameState === 'PLAYING') { player.hp = player.maxHp; state.coreHp = state.coreHpMax; }
            try { update(STEP); } catch (e) { add('update: ' + e.message + ' @' + (e.stack ?? '').split('\n')[1]?.trim().slice(-60)); }
            t += STEP;
            { const k2 = `${state.turn}/${state.gameState}/${state.phase}${document.getElementById('dialogue') ? '+DLG' : ''}${document.querySelector('.wave-results') ? '+WR' : ''}`; if (k2 !== window.__k2) { window.__k2 = k2; if (window.__tl.length < 70) window.__tl.push(Math.round(t) + 's:' + k2); } }
            if (renderFn && frames++ % 12 === 0) { try { renderFn(); } catch (e) { add('render: ' + e.message + ' @' + (e.stack ?? '').split('\n')[1]?.trim().slice(-60)); } }
            if (state.currentBoss) seenBosses.add(state.currentBoss.type);
            if (frames % 30 === 0) ui();
        }
        const key = `${state.turn}/${state.gameState}${document.getElementById('dialogue') ? '+DLG' : ''}`;
        if (key !== lastKey) { trail.push(`${Math.round(t)}s:${key}`); lastKey = key; stuck = 0; } else stuck += 0.2;
        if (stuck >= 900) return finish(`STUCK at ${key} for ${stuck}s boss=${state.currentBoss?.type} hp=${Math.round(state.currentBoss?.hp ?? 0)}/${Math.round(state.currentBoss?.maxHp ?? 0)} bossXY=${Math.round(state.currentBoss?.x ?? 0)},${Math.round(state.currentBoss?.y ?? 0)} player=${Math.round(player.x)},${Math.round(player.y)} enemies=${state.enemies.length} phase=${state.phase} pending=${state.bossPending}`);
        if (t > maxMin * 60) return finish('timeout');
        if (state.turn > 18 && state.gameState !== 'PLAYING') return finish('post-final');
        setTimeout(chunk, 200);
    };
    chunk();
}
if (location.hash === '#bestiary') {
    const out = [];
    const pre = document.createElement('pre'); pre.id = 'bestrep'; document.body.appendChild(pre);
    window.addEventListener('error', (e) => out.push(`ERR ${e.message} @${(e.filename ?? '').split('/').pop()}:${e.lineno}`));
    try {
        const M = await import('/js/render/monster_sprites.js');
        const { BOSS_MODELS } = await import('/data_model/bosses.js');
        const { MONSTER_MODELS } = await import('/data_model/monsters.js');
        const { state } = await import('/js/core/state.js');
        for (const k of Object.keys(BOSS_MODELS)) {
            if (BOSS_MODELS[k].isShadow) continue;
            try { const p = M.getBossPortrait(k); if (!p) out.push(`boss portrait missing ${k}`); } catch (e) { out.push(`boss portrait ${k}: ${e.message}`); }
        }
        for (const k of Object.keys(MONSTER_MODELS)) {
            try { const s = M.getMonsterSprite(k); if (!s) out.push(`monster sprite missing ${k}`); } catch (e) { out.push(`monster sprite ${k}: ${e.message}`); }
        }
        const { setScenery, prepareScenery } = await import('/js/render/scenery.js');
        const { sceneryIds } = await import('/library/scenery/index.js');
        for (const id of sceneryIds()) { try { setScenery(id); prepareScenery(); } catch (e) { out.push(`scenery ${id}: ${e.message}`); } }
        const S = await import('/js/ui/sanctuary.js');
        for (const tab of ['achievements', 'bestiary']) {
            try { S.openSanctuary(); S.setSanctuaryTab(tab); const n = document.querySelectorAll('#sanctuaryList > *').length; out.push(`sanctuary ${tab}: ${n} entries`); } catch (e) { out.push(`sanctuary ${tab}: ${e.message}`); }
        }
        out.push('checked ' + Object.keys(BOSS_MODELS).length + ' bosses, ' + Object.keys(MONSTER_MODELS).length + ' monsters');
    } catch (e) { out.push('ERR ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
    pre.textContent = out.join('\n');
}
