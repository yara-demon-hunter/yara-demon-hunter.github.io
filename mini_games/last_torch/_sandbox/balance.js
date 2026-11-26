// Aba "Boss balance" do sandbox: um bot sem inteligência luta contra o chefe escolhido (perto da tocha, ataca o mais próximo, sem desviar)
// e a tela diz quanto da vida do chefe ele tirou. Regra de bolso: se o bot tira a METADE da vida no automático, um jogador de verdade
// (que desvia) passa. Dá para mudar vida, dano, velocidade e defesas do chefe na hora (só nesta página; o jogo não é alterado)
// e copiar a linha pronta para colar em BOSS_STATS (data_model/bosses.js).
// O herói gasta os pontos de skill ao acaso, só nos caminhos (ramos) marcados. A luta pode ser acelerada em ×1, ×5 ou ×10.
import { ACTIVE_HEROES, HEROES } from '/data_model/heroes.js';
import { BOSS_MODELS, BOSS_STATS } from '/data_model/bosses.js';
import { TREE_BRANCHES } from '/data_model/skill_tree/index.js';
import { audio, joystick, player, state } from '/js/core/state.js';
import { update } from '/js/game.js';
import { buyNode, getBuyableNodes } from '/js/systems/tree.js';

const KEY = 'sbBalance';
const STEP = 1 / 60;
const SPEEDS = [1, 5, 10];
const STATS = [
    { k: 'hp', label: 'HP', step: 100 },
    { k: 'damage', label: 'Damage', step: 0.5 },
    { k: 'speed', label: 'Speed', step: 1 },
    { k: 'physicalDef', label: 'Physical def', step: 0.05 },
    { k: 'magicDef', label: 'Magic def', step: 0.05 }
];
// Onda em que cada chefe aparece na campanha (BOSS_STATS, data_model/bosses.js)
const WAVE_OF = { AZAEL: 3, DEMON_HUNTER: 3, RIVER_SPIRIT: 6, SLIZORK: 9, GRAVE_KING: 12, BRUTOS: 15, DEMON_LORD: 15, BLOOD_COUNTESS: 16, LONG_NIGHT: 17, AZAEL_FINAL: 18, DEMON_HUNTER_FINAL: 18 };
// Pontos de skill que o jogador tem ao chegar na onda de cada chefe: medidos à mão (nov/2026). Valem para todos os chefes da mesma onda.
const POINTS_BY_WAVE = { 3: 30, 6: 58, 9: 84, 12: 123, 15: 167, 16: 182, 17: 194, 18: 208 };
const defaultPoints = (boss) => POINTS_BY_WAVE[WAVE_OF[boss]] ?? 30;

const run = { active: false, speed: 1, over: null, startedAt: 0, boss: null, bossMax: 0, lowest: Infinity, seconds: 0, hit: 0 };
let prevHooks = null;

