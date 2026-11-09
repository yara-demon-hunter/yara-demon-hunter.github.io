// Arena de testes do Last Torch: escolhe herói e boss e começa a luta na hora.
// Roda por cima do jogo de verdade (mesmos módulos, mesmas URLs), sem alterar nenhum arquivo dele.
import { BOSS_MODELS, BOSS_SPAWNING } from '/data_model/bosses.js';
import { ACTIVE_HEROES, HEROES } from '/data_model/heroes.js';
import { save } from '/js/core/save.js';
import { player, state } from '/js/core/state.js';
import { spawnBoss } from '/js/systems/spawner.js';
import { startHour } from '/js/systems/night.js';
import { startGame } from '/js/ui/screens.js';

const choice = { hero: ACTIVE_HEROES[0], boss: 'AZAEL' };
const heroMods = new Map();            // mods originais dos heróis, para o modo deus não vazar para a próxima luta

const bosses = Object.entries(BOSS_MODELS)
    .filter(([, model]) => !model.isShadow)
    .map(([key, model]) => ({ key, label: model.name + (model.hidden ? ' (rematch)' : ''), sub: model.title ?? '' }));

const panel = document.createElement('div');
panel.id = 'sbPanel';
panel.innerHTML = `
  <div class="card">
    <h2>🧪 Last Torch Sandbox</h2>
    <p class="note">Test arena: nothing here touches the game or its save.</p>
    <h3>Hero</h3><div class="sb-row" id="sbHeroes"></div>
    <h3>Boss</h3><div class="sb-row" id="sbBosses"></div>
    <h3>Options</h3>
    <label class="sb-field">Hour (boss strength) <input id="sbHour" type="number" min="1" max="12" value="1"></label>
    <label class="sb-field">Skill points to start with <input id="sbPoints" type="number" min="0" max="80" value="0"></label>
    <label class="sb-field">Only the boss (no other monsters) <input id="sbAlone" type="checkbox" checked></label>
    <label class="sb-field">God mode (takes 90% less damage) <input id="sbGod" type="checkbox"></label>
    <button id="sbGo">⚔️ Start fight</button>
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
        b.onclick = () => { choice[key] = item.key; fill(id, items, key); };
        host.appendChild(b);
    });
}
fill('#sbHeroes', ACTIVE_HEROES.map(k => ({ key: k, label: HEROES[k].name, sub: HEROES[k].tagline })), 'hero');
fill('#sbBosses', bosses.map(b => ({ key: b.key, label: b.label, sub: b.sub })), 'boss');

function value(id) { return panel.querySelector(id); }

function fight() {
    const hour = Math.max(1, Math.min(12, +value('#sbHour').value || 1));
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
    BOSS_SPAWNING.schedule[hour] = choice.boss;
    startHour();
    state.enemies.length = 0;
    state.telegraphs.length = 0;
    state.enemyProjectiles.length = 0;
    state.hourPlan.hordes = [];
    state.hourPlan.elites = [];
    state.hourPlan.boss = choice.boss;
    state.hourPlan.bossCalled = true;
    state.skillPoints = Math.max(0, +value('#sbPoints').value || 0);
    if (value('#sbAlone').checked) state.lastStand = true;       // nada mais nasce
    state.bossSpawnAt = null;
    spawnBoss();
    player.hp = player.maxHp;
    panel.classList.add('hidden');
}

value('#sbGo').onclick = fight;
toggle.onclick = () => panel.classList.toggle('hidden');
