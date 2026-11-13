// Arena de testes do Last Torch: escolhe herói e boss e começa a luta na hora.
// Roda por cima do jogo de verdade (mesmos módulos, mesmas URLs), sem alterar nenhum arquivo dele.
import { BOSS_MODELS, BOSS_SPAWNING } from '/data_model/bosses.js';
import { CORE_MODEL } from '/data_model/core.js';
import { MONSTER_MODELS } from '/data_model/monsters.js';
import { ACTIVE_HEROES, HEROES } from '/data_model/heroes.js';
import { save } from '/js/core/save.js';
import { player, state } from '/js/core/state.js';
import { addMonster, spawnBoss } from '/js/systems/spawner.js';
import { startHour } from '/js/systems/night.js';
import { startGame } from '/js/ui/screens.js';

const choice = { hero: ACTIVE_HEROES[0], boss: 'AZAEL' };
const picked = new Set();               // monstros escolhidos para a luta (vários, clicando)
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
    <h3>Hero</h3><div class="sb-row" id="sbHeroes"></div>
    <h3>Boss <small>(click again to unselect: monsters only)</small></h3><div class="sb-row" id="sbBosses"></div>
    <h3>Monsters <small>(click to add to the fight)</small></h3><div class="sb-row" id="sbMonsters"></div>
    <h3>Options</h3>
    <label class="sb-field">How many of each monster <input id="sbCount" type="number" min="1" max="30" value="4"></label>
    <label class="sb-field">Hour (boss strength) <input id="sbHour" type="number" min="1" max="12" value="1"></label>
    <label class="sb-field">Skill points to start with <input id="sbPoints" type="number" min="0" max="999" value="100"></label>
    <label class="sb-field">Only the boss (no other monsters) <input id="sbAlone" type="checkbox" checked></label>
    <label class="sb-field">God mode: hero (never dies) <input id="sbGod" type="checkbox" checked></label>
    <label class="sb-field">God mode: boss (never dies) <input id="sbGodBoss" type="checkbox" checked></label>
    <label class="sb-field">God mode: torch (never goes out) <input id="sbGodTorch" type="checkbox" checked></label>
    <label class="sb-field">God mode: monsters (never die) <input id="sbGodMonsters" type="checkbox" checked></label>
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
        // Clicar de novo no que está escolhido desmarca (boss: sem boss, só monstros)
        b.onclick = () => { choice[key] = key === 'boss' && choice[key] === item.key ? '' : item.key; fill(id, items, key); };
        host.appendChild(b);
    });
}
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
        if (target && !target.isBoss && target.hp > 0 && n === 1 && Math.hypot(target.x - state.coreX, target.y - state.coreY) < target.radius + CORE_MODEL.collisionRadius + RIM + 4) return [];
        return splice(i, n, ...items);
    };
}
const bossGod = () => value('#sbGodBoss').checked;
const monsterGod = () => value('#sbGodMonsters').checked;
function godLoop() {
    guardEnemies();
    if (state.phase === 'HUNT') {
        if (value('#sbGod').checked && player.hp > 0) player.hp = player.maxHp;
        if (value('#sbGodTorch').checked && state.coreHp > 0) state.coreHp = state.coreHpMax;
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

value('#sbGo').onclick = fight;
toggle.onclick = () => panel.classList.toggle('hidden');