export function mountBalance(host, { bosses, startFight, showPanel, restoreFight }) {
    const fileValues = {};                                 // os números do arquivo (BOSS_STATS), para o botão de voltar
    for (const key of Object.keys(BOSS_STATS)) fileValues[key] = { ...BOSS_STATS[key] };
    const bossList = bosses.filter((b) => BOSS_STATS[b.key]);
    const cfg = { hero: ACTIVE_HEROES[0], boss: bossList[0]?.key, speed: 1, branches: new Set(Object.keys(TREE_BRANCHES)), mortal: true, limit: 300, pass: 50, edits: {}, points: {} };
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) Object.assign(cfg, s, { branches: new Set(s.branches ?? cfg.branches) }); } catch { /* sem armazenamento */ }
    if (!bossList.some((b) => b.key === cfg.boss)) cfg.boss = bossList[0]?.key;
    if (!ACTIVE_HEROES.includes(cfg.hero)) cfg.hero = ACTIVE_HEROES[0];
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ ...cfg, branches: [...cfg.branches] })); } catch { /* ok */ } };

    host.innerHTML = `
      <p class="note">A mindless bot (stays near the torch, hits the closest target, never dodges) fights the boss. If it takes <b>half</b> of his life, a real player who dodges can win. Change the boss numbers, press BATTLE and watch.</p>
      <h3>Hero</h3><div class="sb-row" id="sbBalHeroes"></div>
      <h3>Boss</h3><div class="sb-row" id="sbBalBosses"></div>
      <h3>Boss numbers <small>(this page only: the game files are not touched)</small></h3>
      <div class="sb-bal-stats" id="sbBalStats"></div>
      <div class="sb-row"><button class="sb-opt" id="sbBalFile" title="Put this boss back to the numbers written in bosses.js">↺ Back to file values</button>
      <button class="sb-opt" id="sbBalCopy" title="Copy the BOSS_STATS line with these numbers, to paste in data_model/bosses.js">📋 Copy BOSS_STATS line</button><button class="sb-opt" id="sbBalSave" title="Write the numbers you changed (all bosses) into BOSS_STATS in data_model/bosses.js. Only those numbers are touched.">💾 Save changes to bosses.js</button>
      <button class="sb-opt" id="sbBalResetAll" title="Everything on this tab back to the default: boss numbers from bosses.js, skill points by wave, all paths, limits">⟲ Reset everything to default</button><span id="sbBalMsg" class="note"></span></div>
      <h3>Skill paths the bot picks from <small>(random inside the checked paths)</small></h3><div class="sb-row" id="sbBalBranches"></div>
      <label class="sb-field">Skill points the hero has <input id="sbBalPoints" type="number" min="0" max="999"></label>
      <label class="sb-field">The hero can die (fight ends when he falls) <input id="sbBalMortal" type="checkbox"></label>
      <label class="sb-field">Time limit (game seconds) <input id="sbBalLimit" type="number" min="30" max="1800"></label>
      <label class="sb-field">Passes if the boss loses at least (% of his HP) <input id="sbBalPass" type="number" min="1" max="100"></label>
      <h3>Speed</h3><div class="sb-row" id="sbBalSpeeds"></div>
      <div class="sb-fast-actions" style="grid-template-columns:1fr"><button id="sbBalGo">⚖️ BATTLE<small>bot vs boss</small></button></div>`;
    const q = (s) => host.querySelector(s);

    const pick = (id, items, current, onPick) => {
        const el = q(id); el.innerHTML = '';
        items.forEach(({ key, label }) => {
            const b = document.createElement('button');
            b.className = 'sb-opt' + (current() === key ? ' on' : '');
            b.textContent = label;
            b.onclick = () => { onPick(key); pick(id, items, current, onPick); save(); };
            el.appendChild(b);
        });
    };
    pick('#sbBalHeroes', ACTIVE_HEROES.map((k) => ({ key: k, label: HEROES[k].name })), () => cfg.hero, (k) => { cfg.hero = k; });

    const bossCfg = () => cfg.edits[cfg.boss] ??= {};
    const shown = (stat) => bossCfg()[stat] ?? fileValues[cfg.boss][stat];
    function fillStats() {
        const el = q('#sbBalStats'); el.innerHTML = '';
        STATS.forEach(({ k, label, step }) => {
            const l = document.createElement('label');
            l.className = 'sb-field';
            l.innerHTML = `${label} <input type="number" step="${step}" min="0" value="${shown(k)}">`;
            const input = l.querySelector('input');
            if (shown(k) !== fileValues[cfg.boss][k]) input.classList.add('changed');
            input.onchange = () => {
                const v = parseFloat(input.value);
                if (!Number.isFinite(v) || v < 0) { input.value = shown(k); return; }
                if (v === fileValues[cfg.boss][k]) delete bossCfg()[k]; else bossCfg()[k] = v;
                input.classList.toggle('changed', v !== fileValues[cfg.boss][k]);
                save();
            };
            el.appendChild(l);
        });
        q('#sbBalPoints').value = cfg.points[cfg.boss] ?? defaultPoints(cfg.boss);
    }
    pick('#sbBalBosses', bossList.map((b) => ({ key: b.key, label: `${b.label} · W${WAVE_OF[b.key] ?? '?'}` })), () => cfg.boss, (k) => { cfg.boss = k; fillStats(); });
    fillStats();
    q('#sbBalPoints').onchange = (e) => { cfg.points[cfg.boss] = Math.max(0, +e.target.value || 0); save(); };
    q('#sbBalFile').onclick = () => { delete cfg.edits[cfg.boss]; fillStats(); save(); };
    q('#sbBalCopy').onclick = async () => {
        const pad = (v, n) => String(v).padEnd(n);
        const line = `${cfg.boss}: { hp: ${shown('hp')}, damage: ${shown('damage')}, speed: ${shown('speed')}, physicalDef: ${shown('physicalDef')}, magicDef: ${shown('magicDef')} },`;
        try { await navigator.clipboard.writeText(line); q('#sbBalMsg').textContent = 'Copied: ' + line; } catch { q('#sbBalMsg').textContent = line; }
        void pad;
    };

    q('#sbBalSave').onclick = async () => {
        const stats = {};
        for (const [key, e] of Object.entries(cfg.edits)) if (Object.keys(e).length) stats[key] = e;
        const names = Object.keys(stats);
        if (!names.length) { q('#sbBalMsg').textContent = 'Nothing changed: no boss has edited numbers.'; return; }
        if (!confirm(`Write the changed numbers of ${names.join(', ')} into data_model/bosses.js?`)) return;
        try {
            const r = await fetch('/__save_bosses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stats }) });
            const out = await r.json();
            if (!out.ok) throw new Error(out.error);
            for (const key of names) { Object.assign(fileValues[key], stats[key]); Object.assign(BOSS_STATS[key], stats[key]); delete cfg.edits[key]; }
            fillStats(); save();
            q('#sbBalMsg').textContent = `✅ Saved ${names.join(', ')} in bosses.js`;
        } catch (err) { q('#sbBalMsg').textContent = `❌ Not saved: ${err.message} (restart serve.py if the server is old)`; }
    };
    q('#sbBalResetAll').onclick = () => {
        cfg.edits = {}; cfg.points = {}; cfg.branches = new Set(Object.keys(TREE_BRANCHES));
        cfg.mortal = true; cfg.limit = 300; cfg.pass = 50; cfg.speed = 1;
        q('#sbBalMortal').checked = true; q('#sbBalLimit').value = 300; q('#sbBalPass').value = 50;
        fillStats(); fillBranches(); fillSpeeds(); save();
        q('#sbBalMsg').textContent = 'Back to default.';
    };

    const bl = Object.entries(TREE_BRANCHES).map(([key, b]) => ({ key, label: `${b.icon} ${b.name}` }));
    const fillBranches = () => {
        const el = q('#sbBalBranches'); el.innerHTML = '';
        bl.forEach(({ key, label }) => {
            const b = document.createElement('button');
            b.className = 'sb-opt' + (cfg.branches.has(key) ? ' on' : '');
            b.textContent = label;
            b.onclick = () => { cfg.branches.has(key) ? cfg.branches.delete(key) : cfg.branches.add(key); fillBranches(); save(); };
            el.appendChild(b);
        });
    };
    fillBranches();
    q('#sbBalMortal').checked = cfg.mortal;
    q('#sbBalMortal').onchange = (e) => { cfg.mortal = e.target.checked; save(); };
    q('#sbBalLimit').value = cfg.limit;
    q('#sbBalLimit').onchange = (e) => { cfg.limit = Math.max(30, +e.target.value || 300); save(); };
    q('#sbBalPass').value = cfg.pass;
    q('#sbBalPass').onchange = (e) => { cfg.pass = Math.min(100, Math.max(1, +e.target.value || 50)); save(); };
    const fillSpeeds = () => pick('#sbBalSpeeds', SPEEDS.map((s) => ({ key: s, label: `×${s}` })), () => cfg.speed, (s) => setSpeed(s));
    fillSpeeds();

    // --- a luta ---
    function applyBossNumbers() {
        // Volta tudo ao arquivo e aplica só o que esta aba mudou, no chefe escolhido (o jogo lê BOSS_MODELS ao criar o chefe)
        for (const key of Object.keys(fileValues)) Object.assign(BOSS_MODELS[key], fileValues[key]);
        Object.assign(BOSS_MODELS[cfg.boss], bossCfg());
    }
    q('#sbBalGo').onclick = () => battle();
    function battle() {
        applyBossNumbers();
        run.over = null; run.lowest = Infinity; run.seconds = 0; run.hit = 0; run.boss = null; run.bossMax = 0;
        prevHooks = startFight({ hero: cfg.hero, boss: cfg.boss, hour: WAVE_OF[cfg.boss] ?? 3, points: cfg.points[cfg.boss] ?? defaultPoints(cfg.boss), mortal: cfg.mortal });
        buyAll();
        run.active = true;
        run.startedAt = performance.now();
        setSpeed(cfg.speed);
        bar.classList.remove('hidden');
        bar.querySelector('#sbBalVerdict').textContent = '';
    }
    function buyAll() {
        for (let guard = 0; guard < 999 && state.skillPoints > 0; guard++) {
            const options = getBuyableNodes().filter((n) => cfg.branches.has(n.branch));
            if (!options.length) break;
            buyNode(options[Math.floor(Math.random() * options.length)].id);
        }
    }
    function setSpeed(s) {
        cfg.speed = s; run.speed = s; save();
        bar.querySelectorAll('[data-speed]').forEach((b) => b.classList.toggle('on', b.dataset.speed === String(s)));
        fillSpeeds();
        try { if (s !== 1) audio.ctx?.suspend?.(); else audio.ctx?.resume?.(); } catch { /* sem áudio */ }
    }

    // barra sobre o jogo
    const bar = document.createElement('div');
    bar.id = 'sbBalBar';
    bar.className = 'hidden';
    bar.innerHTML = `<div class="sb-bal-top"><b id="sbBalName"></b><span id="sbBalTime"></span>
        <span class="sb-bal-speeds">${SPEEDS.map((s) => `<button data-speed="${s}">×${s}</button>`).join('')}</span></div>
      <div class="sb-bal-hp"><i id="sbBalFill"></i><i id="sbBalMark"></i><span id="sbBalPct"></span></div>
      <div id="sbBalVerdict"></div>
      <div class="sb-bal-top"><button id="sbBalAgain">↻ Fight again</button><button id="sbBalPanel">☰ Panel</button></div>`;
    document.body.appendChild(bar);
    bar.querySelectorAll('[data-speed]').forEach((b) => { b.onclick = () => setSpeed(+b.dataset.speed); });
    bar.querySelector('#sbBalAgain').onclick = () => battle();
    bar.querySelector('#sbBalPanel').onclick = () => { run.active = false; setSpeed(1); bar.classList.add('hidden'); restoreFight?.(prevHooks); showPanel(); };

    // --- bot (o mesmo do Fast run: perto da tocha, ataca o mais próximo, sem desviar) ---
    function bot() {
        if (state.gameState === 'DIALOGUE') { document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true, cancelable: true })); return; }
        if (state.gameState !== 'PLAYING') return;
        if (state.skillPoints > 0) buyAll();
        if (state.enemies.length > 0) state.knifeInput.stick.fire = true;
        let best = null, bd = 1e9;
        for (const e of state.enemies) {
            const d = Math.hypot(e.x - state.coreX, e.y - state.coreY);
            if (e.hp > 0 && d < bd) { bd = d; best = e; }
        }
        const to = best && bd < 240 ? best : null;
        const dx = (to ?? { x: state.coreX }).x - player.x, dy = (to ?? { y: state.coreY }).y - player.y, d = Math.hypot(dx, dy) || 1;
        const stop = to ? 70 : 60;
        joystick.x = d > stop ? dx / d : 0;
        joystick.y = d > stop ? dy / d : 0;
    }

    function finish(reason) {
        const lost = run.bossMax ? Math.max(0, 1 - (run.lowest / run.bossMax)) * 100 : 0;
        const pass = reason === 'boss' || lost >= cfg.pass;
        run.over = { reason, lost };
        setSpeed(1);
        const why = { boss: 'the boss FELL', hero: 'the hero fell', time: 'time limit' }[reason];
        bar.querySelector('#sbBalVerdict').innerHTML = `${pass ? '✅ PASS' : '❌ TOO HARD'} · ${why} · boss lost <b>${lost.toFixed(0)}%</b> in ${run.seconds.toFixed(0)}s (needed ${cfg.pass}%)`
            + (lost >= 100 ? ' · maybe too EASY' : '');
        bar.querySelector('#sbBalVerdict').className = pass ? 'ok' : 'bad';
    }
    function ui() {
        const boss = run.boss;
        const pct = run.bossMax ? Math.max(0, (run.lowest / run.bossMax) * 100) : 100;
        bar.querySelector('#sbBalName').textContent = `${HEROES[cfg.hero].name} vs ${BOSS_MODELS[cfg.boss].name ?? cfg.boss}`;
        bar.querySelector('#sbBalTime').textContent = `${run.seconds.toFixed(0)}s / ${cfg.limit}s`;
        bar.querySelector('#sbBalFill').style.width = `${boss ? Math.max(0, boss.hp / run.bossMax) * 100 : pct}%`;
        bar.querySelector('#sbBalMark').style.left = `${100 - cfg.pass}%`;
        bar.querySelector('#sbBalPct').textContent = `boss ${Math.round(boss ? Math.max(0, boss.hp) : run.lowest)} / ${run.bossMax}  ·  lost ${(100 - pct).toFixed(0)}%`;
    }

    function tick() {
        requestAnimationFrame(tick);
        if (!run.active || run.over) return;
        const steps = Math.max(1, run.speed);
        for (let i = 0; i < steps && !run.over; i++) {
            if (i > 0 && state.gameState === 'PLAYING') update(STEP);
            if (i % 12 === 0) bot();
            // acompanha o chefe (ele nasce depois de um instante)
            const boss = state.currentBoss ?? state.enemies.find((e) => e.isBoss);
            if (boss && boss.hp > 0 && boss.maxHp) {
                if (!run.boss || run.boss !== boss) { run.boss = boss; run.bossMax = boss.maxHp; run.lowest = boss.hp; }
                run.lowest = Math.min(run.lowest, boss.hp);
            }
            if (state.gameState === 'PLAYING') run.seconds += STEP;
            if (run.boss && run.boss.hp <= 0) { run.lowest = 0; finish('boss'); break; }
            if (cfg.mortal && (player.hp <= 0 || state.phase === 'DYING' || state.gameState === 'GAMEOVER')) { finish('hero'); break; }
            if (run.seconds >= cfg.limit) { finish('time'); break; }
        }
        ui();
    }
    requestAnimationFrame(tick);
    return {};
}
